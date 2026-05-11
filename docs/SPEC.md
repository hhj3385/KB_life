# KB 부스 웹앱 — 통합 기술 명세서

작성: 2026-05-10
버전: v0.1 (초안)

---

## 1. 시스템 개요

### 1.1 시나리오 한 줄 요약
QR로 입장 → 12문항 검사 → 결과 + 캐릭터 커스터마이징 → 봉사자증 발급 → 뽑기

### 1.2 사용자 그룹
- **참여자**: 청소년 (중·고등학생). 본인 폰 또는 부스 비치 태블릿
- **운영자**: 서포터즈. 어드민 대시보드로 진행 상황·뽑기 권한 관리

### 1.3 비기능 요구사항
| 항목 | 목표치 |
|------|--------|
| 1인당 처리 시간 | 평균 5~7분 |
| 동시 접속자 | 시간당 60~100명 (피크 동시 25명) |
| 검사 페이지 오프라인 동작 | Service Worker 캐싱 |
| 사진 자동 삭제 | 행사 종료 + 7일 이내 |

---

## 2. 화면 흐름 + 라우팅

| # | 화면 | 경로 | 비고 |
|---|------|------|------|
| 1 | 인트로 | `/` | QR 스캔 직후 진입. "시작하기" 클릭 시 세션 생성 |
| 2 | 사진 확인 | `/s/[id]/photo` | 입장 시 촬영 사진 미리보기. 다시 찍기 / 검사 시작 |
| 3 | 검사 인트로 | `/s/[id]/test/intro` | 미성년자 동의 체크 + 12문항 안내 |
| 4 | 검사 문항 | `/s/[id]/test` | 1~12문항 순차. 진행률 바 |
| 5 | 분석중 로딩 | `/s/[id]/analyzing` | 채점 + DB 저장 진행 (실제 1~2초) |
| 6 | 결과 공개 | `/s/[id]/result` | 유형명·캐릭터·설명·추천 봉사·마이크로 카피 |
| 7 | 캐릭터 커스터마이징 | `/s/[id]/character` | 성별·헤어·모자·안경 선택. 검사 결과 기반 기본값 자동 세팅 |
| 8 | 봉사 각오 입력 | `/s/[id]/pledge` | 닉네임(선택) + 봉사 각오 한마디 |
| 9 | 봉사자증 앞면 | `/s/[id]/card` | 발급 완료. 이미지 저장·공유 가능 |
| 10 | 봉사자증 뒷면 | `/s/[id]/card/back` | 결과 상세 + KB 안내 + 마무리 멘트 |
| - | 어드민 대시보드 | `/admin` | 진행 인원·완료 수·평균 시간·뽑기 권한 부여 |

흐름: 1 → 2 → 3 → 4(반복) → 5 → 6 → 7 → 8 → 9 ↔ 10

---

## 3. 데이터 모델 (Prisma)

> 개발 단계는 **SQLite**로 시작 (홈서버 PostgreSQL 미준비). Prisma 스키마는 SQLite 호환 형태로 작성하되, 추후 PostgreSQL 마이그레이션이 쉽도록 enum과 배열·JSON은 코드 레벨에서 검증·직렬화한다.

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")  // file:./dev.db
}

