import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { CharacterCustomizationScreen } from "../app/components/screens/CharacterCustomizationScreen";
import { useSession } from "../lib/session-context";
import { api } from "../lib/api";
import type { CharacterConfig } from "@kb-booth/shared";

export function CharacterPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { resultType, character, setCharacter } = useSession();
  const [busy, setBusy] = useState(false);

  if (!resultType) {
    void navigate("/");
    return null;
  }

  const handleNext = async (config: CharacterConfig) => {
    if (busy || !id) return;
    setBusy(true);
    setCharacter(config);
    try {
      await api.session.saveCharacter(id, config);
    } catch {
      // 캐릭터 저장 실패해도 진행 (로컬 Context에는 저장됨)
    }
    void navigate(`/s/${id}/pledge`);
  };

  return (
    <div className="relative h-full">
      <CharacterCustomizationScreen
        resultType={resultType}
        initial={character ?? undefined}
        onNext={(config) => void handleNext(config)}
        onBack={() => void navigate(-1)}
      />
      {busy && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-[32px]">
          <div className="w-8 h-8 rounded-full border-4 border-[#FFCC00] border-t-transparent animate-spin" />
        </div>
      )}
    </div>
  );
}
