import { ChevronLeft } from "lucide-react";
import { QUESTIONS } from "@kb-booth/shared";

const SCALE_LABELS: Record<number, string> = {
  1: "전혀\n아니다",
  2: "아니다",
  3: "보통",
  4: "그렇다",
  5: "매우\n그렇다",
};

interface QuestionScreenProps {
  questionIndex: number; // 0~11
  answer: number | null;  // 1~5 또는 null
  onAnswer: (value: number) => void;
  onBack: () => void;
}

export function QuestionScreen({ questionIndex, answer, onAnswer, onBack }: QuestionScreenProps) {
  const currentQ = questionIndex + 1;
  const totalQ = QUESTIONS.length; // 12
  const progress = (currentQ / totalQ) * 100;
  const question = QUESTIONS[questionIndex];

  return (
    <div className="relative min-h-full pt-12 pb-32 px-6 flex flex-col">
      {/* Header */}
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-[#1E1E1E]" />
        </button>
        <span className="text-[#1E1E1E]/60 text-[12px]">{currentQ} / {totalQ}</span>
      </div>

      {/* Progress bar */}
      <div className="mt-6 bg-white rounded-full h-2 overflow-hidden shadow-sm">
        <div
          className="h-full bg-gradient-to-r from-[#FFCC00] to-[#FFE680] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question */}
      <div className="mt-8 flex-1">
        <div
          className="inline-block bg-[#FFCC00] text-[#1E1E1E] rounded-full px-3 py-1 text-[11px]"
          style={{ fontWeight: 700 }}
        >
          Q{currentQ}
        </div>
        <h1
          className="mt-3 text-[#1E1E1E] tracking-tight leading-tight"
          style={{ fontSize: 22, fontWeight: 800 }}
        >
          {question.text}
        </h1>
        <p className="mt-2 text-[#1E1E1E]/50 text-[13px]">나와 얼마나 일치하나요?</p>

        {/* 5점 척도 */}
        <div className="mt-8 flex gap-2 justify-between">
          {([1, 2, 3, 4, 5] as const).map((v) => (
            <button
              key={v}
              onClick={() => onAnswer(v)}
              className="flex-1 flex flex-col items-center gap-2 transition-all active:scale-95"
            >
              <div
                className={`w-full aspect-square rounded-2xl flex items-center justify-center transition-all ${
                  answer === v
                    ? "bg-[#FFCC00] shadow-[0_6px_0_#E0B400]"
                    : "bg-white shadow-[0_4px_12px_rgba(30,30,30,0.06)] hover:bg-[#FFF9E6]"
                }`}
              >
                <span
                  className="text-[#1E1E1E]"
                  style={{ fontSize: 20, fontWeight: 800 }}
                >
                  {v}
                </span>
              </div>
              <span
                className="text-[#1E1E1E]/50 text-center whitespace-pre-line"
                style={{ fontSize: 9, fontWeight: 600 }}
              >
                {SCALE_LABELS[v]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center text-[#1E1E1E]/40 text-[11px]">
        솔직하게 답해주세요. 틀린 답은 없어요 😊
      </div>
    </div>
  );
}