model Session {
  id          String   @id @default(uuid())
  createdAt   DateTime @default(now())
  expiresAt   DateTime // 행사 종료일 + 7일

  // 동의
  consentedAt DateTime?

  // 입장 사진 (홈서버 로컬 저장)
  photoPath   String?  // 예: "uploads/2026-05-10/abc123.jpg"

  // 검사 응답 (12개 5점 척도) — SQLite는 array 미지원이라 JSON string으로 저장
  responses   String?  // 예: "[5,4,3,2,1,...]"
  // 응답 타임스탬프 (동점 시 마지막 응답 가중치 계산용)
  lastAnswerAt DateTime?

  // 결과 — enum 대신 string ("investigator" | "helper" | "leader" | "innovator")
  resultType  String?
  scores      String?  // JSON string. { investigator: 12, helper: 9, leader: 8, innovator: 7 }

  // 캐릭터 (사전 합성 통이미지 — 액세서리 단일 카테고리)
  gender      String?  // "F" | "M"
  hair        Int?     // 1~5
  accessory   String?  // "none" | "cap" | "beanie" | "band"(F) | "bucket"(M) | "glasses"

  // 봉사자증 — 길이 제한은 앱 레벨에서 (Zod)
  nickname    String?  // 최대 20자
  pledge      String?  // 최대 50자
  cardNo      String?  @unique // KB-2026-XXXXX
  issuedAt    DateTime?

  // 뽑기
  prizeDrawn  Boolean  @default(false)
  prizeRank   Int?     // 1, 2, 3
  drawnAt     DateTime?

  @@index([createdAt])
  @@index([resultType])
}

// 코드 레벨 union (Zod에서 검증)
// type ResultType = "investigator" | "helper" | "leader" | "innovator"
// type Gender = "F" | "M"

// 경품 재고 (어드민에서 차감)
model Prize {
  id        Int      @id @default(autoincrement())
  rank      Int      // 1, 2, 3
  name      String
  total     Int
  remaining Int
}

// 운영 로그 (디버깅·통계용)
model EventLog {
  id        Int      @id @default(autoincrement())
  sessionId String?
  type      String   // "session_created", "test_completed", "card_issued", "prize_drawn"
  meta      Json?
  createdAt DateTime @default(now())

  @@index([type, createdAt])
}
```

---

## 4. API 엔드포인트

| 메서드 | 경로 | 용도 |
|--------|------|------|
| `POST` | `/api/session` | 세션 생성. body: 사진 파일(multipart). 응답: `{ sessionId }`, HttpOnly 쿠키 set |
| `GET`  | `/api/session/[id]` | 세션 정보 조회 (쿠키 검증) |
| `POST` | `/api/session/[id]/consent` | 미성년자 동의 기록 |
| `POST` | `/api/session/[id]/test` | 검사 응답 제출 + 채점 결과 반환. body: `{ responses: number[12] }` |
| `PATCH`| `/api/session/[id]/character` | 캐릭터 커스터마이징 저장. body: `{ gender, hair, hat, glasses }` |
| `POST` | `/api/session/[id]/issue` | 봉사자증 발급 (cardNo 채번). body: `{ nickname?, pledge }` |
| `POST` | `/api/session/[id]/draw` | 뽑기 1회. 응답: `{ rank, prize }` |
| `GET`  | `/api/photo/[id]` | 사진 응답 (쿠키 검증) |
| `GET`  | `/api/admin/stats` | 어드민 대시보드 통계 |
| `POST` | `/api/admin/draw-grant` | 운영자가 뽑기 권한 확정 (운영자 폰) |

### 4.1 응답 표준
```ts
// 성공
{ ok: true, data: T }

// 실패
{ ok: false, error: { code: "INVALID_RESPONSES", message: "..." } }
```

---

## 5. 검사 채점 로직

```ts
// lib/scoring.ts

const QUESTIONS: { type: ResultType }[] = [
  { type: "investigator" }, // Q1
  { type: "helper" },       // Q2
  { type: "leader" },       // Q3
  { type: "innovator" },    // Q4
  { type: "investigator" }, // Q5
  { type: "helper" },       // Q6
  { type: "innovator" },    // Q7
  { type: "leader" },       // Q8
  { type: "investigator" }, // Q9
  { type: "innovator" },    // Q10
  { type: "helper" },       // Q11
  { type: "leader" },       // Q12
];

