import type { ResultType, Gender, Accessory } from "./types.js";

export type Hair = 1 | 2 | 3 | 4 | 5;

// 결과 유형별 기본 캐릭터 설정 (SPEC.md 6.6 표 그대로)
export const DEFAULT_CHARACTER: Record<
  ResultType,
  Record<Gender, { hair: Hair; accessory: Accessory }>
> = {
  investigator: {
    F: { hair: 3, accessory: "glasses" },
    M: { hair: 3, accessory: "glasses" },
  },
  helper: {
    F: { hair: 1, accessory: "band" },
    M: { hair: 1, accessory: "none" },
  },
  leader: {
    F: { hair: 2, accessory: "cap" },
    M: { hair: 5, accessory: "cap" },
  },
  innovator: {
    F: { hair: 4, accessory: "beanie" },
    M: { hair: 4, accessory: "beanie" },
  },
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
