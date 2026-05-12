import { prisma } from "./db.js";
import { BRAND } from "@kb-booth/shared";

// 발급 형식: 전국청소년자원봉사대회-{year}-{5자리 일련번호}
export async function issueCardNo(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `${BRAND.cardNoPrefix}-${year}-`;

  const count = await prisma.session.count({
    where: { cardNo: { startsWith: prefix } },
  });

  const seq = String(count + 1).padStart(5, "0");
  return `${prefix}${seq}`;
}
