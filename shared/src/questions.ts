import type { ResultType } from "./types.js";

export const QUESTIONS = [
  { id: 1, text: "복잡한 문제를 만나면 자료를 모아서 차근차근 풀어보고 싶어진다", type: "investigator" as ResultType },
  { id: 2, text: "누군가 나에게 \"고맙다\"고 말해줄 때, 그 한마디가 오래 마음에 남는다", type: "helper" as ResultType },
  { id: 3, text: "교실에 앉아 있는 것보다 밖에서 몸을 움직이는 일이 더 잘 맞는다", type: "leader" as ResultType },
  { id: 4, text: "내 아이디어로 사회 문제에 대한 사람들의 생각을 바꿔보고 싶다", type: "innovator" as ResultType },
  { id: 5, text: "내가 잘 아는 분야가 생기면 그게 나만의 특별한 자산처럼 느껴진다", type: "investigator" as ResultType },
  { id: 6, text: "친구가 힘들어할 때 옆에서 가만히 들어주는 것만으로도 보람을 느낀다", type: "helper" as ResultType },
  { id: 7, text: "남들이 다 하는 방식보다 나만의 새로운 방식으로 표현하는 게 좋다", type: "innovator" as ResultType },
  { id: 8, text: "팀이 우왕좌왕할 때 내가 나서서 정리하면 오히려 마음이 편해진다", type: "leader" as ResultType },
  { id: 9, text: "봉사를 한다면 새로운 걸 배우거나 내 진로 탐색에 도움이 됐으면 좋겠다", type: "investigator" as ResultType },
  { id: 10, text: "평범한 것보다는 조금 엉뚱하더라도 특별한 게 더 끌린다", type: "innovator" as ResultType },
  { id: 11, text: "봉사는 같이 하는 사람들과 따뜻한 관계가 만들어질 때 의미 있다", type: "helper" as ResultType },
  { id: 12, text: "땀 흘리고 나면 머리가 맑아지고 내 쓸모를 확인하는 기분이 든다", type: "leader" as ResultType },
] as const;