export function score(responses: number[]) {
  if (responses.length !== 12) throw new Error("INVALID_RESPONSES_LENGTH");
  if (responses.some(v => v < 1 || v > 5)) throw new Error("INVALID_RESPONSES_RANGE");

  const totals: Record<ResultType, number> = {
    investigator: 0, helper: 0, leader: 0, innovator: 0,
  };
  responses.forEach((v, i) => { totals[QUESTIONS[i].type] += v; });

  // 마지막 응답 가중치 +0.5 (동점 시 우선)
  totals[QUESTIONS[11].type] += 0.5;

  // 최고점 유형 찾기. 동점이면 무작위
  const max = Math.max(...Object.values(totals));
  const winners = (Object.keys(totals) as ResultType[]).filter(k => totals[k] === max);
  const winner = winners[Math.floor(Math.random() * winners.length)];

  return { resultType: winner, scores: totals };
}
```

---

## 6. 캐릭터 시스템 (통이미지 사전 합성 방식)

### 6.1 자산 방식 변경 (2026-05-11)
부품 레이어 클라이언트 합성 방식에서 **헤어×액세서리 조합 사전 합성된 통이미지** 방식으로 변경. 이유: 디자인 단계에서 이미 모든 조합이 합성된 PNG로 export 완료. 클라이언트 레이어 합성 코드·z-index 룰·부품별 정렬 작업 불필요. 또한 현재 자산은 모자와 안경 중 하나만 착용 가능(둘 다 동시 착용 케이스는 자산에 없음)하므로 액세서리 카테고리를 단일 5지선다로 단순화.

### 6.2 부품 옵션 (확정)

| 카테고리 | 옵션 (여 F) | 옵션 (남 M) |
|----------|-------------|-------------|
| **성별** | F | M |
| **헤어 (h1~h5)** | h1·h2·h3·h4·h5 (위치 번호만 사용. 헤어 이름 매핑은 별도 표) | h1·h2·h3·h4·h5 |
| **액세서리 (택 1)** | none / cap / beanie / band / glasses | none / cap / beanie / bucket / glasses |

조합 수: 성별 × 헤어 5 × 액세서리 5 = 25 / 성별 = **50개 × 2(배경 있음·누끼) = 100장**

### 6.3 PNG 자산 구조 (평면)

```
/web/public/assets/characters/
  F_h{1-5}_{none|cap|beanie|band|glasses}.png        # 여, 배경 있음 (25장)
  F_h{1-5}_{none|cap|beanie|band|glasses}_clear.png  # 여, 누끼 (25장)
  M_h{1-5}_{none|cap|beanie|bucket|glasses}.png      # 남, 배경 있음 (25장)
  M_h{1-5}_{none|cap|beanie|bucket|glasses}_clear.png# 남, 누끼 (25장)
```

- 배경 있음: 아이보리 `#FFF9E6` — 캐릭터 커스터마이징(7번)·결과(6번) 화면에서 사용
- 누끼(`_clear`): 배경 투명 — 봉사자증 앞면 흰 증명사진 프레임 위에 올려서 합성

### 6.4 캐릭터 표시 컴포넌트

```tsx
// web/src/components/character/CharacterImage.tsx
type Gender = "F" | "M";
type Hair = 1 | 2 | 3 | 4 | 5;
type Accessory = "none" | "cap" | "beanie" | "band" | "bucket" | "glasses";

interface Props {
  gender: Gender;
  hair: Hair;
  accessory: Accessory;
  clear?: boolean;   // true면 누끼 버전 (봉사자증용)
  size?: number;     // px (정사각형)
}

export function CharacterImage({ gender, hair, accessory, clear = false, size = 256 }: Props) {
  const suffix = clear ? "_clear" : "";
  const src = `/assets/characters/${gender}_h${hair}_${accessory}${suffix}.png`;
  return <img src={src} width={size} height={size} alt="" />;
}
```

### 6.5 액세서리 ↔ 성별 검증

성별 F는 액세서리에 `bucket` 사용 불가, 성별 M은 `band` 사용 불가. Zod 스키마에서 refine으로 검증:

```ts
// shared/src/schemas.ts
import { z } from "zod";

export const characterSchema = z.object({
  gender: z.enum(["F", "M"]),
  hair: z.number().int().min(1).max(5),
  accessory: z.enum(["none", "cap", "beanie", "band", "bucket", "glasses"]),
}).refine(
  (v) => !(v.gender === "F" && v.accessory === "bucket"),
  { message: "F는 bucket을 쓸 수 없음" }
).refine(
  (v) => !(v.gender === "M" && v.accessory === "band"),
  { message: "M은 band를 쓸 수 없음" }
);
```

