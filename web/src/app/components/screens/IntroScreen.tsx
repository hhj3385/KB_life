import { HeroCarousel } from "../../../components/intro/HeroCarousel";

interface IntroScreenProps {
  onStart: () => void;
}

export function IntroScreen({ onStart }: IntroScreenProps) {
  return (
    <div className="flex flex-col h-full pt-8">
      {/* Top brand bar */}
      <div className="flex items-center justify-between px-5 mb-2">
        <div className="flex items-center gap-2">
          <img src="/assets/logos/kb-life.png" alt="KB 라이프" style={{ height: 22, width: "auto" }} />
          <span className="text-[#1E1E1E]/60" style={{ fontSize: 12 }}>10기 서포터즈</span>
        </div>
        <span className="text-[#1E1E1E]/40" style={{ fontSize: 11, fontWeight: 600 }}>
          봉사 유형 검사
        </span>
      </div>

      {/* Hero carousel takes remaining space */}
      <div className="flex-1 min-h-0">
        <HeroCarousel onStart={onStart} />
      </div>
    </div>
  );
}
