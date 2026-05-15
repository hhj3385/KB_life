import { execSync } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const serverDir = path.dirname(fileURLToPath(import.meta.url));

export default function setup() {
  const dbUrl = process.env.DATABASE_URL ?? "postgresql://localhost:5432/kb_booth_test";
  execSync("npx prisma db push --schema ./prisma/schema.prisma --skip-generate", {
    cwd: serverDir,
    env: { ...process.env, DATABASE_URL: dbUrl },
    stdio: "pipe",
  });
}
