import html2canvas from "html2canvas";
import { useState, useEffect, useCallback, type RefObject } from "react";

const FILE_NAME = "KB-봉사자증.png";

export function useCardCapture(cardRef: RefObject<HTMLDivElement | null>) {
  const [cachedBlob, setCachedBlob] = useState<Blob | null>(null);
  const [capturing, setCapturing] = useState(false);

  // 페이지 진입 후 1.2초 뒤 자동 pre-capture
  // (폰트·이미지 렌더 완료 대기 후)
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      const el = cardRef.current;
      if (!el || cancelled) return;
      setCapturing(true);
      try {
        await document.fonts.ready;
        const canvas = await html2canvas(el, {
          scale: 3,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          logging: false,
          imageTimeout: 8000,
        });
        const blob = await new Promise<Blob | null>((r) =>
          canvas.toBlob(r, "image/png")
        );
        if (!cancelled && blob) setCachedBlob(blob);
      } catch {
        // pre-capture 실패 시 버튼 클릭 때 재시도
      } finally {
        if (!cancelled) setCapturing(false);
      }
    }, 1200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getBlob = useCallback(async (): Promise<Blob> => {
    if (cachedBlob) return cachedBlob;

    // pre-capture 실패 시 즉시 재시도
    const el = cardRef.current;
    if (!el) throw new Error("카드 요소를 찾을 수 없어요.");
    await document.fonts.ready;
    const canvas = await html2canvas(el, {
      scale: 3, useCORS: true, allowTaint: true,
      backgroundColor: null, logging: false, imageTimeout: 8000,
    });
    const blob = await new Promise<Blob | null>((r) =>
      canvas.toBlob(r, "image/png")
    );
    if (!blob) throw new Error("이미지 생성에 실패했어요.");
    setCachedBlob(blob);
    return blob;
  }, [cachedBlob, cardRef]);

  // 다운로드 — 모바일은 share API 우선, 없으면 새 탭
  const download = useCallback(async () => {
    const blob = await getBlob();
    const file = new File([blob], FILE_NAME, { type: "image/png" });

    // Android/iOS 모바일 — 시스템 공유 시트 ("갤러리에 저장" 포함)
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: "KB 봉사자증 저장" });
      return;
    }

    // 데스크탑 — 직접 다운로드
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = FILE_NAME;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 1000);
  }, [getBlob]);

  // SNS 공유 — 시스템 공유 시트 (카카오·인스타 선택)
  const share = useCallback(async () => {
    const blob = await getBlob();
    const file = new File([blob], FILE_NAME, { type: "image/png" });

    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          title: "KB 라이프 봉사자증",
          text: "KB 라이프 10기 봉사자증을 발급받았어요! 🌱\n#KB라이프 #청소년봉사 #봉사자증",
          files: [file],
        });
        return true;
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return false;
        throw e;
      }
    }

    // 공유 API 미지원 → 다운로드 대체
    await download();
    return false;
  }, [getBlob, download]);

  return { download, share, capturing, ready: !!cachedBlob };
}
