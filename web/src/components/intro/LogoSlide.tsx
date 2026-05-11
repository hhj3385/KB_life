import { motion } from "motion/react";

const LOGOS = [
  { src: "/assets/logos/kb-life.png",    alt: "KB 라이프",               delay: 0 },
  { src: "/assets/logos/foundation.png", alt: "KB라이프생명사회공헌재단", delay: 0.15 },
  { src: "/assets/logos/volunteer.png",  alt: "전국중고생 자원봉사대회",  delay: 0.3 },
];

export function LogoSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-7 px-8">
      {LOGOS.map(({ src, alt, delay }) => (
        <motion.div
          key={alt}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay, duration: 0.4, ease: "easeOut" }}
          style={{
            height: 56,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={src}
            alt={alt}
            style={{
              maxHeight: "100%",
              maxWidth: "100%",
              width: "auto",
              height: "auto",
              objectFit: "contain",
            }}
          />
        </motion.div>
      ))}

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
