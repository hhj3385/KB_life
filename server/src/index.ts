import { fileURLToPath } from "node:url";

// 로컬 개발 시 server/.env 로드. 프로덕션(Railway 등)은 플랫폼이 환경변수를 주입하므로
// .env 파일이 없으며, 그 경우 조용히 무시한다.
try {
  process.loadEnvFile(fileURLToPath(new URL("../.env", import.meta.url)));
} catch {
  // .env 파일이 없으면 무시 (프로덕션)
}

// DATABASE_URL이 준비된 뒤에 Prisma가 포함된 앱을 동적 import 한다
// (Prisma 클라이언트는 생성 시점에 datasource URL을 읽기 때문)
const { buildApp } = await import("./app.js");

const app = await buildApp();
const port = Number(process.env.PORT ?? 3001);
await app.listen({ port, host: "0.0.0.0" });
console.log(`\n🚀 KB Booth API server running on http://localhost:${port}\n`);
