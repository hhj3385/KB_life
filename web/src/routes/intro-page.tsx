import { useNavigate } from "react-router";
import { IntroScreen } from "../app/components/screens/IntroScreen";

export function IntroPage() {
  const navigate = useNavigate();

  // 세션 생성은 장소 선택(/start) 이후에 진행
  return <IntroScreen onStart={() => void navigate("/start")} />;
}
