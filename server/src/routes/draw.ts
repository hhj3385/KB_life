import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/db.js";
import { verifySessionOwnership } from "../lib/session-auth.js";

// 재고 비례 랜덤 추첨 중 동시성 충돌 시 재시도용 마커
const RACE = "PRIZE_DRAW_RACE";
const MAX_RETRY = 6;

interface Drawn {
  kind: "won" | "soldout" | "already";
  prize?: { id: number; name: string; rank: number };
}

export async function drawRoutes(fastify: FastifyInstance) {
  // POST /api/session/:id/draw — 경품 1회 추첨 (재고 비례 랜덤)
  fastify.post<{ Params: { id: string } }>(
    "/api/session/:id/draw",
    async (request, reply) => {
      const session = await verifySessionOwnership(request, reply);
      if (!session) return;

      // 검사를 마쳐야 추첨 가능
      if (!session.resultType) {
        return reply.code(400).send({
          ok: false,
          error: { code: "TEST_NOT_COMPLETED", message: "검사를 먼저 완료해주세요" },
        });
      }

      // 이미 뽑은 세션 — 저장된 결과를 멱등 반환
      if (session.prizeDrawn) {
        return reply.send({
          ok: true,
          data: {
            prize: session.prizeId
              ? { id: session.prizeId, name: session.prizeName ?? "", rank: session.prizeRank ?? 0 }
              : null,
            soldOut: !session.prizeId,
          },
        });
      }

      // 장소가 없으면 추첨 불가 (진입 시 장소 선택 누락)
      if (!session.locationId) {
        return reply.code(400).send({
          ok: false,
          error: { code: "NO_LOCATION", message: "장소 정보가 없어 추첨할 수 없습니다" },
        });
      }
      const locationId = session.locationId;
      const sessionId = session.id;

      let outcome: Drawn | null = null;
      for (let attempt = 0; attempt < MAX_RETRY && !outcome; attempt++) {
        try {
          outcome = await prisma.$transaction(async (tx): Promise<Drawn> => {
            // 1) 세션의 뽑기 권리를 원자적으로 선점 (중복 탭/중복 요청 방지)
            const claim = await tx.session.updateMany({
              where: { id: sessionId, prizeDrawn: false },
              data: { prizeDrawn: true, drawnAt: new Date() },
            });
            if (claim.count !== 1) return { kind: "already" };

            // 2) 해당 장소의 재고 있는 경품 조회
            const prizes = await tx.prize.findMany({
              where: { locationId, remaining: { gt: 0 } },
              orderBy: { id: "asc" },
            });
            const totalRemaining = prizes.reduce((sum, p) => sum + p.remaining, 0);

            // 3) 모두 소진 — 권리는 사용됐고 경품은 null
            if (totalRemaining === 0) return { kind: "soldout" };

            // 4) 재고 비례 랜덤: 남은 수량을 1개 단위로 펼친 구간에서 균등 추첨
            let r = Math.floor(Math.random() * totalRemaining);
            let chosen = prizes[0];
            for (const p of prizes) {
              if (r < p.remaining) {
                chosen = p;
                break;
              }
              r -= p.remaining;
            }

            // 5) 조건부 차감 — 다른 트랜잭션이 먼저 소진시켰으면 재시도
            const dec = await tx.prize.updateMany({
              where: { id: chosen.id, remaining: { gt: 0 } },
              data: { remaining: { decrement: 1 } },
            });
            if (dec.count !== 1) throw new Error(RACE);

            await tx.session.update({
              where: { id: sessionId },
              data: { prizeId: chosen.id, prizeName: chosen.name, prizeRank: chosen.rank },
            });

            return { kind: "won", prize: { id: chosen.id, name: chosen.name, rank: chosen.rank } };
          });
        } catch (err) {
          if (err instanceof Error && err.message === RACE) {
            outcome = null; // 재시도
            continue;
          }
          throw err;
        }
      }

      // 재시도 모두 실패 (극히 드묾)
      if (!outcome) {
        return reply.code(503).send({
          ok: false,
          error: { code: "DRAW_BUSY", message: "잠시 후 다시 시도해주세요" },
        });
      }

      // 선점 단계에서 이미 뽑힌 것으로 판명 — 저장된 결과 재조회
      if (outcome.kind === "already") {
        const fresh = await prisma.session.findUnique({ where: { id: sessionId } });
        return reply.send({
          ok: true,
          data: {
            prize: fresh?.prizeId
              ? { id: fresh.prizeId, name: fresh.prizeName ?? "", rank: fresh.prizeRank ?? 0 }
              : null,
            soldOut: !fresh?.prizeId,
          },
        });
      }

      if (outcome.kind === "soldout") {
        await prisma.eventLog.create({
          data: { sessionId, type: "prize_sold_out", meta: JSON.stringify({ locationId }) },
        });
        return reply.send({ ok: true, data: { prize: null, soldOut: true } });
      }

      // won
      await prisma.eventLog.create({
        data: {
          sessionId,
          type: "prize_drawn",
          meta: JSON.stringify({ locationId, prizeId: outcome.prize!.id, prizeName: outcome.prize!.name }),
        },
      });
      return reply.send({ ok: true, data: { prize: outcome.prize!, soldOut: false } });
    },
  );
}
