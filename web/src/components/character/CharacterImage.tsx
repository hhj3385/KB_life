import type { Gender, Accessory } from "@kb-booth/shared";

interface Props {
  gender: Gender;
  hair: number;       // 1~5
  accessory: Accessory;
  clear?: boolean;    // true면 누끼 버전 (_clear.png) — 봉사자증용
  size?: number;      // px 정사각형
  className?: string;
}

export function CharacterImage({
  gender,
  hair,
  accessory,
  clear = false,
  size = 256,
  className,
}: Props) {
  const suffix = clear ? "_clear" : "";
  const src = `/assets/characters/${gender}_h${hair}_${accessory}${suffix}.png`;

  return (
    <img
      src={src}
      width={size}
      height={size}
      alt=""
      className={className}
      style={{ objectFit: "contain" }}
      onError={(e) => {
        // 이미지 로드 실패 시 투명 placeholder (레이아웃 유지)
        (e.currentTarget as HTMLImageElement).style.opacity = "0";
      }}
    />
  );
}
