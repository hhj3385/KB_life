import { useNavigate, useParams } from "react-router";
import { TestIntroScreen } from "../app/components/screens/TestIntroScreen";
import { api } from "../lib/api";

export function TestIntroPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const handleNext = async () => {
    if (!id) return;
    try {
      await api.session.consent(id);
    } catch {
      // 동의 API 실패해도 검사는 진행 (서버에서 재검증)
    }
    void navigate(`/s/${id}/test`);
  };

  return (
    <TestIntroScreen
      onNext={() => void handleNext()}
      onBack={() => void navigate(-1)}
    />
  );
}
