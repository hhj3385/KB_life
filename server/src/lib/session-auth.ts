import type { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "./db.js";

const COOKIE_NAME = "session_id";

// 세션 쿠키를 설정한다 (HttpOnly)
export function setSessionCookie(reply: FastifyReply, sessionId: string): void {
  const isProd = process.env.NODE_ENV === "production";
  reply.setCookie(COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 2, // 2일
  });
}

// 쿠키에서 세션 ID를 꺼내고 DB 세션을 반환. 없거나 만료면 null
export async function getSessionFromCookie(request: FastifyRequest) {
  const cookieId = request.cookies[COOKIE_NAME];
  if (!cookieId) return null;

  const session = await prisma.session.findUnique({ where: { id: cookieId } });
  if (!session) return null;
  if (session.expiresAt < new Date()) return null;

  return session;
}

// URL :id 파라미터와 쿠키 세션 ID가 일치하는지 검증
export async function verifySessionOwnership(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const cookieId = request.cookies[COOKIE_NAME];
  if (!cookieId || cookieId !== request.params.id) {
    return reply.code(403).send({ ok: false, error: { code: "FORBIDDEN", message: "세션 권한 없음" } });
  }

  const session = await prisma.session.findUnique({ where: { id: cookieId } });
  if (!session || session.expiresAt < new Date()) {
    return reply.code(401).send({ ok: false, error: { code: "SESSION_EXPIRED", message: "세션이 만료됐습니다" } });
  }

  return session;
}
