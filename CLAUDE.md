# KB 라이프 청소년자원봉사대회 부스 웹앱 — Claude 작업 룰

## 프로젝트 컨텍스트

경남 청소년 박람회에서 운영하는 KB 라이프 전국청소년자원봉사대회 10기 서포터즈 부스의 체험형 웹앱.
참여자가 부스에서 사진 촬영 → QR 접속 → 봉사 성격유형 검사(12문항) → 디지털 봉사자증 발급 → 경품 뽑기로 이어지는 흐름.

- 운영 규모: 1~2일 / 300~800명 / 시간당 60~100명 처리 / 1인당 5~7분
- 디바이스: 모바일 우선 (iPhone 14 / 375x812 기준)
- 자체 홈서버 운영 (외부 클라우드 의존 X)

상세 기획안은 `KB_부스_기획안.docx` 참고. 통합 기술 명세는 `docs/SPEC.md`.

---

## 기술 스택

| 레이어 | 선택 | 비고 |
|--------|------|------|
| 모노레포 | pnpm workspace | `web/` `server/` `shared/` 분리 |
| 프론트 | Vite 6 + React 18 + TypeScript + Tailwind v4 + shadcn/ui | Figma Make export 그대로 활용 |
| 라우팅 | react-router 7 | SPA. QR 진입이라 SSR 불필요 |
| 상태 관리 | React Context (Zustand 도입은 복잡도 늘면 검토) | 세션 흐름이 단선이라 Context면 충분 |
| 백엔드 | Fastify + TypeScript | 별도 프로세스. PM2로 실행 |
| DB | **SQLite (개발)** → PostgreSQL (배포 시 마이그레이션 옵션) + Prisma | 자체 홈서버. PostgreSQL 미준비 상태라 SQLite로 시작 |
| 인증 | 없음 — 익명 세션 ID (HttpOnly 쿠키, UUID v4) | 미성년자 동의 체크만 |
| 이미지 | 홈서버 로컬 파일시스템 (`server/uploads/`) | Fastify route 통해서만 노출 |
| 캐릭터 합성 | **사전 합성된 통이미지 100장 직접 사용** (부품 레이어 합성 X) | 헤어×액세서리 조합이 PNG에 미리 합성되어 있음 |
| 공통 검증 | Zod (`shared/`에서 web·server 양쪽이 import) | 결과·요청·응답 스키마 통일 |
| 배포 | PM2 (홈서버), 정적 자산은 Vite build → Fastify static serve | |

### DB 호환성 메모
SQLite로 시작하므로 Prisma 스키마에서 enum, Int[], Json 타입을 사용하지 않는다.
- enum → string + Zod 검증
- Int[] → JSON string으로 저장 (`JSON.stringify`/`JSON.parse`)
- Json? → string으로 저장 (JSON 직렬화)
- VarChar 길이 제한 → 앱 레벨(Zod)에서 검증
PostgreSQL로 옮길 때는 위 타입을 native enum/array/json으로 한 번만 바꾸면 된다.

---

## 디자인 시스템

### 컬러 토큰
```ts
export const colors = {
  kbYellow: "#FFCC00",   // 메인
  charcoal: "#1E1E1E",   // 텍스트
  ivory:    "#FFF9E6",   // 배경

  // 4유형 보조 컬러
  investigator: "#6BB5FF", // 지식나눔 탐구자 — 스카이블루
  helper:       "#B5A0E5", // 공감기반 조력자 — 라벤더
  leader:       "#FF7E6B", // 실천적 현장 리더 — 코랄
  innovator:    "#5DD3B0", // 창의적 사회혁신가 — 민트
};
```

### 타이포
- 한글: Pretendard / 영문: Inter
- 제목 Bold / 본문 Medium

### 디자인 원칙
- 둥근 모서리 16~24px / 부드러운 그림자 / 카드 기반
- 한 화면에 한 액션
- CTA는 화면 하단 고정, KB 옐로우 베이스
- 봉사자증 화면은 SNS 캡처 욕구 자극할 만큼 정성

---

## 4유형 정의

| 내부 코드 | 표시 코드 (4글자) | 이름 | 컬러 | 별명 |
|-----------|-------------------|------|------|------|
| `investigator` | **SAGE** | 지식나눔 탐구자 | sky | 차근차근 세상을 풀어내는 사람 |
| `helper` | **WARM** | 공감기반 조력자 | lavender | 마음을 듣는 사람 |
| `leader` | **BOLD** | 실천적 현장 리더 | coral | 먼저 나서는 사람 |
| `innovator` | **NOVA** | 창의적 사회혁신가 | mint | 세상을 새로 그리는 사람 |

- **내부 코드**: 코드·DB·API에서 사용 (식별자)
- **표시 코드**: UI(봉사자증·결과 화면)에서 큰 폰트로 노출하는 4글자 알파벳
- **별명**: 표시 코드 아래에 작은 폰트로 풀어 쓰는 한국어 설명

상세 본문(설명·마이크로 카피·추천 봉사)은 `docs/SPEC.md` 참고.

---

## 코딩 컨벤션

