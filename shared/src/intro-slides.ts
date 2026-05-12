export const INTRO_SLIDES = [
  {
    id: 1,
    kind: "type-grid" as const,
    caption: "KB 라이프사회공헌재단에서 만든,\n신뢰할 수 있는 당신의 진짜 봉사 유형",
  },
  {
    id: 2,
    kind: "source" as const,
    caption: "Holland·에니어그램·VFI·MMTIC\n4개 학술 도구 융합, 12문항 재구성",
  },
  {
    id: 3,
    kind: "character-panorama" as const,
    caption: "당신만의 자원봉사자 캐릭터를 만들어 보세요!",
  },
  {
    id: 4,
    kind: "badge-preview" as const,
    caption: "누구나 남을 돕고자만 한다면\n봉사자가 될 수 있습니다!",
  },
  {
    id: 5,
    kind: "logo" as const,
    caption: "KB 라이프사회공헌재단이 함께하는\n전국청소년자원봉사대회",
  },
] as const;

export type SlideKind = (typeof INTRO_SLIDES)[number]["kind"];
