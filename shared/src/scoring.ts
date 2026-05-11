import { QUESTIONS } from "./questions.js";
import type { ResultType, ScoreResult } from "./types.js";

// 채점 로직: 12개 응답(1~5점) → 유형별 합산 → 최고점 유형 반환
// 동점 시 마지막 응답(Q12, leader 타입) 가중치 +0.5 적용
// 완전 동점이면 무작위 선택
export function score(responses: number[]): ScoreResult {
  if (responses.length !== 12) throw new Error("INVALID_RESPONSES_LENGTH");
  if (responses.some((v) => v < 1 || v > 5)) throw new Error("INVALID_RESPONSES_RANGE");

  const totals: Record<ResultType, number> = {
    investigator: 0,
    helper: 0,
    leader: 0,
    innovator: 0,
  };

  responses.forEach((v, i) => {
    totals[QUESTIONS[i].type] += v;
  });

  // 마지막 응답 가중치: 동점일 때 Q12 해당 유형(leader) 우선
  totals[QUESTIONS[11].type] += 0.5;

  const max = Math.max(...Object.values(totals));
  const winners = (Object.keys(totals) as ResultType[]).filter(
    (k) => totals[k] === max
  );

  // 완전 동점이면 무작위 선택
  const winner = winners[Math.floor(Math.random() * winners.length)];

  return { resultType: winner, scores: totals };
}
