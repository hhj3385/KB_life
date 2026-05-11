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
  const [error, setError] = useState<string | null>(null);

  if (!resultType) {
    void navigate("/");
    return null;
  }

  const handleDownload = async () => {
    setLoading(true);
    setError(null);
    try {
      await download();
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장에 실패했어요.");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    setLoading(true);
    setShowSheet(false);
    setError(null);
    try {
      await share();
    } catch (e) {
      setError(e instanceof Error ? e.message : "공유에 실패했어요.");
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
          onSave={() => void handleDownload().then(() => setShowSheet(false))}
          onKakao={() => void handleShare()}
          onInstagram={() => void handleShare()}
        />
      )}

      {error && (
        <div
          className="fixed bottom-32 left-5 right-5 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-red-700 text-center z-50"
          style={{ fontSize: 13 }}
          onClick={() => setError(null)}
        >
          {error}
        </div>
      )}

      {(loading || capturing) && !showSheet && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
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
