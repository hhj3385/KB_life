import { Download, X } from "lucide-react";

interface ShareSheetProps {
  onClose: () => void;
  onSave: () => void;
  onKakao: () => void;
  onInstagram: () => void;
  loading?: boolean;
}

export function ShareSheet({ onClose, onSave, onKakao, onInstagram, loading }: ShareSheetProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* 딤 처리 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* 시트 */}
      <div className="relative bg-white rounded-t-[28px] px-5 pt-5 pb-10 safe-bottom">
        <div className="flex items-center justify-between mb-5">
          <span className="text-[#1E1E1E]" style={{ fontSize: 17, fontWeight: 700 }}>
            공유하기
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1E1E1E]/8 flex items-center justify-center"
          >
            <X className="w-4 h-4 text-[#1E1E1E]" />
          </button>
        </div>

        {loading && (
          <div className="flex justify-center mb-4">
            <div className="w-8 h-8 rounded-full border-4 border-[#FFCC00] border-t-transparent animate-spin" />
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          {/* 이미지 저장 */}
          <ShareBtn
            onClick={onSave}
            bg="#F2F2F7"
            icon={<Download className="w-7 h-7 text-[#1E1E1E]" />}
            label="이미지 저장"
            disabled={loading}
          />

          {/* 카카오톡 */}
          <ShareBtn
            onClick={onKakao}
            bg="#FAE100"
            icon={
              <svg viewBox="0 0 24 24" className="w-7 h-7" fill="#3C1E1E">
                <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.737 1.64 5.142 4.11 6.597l-.7 2.581c-.07.26.2.463.426.324L8.96 18.25A11.1 11.1 0 0 0 12 18.6c5.523 0 10-3.477 10-7.8S17.523 3 12 3z" />
              </svg>
            }
            label="카카오톡"
            disabled={loading}
          />

          {/* 인스타그램 */}
          <ShareBtn
            onClick={onInstagram}
            bg="linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)"
            icon={
              <svg viewBox="0 0 24 24" className="w-7 h-7" fill="white">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
              </svg>
            }
            label="인스타그램"
            disabled={loading}
          />
        </div>

        <p className="mt-4 text-center text-[#1E1E1E]/40 text-[11px]">
          모바일에서는 기기 공유 메뉴로 앱을 선택하고,
          <br />PC에서는 이미지를 저장 후 앱에서 업로드하세요
        </p>
      </div>
    </div>
  );
}

function ShareBtn({
  onClick,
  bg,
  icon,
  label,
  disabled,
}: {
  onClick: () => void;
  bg: string;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}) {
  const isGradient = bg.startsWith("linear");
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center gap-2 disabled:opacity-50"
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm"
        style={isGradient ? { backgroundImage: bg } : { background: bg }}
      >
        {icon}
      </div>
      <span className="text-[#1E1E1E] text-[12px]" style={{ fontWeight: 600 }}>
        {label}
      </span>
    </button>
  );
}
