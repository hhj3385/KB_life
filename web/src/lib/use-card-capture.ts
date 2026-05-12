import html2canvas from "html2canvas";
import { useState, useEffect, useCallback, type RefObject } from "react";

const FILE_NAME = "예비봉사자증.png";
const SHARE_TITLE = "전국청소년자원봉사대회 예비 봉사자증";
const SHARE_TEXT = "전국청소년자원봉사대회 예비 봉사자증을 발급받았어요! 🌱\n#청소년봉사 #전국청소년자원봉사대회 #봉사자증";

async function captureCard(el: HTMLElement): Promise<Blob> {
  await document.fonts.ready;
  const canvas = await html2canvas(el, {
    scale: 3,
    // useCORS와 allowTaint를 동시에 쓰면 충돌. 동일 출처 자산이므로 allowTaint만 사용.
    allowTaint: true,
    useCORS: false,
    backgroundColor: null,
    logging: false,
    imageTimeout: 8000,
    onclone: (_doc, cloned) => {
      // html2canvas는 mix-blend-mode 미지원 → 캡처 전 제거
      cloned.querySelectorAll<HTMLElement>("[style]").forEach((el) => {
        if (el.style.mixBlendMode) el.style.mixBlendMode = "normal";
      });
    },
  });
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("이미지 생성에 실패했어요."));
    }, "image/png");
  });
}

export function useCardCapture(cardRef: RefObject<HTMLDivElement | null>) {
  const [cachedBlob, setCachedBlob] = useState<Blob | null>(null);
  const [capturing, setCapturing] = useState(false);

  // 페이지 진입 후 1.2초 뒤 자동 pre-capture (폰트·이미지 렌더 완료 대기 후)
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      const el = cardRef.current;
      if (!el || cancelled) return;
      setCapturing(true);
      try {
        const blob = await captureCard(el);
        if (!cancelled) setCachedBlob(blob);
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
    const el = cardRef.current;
    if (!el) throw new Error("카드 요소를 찾을 수 없어요.");
    const blob = await captureCard(el);
    setCachedBlob(blob);
    return blob;
  }, [cachedBlob, cardRef]);

  // 이미지 저장 — 모바일은 시스템 공유 시트, 데스크탑은 직접 다운로드
  const download = useCallback(async () => {
    const blob = await getBlob();
    const file = new File([blob], FILE_NAME, { type: "image/png" });

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: SHARE_TITLE });
      return;
    }

    // 데스크탑 직접 다운로드
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = FILE_NAME;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  }, [getBlob]);

  // SNS 공유 — 시스템 공유 시트 (모바일에서 카카오·인스타 선택 가능)
  // 반환값: "shared" | "downloaded" | "unsupported"
  const share = useCallback(async (): Promise<"shared" | "downloaded" | "unsupported"> => {
    const blob = await getBlob();
    const file = new File([blob], FILE_NAME, { type: "image/png" });

    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ title: SHARE_TITLE, text: SHARE_TEXT, files: [file] });
        return "shared";
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return "unsupported";
        throw e;
      }
    }

    // 데스크탑 — 파일 공유 미지원 → 이미지 다운로드 후 안내
    await download();
    return "downloaded";
  }, [getBlob, download]);

  return { download, share, capturing, ready: !!cachedBlob };
}
