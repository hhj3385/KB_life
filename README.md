# KB 라이프 청소년자원봉사대회 — 부스 웹앱

경남 청소년 박람회 KB 라이프 부스용 체험 웹앱 모노레포.

## 패키지 구조

```
/
├── web/        # Vite + React 18 + Tailwind v4 + shadcn/ui (프론트)
├── server/     # Fastify + Prisma + SQLite (백엔드)
└── shared/     # Zod 스키마, 4유형 상수, 12문항, 채점 로직 (공통)
```

## 빠른 시작

### 사전 요구사항
- Node.js 20+
- pnpm 11+

### 설치

```bash
pnpm install
```

### 개발 서버 (프론트 + 백엔드 동시 실행)

```bash
pnpm dev
```

- 프론트: http://localhost:5173
- 백엔드: http://localhost:3001

### 프론트만 실행

```bash
pnpm --filter @kb-booth/web dev
```

### 백엔드만 실행

```bash
pnpm --filter @kb-booth/server dev
```

### DB 마이그레이션

```bash
pnpm migrate
# 또는 직접:
cd server && npx prisma migrate dev
```

### 빌드

```bash
pnpm build
```

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| 프론트 | Vite 6 + React 18 + TypeScript + Tailwind v4 + shadcn/ui |
| 라우팅 | react-router 7 |
| 백엔드 | Fastify 5 + TypeScript |
| DB | SQLite (Prisma) |
| 공통 검증 | Zod |

## 기획·명세

- `docs/SPEC.md` — 데이터 모델, API, 화면 흐름, 채점 로직, 4유형 본문
- `docs/FIGMA_GUIDE.md` — Figma 자산 활용 가이드
- `CLAUDE.md` — 개발 컨벤션 및 작업 룰
