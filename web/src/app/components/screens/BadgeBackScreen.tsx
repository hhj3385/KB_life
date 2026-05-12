import { Download, Share2, RotateCw, Instagram } from "lucide-react";
import { RESULT_CONTENT, DEFAULT_CHARACTER, BRAND } from "@kb-booth/shared";
import type { ResultType, CharacterConfig } from "@kb-booth/shared";
import { CharacterImage } from "../../../components/character/CharacterImage";
import { AppHeader } from "../../../components/layout/AppHeader";

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
  cardNo = "전국청소년자원봉사대회-2026-00001",
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
    <div className="relative min-h-full pb-32 overflow-y-auto">
      <AppHeader pageLabel="BACK SIDE" />
      <div className="px-5">

      {/* B. 결과 헤드라인: 캐릭터 + 코드 + 유형명 */}
      <div className="mt-4 bg-white rounded-2xl p-4 shadow-[0_8px_24px_rgba(30,30,30,0.06)] flex items-center gap-3">
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

      {/* C. 마이크로 카피 */}
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

      {/* F. 공식 인스타그램 박스 */}
      <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Instagram className="w-5 h-5 text-pink-500" />
          <div>
            <div className="text-[#1E1E1E]/50 text-[9px]">공식 인스타그램</div>
            <div className="text-[#1E1E1E] text-[12px]" style={{ fontWeight: 700 }}>
              @{BRAND.instagramHandle}
            </div>
          </div>
        </div>
        {BRAND.instagramUrl ? (
          <a
            href={BRAND.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full px-3 py-1.5 text-[11px] text-white"
            style={{ background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)", fontWeight: 700 }}
          >
            팔로우하기
          </a>
        ) : (
          <span className="text-[#1E1E1E]/40 text-[10px]">곧 공개</span>
        )}
      </div>

      {/* G. 마무리 멘트 */}
      <div className="mt-4 bg-[#FFCC00] rounded-2xl p-3 text-center">
        <p className="text-[#1E1E1E] text-[11px]" style={{ fontWeight: 700 }}>
          {BRAND.closingMessage}
        </p>
      </div>

      {/* H. 발급 정보 */}
      <div className="mt-4 bg-white/50 rounded-xl p-3 space-y-1">
        <InfoRow label="NO." value={cardNo} />
        <InfoRow label="발급일" value={issuedAt} />
        <InfoRow label="발급기관" value={BRAND.operator} />
      </div>

      </div>{/* /px-5 */}

      {/* I. 액션 버튼 + CTA */}
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#1E1E1E]/50 text-[9px]">{label}</span>
      <span className="text-[#1E1E1E] text-[9px]" style={{ fontWeight: 700 }}>
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
