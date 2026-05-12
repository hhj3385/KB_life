import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/db.js";

const ADMIN_KEY = process.env.ADMIN_KEY ?? "kb-admin-2026";

export async function adminRoutes(fastify: FastifyInstance) {
  // 모든 /api/admin/* 요청에 인증 체크
  fastify.addHook("preHandler", async (request, reply) => {
    const token = (request.headers.authorization ?? "").replace("Bearer ", "").trim();
    if (token !== ADMIN_KEY) {
      return reply.code(401).send({ ok: false, error: { code: "UNAUTHORIZED", message: "관리자 키가 올바르지 않습니다" } });
    }
  });

  // GET /api/admin/stats — 운영 현황 요약
  fastify.get("/api/admin/stats", async () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [total, todayCount, completed, prizeDrawnCount, byType] = await Promise.all([
      prisma.session.count(),
      prisma.session.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.session.count({ where: { cardNo: { not: null } } }),
      prisma.session.count({ where: { prizeDrawn: true } }),
      prisma.session.groupBy({
        by: ["resultType"],
        _count: { resultType: true },
        where: { resultType: { not: null } },
      }),
    ]);

    // 발급 완료 세션의 평균 소요 시간 (createdAt → issuedAt)
    const completedSessions = await prisma.session.findMany({
      where: { issuedAt: { not: null } },
      select: { createdAt: true, issuedAt: true },
    });
    const avgMs =
      completedSessions.length > 0
        ? completedSessions.reduce(
            (sum: number, s) => sum + (s.issuedAt!.getTime() - s.createdAt.getTime()),
            0,
          ) / completedSessions.length
        : 0;

    return {
      ok: true,
      data: {
        total,
        today: todayCount,
        completed,
        inProgress: total - completed,
        prizeDrawn: prizeDrawnCount,
        avgMinutes: Math.round((avgMs / 60000) * 10) / 10,
        byType: Object.fromEntries(
          byType.map((b: { resultType: string | null; _count: { resultType: number } }) => [b.resultType, b._count.resultType]),
        ),
      },
    };
  });

  // GET /api/admin/sessions — 세션 목록
  fastify.get<{ Querystring: { page?: string; limit?: string } }>(
    "/api/admin/sessions",
    async (request) => {
      const page = Math.max(1, parseInt(request.query.page ?? "1", 10));
      const limit = Math.min(100, parseInt(request.query.limit ?? "50", 10));

      const [sessions, total] = await Promise.all([
        prisma.session.findMany({
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            createdAt: true,
            resultType: true,
            nickname: true,
            cardNo: true,
            issuedAt: true,
            prizeDrawn: true,
            gender: true,
            realName: true,
            contact: true,
            birthDate: true,
          },
        }),
        prisma.session.count(),
      ]);

      return { ok: true, data: { sessions, total, page, limit } };
    },
  );

  // GET /api/admin/prizes — 경품 재고
  fastify.get("/api/admin/prizes", async () => {
    const prizes = await prisma.prize.findMany({ orderBy: { rank: "asc" } });
    return { ok: true, data: prizes };
  });

  // GET /api/admin/logs — 최근 이벤트 로그
  fastify.get<{ Querystring: { limit?: string } }>("/api/admin/logs", async (request) => {
    const limit = Math.min(100, parseInt(request.query.limit ?? "30", 10));
    const logs = await prisma.eventLog.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    return { ok: true, data: logs };
  });

  // DELETE /api/admin/sessions/:id — 세션 삭제
  fastify.delete<{ Params: { id: string } }>(
    "/api/admin/sessions/:id",
    async (request, reply) => {
      await prisma.session.delete({ where: { id: request.params.id } });
      return reply.send({ ok: true, data: null });
    },
  );
}
