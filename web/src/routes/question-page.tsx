import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { QuestionScreen } from "../app/components/screens/QuestionScreen";
import { useSession } from "../lib/session-context";

export function QuestionPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { setResponses } = useSession();

  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(12).fill(null));

  const handleAnswer = (value: number) => {
    const next = answers.map((a, i) => (i === questionIndex ? value : a));
    setAnswers(next);

    if (questionIndex < 11) {
      // 다음 문항으로 자동 이동
      setTimeout(() => setQuestionIndex((q) => q + 1), 300);
    } else {
      // 12문항 완료 → 응답 저장 후 분석 페이지로
      const responses = next as number[];
      setResponses(responses);
      void navigate(`/s/${id}/analyzing`);
    }
  };

  const handleBack = () => {
    if (questionIndex === 0) {
      void navigate(`/s/${id}/test/intro`);
    } else {
      setQuestionIndex((q) => q - 1);
    }
  };

  return (
    <QuestionScreen
      questionIndex={questionIndex}
      answer={answers[questionIndex]}
      onAnswer={handleAnswer}
      onBack={handleBack}
    />
  );
}
