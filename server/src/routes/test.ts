import type { FastifyInstance } from "fastify";
import { score, TestSubmitSchema } from "@kb-booth/shared";
import { prisma } from "../lib/db.js";
import { verifySessionOwnership } from "../lib/session-auth.js";

export async function testRoutes(fastify: FastifyInstance) {
  // POST /api/session/:id/test — 검사 응답 제출 + 채점
  fastify.post<{ Params: { id: string }; Body: unknown }>(
    "/api/session/:id/test",
    async (request, reply) => {
      const session = await verifySessionOwnership(request, reply);
      if (!session) return;

      // 동의 체크 (TestIntroScreen에서 consent 먼저 완료해야 함)
      if (!session.consentedAt) {
        return reply.code(400).send({
          ok: false,
          error: { code: "CONSENT_REQUIRED", message: "동의가 필요합니다" },
        });
      }

      // 이미 결과가 있으면 재검사 차단 (세션당 1회)
      if (session.resultType) {
        return reply.code(409).send({
          ok: false,
          error: { code: "ALREADY_COMPLETED", message: "이미 검사를 완료했습니다" },
        });
      }

      const parsed = TestSubmitSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          ok: false,
          error: { code: "INVALID_RESPONSES", message: parsed.error.errors[0].message },
        });
      }

      const { responses } = parsed.data;
      const result = score(responses);

      await prisma.session.update({
        where: { id: session.id },
        data: {
          responses: JSON.stringify(responses),
          lastAnswerAt: new Date(),
          resultType: result.resultType,
          scores: JSON.stringify(result.scores),
        },
      });

      await prisma.eventLog.create({
        data: {
          sessionId: session.id,
          type: "test_completed",
          meta: JSON.stringify({ resultType: result.resultType }),
        },
      });

      return reply.send({
        ok: true,
        data: {
          resultType: result.resultType,
          scores: result.scores,
        },
      });
    }
  );
}