- 파일/폴더: kebab-case (`character-picker.tsx`)
- 컴포넌트: PascalCase (`CharacterPicker`)
- 변수/함수: camelCase
- DB 컬럼: snake_case (Prisma `@@map`로 모델은 camelCase 유지)
- 주석: 한국어 OK. 비즈니스 로직(검사 채점, 동점 처리 등)은 반드시 주석
- TypeScript strict 모드. `any` 금지. 외부 데이터는 Zod 검증
- 한 컴포넌트 200줄 넘으면 분리 검토

### 폴더 구조 (모노레포)
```
/                       # 작업 폴더 (pnpm workspace 루트)
├── package.json
├── pnpm-workspace.yaml
├── CLAUDE.md
├── docs/
│   ├── SPEC.md
│   └── FIGMA_GUIDE.md
├── shared/             # web·server 공통 (Zod 스키마, 타입, 상수)
│   └── src/
│       ├── types.ts
│       ├── questions.ts        # 12문항
│       ├── result-content.ts   # 4유형 본문
│       └── schemas.ts          # Zod
├── web/                # Vite + React 프론트
│   └── src/
│       ├── routes/             # react-router 페이지
│       ├── components/
│       │   ├── ui/             # shadcn/ui (Figma export)
│       │   ├── screens/        # 화면 단위 (Figma export)
│       │   ├── character/      # 캐릭터 합성
│       │   └── card/           # 봉사자증
│       ├── lib/
│       │   ├── api.ts          # fetch 클라이언트
│       │   └── session.ts      # 세션 컨텍스트
│       └── styles/
└── server/             # Fastify 백엔드
    ├── src/
    │   ├── index.ts
    │   ├── routes/
    │   │   ├── session.ts
    │   │   ├── photo.ts
    │   │   └── admin.ts
    │   ├── lib/
    │   │   ├── db.ts           # Prisma 클라이언트
    │   │   ├── scoring.ts      # 검사 채점 로직
    │   │   └── character.ts    # 부품 검증
    │   └── plugins/
    ├── prisma/
    │   └── schema.prisma
    └── uploads/                # 입장 사진 (gitignore)
```

---

## 중요 규칙 (반드시 준수)

### 개인정보·보안
- 입장 사진은 행사 종료 후 7일 이내 자동 삭제 (cron 또는 만료 시점에 lazy 삭제)
- 사진 URL은 추측 불가능한 UUID 기반. 직접 접근 차단 (세션 쿠키 검증 후만 응답)
- 이름·연락처는 받지 않는다. 봉사자증의 "이름"은 닉네임/별명 권장이며 입력은 선택
- 미성년자 동의 체크박스 없이는 검사 시작 불가
- 모든 응답은 익명 세션 ID에 묶임. 별도 회원가입 없음

### 부스 운영 제약
- 모든 페이지는 폰 한 손 조작 가능한 크기. 버튼 최소 44pt
- 검사 페이지는 오프라인 캐싱(Service Worker)으로 와이파이 끊겨도 진행 가능
- 한 세션은 검사 1회·뽑기 1회. 새 참여자는 새 세션
- 어드민 대시보드는 운영 인력 폰에서 사용. 진행 인원 / 완료 수 / 평균 소요 시간 / 경품 재고

### 카피·문구
- KB 라이프 청소년자원봉사대회 슬로건 사용 X (로고만 분산 배치)
- 봉사자증 뒷면 또는 결과 마지막 화면에 마무리 멘트 고정:
  > "KB 라이프 청소년자원봉사대회, 여러분의 참여를 기다릴게요!"

---

## 작업 시 참고 순서

1. 새 작업 들어오면 먼저 `docs/SPEC.md` 확인 → 데이터 모델·API·화면 흐름
2. 디자인 작업이면 `docs/FIGMA_GUIDE.md` 확인 → Figma 자산 활용 방식
3. 메모리(`spaces/.../memory/`)의 `project_kb_booth.md`에 진행 현황 누적
4. 큰 결정사항(스택 변경, 4유형 정의 변경 등)은 메모리 + CLAUDE.md 동시 갱신

---

## 다음 단계 추적

현재까지 확정된 작업 (2026-05-10):
- [x] 1차 기획안 (Word docx) 산출
- [x] 4유형 정의 (학술 근거 + 결과 본문)
- [x] 검사 12문항 + 채점 로직
- [x] 봉사자증 앞·뒷면 영역 구성
- [x] 캐릭터 부품 옵션 확정 (헤어 5 / 모자 4 / 안경 3 × 2성별)
- [x] CLAUDE.md / SPEC / FIGMA_GUIDE 초안

진행 예정:
- [ ] 캐릭터 부품 PNG 자산 export (Figma → `/public/assets/characters/`)
- [ ] Figma 보강 요청 (캐릭터 커스터마이징 화면, 봉사자증 뒷면 9영역)
- [ ] Next.js 프로젝트 초기화 + Prisma 스키마 생성
- [ ] 검사 채점 로직 + 단위 테스트
- [ ] 캐릭터 합성 컴포넌트
- [ ] 봉사자증 이미지 다운로드(html2canvas 또는 SSR canvas)
- [ ] 어드민 대시보드
- [ ] 부스 평면도 + 인력 운영 매뉴얼
