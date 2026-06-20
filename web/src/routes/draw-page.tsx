import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { DrawScreen } from "../app/components/screens/DrawScreen";
import { useSession } from "../lib/session-context";
import { api, ApiError } from "../lib/api";
import type { DrawResult } from "@kb-booth/shared";

type Phase = "idle" | "drawing" | "done";

export function DrawPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { sessionId, resultType } = useSession();

  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<DrawResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 검사 미완료 상태로 직접 진입하면 처음으로
  if (!resultType) {
    void navigate("/");
    return null;
  }

  const sid = id ?? sessionId;

  const handleDraw = async () => {
    if (!sid || phase === "drawing") return;
    setPhase("drawing");
    setError(null);
    try {
      const res = await api.session.draw(sid);
      // 추첨 연출을 위해 약간의 지연 후 공개
      setTimeout(() => {
        setResult(res);
        setPhase("done");
      }, 1400);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "추첨에 실패했습니다. 잠시 후 다시 시도해주세요.");
      setPhase("idle");
    }
  };

  return (
    <DrawScreen
      phase={phase}
      result={result}
      error={error}
      onDraw={() => void handleDraw()}
      onBack={() => void navigate(`/s/${sid}/card/back`)}
    />
  );
}
