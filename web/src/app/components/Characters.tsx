// 4유형 캐릭터 SVG 플레이스홀더
// 실제 PNG 자산(public/assets/characters/)이 준비되기 전까지 사용

type CharProps = { size?: number };

// 지식나눔 탐구자 (investigator) — 스카이블루
export function InvestigatorChar({ size = 96 }: CharProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r="56" fill="#DEEBFF" />
      <circle cx="60" cy="60" r="34" fill="#6BB5FF" />
      <rect x="38" y="52" width="20" height="14" rx="3" fill="none" stroke="#1E1E1E" strokeWidth="3" />
      <rect x="62" y="52" width="20" height="14" rx="3" fill="none" stroke="#1E1E1E" strokeWidth="3" />
      <path d="M58 58 L62 58" stroke="#1E1E1E" strokeWidth="3" />
      <path d="M50 74 Q60 80 70 74" stroke="#1E1E1E" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// 공감기반 조력자 (helper) — 라벤더
export function HelperChar({ size = 96 }: CharProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r="56" fill="#EFE9FB" />
      <circle cx="60" cy="58" r="34" fill="#B5A0E5" />
      <path d="M40 50 Q44 44 50 50" stroke="#1E1E1E" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M70 50 Q74 44 80 50" stroke="#1E1E1E" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M52 68 Q60 72 68 68" stroke="#1E1E1E" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M60 80 l-6 -6 a4 4 0 1 1 6 -5 a4 4 0 1 1 6 5 z" fill="#FF7E6B" />
    </svg>
  );
}

// 실천적 현장 리더 (leader) — 코랄
export function LeaderChar({ size = 96 }: CharProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r="56" fill="#FFE4DE" />
      <circle cx="60" cy="58" r="34" fill="#FF7E6B" />
      <circle cx="50" cy="56" r="4" fill="#1E1E1E" />
      <circle cx="70" cy="56" r="4" fill="#1E1E1E" />
      <path d="M50 68 Q60 76 70 68" stroke="#1E1E1E" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="44" cy="62" r="3" fill="#FFB3A6" />
      <circle cx="76" cy="62" r="3" fill="#FFB3A6" />
      <path d="M30 96 Q60 80 90 96" stroke="#FF7E6B" strokeWidth="6" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// 창의적 사회혁신가 (innovator) — 민트
export function InnovatorChar({ size = 96 }: CharProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r="56" fill="#DCF6EC" />
      <circle cx="60" cy="60" r="34" fill="#5DD3B0" />
      <path d="M40 38 L60 28 L80 38 L74 44 L60 38 L46 44 Z" fill="#FFCC00" />
      <circle cx="50" cy="58" r="4" fill="#1E1E1E" />
      <circle cx="70" cy="58" r="4" fill="#1E1E1E" />
      <path d="M50 72 Q60 80 70 72" stroke="#1E1E1E" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

import type { ResultType } from "@kb-booth/shared";

export const CHAR_BY_TYPE: Record<ResultType, React.ComponentType<{ size?: number }>> = {
  investigator: InvestigatorChar,
  helper: HelperChar,
  leader: LeaderChar,
  innovator: InnovatorChar,
};
