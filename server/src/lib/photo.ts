import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_ROOT = process.env.UPLOADS_DIR
  ?? path.resolve(__dirname, "../../uploads");

// 파일을 uploads/{YYYY-MM-DD}/{uuid}.{ext} 에 저장하고 상대 경로 반환
export async function savePhoto(buffer: Buffer, originalName: string): Promise<string> {
  const ext = path.extname(originalName).toLowerCase() || ".jpg";
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const dir = path.join(UPLOADS_ROOT, today);

  await fs.mkdir(dir, { recursive: true });

  const filename = `${randomUUID()}${ext}`;
  const fullPath = path.join(dir, filename);
  await fs.writeFile(fullPath, buffer);

  return `${today}/${filename}`; // DB에 저장할 상대 경로
}

// 상대 경로 → 절대 경로
export function resolvePhotoPath(relativePath: string): string {
  return path.join(UPLOADS_ROOT, relativePath);
}

// 행사 종료 + 7일 후 자동 삭제를 위한 만료 시간 계산
export function calcExpiry(): Date {
  const eventEnd = process.env.EVENT_END_DATE
    ? new Date(process.env.EVENT_END_DATE)
    : new Date();
  eventEnd.setDate(eventEnd.getDate() + 7);
  return eventEnd;
}
