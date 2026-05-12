import type { ResultType, Gender, Accessory } from "./types.js";

export type Hair = 1 | 2 | 3 | 4 | 5;

// 모든 유형 공통 기본값 — H1, 액세서리 없음
const BASE: Record<Gender, { hair: Hair; accessory: Accessory }> = {
  F: { hair: 1, accessory: "none" },
  M: { hair: 1, accessory: "none" },
};

export const DEFAULT_CHARACTER: Record<
  ResultType,
  Record<Gender, { hair: Hair; accessory: Accessory }>
> = {
  investigator: BASE,
  helper:       BASE,
  leader:       BASE,
  innovator:    BASE,
};

// 파일 경로 생성 — /web/public/assets/characters/{gender}_h{hair}_{accessory}[_clear].png
export function getCharacterImagePath(
  gender: Gender,
  hair: number,
  accessory: Accessory,
  clear = false,
): string {
  const suffix = clear ? "_clear" : "";
  return `/assets/characters/${gender}_h${hair}_${accessory}${suffix}.png`;
}
