import { ChevronLeft, RotateCcw } from "lucide-react";
import { useState } from "react";
import type { ResultType, CharacterConfig, Gender, Accessory } from "@kb-booth/shared";
import { DEFAULT_CHARACTER } from "@kb-booth/shared";
import { CharacterImage } from "../../../components/character/CharacterImage";

const TYPE_COLOR: Record<ResultType, string> = {
  investigator: "#6BB5FF",
  helper:       "#B5A0E5",
  leader:       "#FF7E6B",
  innovator:    "#5DD3B0",
};

// 성별별 선택 가능한 액세서리 목록 (F=band 가능, bucket 불가 / M=bucket 가능, band 불가)
const ACCESSORY_OPTIONS: Record<Gender, { value: Accessory; label: string }[]> = {
  F: [
    { value: "none",    label: "없음" },
    { value: "cap",     label: "볼캡" },
    { value: "beanie",  label: "비니" },
    { value: "band",    label: "헤어밴드" },
    { value: "glasses", label: "안경" },
  ],
  M: [
    { value: "none",    label: "없음" },
    { value: "cap",     label: "볼캡" },
    { value: "beanie",  label: "비니" },
    { value: "bucket",  label: "버킷햇" },
    { value: "glasses", label: "안경" },
  ],
};

const HAIR_OPTIONS = [1, 2, 3, 4, 5] as const;

interface Props {
  resultType: ResultType;
  initial?: CharacterConfig;
  onNext: (config: CharacterConfig) => void;
  onBack: () => void;
}

