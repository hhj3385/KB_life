export const INTRO_SLIDES = [
  {
    id: 1,
    kind: "type-grid" as const,
    caption: "KB 라이프사회공헌재단에서 만든,\n신뢰할 수 있는 당신의 진짜 봉사 유형",
  },
  {
    id: 2,
    kind: "character-panorama" as const,
    caption: "당신만의 자원봉사자 캐릭터를 만들어 보세요!",
  },
  {
    id: 3,
    kind: "badge-preview" as const,
    caption: "누구나 남을 돕고자만 한다면\n봉사자가 될 수 있습니다!",
  },
  {
    id: 4,
    kind: "logo" as const,
    caption: "10기 서포터즈가 준비한 봉사 유형 테스트,\n지금 시작해볼까요?",
  },
] as const;

export type SlideKind = (typeof INTRO_SLIDES)[number]["kind"];
