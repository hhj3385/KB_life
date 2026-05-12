import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { BadgeFrontScreen } from "../app/components/screens/BadgeFrontScreen";
import { ShareSheet } from "../app/components/ShareSheet";
import { useSession } from "../lib/session-context";
import { useCardCapture } from "../lib/use-card-capture";

export function CardFrontPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { resultType, character, nickname, pledge, cardNo, photoUrl } = useSession();
  const cardRef = useRef<HTMLDivElement>(null);
  const { download, share, capturing, ready } = useCardCapture(cardRef);

  const [showSheet, setShowSheet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  if (!resultType) {
    void navigate("/");
    return null;
  }

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      await download();
      showToast("이미지가 저장됐어요!");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "저장에 실패했어요.");
    } finally {
      setLoading(false);
      setShowSheet(false);
    }
  };

  // 모바일: 시스템 공유 시트 → 앱 선택
  // 데스크탑: 이미지 다운로드 + 안내 토스트
  const handleSnsShare = async (target: "kakao" | "instagram") => {
    setLoading(true);
    setShowSheet(false);
    try {
      const result = await share();
      if (result === "downloaded") {
        const label = target === "instagram" ? "인스타그램" : "카카오톡";
        showToast(`이미지를 저장했어요. ${label} 앱에서 직접 업로드해주세요!`);
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : "공유에 실패했어요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <BadgeFrontScreen
        type={resultType}
        character={character ?? undefined}
        photoUrl={photoUrl ?? undefined}
        nickname={nickname || undefined}
        pledge={pledge || undefined}
        cardNo={cardNo ?? undefined}
        cardRef={cardRef}
        onFlip={() => void navigate(`/s/${id}/card/back`)}
        onDownload={() => void handleDownload()}
        onShare={() => setShowSheet(true)}
        onDrawPrize={() => alert("경품 뽑기존에서 운영자에게 화면을 보여주세요!")}
      />

      {showSheet && (
        <ShareSheet
          loading={loading}
          onClose={() => setShowSheet(false)}
          onSave={() => void handleDownload()}
          onKakao={() => void handleSnsShare("kakao")}
          onInstagram={() => void handleSnsShare("instagram")}
        />
      )}

      {/* 토스트 메시지 */}
      {toast && (
        <div
          className="fixed bottom-32 left-5 right-5 rounded-2xl px-4 py-3 text-center z-50 shadow-lg"
          style={{
            background: toast.includes("실패") ? "#FFF0F0" : "#1E1E1E",
            color: toast.includes("실패") ? "#C0392B" : "#FFFFFF",
            fontSize: 13,
            fontWeight: 600,
          }}
          onClick={() => setToast(null)}
        >
          {toast}
        </div>
      )}

      {(loading || capturing) && !showSheet && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/60 z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-[#FFCC00] border-t-transparent animate-spin" />
            <span className="text-[#1E1E1E] text-[13px]" style={{ fontWeight: 600 }}>
              {capturing ? "이미지 준비 중..." : "처리 중..."}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