### 6.6 결과 유형별 캐릭터 기본값 (검사 직후 자동 세팅)

| 유형 | F 기본 (h, accessory) | M 기본 (h, accessory) |
|------|------------------------|------------------------|
| `investigator` | (h3, glasses) | (h3, glasses) |
| `helper` | (h1, band) | (h1, none) |
| `leader` | (h2, cap) | (h5, cap) |
| `innovator` | (h4, beanie) | (h4, beanie) |

기본값 자동 세팅 후 사용자가 헤어·액세서리 자유롭게 변경.

### 6.7 봉사자증 합성 룰

- 앞면 캐릭터 영역: 누끼 캐릭터(`_clear.png`) + 흰색 증명사진 프레임 (흰 사각 + 1px 회색 라인 + soft shadow)
- 뒷면 미니 썸네일: 누끼 캐릭터(`_clear.png`)를 작게 (48~64px)
- 결과 화면(6번)·커스터마이징(7번) 캐릭터 영역: 배경 있는 버전 사용

### 6.8 봉사자증 이미지 저장
`html2canvas`로 봉사자증 컴포넌트(앞면 + 뒷면) 통째로 캡처해 PNG로 저장. CORS 문제 회피를 위해 캐릭터 PNG는 동일 origin에서 서빙(`/assets/characters/...`).

---

## 7. 봉사자증 합성·발급

### 7.1 봉사자증 번호
형식: `KB-{year}-{5자리}` (예: `KB-2026-04821`)
- year: 발급 시점 연도
- 5자리: 일련번호 또는 세션 ID 해시 앞 5자리 (충돌 방지 위해 일련번호 권장)

### 7.2 앞면 구성 요소
- KB 라이프 로고 (좌상단)
- "10기 봉사자증" 타이틀
- 캐릭터 이미지 (256x256)
- 입장 사진 (폴라로이드 썸네일, 96x120)
- 닉네임 / 봉사유형명 / 봉사 각오 한 줄
- 발급일자 + 고유번호

### 7.3 뒷면 구성 요소 (9영역)
A. 헤더 — KB 로고 + BACK SIDE
B. 결과 헤드라인 — 유형 별명 + 미니 캐릭터
C. 마이크로 카피 — 따옴표 인용구 박스 (유형 컬러)
D. 유형 설명 4줄
E. 추천 봉사 카드 3개
F. KB 대회 안내 박스 + QR
G. 마무리 멘트
H. 발급 정보 (작게)
I. 액션 버튼 + 메인 CTA

### 7.4 4유형 본문 (DB나 i18n으로 관리. JSON 예시)

```ts
// lib/result-content.ts
export const RESULT_CONTENT: Record<ResultType, {
  code: "SAGE" | "WARM" | "BOLD" | "NOVA";  // 4글자 표시 코드 (UI 강조용)
  name: string; nickname: string; micro: string;
  description: string; recommendations: { name: string; desc: string }[];
}> = {
  investigator: {
    code: "SAGE",
    name: "지식나눔 탐구자",
    nickname: "차근차근 세상을 풀어내는 사람",
    micro: "지식은 나눌수록 커지는 유일한 자본이에요",
    description: "호기심이 많고, 복잡한 문제를 만나면 자료를 모아 분석하는 데 강한 사람이에요. 새로 배우는 즐거움이 곧 동력이고, 그 지식이 누군가에게 도움이 될 때 더 큰 보람을 느껴요. 머리를 쓰는 봉사에서 진가를 발휘하는 타입.",
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
    description: "다른 사람의 감정에 깊이 공감하고, 함께 있는 것만으로도 힘이 되는 사람이에요. 경쟁이나 효율보다 따뜻한 관계와 정서적 유대를 더 소중히 여기죠. 사람의 체온이 닿는 곳에서 가장 빛나요.",
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
    description: "머리로 고민하기보다 몸을 움직여 결과를 만들어내는 사람이에요. 위기 상황에서 망설임 없이 먼저 손을 내밀고, 팀이 흔들릴 땐 자연스럽게 중심을 잡아주죠. 현장에서 진짜 리더십이 나오는 타입.",
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
    description: "평범한 방식이 아닌 자기만의 새로운 방식으로 세상을 표현하고 싶은 사람이에요. 풍부한 상상력과 감수성으로 사회 문제에 신선한 답을 던지고, 사람들의 인식을 바꾸는 힘이 있어요.",
    recommendations: [
      { name: "SNS 콘텐츠 제작", desc: "유기동물·로컬 소상공인 홍보 숏폼·카드뉴스" },
      { name: "캠페인 디자인", desc: "환경·인식 개선 포스터·굿즈" },
      { name: "업사이클링", desc: "폐기물 리디자인 작품 제작·전시" },
    ],
  },
};
```

