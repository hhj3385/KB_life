import type { FastifyInstance } from "fastify";
import { IssueCardSchema } from "@kb-booth/shared";
import { prisma } from "../lib/db.js";
import { verifySessionOwnership } from "../lib/session-auth.js";
import { issueCardNo } from "../lib/card-no.js";

export async function issueRoutes(fastify: FastifyInstance) {
  // POST /api/session/:id/issue — 봉사자증 발급 (cardNo 채번)
  fastify.post<{ Params: { id: string }; Body: unknown }>(
    "/api/session/:id/issue",
    async (request, reply) => {
      const session = await verifySessionOwnership(request, reply);
      if (!session) return;

      if (!session.resultType) {
        return reply.code(400).send({
          ok: false,
          error: { code: "TEST_NOT_COMPLETED", message: "검사를 먼저 완료해주세요" },
        });
      }

      // 이미 발급된 경우 기존 cardNo 반환 (멱등성)
      if (session.cardNo) {
        return reply.send({
          ok: true,
          data: {
            cardNo: session.cardNo,
            issuedAt: session.issuedAt,
          },
        });
      }

      const parsed = IssueCardSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          ok: false,
          error: { code: "INVALID_PLEDGE", message: parsed.error.errors[0].message },
        });
      }

      const { nickname, pledge } = parsed.data;
      const cardNo = await issueCardNo();
      const issuedAt = new Date();

      await prisma.session.update({
        where: { id: session.id },
        data: { nickname: nickname ?? null, pledge, cardNo, issuedAt },
      });

      await prisma.eventLog.create({
        data: {
          sessionId: session.id,
          type: "card_issued",
          meta: JSON.stringify({ cardNo }),
        },
      });

      return reply.code(201).send({
        ok: true,
        data: { cardNo, issuedAt },
      });
    }
  );
}
