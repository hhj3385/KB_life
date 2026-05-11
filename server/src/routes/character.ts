import type { FastifyInstance } from "fastify";
import { characterSchema } from "@kb-booth/shared";
import { prisma } from "../lib/db.js";
import { verifySessionOwnership } from "../lib/session-auth.js";

export async function characterRoutes(fastify: FastifyInstance) {
  // PATCH /api/session/:id/character — 캐릭터 커스터마이징 저장
  fastify.patch<{ Params: { id: string }; Body: unknown }>(
    "/api/session/:id/character",
    async (request, reply) => {
      const session = await verifySessionOwnership(request, reply);
      if (!session) return;

      const parsed = characterSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          ok: false,
          error: { code: "INVALID_CHARACTER", message: parsed.error.errors[0].message },
        });
      }

      const { gender, hair, accessory } = parsed.data;

      await prisma.session.update({
        where: { id: session.id },
        data: { gender, hair, accessory },
      });

      return reply.send({ ok: true, data: null });
    }
  );
}
