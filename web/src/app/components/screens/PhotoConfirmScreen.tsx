import { ChevronLeft, RotateCcw, Camera } from "lucide-react";

interface PhotoConfirmScreenProps {
  photoUrl?: string;
  onRetake: () => void;
  onNext: () => void;
}

export function PhotoConfirmScreen({ photoUrl, onRetake, onNext }: PhotoConfirmScreenProps) {
  return (
    <div className="relative min-h-full pt-12 pb-28 px-6">
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={onRetake}
          className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-[#1E1E1E]" />
        </button>
        <span className="text-[#1E1E1E]/60 text-[12px]">1 / 3</span>
      </div>

      <div className="mt-6">
        <h1 className="text-[#1E1E1E] tracking-tight" style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.25 }}>
          입장 사진을<br />확인해주세요 📸
        </h1>
        <p className="mt-2 text-[#1E1E1E]/60" style={{ fontSize: 14 }}>
          봉사자증에 들어갈 사진이에요
        </p>
      </div>

      {/* Polaroid */}
      <div className="mt-8 flex justify-center">
        <div className="bg-white rounded-[8px] p-3 pb-12 shadow-[0_12px_30px_rgba(30,30,30,0.15)] -rotate-[3deg] relative">
          <div className="w-[220px] h-[260px] rounded-[4px] overflow-hidden flex items-center justify-center bg-[#FFF3C4]">
            {photoUrl ? (
              <img src={photoUrl} alt="입장 사진" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-[#1E1E1E]/40">
                <Camera className="w-12 h-12" />
                <span className="text-[12px]">사진 없음</span>
              </div>
            )}
          </div>
          <div
            className="absolute bottom-3 left-0 right-0 text-center text-[#1E1E1E]/60"
            style={{ fontSize: 13 }}
          >
            KB · 2026.05
          </div>
        </div>
      </div>

      <div className="mt-10 bg-[#FFCC00]/20 border border-[#FFCC00] rounded-2xl p-3 flex items-start gap-2">
        <Camera className="w-4 h-4 text-[#1E1E1E] mt-0.5 flex-shrink-0" />
        <p className="text-[#1E1E1E] text-[13px] leading-snug">
          사진은 봉사자증에만 사용되고 행사 종료 후 자동 삭제돼요.
        </p>
      </div>

      <div className="absolute bottom-6 left-6 right-6 flex gap-3">
        <button
          onClick={onRetake}
          className="flex-1 bg-white border-2 border-[#1E1E1E]/10 text-[#1E1E1E] rounded-2xl py-4 flex items-center justify-center gap-1"
          style={{ fontSize: 15, fontWeight: 600 }}
        >
          <RotateCcw className="w-4 h-4" />
          다시 찍기
        </button>
        <button
          onClick={onNext}
          className="flex-[1.4] bg-[#FFCC00] text-[#1E1E1E] rounded-2xl py-4 shadow-[0_6px_0_#E0B400]"
          style={{ fontSize: 16, fontWeight: 700 }}
        >
          검사 시작 →
        </button>
      </div>
    </div>
  );
}
