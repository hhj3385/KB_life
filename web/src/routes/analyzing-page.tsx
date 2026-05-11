import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { LoadingScreen } from "../app/components/screens/LoadingScreen";
import { useSession } from "../lib/session-context";
import { api } from "../lib/api";

export function AnalyzingPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { responses, setResult } = useSession();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    if (!id || responses.length !== 12) {
      void navigate("/");
      return;
    }

    // 최소 1.5초 로딩 효과 + 서버 채점
    const start = Date.now();
    api.session
      .submitTest(id, responses)
      .then((result) => {
        setResult(result);
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, 1500 - elapsed);
        setTimeout(() => void navigate(`/s/${id}/result`), remaining);
      })
      .catch(() => {
        void navigate("/");
      });
  }, [id, navigate, responses, setResult]);

  return <LoadingScreen />;
}
