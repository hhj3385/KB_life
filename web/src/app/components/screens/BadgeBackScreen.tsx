import { Download, Share2, RotateCw, QrCode } from "lucide-react";
import { RESULT_CONTENT, DEFAULT_CHARACTER } from "@kb-booth/shared";
import type { ResultType, CharacterConfig } from "@kb-booth/shared";
import { CharacterImage } from "../../../components/character/CharacterImage";

const TYPE_COLOR: Record<ResultType, string> = {
  investigator: "#6BB5FF",
  helper:       "#B5A0E5",
  leader:       "#FF7E6B",
  innovator:    "#5DD3B0",
};

interface BadgeBackScreenProps {
  type: ResultType;
  character?: CharacterConfig;
  cardNo?: string;
  issuedAt?: string;
  onFlip?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onDrawPrize?: () => void;
}

export function BadgeBackScreen({
  type,
  character,
  cardNo = "KB-2026-00001",
  issuedAt = "2026.05.11",
  onFlip,
  onDownload,
  onShare,
  onDrawPrize,
}: BadgeBackScreenProps) {
  const content = RESULT_CONTENT[type];
  const color = TYPE_COLOR[type];

  // 캐릭터 설정 — 저장된 값 없으면 유형별 기본값(F) 사용
  const char = character ?? { gender: "F" as const, ...DEFAULT_CHARACTER[type].F };

  return (
    <div className="relative min-h-full pt-8 pb-32 px-5 overflow-y-auto">

      {/* A. 헤더 */}
      <div className="flex items-center justify-between">
        <div className="bg-[#1E1E1E] rounded-md px-2 py-1">
          <span className="text-[#FFCC00] text-[11px]" style={{ fontWeight: 800 }}>KB 라이프</span>
        </div>
        <span className="text-[#1E1E1E]/60 text-[10px]" style={{ fontWeight: 600 }}>
          BACK SIDE
        </span>
      </div>

      {/* B. 결과 헤드라인: 캐릭터 + 코드 + 유형명 */}
      <div className="mt-6 bg-white rounded-2xl p-4 shadow-[0_8px_24px_rgba(30,30,30,0.06)] flex items-center gap-3">
        <div className="flex-shrink-0">
          <CharacterImage
            gender={char.gender}
            hair={char.hair}
            accessory={char.accessory}
            clear={true}
            size={52}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div style={{ fontSize: 28, fontWeight: 900, color, fontFamily: "KBFG Display", lineHeight: 1 }}>
            {content.code}
          </div>
          <div className="text-[#1E1E1E] text-[12px] mt-1" style={{ fontWeight: 700 }}>{content.name}</div>
        </div>
      </div>

      {/* C. 마이크로 카피 — 따옴표 인용구 박스 */}
      <div className="mt-4 rounded-2xl p-4 relative" style={{ background: `${color}20` }}>
        <div
          className="absolute -top-2 -left-1 text-[32px] opacity-30"
          style={{ color, fontFamily: "Georgia, serif", lineHeight: 1 }}
        >"</div>
        <p className="text-[#1E1E1E] text-center relative z-10" style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.5 }}>
          {content.micro}
        </p>
        <div
          className="absolute -bottom-2 -right-1 text-[32px] opacity-30"
          style={{ color, fontFamily: "Georgia, serif", lineHeight: 1 }}
        >"</div>
      </div>

      {/* D. 유형 설명 */}
      <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm">
        <div className="text-[#1E1E1E] text-[11px]" style={{ fontWeight: 700 }}>유형 설명</div>
        <p className="mt-2 text-[#1E1E1E]/80 text-[11px] leading-relaxed">
          {content.description}
        </p>
      </div>

      {/* E. 추천 봉사 카드 3개 */}
      <div className="mt-4">
        <div className="text-[#1E1E1E] text-[11px] mb-2" style={{ fontWeight: 700 }}>추천 봉사활동</div>
        <div className="space-y-2">
          {content.recommendations.map((activity) => (
            <div
              key={activity.name}
              className="bg-white rounded-xl p-3 shadow-sm border"
              style={{ borderColor: `${color}30` }}
            >
              <div className="text-[12px]" style={{ fontWeight: 700, color }}>{activity.name}</div>
              <p className="mt-1 text-[#1E1E1E]/70 text-[10px]">{activity.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* F. KB 대회 안내 박스 + QR */}
      <div className="mt-4 bg-gradient-to-br from-[#FFCC00]/10 to-[#FFF9E6] rounded-2xl p-4 border border-[#FFCC00]/30">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="text-[#1E1E1E] text-[12px]" style={{ fontWeight: 800 }}>
              KB 라이프 전국청소년자원봉사대회 10기
            </div>
            <p className="mt-1 text-[#1E1E1E]/70 text-[10px] leading-snug">
              청소년의 봉사 아이디어를 응원하는 국내 최고 청소년 자원봉사대회
            </p>
          </div>
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <QrCode className="w-8 h-8 text-[#1E1E1E]/20" />
            </div>
          </div>
        </div>
      </div>

      {/* G. 마무리 멘트 — CLAUDE.md 고정 문구 */}
      <div className="mt-4 bg-[#FFCC00] rounded-2xl p-3 text-center">
        <p className="text-[#1E1E1E] text-[11px]" style={{ fontWeight: 700 }}>
          KB 라이프 청소년자원봉사대회,<br />여러분의 참여를 기다릴게요!
        </p>
      </div>

      {/* H. 발급 정보 (작게) */}
      <div className="mt-4 bg-white/50 rounded-xl p-3 space-y-1">
        <InfoRow label="NO." value={cardNo} mono />
        <InfoRow label="발급일" value={issuedAt} mono />
        <InfoRow label="발급기관" value="KB 라이프 10기 서포터즈" />
      </div>

      {/* I. 액션 버튼 + 메인 CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#F5F1E6] pt-3 pb-6 px-5 border-t border-[#1E1E1E]/5">
        <div className="grid grid-cols-3 gap-2 mb-3">
          <ActionBtn icon={<RotateCw className="w-4 h-4" />} label="앞면" onClick={onFlip} />
          <ActionBtn icon={<Download className="w-4 h-4" />} label="저장" onClick={onDownload} />
          <ActionBtn icon={<Share2 className="w-4 h-4" />} label="공유" onClick={onShare} />
        </div>
        <button
          onClick={onDrawPrize}
          className="w-full bg-[#FFCC00] text-[#1E1E1E] rounded-2xl py-4 shadow-[0_6px_0_#E0B400]"
          style={{ fontSize: 15, fontWeight: 700 }}
        >
          경품 뽑기존으로 가기 🎁
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#1E1E1E]/50 text-[9px]">{label}</span>
      <span
        className="text-[#1E1E1E] text-[9px]"
        style={{ fontWeight: 700 }}
      >
        {value}
      </span>
    </div>
  );
}

function ActionBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl py-2 flex flex-col items-center gap-0.5 shadow-sm border border-[#1E1E1E]/5"
    >
      <div className="text-[#1E1E1E]">{icon}</div>
      <span className="text-[#1E1E1E] text-[9px]" style={{ fontWeight: 600 }}>{label}</span>
    </button>
  );
}
