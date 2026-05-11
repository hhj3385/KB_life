import { prisma } from "./db.js";

// 발급 형식: KB-{year}-{5자리 일련번호}
// 충돌 방지: 발급된 카드 수 + 1 사용
export async function issueCardNo(): Promise<string> {
  const year = new Date().getFullYear();

  // 같은 해 발급된 카드 수를 세어 일련번호 결정
  const count = await prisma.session.count({
    where: {
      cardNo: { startsWith: `KB-${year}-` },
    },
  });

  const seq = String(count + 1).padStart(5, "0");
  return `KB-${year}-${seq}`;
}
