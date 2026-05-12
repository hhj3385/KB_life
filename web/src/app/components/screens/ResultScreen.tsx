import { ChevronLeft, Share2 } from "lucide-react";
import { RESULT_CONTENT } from "@kb-booth/shared";
import type { ResultType } from "@kb-booth/shared";
import { CHAR_BY_TYPE } from "../Characters";

const TYPE_COLOR: Record<ResultType, string> = {
  investigator: "#6BB5FF",
  helper:       "#B5A0E5",
  leader:       "#FF7E6B",
  innovator:    "#5DD3B0",
};

interface ResultScreenProps {
  type: ResultType;
  onNext: () => void;
  onShare?: () => void;
}

export function ResultScreen({ type, onNext, onShare }: ResultScreenProps) {
  const content = RESULT_CONTENT[type];
  const color = TYPE_COLOR[type];

  const Char = CHAR_BY_TYPE[type];

  return (
    <div className="relative min-h-full pb-28">
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(180deg, ${color}55 0%, ${color}22 40%, #FFF9E6 75%)` }}
      />

<div className="relative px-6 pt-2">
        <div className="flex items-center justify-between">
          <button className="w-9 h-9 rounded-full bg-white/80 backdrop-blur shadow-sm flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-[#1E1E1E]" />
          </button>
          <button
            onClick={onShare}
            className="w-9 h-9 rounded-full bg-white/80 backdrop-blur shadow-sm flex items-center justify-center"
          >
            <Share2 className="w-4 h-4 text-[#1E1E1E]" />
          </button>
        </div>

        {/* 진행 인디케이터 */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <Step label="1.검사" active={false} />
          <div className="w-6 h-0.5 bg-[#1E1E1E]/20" />
          <Step label="2.결과" active={true} color={color} />
          <div className="w-6 h-0.5 bg-[#1E1E1E]/20" />
          <Step label="3.봉사자증" active={false} />
        </div>

        {/* 헤드라인 */}
        <div className="mt-4 text-center">
          <div
            className="inline-block rounded-full px-3 py-1 text-[12px]"
            style={{ background: color, color: "white", fontWeight: 700 }}
          >
            ✨ 검사 결과
          </div>
          <div className="mt-2 text-[#1E1E1E]/50" style={{ fontSize: 13 }}>당신의 봉사 유형은</div>
          <div
            className="tracking-widest"
            style={{ fontSize: 64, fontWeight: 900, color, lineHeight: 1.05, fontFamily: "KBFG Display" }}
          >
            {content.code}
          </div>
          <div className="text-[#1E1E1E] tracking-tight mt-1" style={{ fontSize: 18, fontWeight: 800 }}>
            {content.name}
          </div>
        </div>

        {/* 캐릭터 */}
        <div className="mt-4 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-2xl opacity-40" style={{ background: color }} />
            <div
              className="relative bg-white rounded-full p-4"
              style={{ boxShadow: `0 12px 30px ${color}40` }}
            >
              <Char size={180} />
            </div>
          </div>
        </div>

        {/* 마이크로 카피 */}
        <div className="mt-4 rounded-2xl p-4 relative" style={{ background: `${color}15` }}>
          <div
            className="absolute -top-2 -left-1 text-[36px] opacity-30"
            style={{ color, fontFamily: "Georgia, serif", lineHeight: 1 }}
          >"</div>
          <p className="text-[#1E1E1E] text-center relative z-10" style={{ fontSize: 14, fontWeight: 700 }}>
            {content.micro}
          </p>
          <div
            className="absolute -bottom-2 -right-1 text-[36px] opacity-30"
            style={{ color, fontFamily: "Georgia, serif", lineHeight: 1 }}
          >"</div>
        </div>

        {/* 유형 설명 */}
        <div className="mt-4 bg-white/70 backdrop-blur rounded-2xl p-4 shadow-sm">
          <p className="text-[#1E1E1E]/80 text-[13px] leading-relaxed">
            {content.description}
          </p>
        </div>

        {/* 추천 봉사 칩 */}
        <div className="mt-4">
          <div className="text-[#1E1E1E]/60 text-[12px] mb-2">추천 봉사활동</div>
          <div className="flex flex-wrap gap-2">
            {content.recommendations.map((r) => (
              <span
                key={r.name}
                className="rounded-full px-3 py-1.5 text-[13px] bg-white border"
                style={{ borderColor: `${color}55`, color: "#1E1E1E", fontWeight: 600 }}
              >
                #{r.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <button
          onClick={onNext}
          className="w-full bg-[#FFCC00] text-[#1E1E1E] rounded-2xl py-4 shadow-[0_6px_0_#E0B400]"
          style={{ fontSize: 17, fontWeight: 700 }}
        >
          내 캐릭터 커스터마이징 →
        </button>
      </div>
    </div>
  );
}

function Step({ label, active, color }: { label: string; active: boolean; color?: string }) {
  return (
    <div
      className="rounded-full px-2.5 py-1 text-[10px]"
      style={
        active
          ? { background: color, color: "white", fontWeight: 700 }
          : { background: "white", border: "1px solid rgba(30,30,30,0.1)", color: "#1E1E1E60", fontWeight: 600 }
      }
    >
      {label}
    </div>
  );
}
