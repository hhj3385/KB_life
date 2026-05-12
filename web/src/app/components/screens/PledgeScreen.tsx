import { ChevronLeft, Sparkles } from "lucide-react";
import { useState } from "react";
import type { ResultType, CharacterConfig } from "@kb-booth/shared";
import { DEFAULT_CHARACTER } from "@kb-booth/shared";
import { CharacterImage } from "../../../components/character/CharacterImage";
import { AppHeader } from "../../../components/layout/AppHeader";

const EXAMPLES = [
  "작은 행동으로 큰 변화를 만들겠습니다 💪",
  "따뜻한 마음으로 세상을 바꾸겠습니다 ❤️",
  "함께하는 봉사로 행복을 나누겠습니다 ✨",
];

const TYPE_COLOR: Record<ResultType, string> = {
  investigator: "#6BB5FF",
  helper:       "#B5A0E5",
  leader:       "#FF7E6B",
  innovator:    "#5DD3B0",
};

export interface PledgeFormData {
  nickname: string;
  pledge: string;
  realName: string;
  contact: string;
  birthDate: string;
}

interface PledgeScreenProps {
  resultType: ResultType;
  character?: CharacterConfig;
  onNext: (data: PledgeFormData) => void;
  onBack: () => void;
}

function formatContact(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}

