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

  const uploadsDir = path.resolve(__dirname, "../../uploads");
  await app.register(fastifyStatic, {
    root: uploadsDir,
    prefix: "/uploads/",
    decorateReply: false,
    serve: false,
  });

  await app.register(sessionRoutes);
  await app.register(testRoutes);
  await app.register(characterRoutes);
  await app.register(issueRoutes);
  await app.register(photoRoutes);

  app.get("/health", async () => ({ ok: true, ts: new Date().toISOString() }));

  return app;
}
