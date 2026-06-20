import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/db.js";

// 공개(비인증) 장소 라우트 — 진입 화면 장소 선택용
export async function locationRoutes(fastify: FastifyInstance) {
  // GET /api/locations — 활성 장소 목록 (정렬순)
  // 참가자가 진입 시 선택. 경품 소진 여부도 함께 내려 안내에 활용
  fastify.get("/api/locations", async () => {
    const locations = await prisma.location.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        sortOrder: true,
        prizes: { select: { remaining: true } },
      },
    });

    const data = locations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      sortOrder: loc.sortOrder,
      // 남은 경품 총합 (0이면 소진)
      remainingTotal: loc.prizes.reduce((sum, p) => sum + p.remaining, 0),
    }));

    return { ok: true, data };
  });
}