export function PledgeScreen({ resultType, character, onNext, onBack }: PledgeScreenProps) {
  const [nickname, setNickname] = useState("");
  const [pledge, setPledge] = useState("");
  const [realName, setRealName] = useState("");
  const [contact, setContact] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const maxPledge = 50;
  const maxNickname = 20;
  const accent = TYPE_COLOR[resultType];

  const char = character ?? { gender: "F" as const, ...DEFAULT_CHARACTER[resultType].F };

  const contactValid = /^010-\d{3,4}-\d{4}$/.test(contact);
  const birthValid = /^\d{4}-\d{2}-\d{2}$/.test(birthDate);
  const canSubmit = pledge.trim() && realName.trim() && contactValid && birthValid;

  const handleContactChange = (v: string) => {
    setContact(formatContact(v));
  };

  return (
    <div className="relative min-h-full pb-28">
      <AppHeader pageLabel="봉사 각오" />
      <div className="px-6 overflow-y-auto">

      <div className="mt-2 flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-[#1E1E1E]" />
        </button>
        <span className="text-[#1E1E1E]/60 text-[12px]">마지막 단계</span>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-2">
          <div
            className="inline-block bg-[#FFCC00] text-[#1E1E1E] rounded-full px-3 py-1 text-[11px]"
            style={{ fontWeight: 700 }}
          >
            마지막 단계
          </div>
          <Sparkles className="w-4 h-4 text-[#FFCC00]" />
        </div>
        <h1
          className="mt-3 text-[#1E1E1E] tracking-tight leading-tight"
          style={{ fontSize: 24, fontWeight: 800 }}
        >
          봉사 각오를<br />한마디로 적어주세요
        </h1>
        <p className="mt-2 text-[#1E1E1E]/60" style={{ fontSize: 13 }}>
          봉사자증에 표시될 내용이에요
        </p>
      </div>

      {/* Mini preview */}
      <div
        className="mt-4 rounded-2xl p-4 flex items-center gap-3"
        style={{ background: `linear-gradient(135deg, ${accent}20, #FFF9E6)` }}
      >
        <CharacterImage
          gender={char.gender}
          hair={char.hair}
          accessory={char.accessory}
          clear={true}
          size={60}
        />
        <div className="flex-1">
          <div className="text-[#1E1E1E]/60 text-[10px]">미리보기</div>
          {nickname && (
            <div className="text-[#1E1E1E] text-[13px]" style={{ fontWeight: 700 }}>
              {nickname}
            </div>
          )}
          <p className="mt-0.5 text-[#1E1E1E] text-[12px] leading-snug" style={{ fontWeight: 600 }}>
            {pledge || "각오 한마디를 입력해주세요"}
          </p>
        </div>
      </div>

      {/* 개인정보 입력 */}
      <div className="mt-4 bg-white rounded-2xl p-5 shadow-[0_8px_24px_rgba(30,30,30,0.06)] space-y-4">
        <div className="text-[#1E1E1E]/50 text-[11px]">
          대회 안내 및 홍보용으로만 사용돼요
        </div>

        {/* 이름 */}
        <div>
          <div className="text-[#1E1E1E] text-[13px] mb-1.5" style={{ fontWeight: 700 }}>
            이름 <span className="text-[#FF7E6B] text-[11px]">*필수</span>
          </div>
          <input
            type="text"
            value={realName}
            onChange={(e) => { if (e.target.value.length <= 20) setRealName(e.target.value); }}
            placeholder="예) 김민서"
            className="w-full bg-[#FFF9E6] rounded-xl px-4 py-3 text-[#1E1E1E] outline-none focus:ring-2 focus:ring-[#FFCC00] transition placeholder:text-[#1E1E1E]/40"
            style={{ fontSize: 15, fontWeight: 600 }}
          />
        </div>

        {/* 연락처 */}
        <div>
          <div className="text-[#1E1E1E] text-[13px] mb-1.5" style={{ fontWeight: 700 }}>
            연락처 <span className="text-[#FF7E6B] text-[11px]">*필수</span>
          </div>
          <input
            type="tel"
            value={contact}
            onChange={(e) => handleContactChange(e.target.value)}
            placeholder="010-1234-5678"
            maxLength={13}
            className="w-full bg-[#FFF9E6] rounded-xl px-4 py-3 text-[#1E1E1E] outline-none focus:ring-2 focus:ring-[#FFCC00] transition placeholder:text-[#1E1E1E]/40"
            style={{ fontSize: 15, fontWeight: 600 }}
          />
          {contact && !contactValid && (
            <p className="mt-1 text-[#FF7E6B] text-[11px]">010-XXXX-XXXX 형식으로 입력해주세요</p>
          )}
        </div>

        {/* 생년월일 */}
        <div>
          <div className="text-[#1E1E1E] text-[13px] mb-1.5" style={{ fontWeight: 700 }}>
            생년월일 <span className="text-[#FF7E6B] text-[11px]">*필수</span>
          </div>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full bg-[#FFF9E6] rounded-xl px-4 py-3 text-[#1E1E1E] outline-none focus:ring-2 focus:ring-[#FFCC00] transition"
            style={{ fontSize: 15, fontWeight: 600 }}
          />
        </div>
      </div>

      {/* 닉네임 (선택) */}
      <div className="mt-4 bg-white rounded-2xl p-5 shadow-[0_8px_24px_rgba(30,30,30,0.06)]">
        <div className="text-[#1E1E1E] text-[13px] mb-2" style={{ fontWeight: 700 }}>
          닉네임 <span className="text-[#1E1E1E]/40 font-normal">(선택, 최대 {maxNickname}자)</span>
        </div>
        <input
          type="text"
          value={nickname}
          onChange={(e) => { if (e.target.value.length <= maxNickname) setNickname(e.target.value); }}
          placeholder="예) 봉사왕 민서"
          className="w-full bg-[#FFF9E6] rounded-xl px-4 py-3 text-[#1E1E1E] outline-none focus:ring-2 focus:ring-[#FFCC00] transition placeholder:text-[#1E1E1E]/40"
          style={{ fontSize: 15, fontWeight: 600 }}
        />
      </div>

      {/* 봉사 각오 (필수) */}
      <div className="mt-4 bg-white rounded-2xl p-5 shadow-[0_8px_24px_rgba(30,30,30,0.06)]">
        <div className="text-[#1E1E1E] text-[13px] mb-2" style={{ fontWeight: 700 }}>
          봉사 각오 <span className="text-[#FF7E6B] text-[11px]">*필수</span>
        </div>
        <textarea
          value={pledge}
          onChange={(e) => { if (e.target.value.length <= maxPledge) setPledge(e.target.value); }}
          placeholder="예) 작은 행동으로 큰 변화를 만들겠습니다!"
          className="w-full h-20 bg-[#FFF9E6] rounded-xl px-4 py-3 text-[#1E1E1E] resize-none outline-none focus:ring-2 focus:ring-[#FFCC00] transition placeholder:text-[#1E1E1E]/40"
          style={{ fontSize: 15, fontWeight: 600 }}
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[#1E1E1E]/50 text-[11px]">짧고 임팩트있게!</span>
          <span
            className="text-[11px]"
            style={{ fontWeight: 700, color: pledge.length >= maxPledge ? "#FF7E6B" : "#1E1E1E60" }}
          >
            {pledge.length} / {maxPledge}
          </span>
        </div>
      </div>

      {/* 예시 */}
      <div className="mt-4">
        <div className="text-[#1E1E1E]/60 text-[12px] mb-2">각오 예시 (클릭하면 입력돼요)</div>
        <div className="flex flex-col gap-2">
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => setPledge(ex)}
              className="bg-white rounded-xl px-4 py-3 text-left shadow-sm border border-[#1E1E1E]/5 hover:border-[#FFCC00] hover:shadow-md transition text-[#1E1E1E] text-[13px]"
              style={{ fontWeight: 600 }}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      </div>{/* /px-6 */}

      <div className="absolute bottom-6 left-6 right-6">
        <button
          disabled={!canSubmit}
          onClick={() => onNext({ nickname, pledge, realName, contact, birthDate })}
          className="w-full bg-[#FFCC00] text-[#1E1E1E] rounded-2xl py-4 shadow-[0_6px_0_#E0B400] active:translate-y-[2px] active:shadow-[0_4px_0_#E0B400] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:active:translate-y-0"
          style={{ fontSize: 17, fontWeight: 700 }}
        >
          봉사자증 만들기 🎉
        </button>
      </div>
    </div>
  );
}
