import { motion } from "motion/react";
import { CharacterImage } from "../character/CharacterImage";

// 봉사자증 미리보기 — 더미 데이터
export function BadgePreviewSlide() {
  return (
    <div className="flex items-center justify-center h-full">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ perspective: "900px" }}
      >
        <div style={{ transform: "rotateY(-8deg)", transformStyle: "preserve-3d" }}>
          <MiniCard />
        </div>
      </motion.div>
    </div>
  );
}

function MiniCard() {
  return (
    <div
      className="rounded-[20px] overflow-hidden shadow-[0_16px_36px_rgba(30,30,30,0.20)]"
      style={{
        width: 230,
        background: "linear-gradient(160deg, #FFCC00 0%, #FFE680 50%, #FFF9E6 100%)",
      }}
    >
      {/* Header */}
      <div className="px-4 pt-4 flex items-center justify-between">
        <img
          src="/assets/logos/kb-life.png"
          alt="KB 라이프"
          style={{ height: 14, width: "auto", mixBlendMode: "multiply" }}
        />
        <span className="text-[#1E1E1E]/60" style={{ fontSize: 8, fontFamily: "KBFG Text", fontWeight: 600 }}>
          VOLUNTEER ID
        </span>
      </div>
      <div className="px-4 mt-1">
        <div className="text-[#1E1E1E]" style={{ fontSize: 13, fontWeight: 800 }}>10기 봉사자증</div>
        <img
          src="/assets/logos/volunteer.png"
          alt="전국중고생 자원봉사대회"
          style={{ height: 18, width: "auto", marginTop: 2, mixBlendMode: "multiply" }}
        />
      </div>

      {/* Body */}
      <div className="mt-3 mx-3 bg-white rounded-xl p-3 relative shadow-sm">
        {/* 누끼 캐릭터 */}
        <div className="flex justify-center">
          <div
            className="rounded-lg overflow-hidden flex items-center justify-center bg-[#B5A0E5]/10"
            style={{ width: 80, height: 80, border: "1px solid #DDD" }}
          >
            <CharacterImage gender="F" hair={1} accessory="band" clear size={76} />
          </div>
        </div>

        {/* 폴라로이드 썸네일 */}
        <div
          className="absolute -top-2 -right-2 bg-white rounded p-1 pb-2 shadow rotate-[5deg]"
        >
          <div
            className="rounded-sm flex items-center justify-center bg-[#FFF3C4]"
            style={{ width: 30, height: 36 }}
          >
            <span style={{ fontSize: 14 }}>📷</span>
          </div>
        </div>

        {/* 유형 배지 */}
        <div className="mt-2 text-center">
          <span
            className="rounded-full px-2 py-0.5 text-white"
            style={{ fontSize: 9, fontWeight: 700, background: "#B5A0E5" }}
          >
            공감기반 조력자
          </span>
        </div>

        {/* 정보 */}
        <div className="mt-2 grid grid-cols-3 gap-1 text-center">
          <MiniField label="이름" value="OOO" />
          <MiniField label="유형" value="마음을 듣는" />
          <MiniField label="발급일" value="2026.05" />
        </div>

        {/* 각오 */}
        <div className="mt-2 border-t border-dashed border-[#1E1E1E]/10 pt-2">
          <p className="text-[#1E1E1E]/70 leading-snug" style={{ fontSize: 9 }}>
            "작은 행동으로 큰 변화를 만들겠습니다"
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 mt-2 flex items-center justify-between">
        <span className="text-[#1E1E1E]/50" style={{ fontSize: 8, fontFamily: "KBFG Text" }}>
          NO. KB-2026-00001
        </span>
        <div className="flex gap-0.5">
          {["#FF7E6B", "#B5A0E5", "#5DD3B0", "#6BB5FF"].map((c) => (
            <div key={c} className="w-1 h-1 rounded-full" style={{ background: c }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[#1E1E1E]/40" style={{ fontSize: 8 }}>{label}</div>
      <div className="text-[#1E1E1E]" style={{ fontSize: 9, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
