import type { FastifyInstance } from "fastify";
import { LocationInputSchema, PrizeInputSchema, PrizeUpdateSchema } from "@kb-booth/shared";
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

  // ── 장소 관리 ────────────────────────────────────────────

  // GET /api/admin/locations — 장소 목록 + 장소별 경품·재고 집계
  fastify.get("/api/admin/locations", async () => {
    const locations = await prisma.location.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: { prizes: { orderBy: [{ rank: "asc" }, { id: "asc" }] } },
    });

    const data = locations.map((loc) => {
      const totalRemaining = loc.prizes.reduce((s, p) => s + p.remaining, 0);
      const totalStock = loc.prizes.reduce((s, p) => s + p.total, 0);
      return {
        id: loc.id,
        name: loc.name,
        active: loc.active,
        sortOrder: loc.sortOrder,
        createdAt: loc.createdAt,
        totalRemaining,
        totalStock,
        prizes: loc.prizes,
      };
    });

    return { ok: true, data };
  });

  // POST /api/admin/locations — 장소 생성
  fastify.post<{ Body: unknown }>("/api/admin/locations", async (request, reply) => {
    const parsed = LocationInputSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ ok: false, error: { code: "INVALID_LOCATION", message: parsed.error.errors[0].message } });
    }
    const location = await prisma.location.create({
      data: {
        name: parsed.data.name,
        active: parsed.data.active ?? true,
        sortOrder: parsed.data.sortOrder ?? 0,
      },
    });
    return reply.code(201).send({ ok: true, data: location });
  });

  // PATCH /api/admin/locations/:id — 장소 수정 (이름·노출·정렬)
  fastify.patch<{ Params: { id: string }; Body: unknown }>("/api/admin/locations/:id", async (request, reply) => {
    const parsed = LocationInputSchema.partial().safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ ok: false, error: { code: "INVALID_LOCATION", message: parsed.error.errors[0].message } });
    }
    const location = await prisma.location.update({ where: { id: request.params.id }, data: parsed.data });
    return reply.send({ ok: true, data: location });
  });

  // DELETE /api/admin/locations/:id — 장소 삭제 (경품 함께 삭제)
  fastify.delete<{ Params: { id: string } }>("/api/admin/locations/:id", async (request, reply) => {
    await prisma.location.delete({ where: { id: request.params.id } });
    return reply.send({ ok: true, data: null });
  });

  // ── 경품 관리 (장소 소속) ─────────────────────────────────

  // POST /api/admin/locations/:id/prizes — 장소에 경품 등록
  fastify.post<{ Params: { id: string }; Body: unknown }>(
    "/api/admin/locations/:id/prizes",
    async (request, reply) => {
      const parsed = PrizeInputSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ ok: false, error: { code: "INVALID_PRIZE", message: parsed.error.errors[0].message } });
      }
      const location = await prisma.location.findUnique({ where: { id: request.params.id } });
      if (!location) {
        return reply.code(404).send({ ok: false, error: { code: "LOCATION_NOT_FOUND", message: "장소를 찾을 수 없습니다" } });
      }
      const prize = await prisma.prize.create({
        data: {
          locationId: location.id,
          name: parsed.data.name,
          rank: parsed.data.rank ?? 0,
          total: parsed.data.total,
          remaining: parsed.data.total, // 등록 시 재고 = 총 수량
        },
      });
      return reply.code(201).send({ ok: true, data: prize });
    },
  );

  // PATCH /api/admin/prizes/:id — 경품 수정 (이름·등급·수량 보정)
  fastify.patch<{ Params: { id: string }; Body: unknown }>("/api/admin/prizes/:id", async (request, reply) => {
    const id = parseInt(request.params.id, 10);
    const parsed = PrizeUpdateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ ok: false, error: { code: "INVALID_PRIZE", message: parsed.error.errors[0].message } });
    }
    const current = await prisma.prize.findUnique({ where: { id } });
    if (!current) {
      return reply.code(404).send({ ok: false, error: { code: "PRIZE_NOT_FOUND", message: "경품을 찾을 수 없습니다" } });
    }

    const { name, rank, total, remaining } = parsed.data;
    // total을 늘리면 그 증가분만큼 remaining도 보충 (refill). remaining을 직접 주면 그 값 우선
    let nextRemaining = remaining ?? current.remaining;
    if (remaining === undefined && total !== undefined && total > current.total) {
      nextRemaining = current.remaining + (total - current.total);
    }
    const nextTotal = total ?? current.total;
    // remaining은 0~total 범위로 클램프
    nextRemaining = Math.max(0, Math.min(nextRemaining, nextTotal));

    const prize = await prisma.prize.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(rank !== undefined ? { rank } : {}),
        total: nextTotal,
        remaining: nextRemaining,
      },
    });
    return reply.send({ ok: true, data: prize });
  });

  // DELETE /api/admin/prizes/:id — 경품 삭제
  fastify.delete<{ Params: { id: string } }>("/api/admin/prizes/:id", async (request, reply) => {
    await prisma.prize.delete({ where: { id: parseInt(request.params.id, 10) } });
    return reply.send({ ok: true, data: null });
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
