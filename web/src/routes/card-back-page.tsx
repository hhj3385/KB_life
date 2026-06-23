import { useNavigate, useParams } from "react-router";
import { BadgeBackScreen } from "../app/components/screens/BadgeBackScreen";
import { useSession } from "../lib/session-context";
import { PRIZE_FEATURE_ENABLED } from "../lib/feature-flags";

export function CardBackPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { resultType, character, cardNo } = useSession();

  if (!resultType) {
    void navigate("/");
    return null;
  }

  // 경품 기능 ON: 실제 추첨 화면으로 / OFF: 도입 이전처럼 안내만
  const handleDrawPrize = () => {
    if (PRIZE_FEATURE_ENABLED) {
      void navigate(`/s/${id}/draw`);
    } else {
      alert("경품 뽑기존에서 운영자에게 화면을 보여주세요!");
    }
  };

  return (
    <BadgeBackScreen
      type={resultType}
      character={character ?? undefined}
      cardNo={cardNo ?? undefined}
      onFlip={() => void navigate(`/s/${id}/card`)}
      onDrawPrize={handleDrawPrize}
    />
  );
}
