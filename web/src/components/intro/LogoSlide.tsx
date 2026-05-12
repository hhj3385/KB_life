import { motion } from "motion/react";
import { BRAND } from "@kb-booth/shared";

export function LogoSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-8">
      {/* 재단 로고 크게 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0, duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center gap-2"
      >
        <img
          src={BRAND.logoFoundation}
          alt={BRAND.foundation}
          style={{ height: 64, width: "auto", maxWidth: "100%", objectFit: "contain" }}
        />
        <span className="text-[#1E1E1E]/60 text-[12px]" style={{ fontWeight: 600 }}>
          {BRAND.foundation}
        </span>
      </motion.div>

      {/* 구분선 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="w-12 h-[1px] bg-[#1E1E1E]/15"
      />

      {/* 대회 로고 작게 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center gap-1.5"
      >
        <img
          src={BRAND.logoContest}
          alt={BRAND.contest}
          style={{ height: 36, width: "auto", maxWidth: "100%", objectFit: "contain" }}
        />
        <span className="text-[#1E1E1E]/50 text-[11px]" style={{ fontWeight: 600 }}>
          {BRAND.supporters}
        </span>
      </motion.div>

      {/* 장식 점 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="flex gap-2"
      >
        {["#6BB5FF", "#B5A0E5", "#FF7E6B", "#5DD3B0"].map((c) => (
          <div key={c} className="rounded-full" style={{ width: 7, height: 7, background: c }} />
        ))}
      </motion.div>
    </div>
  );
}
