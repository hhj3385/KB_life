import { CharacterImage } from "../character/CharacterImage";
import type { Gender, Accessory } from "@kb-booth/shared";

type CharDef = { gender: Gender; hair: 1 | 2 | 3 | 4 | 5; accessory: Accessory; color: string };

const COLORS = ["#6BB5FF", "#B5A0E5", "#FF7E6B", "#5DD3B0"];

const ROW1: CharDef[] = [
  { gender: "F", hair: 1, accessory: "none",    color: COLORS[0] },
  { gender: "F", hair: 1, accessory: "cap",     color: COLORS[1] },
  { gender: "F", hair: 2, accessory: "none",    color: COLORS[2] },
  { gender: "F", hair: 2, accessory: "beanie",  color: COLORS[3] },
  { gender: "F", hair: 3, accessory: "glasses", color: COLORS[0] },
  { gender: "F", hair: 3, accessory: "band",    color: COLORS[1] },
  { gender: "F", hair: 4, accessory: "none",    color: COLORS[2] },
  { gender: "F", hair: 4, accessory: "cap",     color: COLORS[3] },
  { gender: "F", hair: 5, accessory: "none",    color: COLORS[0] },
  { gender: "F", hair: 5, accessory: "beanie",  color: COLORS[1] },
];

const ROW2: CharDef[] = [
  { gender: "M", hair: 1, accessory: "none",    color: COLORS[2] },
  { gender: "M", hair: 1, accessory: "cap",     color: COLORS[3] },
  { gender: "M", hair: 2, accessory: "beanie",  color: COLORS[0] },
  { gender: "M", hair: 2, accessory: "none",    color: COLORS[1] },
  { gender: "M", hair: 3, accessory: "glasses", color: COLORS[2] },
  { gender: "M", hair: 3, accessory: "bucket",  color: COLORS[3] },
  { gender: "M", hair: 4, accessory: "none",    color: COLORS[0] },
  { gender: "M", hair: 4, accessory: "cap",     color: COLORS[1] },
  { gender: "M", hair: 5, accessory: "none",    color: COLORS[2] },
  { gender: "M", hair: 5, accessory: "beanie",  color: COLORS[3] },
];

function CharCard({ gender, hair, accessory, color }: CharDef) {
  return (
    <div
      className="flex-none rounded-2xl flex items-center justify-center overflow-hidden"
      style={{ width: 80, height: 80, background: `${color}25`, border: `1.5px solid ${color}40` }}
    >
      <CharacterImage
        gender={gender}
        hair={hair}
        accessory={accessory}
        clear={true}
        size={72}
      />
    </div>
  );
}

function MarqueeRow({ items, reverse }: { items: CharDef[]; reverse?: boolean }) {
  // 두 벌 이어붙여 seamless 루프
  const doubled = [...items, ...items];
  const duration = reverse ? 18 : 22;

  return (
    <div className="overflow-hidden">
      <div
        className="flex gap-2.5"
        style={{
          width: "max-content",
          willChange: "transform",
          animation: `kb-scroll ${duration}s linear infinite${reverse ? " reverse" : ""}`,
        }}
      >
        {doubled.map((c, i) => (
          <CharCard key={i} {...c} />
        ))}
      </div>
    </div>
  );
}

export function CharacterPanoramaSlide() {
  return (
    <div className="flex flex-col justify-center gap-3 h-full py-2 overflow-hidden">
      <style>{`
        @keyframes kb-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
      <MarqueeRow items={ROW1} />
      <MarqueeRow items={ROW2} reverse />
    </div>
  );
}
