import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { PledgeScreen } from "../app/components/screens/PledgeScreen";
import { useSession } from "../lib/session-context";
import { api, ApiError } from "../lib/api";

export function PledgePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { resultType, character, setPledgeInfo, setCardNo } = useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!resultType) {
    void navigate("/");
    return null;
  }

  const handleNext = async (nickname: string, pledge: string) => {
    if (busy || !id) return;
    setBusy(true);
    setError(null);
    setPledgeInfo(nickname, pledge);
    try {
      const { cardNo } = await api.session.issue(id, { nickname: nickname || undefined, pledge });
      setCardNo(cardNo);
      void navigate(`/s/${id}/card`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "발급 중 오류가 발생했습니다.");
      setBusy(false);
    }
  };

  return (
    <div className="relative h-full">
      <PledgeScreen
        resultType={resultType}
        character={character ?? undefined}
        onNext={(nickname, pledge) => void handleNext(nickname, pledge)}
        onBack={() => void navigate(-1)}
      />
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
