import Fastify from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyStatic from "@fastify/static";
import path from "path";
import { fileURLToPath } from "url";

import { sessionRoutes } from "./routes/session.js";
import { testRoutes } from "./routes/test.js";
import { characterRoutes } from "./routes/character.js";
import { issueRoutes } from "./routes/issue.js";
import { photoRoutes } from "./routes/photo.js";
import { adminRoutes } from "./routes/admin.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function buildApp(opts: { logger?: boolean } = {}) {
  const loggerOpt = opts.logger ?? process.env.NODE_ENV !== "test";
  const app = Fastify({
    logger: loggerOpt
      ? { level: process.env.NODE_ENV === "production" ? "warn" : "info" }
      : false,
  });

  await app.register(fastifyCors, {
    origin:
      process.env.NODE_ENV === "development"
        ? ["http://localhost:5173", "http://localhost:5174", "http://localhost:4173"]
        : false,
    credentials: true,
  });

  await app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET ?? "kb-booth-dev-secret-change-in-production",
  });

  await app.register(fastifyMultipart, {
    limits: { fileSize: 10 * 1024 * 1024 },
  });

  await app.register(fastifyRateLimit, {
    max: 100,
    timeWindow: "1 minute",
    keyGenerator: (req) => req.ip,
  });

  // 업로드 파일 서빙 — 프로덕션에서는 /data/uploads (Railway 볼륨)
  const uploadsDir = process.env.UPLOADS_DIR
    ?? path.resolve(__dirname, "../../uploads");
  await app.register(fastifyStatic, {
    root: uploadsDir,
    prefix: "/uploads/",
    decorateReply: false,
    serve: false,
  });

  // 프로덕션: Vite 빌드 결과물 서빙 + SPA fallback
  if (process.env.NODE_ENV === "production") {
    const webDist = path.resolve(__dirname, "../../web/dist");
    app.log.warn(`[static] serving web from ${webDist}`);
    await app.register(fastifyStatic, {
      root: webDist,
      prefix: "/",
      decorateReply: true,
      index: ["index.html"],
    });
    app.setNotFoundHandler((_req, reply) => {
      reply.sendFile("index.html", webDist);
    });
  }

  await app.register(sessionRoutes);
  await app.register(testRoutes);
  await app.register(characterRoutes);
  await app.register(issueRoutes);
  await app.register(photoRoutes);
  await app.register(adminRoutes);

  app.get("/health", async () => ({ ok: true, ts: new Date().toISOString() }));

  return app;
}