export function CharacterCustomizationScreen({ resultType, initial, onNext, onBack }: Props) {
  const defaultForGender = (g: Gender): CharacterConfig => ({
    gender: g,
    hair: DEFAULT_CHARACTER[resultType][g].hair,
    accessory: DEFAULT_CHARACTER[resultType][g].accessory,
  });

  const [config, setConfig] = useState<CharacterConfig>(
    initial ?? defaultForGender("F"),
  );
  const [activeTab, setActiveTab] = useState<"gender" | "hair" | "accessory">("gender");

  const accent = TYPE_COLOR[resultType];

  const resetToDefault = () => setConfig(defaultForGender(config.gender));

  // 성별 변경 시 해당 성별 기본값으로 리셋
  const updateGender = (g: Gender) => setConfig(defaultForGender(g));

  return (
    <div className="relative min-h-full pt-12 pb-28 px-6">
      {/* 배경 그라데이션 */}
      <div
        className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
        style={{ background: `linear-gradient(180deg, ${accent}18 0%, transparent 100%)` }}
      />

      <div className="relative">
        {/* 헤더 */}
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-[#1E1E1E]" />
          </button>
          <span className="text-[#1E1E1E]/60 text-[12px]">3 · 봉사자증</span>
        </div>

        {/* 진행 인디케이터 */}
        <div className="mt-5 flex items-center justify-center gap-2">
          <Step label="1.검사" active={false} />
          <div className="w-6 h-0.5 bg-[#1E1E1E]/20" />
          <Step label="2.결과" active={false} />
          <div className="w-6 h-0.5 bg-[#1E1E1E]/20" />
          <Step label="3.봉사자증" active={true} color={accent} />
        </div>

        <div className="mt-5">
          <h1 className="text-[#1E1E1E] tracking-tight" style={{ fontSize: 22, fontWeight: 800 }}>
            내 캐릭터를 꾸며보세요
          </h1>
          <p className="mt-1 text-[#1E1E1E]/50" style={{ fontSize: 13 }}>
            헤어와 액세서리를 자유롭게 선택하세요
          </p>
        </div>

        {/* 캐릭터 미리보기 (배경 있음 버전) */}
        <div className="mt-5 bg-white rounded-3xl p-5 shadow-[0_12px_32px_rgba(30,30,30,0.08)] flex justify-center">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full blur-2xl opacity-25"
              style={{ background: accent }}
            />
            <CharacterImage
              gender={config.gender}
              hair={config.hair}
              accessory={config.accessory}
              clear={true}
              size={200}
              className="relative"
            />
            <div
              className="absolute top-2 right-2 rounded-full px-2 py-0.5 text-[9px] text-[#1E1E1E]"
              style={{ background: "#FFCC00", fontWeight: 700 }}
            >
              {config.gender === "F" ? "여" : "남"}
            </div>
          </div>
        </div>

        {/* 탭 바 */}
        <div className="mt-5">
          <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-sm">
            {(["gender", "hair", "accessory"] as const).map((tab) => (
              <TabButton
                key={tab}
                label={tab === "gender" ? "성별" : tab === "hair" ? "헤어" : "액세서리"}
                active={activeTab === tab}
                accent={accent}
                onClick={() => setActiveTab(tab)}
              />
            ))}
          </div>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="mt-3">
          {activeTab === "gender" && (
            <div className="grid grid-cols-2 gap-3">
              {(["F", "M"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => updateGender(g)}
                  className="relative bg-white rounded-2xl p-4 flex flex-col items-center gap-2 transition-all"
                  style={
                    config.gender === g
                      ? { outline: `3px solid ${accent}`, outlineOffset: "2px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }
                      : { boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }
                  }
                >
                  <CharacterImage
                    gender={g}
                    hair={DEFAULT_CHARACTER[resultType][g].hair}
                    accessory={DEFAULT_CHARACTER[resultType][g].accessory}
                    clear={true}
                    size={64}
                  />
                  <span className="text-[#1E1E1E] text-[13px]" style={{ fontWeight: 700 }}>
                    {g === "F" ? "여 (F)" : "남 (M)"}
                  </span>
                  {config.gender === g && (
                    <CheckBadge color={accent} />
                  )}
                </button>
              ))}
            </div>
          )}

          {activeTab === "hair" && (
            <div className="grid grid-cols-5 gap-2">
              {HAIR_OPTIONS.map((h) => (
                <button
                  key={h}
                  onClick={() => setConfig((c) => ({ ...c, hair: h }))}
                  className="relative bg-white rounded-2xl p-1.5 flex flex-col items-center gap-1 transition-all"
                  style={
                    config.hair === h
                      ? { outline: `3px solid ${accent}`, outlineOffset: "2px" }
                      : { boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }
                  }
                >
                  <CharacterImage
                    gender={config.gender}
                    hair={h}
                    accessory={config.accessory}
                    clear={true}
                    size={52}
                  />
                  <span className="text-[#1E1E1E]/70 text-[9px]" style={{ fontWeight: 600 }}>
                    H{h}
                  </span>
                  {config.hair === h && <CheckBadge color={accent} />}
                </button>
              ))}
            </div>
          )}

          {activeTab === "accessory" && (
            <div className="grid grid-cols-5 gap-2">
              {ACCESSORY_OPTIONS[config.gender].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setConfig((c) => ({ ...c, accessory: opt.value }))}
                  className="relative bg-white rounded-2xl p-1.5 flex flex-col items-center gap-1 transition-all"
                  style={
                    config.accessory === opt.value
                      ? { outline: `3px solid ${accent}`, outlineOffset: "2px" }
                      : { boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }
                  }
                >
                  <CharacterImage
                    gender={config.gender}
                    hair={config.hair}
                    accessory={opt.value}
                    clear={true}
                    size={52}
                  />
                  <span className="text-[#1E1E1E]/70 text-[9px] text-center leading-tight" style={{ fontWeight: 600 }}>
                    {opt.label}
                  </span>
                  {config.accessory === opt.value && <CheckBadge color={accent} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 기본값 리셋 */}
        <div className="mt-4">
          <button
            onClick={resetToDefault}
            className="w-full bg-white border-2 border-[#FFCC00] text-[#1E1E1E] rounded-2xl py-3 flex items-center justify-center gap-2 shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span style={{ fontSize: 14, fontWeight: 700 }}>기본값으로 리셋</span>
          </button>
        </div>
      </div>

      {/* 하단 CTA */}
      <div className="absolute bottom-6 left-6 right-6">
        <button
          onClick={() => onNext(config)}
          className="w-full bg-[#FFCC00] text-[#1E1E1E] rounded-2xl py-4 shadow-[0_6px_0_#E0B400] active:translate-y-[2px] transition"
          style={{ fontSize: 17, fontWeight: 700 }}
        >
          이대로 봉사자증 만들기 →
        </button>
      </div>
    </div>
  );
}

function TabButton({
  label, active, accent, onClick,
}: {
  label: string; active: boolean; accent: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 rounded-xl py-2 text-[13px] transition"
      style={
        active
          ? { background: accent, color: "white", fontWeight: 700 }
          : { color: "#1E1E1E60", fontWeight: 600 }
      }
    >
      {label}
    </button>
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

function CheckBadge({ color }: { color: string }) {
  return (
    <div
      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center shadow-md"
      style={{ background: color }}
    >
      <span className="text-white text-[11px]">✓</span>
    </div>
  );
}
