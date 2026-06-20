import { ChevronLeft, MapPin, Check } from "lucide-react";
import { AppHeader } from "../../../components/layout/AppHeader";
import type { PublicLocation } from "../../../lib/api";

interface LocationSelectScreenProps {
  locations: PublicLocation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
  busy: boolean;
  error: string | null;
}

export function LocationSelectScreen({
  locations,
  selectedId,
  onSelect,
  onNext,
  onBack,
  loading,
  busy,
  error,
}: LocationSelectScreenProps) {
  return (
    <div className="relative min-h-full pb-28">
      <AppHeader pageLabel="장소 선택" />
      <div className="px-6 pt-2">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-[#1E1E1E]" />
        </button>

        <div className="mt-6 text-center">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-[#FFCC00] flex items-center justify-center shadow-[0_8px_0_#E0B400]">
            <MapPin className="w-9 h-9 text-[#1E1E1E]" />
          </div>
          <h1
            className="mt-6 text-[#1E1E1E] tracking-tight"
            style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.25 }}
          >
            어느 부스에서<br />참여하고 있나요?
          </h1>
          <p className="mt-3 text-[#1E1E1E]/60 text-[13px] leading-snug">
            선택한 장소의 경품으로 뽑기가 진행돼요
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {loading && (
            <div className="py-12 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-4 border-[#FFCC00] border-t-transparent animate-spin" />
            </div>
          )}

          {!loading && locations.length === 0 && (
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <p className="text-[#1E1E1E]/60 text-[14px]" style={{ fontWeight: 700 }}>
                등록된 장소가 없습니다
              </p>
              <p className="mt-1 text-[#1E1E1E]/40 text-[12px]">
                운영자에게 문의하거나 아래 버튼으로 바로 시작하세요
              </p>
            </div>
          )}

          {!loading &&
            locations.map((loc) => {
              const selected = loc.id === selectedId;
              const soldOut = loc.remainingTotal === 0;
              return (
                <button
                  key={loc.id}
                  onClick={() => onSelect(loc.id)}
                  className={`w-full flex items-center justify-between rounded-2xl px-4 py-4 text-left transition border-2 ${
                    selected
                      ? "bg-[#FFF3BF] border-[#FFCC00]"
                      : "bg-white border-transparent shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        selected ? "bg-[#FFCC00]" : "bg-[#FFF9E6]"
                      }`}
                    >
                      <MapPin className="w-5 h-5 text-[#1E1E1E]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[#1E1E1E] truncate" style={{ fontSize: 16, fontWeight: 700 }}>
                        {loc.name}
                      </p>
                      <p
                        className={soldOut ? "text-[#FF7E6B]" : "text-[#1E1E1E]/40"}
                        style={{ fontSize: 11, fontWeight: 600 }}
                      >
                        {soldOut ? "경품 소진" : `경품 ${loc.remainingTotal}개 남음`}
                      </p>
                    </div>
                  </div>
                  {selected && (
                    <div className="w-7 h-7 rounded-full bg-[#FFCC00] flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-[#1E1E1E]" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-red-700 text-[13px] text-center">
            {error}
          </div>
        )}
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <button
          onClick={onNext}
          disabled={busy || (locations.length > 0 && !selectedId)}
          className="w-full bg-[#FFCC00] text-[#1E1E1E] rounded-2xl py-4 shadow-[0_6px_0_#E0B400] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          style={{ fontSize: 17, fontWeight: 700 }}
        >
          {busy ? "준비 중..." : locations.length === 0 ? "그냥 시작하기 →" : "이 장소로 시작 →"}
        </button>
      </div>
    </div>
  );
}
