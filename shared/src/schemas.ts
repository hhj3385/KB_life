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
});

// 공통 API 응답 형태
export type ApiOk<T> = { ok: true; data: T };
export type ApiError = { ok: false; error: { code: string; message: string } };
export type ApiResponse<T> = ApiOk<T> | ApiError;
