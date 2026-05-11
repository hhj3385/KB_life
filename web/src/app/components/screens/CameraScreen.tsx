import { useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, X } from "lucide-react";

interface CameraScreenProps {
  onCapture: (blob: Blob) => void;
  onSkip: () => void;
}

export function CameraScreen({ onCapture, onSkip }: CameraScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [error, setError] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    let active = true;
    setReady(false);
    setError(null);

    // 이전 스트림 정리
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("카메라를 사용하려면 HTTPS 연결이 필요해요.\n사진 없이 계속 진행할 수 있어요.");
      return;
    }

    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      })
      .then((stream) => {
        if (!active) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err: DOMException) => {
        if (!active) return;
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setError("카메라 권한이 거부됐어요.\n브라우저 주소창 옆 자물쇠 아이콘에서 카메라를 허용해주세요.");
        } else if (err.name === "NotFoundError") {
          setError("카메라를 찾을 수 없어요.");
        } else {
          setError("카메라를 시작할 수 없어요.\n사진 없이 계속 진행할 수 있어요.");
        }
      });

    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [facingMode]);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !ready || capturing) return;
    setCapturing(true);

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) { setCapturing(false); return; }

    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        setCapturing(false);
        if (blob) onCapture(blob);
      },
      "image/jpeg",
      0.88,
    );
  };

  const flipCamera = () => {
    setFacingMode((m) => (m === "user" ? "environment" : "user"));
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-8 text-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-[#FFCC00]/20 flex items-center justify-center">
          <Camera className="w-9 h-9 text-[#1E1E1E]/40" />
        </div>
        <p className="text-[#1E1E1E] whitespace-pre-line" style={{ fontSize: 15, fontWeight: 600 }}>
          {error}
        </p>
        <button
          onClick={onSkip}
          className="w-full bg-[#FFCC00] text-[#1E1E1E] rounded-2xl py-4 shadow-[0_6px_0_#E0B400]"
          style={{ fontSize: 16, fontWeight: 700 }}
        >
          사진 없이 계속하기 →
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-full bg-black">
      {/* 뷰파인더 */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onCanPlay={() => setReady(true)}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
        />

        {/* 상단 버튼 */}
        <button
          onClick={onSkip}
          className="absolute top-10 right-4 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* 가이드 프레임 */}
        {ready && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="w-56 h-64 rounded-[20px]"
              style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)", border: "2px solid rgba(255,204,0,0.8)" }}
            />
          </div>
        )}

        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-4 border-[#FFCC00] border-t-transparent animate-spin" />
          </div>
        )}
      </div>

      {/* 하단 컨트롤 */}
      <div className="bg-black px-8 py-6 flex items-center justify-between gap-6">
        {/* 전/후면 전환 */}
        <button
          onClick={flipCamera}
          className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"
        >
          <RefreshCw className="w-5 h-5 text-white" />
        </button>

        {/* 셔터 */}
        <button
          onClick={handleCapture}
          disabled={!ready || capturing}
          className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg disabled:opacity-50 active:scale-95 transition-transform"
        >
          <div className="w-16 h-16 rounded-full bg-white border-4 border-[#1E1E1E]/10" />
        </button>

        {/* 사진 없이 계속 */}
        <button
          onClick={onSkip}
          className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"
        >
          <span className="text-white text-[10px] text-center leading-tight" style={{ fontWeight: 600 }}>건너<br />뛰기</span>
        </button>
      </div>
    </div>
  );
}
