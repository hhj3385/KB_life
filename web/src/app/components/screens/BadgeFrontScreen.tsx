import { Download, Share2, RotateCw } from "lucide-react";
import { useState } from "react";
import type { RefObject } from "react";
import type { ResultType, CharacterConfig } from "@kb-booth/shared";
import { RESULT_CONTENT, DEFAULT_CHARACTER, BRAND } from "@kb-booth/shared";
import { CharacterImage } from "../../../components/character/CharacterImage";
import { AppHeader } from "../../../components/layout/AppHeader";

const TYPE_COLOR: Record<ResultType, string> = {
  investigator: "#6BB5FF",
  helper:       "#B5A0E5",
  leader:       "#FF7E6B",
  innovator:    "#5DD3B0",
};

interface BadgeFrontScreenProps {
  type: ResultType;
  character?: CharacterConfig;
  photoUrl?: string;
  nickname?: string;
  pledge?: string;
  cardNo?: string;
  issuedAt?: string;
  cardRef?: RefObject<HTMLDivElement>;
  onFlip?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onDrawPrize?: () => void;
}

export function BadgeFrontScreen({
  type,
  character,
  photoUrl,
  nickname,
  pledge = "봉사로 세상을 바꾸겠습니다!",
  cardNo = "전국청소년자원봉사대회-2026-00001",
  issuedAt = "2026.05.11",
  cardRef,
  onFlip,
  onDownload,
  onShare,
  onDrawPrize,
}: BadgeFrontScreenProps) {
  const accent = TYPE_COLOR[type];
  const content = RESULT_CONTENT[type];

  // 캐릭터 설정 — 저장된 값 없으면 유형별 기본값(F) 사용
  const char = character ?? { gender: "F" as const, ...DEFAULT_CHARACTER[type].F };

  // 사진 클릭 시 캐릭터↔사진 위치 교체
  const [swapped, setSwapped] = useState(false);

  return (
    <div className="relative min-h-full pb-28">
      <AppHeader pageLabel="봉사자증" />
      <div className="px-5">
      <div className="mt-2 text-center">
        <h1 className="text-[#1E1E1E] tracking-tight" style={{ fontSize: 22, fontWeight: 800 }}>
          봉사자증이 발급됐어요!
        </h1>
        <p className="mt-1 text-[#1E1E1E]/50" style={{ fontSize: 13 }}>
          이미지를 저장하거나 뒷면도 확인해보세요
        </p>
      </div>

      {/* 봉사자증 카드 — html2canvas 캡처 영역 */}
      <div className="mt-5 mx-auto" style={{ width: 300 }}>
        <div
          ref={cardRef}
          className="relative rounded-[24px] overflow-hidden shadow-[0_20px_40px_rgba(30,30,30,0.18)]"
          style={{ background: "linear-gradient(160deg, #FFCC00 0%, #FFE680 50%, #FFF9E6 100%)" }}
        >
          {/* 유형 컬러 포인트 */}
          <div
            className="absolute top-0 left-0 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ background: accent }}
          />

          {/* Header */}
          <div className="px-5 pt-2 flex items-center justify-between relative">
            <img
              src={BRAND.logoContest}
              alt={BRAND.contest}
              style={{ height: 40, width: "auto", mixBlendMode: "multiply" }}
            />
            <span className="text-[#1E1E1E]/70 text-[10px]" style={{ fontWeight: 600 }}>
              VOLUNTEER ID
            </span>
          </div>
          <div className="px-5 mt-1 relative">
            <div className="text-[#1E1E1E]" style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.1 }}>
              예비 봉사자증
            </div>
          </div>

          {/* Body */}
          <div className="mt-4 mx-4 bg-white rounded-2xl p-4 relative shadow-sm">
            {/* 메인 프레임 — swapped에 따라 캐릭터↔사진 표시 */}
            <div className="flex justify-center">
              <button
                onClick={() => setSwapped((s) => !s)}
                className="relative rounded-xl overflow-hidden flex items-center justify-center focus:outline-none active:scale-95 transition-transform"
                style={{
                  width: 120, height: 120,
                  border: "1px solid #DDD",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  background: "white",
                }}
              >
                {swapped && photoUrl ? (
                  <img src={photoUrl} alt="입장 사진" className="w-full h-full object-cover" />
                ) : swapped ? (
                  <span className="text-[36px]">📷</span>
                ) : (
                  <CharacterImage
                    gender={char.gender}
                    hair={char.hair}
                    accessory={char.accessory}
                    clear={true}
                    size={120}
                  />
                )}
              </button>
            </div>

            {/* 폴라로이드 썸네일 — swapped 시 캐릭터가 들어감 */}
            <button
              onClick={() => setSwapped((s) => !s)}
              className="absolute -top-3 -right-3 bg-white rounded-md p-1.5 pb-3 shadow-md rotate-[6deg] focus:outline-none active:scale-95 transition-transform"
            >
              <div className="w-12 h-14 overflow-hidden rounded-sm bg-[#FFF3C4] flex items-center justify-center">
                {swapped ? (
                  <CharacterImage
                    gender={char.gender}
                    hair={char.hair}
                    accessory={char.accessory}
                    clear={true}
                    size={48}
                  />
                ) : photoUrl ? (
                  <img src={photoUrl} alt="입장 사진" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[20px]">📷</span>
                )}
              </div>
            </button>

            {/* 유형 배지 */}
            <div className="mt-3 text-center">
              <div className="inline-block rounded-full px-2.5 py-0.5" style={{ background: accent }}>
                <span className="text-white text-[11px]" style={{ fontWeight: 700 }}>
                  {content.name}
                </span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center items-start">
              <Field label="이름" value={nickname || "익명"} />
              <div>
                <div className="text-[#1E1E1E]/50 text-[10px]">유형</div>
                <div className="text-[12px]" style={{ fontWeight: 700, color: accent, fontFamily: "KBFG Display", letterSpacing: "0.04em" }}>
                  {content.code}
                </div>
              </div>
              <Field label="발급일" value={issuedAt} mono />
            </div>

            <div className="mt-3 border-t border-dashed border-[#1E1E1E]/15 pt-3">
              <div className="text-[#1E1E1E]/50 text-[10px]">봉사 각오 한마디</div>
              <p className="text-[#1E1E1E] text-[12px] leading-snug mt-0.5">"{pledge}"</p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 mt-3 flex items-center justify-between">
            <span className="text-[#1E1E1E]/60" style={{ fontSize: 8, letterSpacing: 0.5 }}>
              NO. {cardNo}
            </span>
            <div className="flex gap-1">
              <Dot c="#FF7E6B" /><Dot c="#B5A0E5" /><Dot c="#5DD3B0" /><Dot c="#6BB5FF" />
            </div>
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="mt-5 grid grid-cols-3 gap-2">
        <ActionBtn icon={<RotateCw className="w-4 h-4" />} label="뒷면 보기" onClick={onFlip} />
        <ActionBtn icon={<Download className="w-4 h-4" />} label="이미지 저장" onClick={onDownload} />
        <ActionBtn icon={<Share2 className="w-4 h-4" />} label="공유" onClick={onShare} />
      </div>
      </div>{/* /px-5 */}

      <div className="absolute bottom-6 left-5 right-5">
        <button
          onClick={onDrawPrize}
          className="w-full bg-[#FFCC00] text-[#1E1E1E] rounded-2xl py-4 shadow-[0_6px_0_#E0B400]"
          style={{ fontSize: 16, fontWeight: 700 }}
        >
          경품 뽑기존으로 가기 🎁
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[#1E1E1E]/50 text-[10px]">{label}</div>
      <div
        className="text-[#1E1E1E] text-[12px]"
        style={{ fontWeight: 700 }}
      >
        {value}
      </div>
    </div>
  );
}

function Dot({ c }: { c: string }) {
  return <div className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />;
}

function ActionBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl py-3 flex flex-col items-center gap-1 shadow-sm border border-[#1E1E1E]/5"
    >
      <div className="text-[#1E1E1E]">{icon}</div>
      <span className="text-[#1E1E1E] text-[11px]" style={{ fontWeight: 600 }}>{label}</span>
    </button>
  );
}
