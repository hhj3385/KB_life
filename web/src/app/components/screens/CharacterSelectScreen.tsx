import { ChevronLeft, Check } from "lucide-react";
import { useState } from "react";
import type { ResultType } from "@kb-booth/shared";
import { RESULT_CONTENT } from "@kb-booth/shared";
import { CharacterImage } from "../../../components/character/CharacterImage";

// 미사용 화면 — 실제 라우팅은 CharacterCustomizationScreen 사용
const RESULT_TYPES: ResultType[] = ["investigator", "helper", "leader", "innovator"];

export function CharacterSelectScreen() {
  const [selected, setSelected] = useState<ResultType>("investigator");

  return (
    <div className="relative min-h-full pt-12 pb-28 px-6">
      <div className="mt-4 flex items-center justify-between">
        <button className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-[#1E1E1E]" />
        </button>
        <span className="text-[#1E1E1E]/60 text-[12px]">캐릭터 선택</span>
      </div>

      <div className="mt-6">
        <h1 className="text-[#1E1E1E] tracking-tight leading-tight" style={{ fontSize: 26, fontWeight: 800 }}>
          봉사 유형을<br />선택해보세요
        </h1>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {RESULT_TYPES.map((type) => {
          const content = RESULT_CONTENT[type];
          return (
            <button
              key={type}
              onClick={() => setSelected(type)}
              className="relative bg-white rounded-2xl p-4 flex flex-col items-center gap-2 transition-all shadow-sm"
              style={selected === type ? { outline: "3px solid #FFCC00", outlineOffset: "2px" } : {}}
            >
              {selected === type && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#FFCC00] flex items-center justify-center shadow-md">
                  <Check className="w-3 h-3 text-[#1E1E1E]" strokeWidth={3} />
                </div>
              )}
              <CharacterImage gender="F" hair={3} accessory="none" size={64} />
              <span className="text-[#1E1E1E] text-[11px] text-center leading-tight" style={{ fontWeight: 700 }}>
                {content.name}
              </span>
            </button>
          );
        })}
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <button className="w-full bg-[#FFCC00] text-[#1E1E1E] rounded-2xl py-4 shadow-[0_6px_0_#E0B400]" style={{ fontSize: 17, fontWeight: 700 }}>
          선택 완료 →
        </button>
      </div>
    </div>
  );
}
