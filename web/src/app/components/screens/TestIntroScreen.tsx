import { ChevronLeft, ClipboardList, Award, IdCard, Clock, MessageCircleHeart } from "lucide-react";
import { useState } from "react";

interface TestIntroScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function TestIntroScreen({ onNext, onBack }: TestIntroScreenProps) {
  const [consented, setConsented] = useState(false);

  return (
    <div className="relative min-h-full pt-12 pb-28 px-6">
      <div className="mt-2 flex items-center gap-2">
        <div className="bg-[#FFCC00] rounded-lg px-2 py-1">
          <span className="text-[#1E1E1E] tracking-tight text-[11px]" style={{ fontWeight: 700 }}>KB 라이프</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-[#1E1E1E]" />
        </button>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Step n="1" label="검사" icon={<ClipboardList className="w-4 h-4" />} active />
        <Bar />
        <Step n="2" label="결과" icon={<Award className="w-4 h-4" />} />
        <Bar />
        <Step n="3" label="봉사자증" icon={<IdCard className="w-4 h-4" />} />
      </div>

      <div className="mt-12 text-center">
        <div className="mx-auto w-20 h-20 rounded-3xl bg-[#FFCC00] flex items-center justify-center shadow-[0_8px_0_#E0B400]">
          <ClipboardList className="w-9 h-9 text-[#1E1E1E]" />
        </div>
        <h1
          className="mt-6 text-[#1E1E1E] tracking-tight"
          style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.25 }}
        >
          봉사 성격 검사를<br />시작해볼까요?
        </h1>
        <div className="mt-4 inline-flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 shadow-sm">
          <Clock className="w-4 h-4 text-[#1E1E1E]/60" />
          <span className="text-[#1E1E1E]" style={{ fontSize: 13, fontWeight: 600 }}>
            총 12문항 · 약 3분 소요
          </span>
        </div>
      </div>

      <div className="mt-8 bg-white border-2 border-[#FFCC00] rounded-2xl p-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#FFCC00]/30 flex items-center justify-center shrink-0">
          <MessageCircleHeart className="w-5 h-5 text-[#1E1E1E]" />
        </div>
        <div>
          <div className="text-[#1E1E1E]" style={{ fontSize: 14, fontWeight: 700 }}>솔직하게 답할수록 정확해요</div>
          <p className="mt-1 text-[#1E1E1E]/70 text-[13px] leading-snug">
            정답은 없어요. 평소 나의 모습을 떠올리며 가볍게 답해주세요!
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-2 text-[#1E1E1E]/70 text-[13px]">
        <li className="flex gap-2"><span>✅</span>5점 척도로 답해요 (1=전혀 아니다 ~ 5=매우 그렇다)</li>
        <li className="flex gap-2"><span>✅</span>중간에 이전 문항으로 돌아갈 수 있어요</li>
        <li className="flex gap-2"><span>✅</span>결과는 4가지 봉사 유형 중 하나로 나와요</li>
      </ul>

      {/* 미성년자 동의 체크 — 없으면 검사 시작 불가 (CLAUDE.md 규칙) */}
      <label className="mt-6 flex items-start gap-3 cursor-pointer">
        <div className="mt-0.5">
          <input
            type="checkbox"
            checked={consented}
            onChange={(e) => setConsented(e.target.checked)}
            className="w-5 h-5 accent-[#FFCC00] rounded"
          />
        </div>
        <span className="text-[#1E1E1E] text-[13px] leading-snug" style={{ fontWeight: 600 }}>
          개인정보 수집·이용에 동의합니다.<br />
          <span className="text-[#1E1E1E]/50 font-normal text-[11px]">
            (검사 응답은 봉사자증 발급 목적으로만 사용되며 행사 종료 후 자동 삭제됩니다)
          </span>
        </span>
      </label>

      <div className="absolute bottom-6 left-6 right-6">
        <button
          onClick={onNext}
          disabled={!consented}
          className="w-full bg-[#FFCC00] text-[#1E1E1E] rounded-2xl py-4 shadow-[0_6px_0_#E0B400] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          style={{ fontSize: 17, fontWeight: 700 }}
        >
          시작 →
        </button>
      </div>
    </div>
  );
}

function Step({ n, label, icon, active }: { n: string; label: string; icon: React.ReactNode; active?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${
          active ? "bg-[#1E1E1E] text-white" : "bg-white text-[#1E1E1E]/40 border border-[#1E1E1E]/10"
        }`}
      >
        {icon}
      </div>
      <div
        className={`text-[11px] ${active ? "text-[#1E1E1E]" : "text-[#1E1E1E]/40"}`}
        style={{ fontWeight: active ? 700 : 500 }}
      >
        {n}. {label}
      </div>
    </div>
  );
}

function Bar() {
  return <div className="flex-1 h-[2px] bg-[#1E1E1E]/10 mx-1 mb-5" />;
}
