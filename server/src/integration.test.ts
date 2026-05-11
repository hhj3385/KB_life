import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "./app.js";
import { prisma } from "./lib/db.js";

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp({ logger: false });
  await app.ready();
});

afterAll(async () => {
  await app.close();
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.eventLog.deleteMany();
  await prisma.session.deleteMany();
});

// 쿠키 헤더에서 "session_id=..." 부분만 추출
function extractCookie(headers: Record<string, string | string[] | undefined>): string {
  const raw = headers["set-cookie"];
  const first = Array.isArray(raw) ? raw[0] : (raw ?? "");
  return first.split(";")[0]; // "session_id=<uuid>"
}

// 세션 생성 + 쿠키 추출 헬퍼
async function createSession() {
  const res = await app.inject({ method: "POST", url: "/api/session" });
  const { data } = JSON.parse(res.body) as { data: { sessionId: string } };
  const cookie = extractCookie(res.headers as Record<string, string | string[] | undefined>);
  return { sessionId: data.sessionId, cookie, statusCode: res.statusCode };
}

// 동의 → 검사까지 진행하는 헬퍼
async function setupTestCompleted(sessionId: string, cookie: string) {
  await app.inject({
    method: "POST",
    url: `/api/session/${sessionId}/consent`,
    headers: { cookie },
  });
  await app.inject({
    method: "POST",
    url: `/api/session/${sessionId}/test`,
    headers: { cookie, "content-type": "application/json" },
    body: JSON.stringify({ responses: new Array(12).fill(3) }),
  });
}

