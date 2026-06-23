import { useState } from "react";
import { useNavigate } from "react-router";
import { IntroScreen } from "../app/components/screens/IntroScreen";
import { useSession } from "../lib/session-context";
import { api, ApiError } from "../lib/api";
import { PRIZE_FEATURE_ENABLED } from "../lib/feature-flags";

export function IntroPage() {
  const navigate = useNavigate();
  const { initSession } = useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 경품 기능 ON: 장소 선택(/start)으로 이동해 거기서 세션 생성
  // 경품 기능 OFF: 장소 단계 없이 바로 세션을 만들고 사진 단계로 (도입 이전 흐름)
  const handleStart = async () => {
    if (PRIZE_FEATURE_ENABLED) {
      void navigate("/start");
      return;
    }
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const { sessionId } = await api.session.create();
      initSession(sessionId);
      void navigate(`/s/${sessionId}/photo`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
      setBusy(false);
    }
  };

  return (
    <div className="relative h-full">
      <IntroScreen onStart={() => void handleStart()} />
      {busy && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-[32px]">
          <div className="w-10 h-10 rounded-full border-4 border-[#FFCC00] border-t-transparent animate-spin" />
        </div>
      )}
      {error && (
        <div className="absolute bottom-28 left-6 right-6 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-red-700 text-[13px] text-center">
          {error}
        </div>
      )}
    </div>
  );
}
