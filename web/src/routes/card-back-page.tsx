import { useNavigate, useParams } from "react-router";
import { BadgeBackScreen } from "../app/components/screens/BadgeBackScreen";
import { useSession } from "../lib/session-context";

export function CardBackPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { resultType, character, cardNo } = useSession();

  if (!resultType) {
    void navigate("/");
    return null;
  }

  return (
    <BadgeBackScreen
      type={resultType}
      character={character ?? undefined}
      cardNo={cardNo ?? undefined}
      onFlip={() => void navigate(`/s/${id}/card`)}
      onDrawPrize={() => alert("경품 뽑기존에서 운영자에게 화면을 보여주세요!")}
    />
  );
}
