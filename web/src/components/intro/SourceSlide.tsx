import { useState } from "react";
import { ChevronDown } from "lucide-react";

const SOURCES = [
  { key: "Holland", label: "Holland 직업흥미검사(RIASEC)", desc: "흥미·역량 교차 분석" },
  { key: "Enneagram", label: "에니어그램 청소년판", desc: "내면 동기 척도" },
  { key: "VFI", label: "VFI (Volunteer Functions Inventory)", desc: "봉사 동기 6요인" },
  { key: "MMTIC", label: "MMTIC", desc: "비판단적 청소년 친화 문항 톤" },
];

interface SourceSlideProps {
  onExpandChange?: (expanded: boolean) => void;
}

export function SourceSlide({ onExpandChange }: SourceSlideProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col justify-center h-full px-6 gap-5">
      <div>
        <div className="inline-block bg-[#FFCC00] text-[#1E1E1E] rounded-full px-3 py-1 text-[11px]" style={{ fontWeight: 700 }}>
          검사 근거
        </div>
        <h2 className="mt-3 text-[#1E1E1E] tracking-tight" style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.25 }}>
          4개 학술 도구를<br />융합해 만들었어요
        </h2>
        <p className="mt-2 text-[#1E1E1E]/60" style={{ fontSize: 13 }}>
          12문항으로 재구성한 신뢰 기반 봉사 유형 검사
        </p>
      </div>

      <button
        onClick={() => {
          const next = !open;
          setOpen(next);
          onExpandChange?.(next);
        }}
        className="bg-white rounded-2xl p-4 shadow-[0_8px_24px_rgba(30,30,30,0.06)] text-left w-full"
      >
        <div className="flex items-center justify-between">
          <span className="text-[#1E1E1E] text-[13px]" style={{ fontWeight: 700 }}>검사 근거 보기</span>
          <ChevronDown
            className="w-4 h-4 text-[#1E1E1E]/50 transition-transform duration-200"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </div>

        {open && (
          <div className="mt-3 space-y-2.5">
            {SOURCES.map((s) => (
              <div key={s.key} className="flex items-start gap-2.5">
                <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[#FFCC00] flex-shrink-0" />
                <div>
                  <div className="text-[#1E1E1E] text-[12px]" style={{ fontWeight: 700 }}>{s.label}</div>
                  <div className="text-[#1E1E1E]/60 text-[11px]">{s.desc}</div>
                </div>
              </div>
            ))}
            <p className="mt-1 text-[#1E1E1E]/40 text-[10px] border-t border-[#1E1E1E]/10 pt-2">
              위 4개 학술 도구를 융합해 12문항으로 재구성
            </p>
          </div>
        )}
      </button>
    </div>
  );
}
