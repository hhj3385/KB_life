import { useNavigate, useParams } from "react-router";
import { ResultScreen } from "../app/components/screens/ResultScreen";
import { useSession } from "../lib/session-context";

export function ResultPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { resultType } = useSession();

  // 결과 없이 접근하면 처음으로
  if (!resultType) {
    void navigate("/");
    return null;
  }

  return (
    <ResultScreen
      type={resultType}
      onNext={() => void navigate(`/s/${id}/character`)}
    />
  );
}
