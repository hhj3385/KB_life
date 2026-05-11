import type { ResultType } from "./types.js";

export type ResultCode = "SAGE" | "WARM" | "BOLD" | "NOVA";

export interface ResultContent {
  code: ResultCode;
  name: string;
  nickname: string;
  micro: string;
  description: string;
  recommendations: { name: string; desc: string }[];
}

export const RESULT_CONTENT: Record<ResultType, ResultContent> = {
  investigator: {
    code: "SAGE",
    name: "지식나눔 탐구자",
    nickname: "차근차근 세상을 풀어내는 사람",
    micro: "지식은 나눌수록 커지는 유일한 자본이에요",
    description:
      "호기심이 많고, 복잡한 문제를 만나면 자료를 모아 분석하는 데 강한 사람이에요. 새로 배우는 즐거움이 곧 동력이고, 그 지식이 누군가에게 도움이 될 때 더 큰 보람을 느껴요. 머리를 쓰는 봉사에서 진가를 발휘하는 타입.",
    recommendations: [
      { name: "학습 멘토링", desc: "다문화·취약계층 아동 맞춤형 학습 도움" },
      { name: "데이터 모니터링", desc: "지역 환경(수질·미세먼지) 정기 측정·기록" },
      { name: "점자·전자도서 변환", desc: "시각장애인을 위한 도서 접근성 봉사" },
    ],
  },
  helper: {
    code: "WARM",
    name: "공감기반 조력자",
    nickname: "마음을 듣는 사람",
    micro: "당신의 따뜻한 경청이 누군가의 세상을 구해요",
    description:
      "다른 사람의 감정에 깊이 공감하고, 함께 있는 것만으로도 힘이 되는 사람이에요. 경쟁이나 효율보다 따뜻한 관계와 정서적 유대를 더 소중히 여기죠. 사람의 체온이 닿는 곳에서 가장 빛나요.",
    recommendations: [
      { name: "어르신 말벗·자서전 기록", desc: "독거 어르신과 1:1 멘토링·생애사 정리" },
      { name: "또래 상담", desc: "학교폭력 피해자 지원·또래 멘토링" },
      { name: "동행 봉사", desc: "장애인 나들이·문화활동 보조" },
    ],
  },
  leader: {
    code: "BOLD",
    name: "실천적 현장 리더",
    nickname: "먼저 나서는 사람",
    micro: "위기 속에서 가장 먼저 내민 손이 진짜 리더예요",
    description:
      "머리로 고민하기보다 몸을 움직여 결과를 만들어내는 사람이에요. 위기 상황에서 망설임 없이 먼저 손을 내밀고, 팀이 흔들릴 땐 자연스럽게 중심을 잡아주죠. 현장에서 진짜 리더십이 나오는 타입.",
    recommendations: [
      { name: "환경 정화", desc: "해변·하천·산림 정화 활동" },
      { name: "안전 캠페인", desc: "통학로 점검·화재 취약 가구 안전 점검" },
      { name: "재해·재난 구호", desc: "수해 복구·구호품 분류 등 현장 지원" },
    ],
  },
  innovator: {
    code: "NOVA",
    name: "창의적 사회혁신가",
    nickname: "세상을 새로 그리는 사람",
    micro: "틀을 깨는 당신의 상상력이 오래된 문제를 혁신해요",
    description:
      "평범한 방식이 아닌 자기만의 새로운 방식으로 세상을 표현하고 싶은 사람이에요. 풍부한 상상력과 감수성으로 사회 문제에 신선한 답을 던지고, 사람들의 인식을 바꾸는 힘이 있어요.",
    recommendations: [
      { name: "SNS 콘텐츠 제작", desc: "유기동물·로컬 소상공인 홍보 숏폼·카드뉴스" },
      { name: "캠페인 디자인", desc: "환경·인식 개선 포스터·굿즈" },
      { name: "업사이클링", desc: "폐기물 리디자인 작품 제작·전시" },
    ],
  },
};
