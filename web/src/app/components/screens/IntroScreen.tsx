import { HeroCarousel } from "../../../components/intro/HeroCarousel";
import { AppHeader } from "../../../components/layout/AppHeader";

interface IntroScreenProps {
  onStart: () => void;
}

export function IntroScreen({ onStart }: IntroScreenProps) {
  return (
    <div className="flex flex-col h-full">
      <AppHeader pageLabel="봉사 유형 검사" />
      <div className="flex-1 min-h-0">
        <HeroCarousel onStart={onStart} />
      </div>
    </div>
  );
}
