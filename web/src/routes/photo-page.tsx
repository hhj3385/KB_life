import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { CameraScreen } from "../app/components/screens/CameraScreen";
import { PhotoConfirmScreen } from "../app/components/screens/PhotoConfirmScreen";
import { api } from "../lib/api";
import { useSession } from "../lib/session-context";

type Stage = "camera" | "preview" | "uploading";

export function PhotoPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { setPhotoUrl } = useSession();
  const [stage, setStage] = useState<Stage>("camera");
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();

  const handleCapture = (blob: Blob) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(blob);
    setPhotoBlob(blob);
    setPreviewUrl(url);
    setPhotoUrl(url); // 세션에 저장 → 배지 화면에서 사용
    setStage("preview");
  };

  const handleRetake = () => {
    setStage("camera");
  };

  const handleNext = async () => {
    setStage("uploading");
    // 사진 있으면 서버에 업로드 (실패해도 진행)
    if (photoBlob && id) {
      try {
        await api.session.uploadPhoto(id, photoBlob);
      } catch {
        // 업로드 실패해도 검사는 진행
      }
    }
    void navigate(`/s/${id}/test/intro`);
  };

  const handleSkip = () => {
    void navigate(`/s/${id}/test/intro`);
  };

  if (stage === "camera") {
    return <CameraScreen onCapture={handleCapture} onSkip={handleSkip} />;
  }

  return (
    <div className="relative h-full">
      <PhotoConfirmScreen
        photoUrl={previewUrl}
        onRetake={handleRetake}
        onNext={() => void handleNext()}
      />
      {stage === "uploading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-[32px]">
          <div className="w-10 h-10 rounded-full border-4 border-[#FFCC00] border-t-transparent animate-spin" />
        </div>
      )}
    </div>
  );
}
