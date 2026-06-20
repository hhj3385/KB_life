import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/db.js";
import { savePhoto, calcExpiry } from "../lib/photo.js";
import { setSessionCookie, verifySessionOwnership } from "../lib/session-auth.js";

export async function sessionRoutes(fastify: FastifyInstance) {
  // POST /api/session — 세션 생성 + 사진 업로드
  // 진입 시 선택한 장소는 ?locationId= 쿼리로 전달 (multipart 본문과 충돌 방지)
  // IP당 분당 5회 제한은 index.ts에서 rate-limit 플러그인으로 처리
  fastify.post<{ Querystring: { locationId?: string } }>("/api/session", async (request, reply) => {
    let photoPath: string | undefined;

    // 장소 검증 — 전달됐다면 활성 장소여야 함
    let locationId: string | null = null;
    const rawLocationId = request.query.locationId;
    if (rawLocationId) {
      const location = await prisma.location.findUnique({ where: { id: rawLocationId } });
      if (!location || !location.active) {
        return reply.code(400).send({
          ok: false,
          error: { code: "INVALID_LOCATION", message: "선택한 장소를 찾을 수 없습니다" },
        });
      }
      locationId = location.id;
    }

    try {
      // multipart/form-data로 사진이 왔을 때 처리
      if (request.isMultipart()) {
        const data = await request.file();
        if (data) {
          const chunks: Buffer[] = [];
          for await (const chunk of data.file) {
            chunks.push(chunk as Buffer);
          }
          const buffer = Buffer.concat(chunks);
          photoPath = await savePhoto(buffer, data.filename);
        }
      }
    } catch {
      // 사진 없이 생성하는 것도 허용 (테스트용)
    }

    const session = await prisma.session.create({
      data: {
        expiresAt: calcExpiry(),
        photoPath: photoPath ?? null,
        locationId,
      },
    });

    setSessionCookie(reply, session.id);

    await prisma.eventLog.create({
      data: { sessionId: session.id, type: "session_created" },
    });

    return reply.code(201).send({ ok: true, data: { sessionId: session.id } });
  });

  // GET /api/session/:id — 세션 정보 조회
  fastify.get<{ Params: { id: string } }>("/api/session/:id", async (request, reply) => {
    const session = await verifySessionOwnership(request, reply);
    if (!session) return; // verifySessionOwnership이 이미 응답 전송

    const scores = session.scores ? (JSON.parse(session.scores) as Record<string, number>) : null;

    return reply.send({
      ok: true,
      data: {
        id: session.id,
        hasPhoto: !!session.photoPath,
        locationId: session.locationId,
        consentedAt: session.consentedAt,
        resultType: session.resultType,
        scores,
        gender: session.gender,
        hair: session.hair,
        accessory: session.accessory,
        nickname: session.nickname,
        pledge: session.pledge,
        cardNo: session.cardNo,
        issuedAt: session.issuedAt,
        prizeDrawn: session.prizeDrawn,
      },
    });
  });

  // POST /api/session/:id/consent — 미성년자 동의 기록
  fastify.post<{ Params: { id: string } }>("/api/session/:id/consent", async (request, reply) => {
    const session = await verifySessionOwnership(request, reply);
    if (!session) return;

    await prisma.session.update({
      where: { id: session.id },
      data: { consentedAt: new Date() },
    });

    return reply.send({ ok: true, data: null });
  });
}
