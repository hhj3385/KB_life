import { execSync } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const serverDir = path.dirname(fileURLToPath(import.meta.url));

export default function setup() {
  execSync("npx prisma db push --schema ./prisma/schema.prisma --skip-generate", {
    cwd: serverDir,
    env: { ...process.env, DATABASE_URL: "file:./test.db" },
    stdio: "pipe",
  });
}
