import { describe, it, expect, vi, afterEach } from "vitest";
import { score } from "./scoring.js";

// QUESTIONS 순서: inv(0) helper(1) leader(2) innovator(3) inv(4) helper(5)
//                innovator(6) leader(7) inv(8) innovator(9) helper(10) leader(11)
// Q12(index 11) = leader 타입 → 동점 시 +0.5 가중치

afterEach(() => {
  vi.restoreAllMocks();
});

describe("score()", () => {
  it("정상 응답 12개 → 최고 유형과 점수 반환", () => {
    // investigator 문항(0,4,8) 모두 5점, 나머지 1점
    const responses = [5, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1];
    const result = score(responses);

    expect(result.resultType).toBe("investigator");
    expect(result.scores.investigator).toBe(15);
    expect(result.scores.helper).toBe(3);
    // leader는 tiebreaker +0.5 적용
    expect(result.scores.leader).toBe(3.5);
    expect(result.scores.innovator).toBe(3);
  });

  it("응답 길이 != 12 → INVALID_RESPONSES_LENGTH throw", () => {
    expect(() => score([1, 2, 3])).toThrow("INVALID_RESPONSES_LENGTH");
    expect(() => score([])).toThrow("INVALID_RESPONSES_LENGTH");
    expect(() => score(new Array(13).fill(3))).toThrow("INVALID_RESPONSES_LENGTH");
  });

  it("응답 값이 1~5 범위 밖 → INVALID_RESPONSES_RANGE throw", () => {
    const base = new Array(12).fill(3);
    expect(() => score([...base.slice(0, 5), 0, ...base.slice(6)])).toThrow(
      "INVALID_RESPONSES_RANGE"
    );
    expect(() => score([...base.slice(0, 3), 6, ...base.slice(4)])).toThrow(
      "INVALID_RESPONSES_RANGE"
    );
  });

  it("동점 케이스 → 마지막 응답 가중치로 leader 우선", () => {
    // investigator(0,4,8)=5 → 15점
    // leader(2,7,11)=5 → 15점 + 0.5 = 15.5 → 승리
    // helper(1,5,10)=1 → 3점, innovator(3,6,9)=1 → 3점
    const responses = [5, 1, 5, 1, 5, 1, 1, 5, 5, 1, 1, 5];
    const result = score(responses);

    expect(result.resultType).toBe("leader");
    expect(result.scores.investigator).toBe(15);
    expect(result.scores.leader).toBe(15.5);
  });

  it("완전 동점 → 무작위 선택 (세 유형 중 하나)", () => {
    // investigator(0,4,8)=5 → 15점
    // helper(1,5,10)=5 → 15점
    // innovator(3,6,9)=5 → 15점
    // leader(2,7,11)=1 → 3+0.5=3.5점 (최저)
    const responses = [5, 5, 1, 5, 5, 5, 5, 1, 5, 5, 5, 1];

    // Math.random=0.0 → 첫 번째 winner
    vi.spyOn(Math, "random").mockReturnValue(0.0);
    const r1 = score(responses);
    expect(["investigator", "helper", "innovator"]).toContain(r1.resultType);

    // Math.random=0.99 → 마지막 winner
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    const r2 = score(responses);
    expect(["investigator", "helper", "innovator"]).toContain(r2.resultType);

    // 두 번 모두 non-leader
    expect(r1.resultType).not.toBe("leader");
    expect(r2.resultType).not.toBe("leader");
  });

  it("모든 응답 3점(중간) → leader가 tiebreaker로 승리", () => {
    const responses = new Array(12).fill(3);
    const result = score(responses);

    // 모두 9점이지만 leader만 9.5
    expect(result.resultType).toBe("leader");
    expect(result.scores.leader).toBe(9.5);
    expect(result.scores.investigator).toBe(9);
  });
});
