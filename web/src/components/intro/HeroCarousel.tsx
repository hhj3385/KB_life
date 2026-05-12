import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { INTRO_SLIDES } from "@kb-booth/shared";
import { TypeGridSlide } from "./TypeGridSlide";
import { CharacterPanoramaSlide } from "./CharacterPanoramaSlide";
import { BadgePreviewSlide } from "./BadgePreviewSlide";
import { LogoSlide } from "./LogoSlide";
import { SourceSlide } from "./SourceSlide";

const SLIDE_DURATION = 4000;
const RESUME_DELAY = 5000;

function SlideContent({ kind }: { kind: (typeof INTRO_SLIDES)[number]["kind"] }) {
  switch (kind) {
    case "type-grid":          return <TypeGridSlide />;
    case "source":             return <SourceSlide />;
    case "character-panorama": return <CharacterPanoramaSlide />;
    case "badge-preview":      return <BadgePreviewSlide />;
    case "logo":               return <LogoSlide />;
  }
}

interface HeroCarouselProps {
  onStart: () => void;
}

export function HeroCarousel({ onStart }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const slide = INTRO_SLIDES[index];

  const startAutoPlay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % INTRO_SLIDES.length);
    }, SLIDE_DURATION);
  }, []);

  const pauseAndResume = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (resumeRef.current) clearTimeout(resumeRef.current);
    resumeRef.current = setTimeout(startAutoPlay, RESUME_DELAY);
  }, [startAutoPlay]);

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (resumeRef.current) clearTimeout(resumeRef.current);
    };
  }, [startAutoPlay]);

  // Touch / swipe
  const touchStartX = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40) return;
    pauseAndResume();
    if (dx < 0) {
      setDirection(1);
      setIndex((i) => (i + 1) % INTRO_SLIDES.length);
    } else {
      setDirection(-1);
      setIndex((i) => (i - 1 + INTRO_SLIDES.length) % INTRO_SLIDES.length);
    }
  };

  const goTo = (i: number) => {
    if (i === index) return;
    setDirection(i > index ? 1 : -1);
    setIndex(i);
    pauseAndResume();
  };

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d * 12 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d * -12 }),
  };

  return (
    <div className="flex flex-col h-full">
      {/* Slide area */}
      <div
        className="relative flex-1 overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={slide.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <SlideContent kind={slide.kind} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Caption */}
      <AnimatePresence mode="wait">
        <motion.p
          key={`caption-${slide.id}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="text-center text-[#1E1E1E]/70 px-6 whitespace-pre-line"
          style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.5, minHeight: 36 }}
        >
          {slide.caption}
        </motion.p>
      </AnimatePresence>

      {/* Indicator dots */}
      <div className="flex justify-center gap-1.5 mt-2 mb-2">
        {INTRO_SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === index ? 20 : 6,
              height: 6,
              background: i === index ? "#FFCC00" : "#1E1E1E20",
            }}
            aria-label={`슬라이드 ${i + 1}`}
          />
        ))}
      </div>

      {/* CTA */}
      <div className="px-5 pb-5">
        <button
          onClick={onStart}
          className="w-full bg-[#FFCC00] text-[#1E1E1E] rounded-2xl py-3.5 shadow-[0_5px_0_#E0B400] active:translate-y-[2px] active:shadow-[0_3px_0_#E0B400] transition"
          style={{ fontSize: 16, fontWeight: 700 }}
        >
          시작하기 →
        </button>
      </div>
    </div>
  );
}
