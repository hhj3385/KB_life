import { z } from "zod";

export const ResultTypeSchema = z.enum([
  "investigator",
  "helper",
  "leader",
  "innovator",
]);

export const GenderSchema = z.enum(["F", "M"]);

// POST /api/session/[id]/test
export const TestSubmitSchema = z.object({
  responses: z
    .array(z.number().int().min(1).max(5))
    .length(12, "응답은 정확히 12개여야 합니다"),
});

// PATCH /api/session/[id]/character — SPEC.md 6.5
// F는 bucket 불가, M은 band 불가
export const characterSchema = z
  .object({
    gender: GenderSchema,
    hair: z.number().int().min(1).max(5),
    accessory: z.enum(["none", "cap", "beanie", "band", "bucket", "glasses"]),
  })
  .refine((v) => !(v.gender === "F" && v.accessory === "bucket"), {
    message: "F는 bucket을 쓸 수 없음",
  })
  .refine((v) => !(v.gender === "M" && v.accessory === "band"), {
    message: "M은 band를 쓸 수 없음",
  });

export const CharacterUpdateSchema = characterSchema;

// POST /api/session/[id]/issue
export const IssueCardSchema = z.object({
  nickname: z.string().max(20).optional(),
  pledge: z.string().min(1).max(50),
  realName: z.string().min(1).max(20),
  contact: z.string().regex(/^010-\d{3,4}-\d{4}$/, "010-XXXX-XXXX 형식으로 입력해주세요"),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식으로 입력해주세요"),
});

// ── 장소·경품 (어드민) ────────────────────────────────────

// POST /api/admin/locations · PATCH /api/admin/locations/:id
export const LocationInputSchema = z.object({
  name: z.string().min(1, "장소 이름을 입력해주세요").max(40),
  active: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

// POST /api/admin/locations/:id/prizes · PATCH /api/admin/prizes/:id
// rank: 표시·정렬용 라벨(1=1등). 추첨 확률에는 영향 없음(재고 비례 랜덤)
export const PrizeInputSchema = z.object({
  name: z.string().min(1, "경품 이름을 입력해주세요").max(60),
  rank: z.number().int().min(0).max(99).optional(),
  total: z.number().int().min(0).max(100000),
});

// PATCH /api/admin/prizes/:id — 수량/이름 수정. remaining 직접 보정 허용(소진 정정 등)
export const PrizeUpdateSchema = z.object({
  name: z.string().min(1).max(60).optional(),
  rank: z.number().int().min(0).max(99).optional(),
  total: z.number().int().min(0).max(100000).optional(),
  remaining: z.number().int().min(0).max(100000).optional(),
});

// POST /api/session — 진입 시 선택한 장소
export const SessionCreateSchema = z.object({
  locationId: z.string().uuid().optional(),
});

// 공통 API 응답 형태
export type ApiOk<T> = { ok: true; data: T };
export type ApiError = { ok: false; error: { code: string; message: string } };
export type ApiResponse<T> = ApiOk<T> | ApiError;
