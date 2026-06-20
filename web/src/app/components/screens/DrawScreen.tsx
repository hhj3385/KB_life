import { ChevronLeft, Gift, PartyPopper, Sparkles } from "lucide-react";
import { AppHeader } from "../../../components/layout/AppHeader";
import type { DrawResult } from "@kb-booth/shared";

type Phase = "idle" | "drawing" | "done";

interface DrawScreenProps {
  phase: Phase;
  result: DrawResult | null;
  error: string | null;
  onDraw: () => void;
  onBack: () => void;
}

export function DrawScreen({ phase, result, error, onDraw, onBack }: DrawScreenProps) {
  const won = phase === "done" && result?.prize != null;
  const soldOut = phase === "done" && result?.soldOut === true;

  return (
    <div className="relative min-h-full pb-28">
      <AppHeader pageLabel="경품 뽑기" />
      <div className="px-6 pt-2">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-[#1E1E1E]" />
        </button>

        {/* ── 결과 전 / 추첨 중 ── */}
        {!won && !soldOut && (
          <div className="mt-10 text-center">
            <div
              className={`mx-auto w-28 h-28 rounded-[28px] bg-[#FFCC00] flex items-center justify-center shadow-[0_10px_0_#E0B400] ${
                phase === "drawing" ? "animate-bounce" : ""
              }`}
            >
              <Gift className="w-14 h-14 text-[#1E1E1E]" />
            </div>
            <h1 className="mt-8 text-[#1E1E1E] tracking-tight" style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.25 }}>
              {phase === "drawing" ? "추첨하고 있어요..." : "경품 뽑기에\n도전하세요!"}
            </h1>
            <p className="mt-3 text-[#1E1E1E]/60 text-[14px] leading-snug whitespace-pre-line">
              {phase === "drawing"
                ? "두근두근, 어떤 경품이 나올까요?"
                : "이 장소에 준비된 경품 중\n하나가 무작위로 추첨돼요"}
            </p>
          </div>
        )}

        {/* ── 당첨 ── */}
        {won && result?.prize && (
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-2 text-[#FFCC00]">
              <Sparkles className="w-6 h-6" />
              <PartyPopper className="w-9 h-9 text-[#FF7E6B]" />
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="mt-4 text-[#1E1E1E]" style={{ fontSize: 24, fontWeight: 800 }}>
              축하합니다! 🎉
            </h1>
            <div className="mt-6 bg-white rounded-3xl p-8 shadow-[0_8px_24px_rgba(0,0,0,0.08)] border-2 border-[#FFCC00]">
              {result.prize.rank > 0 && (
                <span className="inline-block rounded-full bg-[#FFCC00] text-[#1E1E1E] px-3 py-1" style={{ fontSize: 12, fontWeight: 800 }}>
                  {result.prize.rank}등
                </span>
              )}
              <p className="mt-3 text-[#1E1E1E]" style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.2 }}>
                {result.prize.name}
              </p>
            </div>
            <div className="mt-6 bg-[#FFF3BF] rounded-2xl px-4 py-3">
              <p className="text-[#1E1E1E]" style={{ fontSize: 14, fontWeight: 700 }}>
                운영자에게 이 화면을 보여주세요
              </p>
              <p className="mt-0.5 text-[#1E1E1E]/60" style={{ fontSize: 12 }}>
                경품은 현장에서 수령할 수 있어요
              </p>
            </div>
          </div>
        )}

        {/* ── 소진 ── */}
        {soldOut && (
          <div className="mt-10 text-center">
            <div className="mx-auto w-28 h-28 rounded-[28px] bg-[#F0EDE4] flex items-center justify-center">
              <Gift className="w-14 h-14 text-[#1E1E1E]/30" />
            </div>
            <h1 className="mt-8 text-[#1E1E1E]" style={{ fontSize: 23, fontWeight: 800, lineHeight: 1.3 }}>
              준비된 경품이<br />모두 소진되었어요
            </h1>
            <p className="mt-3 text-[#1E1E1E]/60 text-[14px] leading-snug">
              참여해주셔서 감사합니다!<br />
              운영자에게 문의해주세요
            </p>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-red-700 text-[13px] text-center">
            {error}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="absolute bottom-6 left-6 right-6">
        {phase === "done" ? (
          <button
            onClick={onBack}
            className="w-full bg-white text-[#1E1E1E] border-2 border-[#1E1E1E]/10 rounded-2xl py-4"
            style={{ fontSize: 16, fontWeight: 700 }}
          >
            봉사자증으로 돌아가기
          </button>
        ) : (
          <button
            onClick={onDraw}
            disabled={phase === "drawing"}
            className="w-full bg-[#FFCC00] text-[#1E1E1E] rounded-2xl py-4 shadow-[0_6px_0_#E0B400] disabled:opacity-50 disabled:shadow-none"
            style={{ fontSize: 18, fontWeight: 800 }}
          >
            {phase === "drawing" ? "추첨 중..." : "🎁 경품 뽑기"}
          </button>
        )}
      </div>
    </div>
  );
}