---

## 8. 12문항 (확정 — DB seed 또는 상수)

```ts
// lib/questions.ts
export const QUESTIONS = [
  { id: 1, text: "복잡한 문제를 만나면 자료를 모아서 차근차근 풀어보고 싶어진다", type: "investigator" },
  { id: 2, text: "누군가 나에게 \"고맙다\"고 말해줄 때, 그 한마디가 오래 마음에 남는다", type: "helper" },
  { id: 3, text: "교실에 앉아 있는 것보다 밖에서 몸을 움직이는 일이 더 잘 맞는다", type: "leader" },
  { id: 4, text: "내 아이디어로 사회 문제에 대한 사람들의 생각을 바꿔보고 싶다", type: "innovator" },
  { id: 5, text: "내가 잘 아는 분야가 생기면 그게 나만의 특별한 자산처럼 느껴진다", type: "investigator" },
  { id: 6, text: "친구가 힘들어할 때 옆에서 가만히 들어주는 것만으로도 보람을 느낀다", type: "helper" },
  { id: 7, text: "남들이 다 하는 방식보다 나만의 새로운 방식으로 표현하는 게 좋다", type: "innovator" },
  { id: 8, text: "팀이 우왕좌왕할 때 내가 나서서 정리하면 오히려 마음이 편해진다", type: "leader" },
  { id: 9, text: "봉사를 한다면 새로운 걸 배우거나 내 진로 탐색에 도움이 됐으면 좋겠다", type: "investigator" },
  { id: 10, text: "평범한 것보다는 조금 엉뚱하더라도 특별한 게 더 끌린다", type: "innovator" },
  { id: 11, text: "봉사는 같이 하는 사람들과 따뜻한 관계가 만들어질 때 의미 있다", type: "helper" },
  { id: 12, text: "땀 흘리고 나면 머리가 맑아지고 내 쓸모를 확인하는 기분이 든다", type: "leader" },
] as const;
```

---

## 9. 보안·프라이버시

- HttpOnly + Secure + SameSite=Strict 쿠키
- 사진 API는 쿠키 검증 후 응답. 직접 URL로 접근 차단
- 사진 자동 삭제 cron (행사 종료 + 7일)
- 부하 대응: 검사 페이지는 SSG/CSR 위주, API에는 단순 rate limit (`/api/session` POST는 IP당 분당 5회)
- HTTPS 필수 (홈서버에서 Cloudflare Tunnel + 자체 도메인 권장)

---

## 10. 운영·모니터링

### 10.1 어드민 대시보드 KPI
- 진행 인원 (검사 시작 ~ 봉사자증 발급 미완료)
- 시간당 완료 수
- 평균 소요 시간
- 4유형별 분포
- 경품 재고 (1·2·3등급별)

### 10.2 장애 대응
- 와이파이 끊김 → SW 캐시로 검사 진행 가능, 결과는 복귀 시 동기화
- 폰 없는 청소년 → 부스 비치 태블릿 2대
- DB 연결 실패 → 운영자 알림 + 다음 참여자 일시 안내
