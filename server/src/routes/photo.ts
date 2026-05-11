import type { FastifyInstance } from "fastify";
import fs from "fs";
import { prisma } from "../lib/db.js";
import { resolvePhotoPath, savePhoto } from "../lib/photo.js";
import { verifySessionOwnership } from "../lib/session-auth.js";

export async function photoRoutes(fastify: FastifyInstance) {
  // PATCH /api/session/:id/photo — 세션 생성 후 사진 업로드 (모바일 촬영)
  fastify.patch<{ Params: { id: string } }>(
    "/api/session/:id/photo",
    async (request, reply) => {
      const session = await verifySessionOwnership(request, reply);
      if (!session) return;

      if (!request.isMultipart()) {
        return reply.code(400).send({ ok: false, error: { code: "NO_PHOTO", message: "사진 데이터가 없습니다" } });
      }

      const data = await request.file();
      if (!data) {
        return reply.code(400).send({ ok: false, error: { code: "NO_PHOTO", message: "파일을 찾을 수 없습니다" } });
      }

      const chunks: Buffer[] = [];
      for await (const chunk of data.file) chunks.push(chunk as Buffer);
      const buffer = Buffer.concat(chunks);
      const photoPath = await savePhoto(buffer, data.filename || "photo.jpg");

      await prisma.session.update({
        where: { id: session.id },
        data: { photoPath },
      });

      return reply.send({ ok: true, data: null });
    }
  );

  // GET /api/photo/:id — 세션 사진 응답 (쿠키 검증)
  // :id = sessionId. 쿠키 sessionId와 일치해야만 응답
  fastify.get<{ Params: { id: string } }>(
    "/api/photo/:id",
    async (request, reply) => {
      const cookieId = request.cookies["session_id"];

      // 세션 쿠키와 요청 ID가 일치해야 함 (추측 접근 방지)
      if (!cookieId || cookieId !== request.params.id) {
        return reply.code(403).send({ ok: false, error: { code: "FORBIDDEN", message: "접근 권한 없음" } });
      }

      const session = await prisma.session.findUnique({
        where: { id: request.params.id },
        select: { photoPath: true, expiresAt: true },
      });

      if (!session || session.expiresAt < new Date()) {
        return reply.code(404).send({ ok: false, error: { code: "NOT_FOUND", message: "세션을 찾을 수 없습니다" } });
      }

      if (!session.photoPath) {
        return reply.code(404).send({ ok: false, error: { code: "NO_PHOTO", message: "사진이 없습니다" } });
      }

      const filePath = resolvePhotoPath(session.photoPath);

      if (!fs.existsSync(filePath)) {
        return reply.code(404).send({ ok: false, error: { code: "FILE_NOT_FOUND", message: "파일을 찾을 수 없습니다" } });
      }

      const ext = filePath.split(".").pop()?.toLowerCase() ?? "jpg";
      const mimeMap: Record<string, string> = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        webp: "image/webp",
      };

      return reply
        .header("Content-Type", mimeMap[ext] ?? "image/jpeg")
        .header("Cache-Control", "private, max-age=3600")
        .send(fs.createReadStream(filePath));
    }
  );
}
