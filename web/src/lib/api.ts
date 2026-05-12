import type { ResultType, CharacterConfig } from "@kb-booth/shared";

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const hasBody = init?.body != null;
  const res = await fetch(path, {
    credentials: "include",
    headers: {
      ...(hasBody ? { "content-type": "application/json" } : {}),
      ...init?.headers,
    },
    ...init,
  });

  const json = (await res.json()) as { ok: boolean; data?: T; error?: { code: string; message: string } };

  if (!json.ok) {
    throw new ApiError(
      json.error?.code ?? "UNKNOWN",
      json.error?.message ?? "오류가 발생했습니다",
    );
  }

  return json.data as T;
}

export const api = {
  session: {
    create: () =>
      request<{ sessionId: string }>("/api/session", { method: "POST" }),

    consent: (id: string) =>
      request<null>(`/api/session/${id}/consent`, { method: "POST" }),

    submitTest: (id: string, responses: number[]) =>
      request<{ resultType: ResultType; scores: Record<ResultType, number> }>(
        `/api/session/${id}/test`,
        { method: "POST", body: JSON.stringify({ responses }) },
      ),

    saveCharacter: (id: string, config: CharacterConfig) =>
      request<null>(`/api/session/${id}/character`, {
        method: "PATCH",
        body: JSON.stringify(config),
      }),

    issue: (
      id: string,
      payload: { nickname?: string; pledge: string; realName: string; contact: string; birthDate: string },
    ) =>
      request<{ cardNo: string; issuedAt: string }>(`/api/session/${id}/issue`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    uploadPhoto: async (id: string, blob: Blob): Promise<void> => {
      const form = new FormData();
      form.append("photo", blob, "photo.jpg");
      const res = await fetch(`/api/session/${id}/photo`, {
        method: "PATCH",
        credentials: "include",
        body: form,
        // content-type 헤더 없음 — 브라우저가 multipart boundary 자동 설정
      });
      const json = (await res.json()) as { ok: boolean; error?: { code: string; message: string } };
      if (!json.ok) throw new ApiError(json.error?.code ?? "UNKNOWN", json.error?.message ?? "업로드 실패");
    },
  },
};
