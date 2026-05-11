import { RESULT_CONTENT } from "@kb-booth/shared";
import type { ResultType } from "@kb-booth/shared";
import { CHAR_BY_TYPE } from "../../app/components/Characters";

const TYPE_COLOR: Record<ResultType, string> = {
  investigator: "#6BB5FF",
  helper:       "#B5A0E5",
  leader:       "#FF7E6B",
  innovator:    "#5DD3B0",
};

const TYPES: ResultType[] = ["investigator", "helper", "leader", "innovator"];

export function TypeGridSlide() {
  return (
    <div className="flex flex-col justify-center h-full px-5 gap-3">
      {/* 제목 */}
      <div>
        <h1 className="text-[#1E1E1E] tracking-tight" style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.2 }}>
          당신의 봉사 유형은?
        </h1>
        <p className="mt-1 text-[#1E1E1E]/70" style={{ fontSize: 13 }}>
          12문항 검사로{" "}
          <span style={{ color: "#1E1E1E", fontWeight: 700 }}>나만의 봉사자증</span>을 받아보세요 ✨
        </p>
      </div>

      {/* 4유형 카드 */}
      <div className="bg-white rounded-[20px] p-3 shadow-[0_6px_20px_rgba(30,30,30,0.06)]">
        <div className="text-[#1E1E1E]/50 mb-2" style={{ fontSize: 11 }}>4가지 봉사 유형</div>
        <div className="grid grid-cols-2 gap-2">
          {TYPES.map((t) => {
            const c = RESULT_CONTENT[t];
            const color = TYPE_COLOR[t];
            const Char = CHAR_BY_TYPE[t];
            return (
              <div
                key={t}
                className="rounded-xl p-2 flex flex-col items-center gap-1"
                style={{ background: `${color}1A` }}
              >
                <Char size={58} />
                <div className="text-[#1E1E1E] text-center leading-tight" style={{ fontSize: 11, fontWeight: 700 }}>
                  {c.name}
                </div>
                <div style={{ fontSize: 9, fontWeight: 600, color, fontFamily: "KBFG Display", letterSpacing: "0.08em" }}>
                  {c.code}
                </div>
                <div className="w-5 h-1 rounded-full" style={{ background: color }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