describe("통합 테스트: 전체 플로우", () => {
  it("POST /api/session → 201, sessionId(UUID) + HttpOnly 쿠키 반환", async () => {
    const res = await app.inject({ method: "POST", url: "/api/session" });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.ok).toBe(true);
    expect(body.data.sessionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);

    const cookieHeader = res.headers["set-cookie"];
    const cookieStr = Array.isArray(cookieHeader) ? cookieHeader[0] : (cookieHeader ?? "");
    expect(cookieStr).toContain("session_id=");
    expect(cookieStr.toLowerCase()).toContain("httponly");
  });

  it("세션 생성 → 동의 → 검사 → 캐릭터 → 발급 → 조회 (전체 플로우)", async () => {
    // 1. 세션 생성
    const { sessionId, cookie } = await createSession();

    // 2. 동의
    const consentRes = await app.inject({
      method: "POST",
      url: `/api/session/${sessionId}/consent`,
      headers: { cookie },
    });
    expect(consentRes.statusCode).toBe(200);
    expect(JSON.parse(consentRes.body)).toMatchObject({ ok: true });

    // 3. 검사 제출 (응답 12개)
    const responses = [5, 4, 3, 2, 1, 5, 4, 3, 2, 1, 5, 4];
    const testRes = await app.inject({
      method: "POST",
      url: `/api/session/${sessionId}/test`,
      headers: { cookie, "content-type": "application/json" },
      body: JSON.stringify({ responses }),
    });
    expect(testRes.statusCode).toBe(200);
    const testBody = JSON.parse(testRes.body);
    expect(testBody.ok).toBe(true);
    expect(["investigator", "helper", "leader", "innovator"]).toContain(testBody.data.resultType);
    expect(typeof testBody.data.scores.investigator).toBe("number");
    expect(typeof testBody.data.scores.helper).toBe("number");

    // 4. 캐릭터 저장
    const charRes = await app.inject({
      method: "PATCH",
      url: `/api/session/${sessionId}/character`,
      headers: { cookie, "content-type": "application/json" },
      body: JSON.stringify({ gender: "F", hair: 1, accessory: "none" }),
    });
    expect(charRes.statusCode).toBe(200);
    expect(JSON.parse(charRes.body)).toMatchObject({ ok: true });

    // 5. 봉사자증 발급
    const issueRes = await app.inject({
      method: "POST",
      url: `/api/session/${sessionId}/issue`,
      headers: { cookie, "content-type": "application/json" },
      body: JSON.stringify({ pledge: "열심히 봉사하겠습니다" }),
    });
    expect(issueRes.statusCode).toBe(201);
    const issueBody = JSON.parse(issueRes.body);
    expect(issueBody.ok).toBe(true);
    expect(issueBody.data.cardNo).toMatch(/^KB-\d{4}-\d{5}$/);

    // 6. 세션 전체 조회로 데이터 영속성 확인
    const getRes = await app.inject({
      method: "GET",
      url: `/api/session/${sessionId}`,
      headers: { cookie },
    });
    expect(getRes.statusCode).toBe(200);
    const getBody = JSON.parse(getRes.body).data;
    expect(getBody.resultType).toBe(testBody.data.resultType);
    expect(getBody.cardNo).toBe(issueBody.data.cardNo);
    expect(getBody.gender).toBe("F");
    expect(getBody.consentedAt).not.toBeNull();
  });

  it("동의 없이 검사 제출 → 400 CONSENT_REQUIRED", async () => {
    const { sessionId, cookie } = await createSession();

    const res = await app.inject({
      method: "POST",
      url: `/api/session/${sessionId}/test`,
      headers: { cookie, "content-type": "application/json" },
      body: JSON.stringify({ responses: new Array(12).fill(3) }),
    });
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).error.code).toBe("CONSENT_REQUIRED");
  });

  it("검사 중복 제출 → 409 ALREADY_COMPLETED", async () => {
    const { sessionId, cookie } = await createSession();
    await setupTestCompleted(sessionId, cookie);

    const secondRes = await app.inject({
      method: "POST",
      url: `/api/session/${sessionId}/test`,
      headers: { cookie, "content-type": "application/json" },
      body: JSON.stringify({ responses: new Array(12).fill(3) }),
    });
    expect(secondRes.statusCode).toBe(409);
    expect(JSON.parse(secondRes.body).error.code).toBe("ALREADY_COMPLETED");
  });

  it("검사 전 봉사자증 발급 → 400 TEST_NOT_COMPLETED", async () => {
    const { sessionId, cookie } = await createSession();

    const issueRes = await app.inject({
      method: "POST",
      url: `/api/session/${sessionId}/issue`,
      headers: { cookie, "content-type": "application/json" },
      body: JSON.stringify({ pledge: "봉사하겠습니다" }),
    });
    expect(issueRes.statusCode).toBe(400);
    expect(JSON.parse(issueRes.body).error.code).toBe("TEST_NOT_COMPLETED");
  });

  it("봉사자증 발급 멱등성 — 두 번 호출해도 같은 cardNo, 첫 호출 201 / 재호출 200", async () => {
    const { sessionId, cookie } = await createSession();
    await setupTestCompleted(sessionId, cookie);

    const payload = JSON.stringify({ pledge: "최선을 다하겠습니다" });
    const headers = { cookie, "content-type": "application/json" };

    const r1 = await app.inject({
      method: "POST",
      url: `/api/session/${sessionId}/issue`,
      headers,
      body: payload,
    });
    const r2 = await app.inject({
      method: "POST",
      url: `/api/session/${sessionId}/issue`,
      headers,
      body: payload,
    });

    expect(r1.statusCode).toBe(201);
    expect(r2.statusCode).toBe(200);
    expect(JSON.parse(r1.body).data.cardNo).toBe(JSON.parse(r2.body).data.cardNo);
  });

  it("타인 쿠키로 다른 세션 접근 → 403 FORBIDDEN", async () => {
    const s1 = await createSession();
    const s2 = await createSession();

    // s2 쿠키로 s1에 consent 시도
    const res = await app.inject({
      method: "POST",
      url: `/api/session/${s1.sessionId}/consent`,
      headers: { cookie: s2.cookie },
    });
    expect(res.statusCode).toBe(403);
    expect(JSON.parse(res.body).error.code).toBe("FORBIDDEN");
  });

  it("GET /health → 200 ok", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).ok).toBe(true);
  });
});
