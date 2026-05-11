import { motion } from "motion/react";
import { Sparkles, Heart, Star, Zap } from "lucide-react";

const MESSAGES = [
  "당신의 봉사 성향을 분석하고 있어요",
  "멋진 유형을 찾고 있어요",
  "거의 다 됐어요"
];

export function LoadingScreen() {
  return (
    <div className="relative min-h-full bg-gradient-to-b from-[#FFF9E6] to-[#FFCC00]/20 pt-20 pb-28 px-6 flex flex-col items-center justify-center">
      {/* Floating icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingIcon Icon={Sparkles} delay={0} />
        <FloatingIcon Icon={Heart} delay={0.5} />
        <FloatingIcon Icon={Star} delay={1} />
        <FloatingIcon Icon={Zap} delay={1.5} />
      </div>

      {/* Main spinner */}
      <div className="relative z-10">
        <motion.div
          className="relative"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className="w-32 h-32 rounded-full border-8 border-[#FFCC00]/30 border-t-[#FFCC00]" />
        </motion.div>

        {/* Center pulse */}
        <motion.div
          className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-[#FFCC00]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 0.8, 0.6]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Message carousel */}
      <div className="mt-12 h-16 flex items-center justify-center">
        <motion.div
          key={Math.floor(Date.now() / 2000) % MESSAGES.length}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[#1E1E1E] text-center px-6" style={{ fontSize: 16, fontWeight: 700 }}>
            {MESSAGES[Math.floor(Date.now() / 2000) % MESSAGES.length]}
          </p>
        </motion.div>
      </div>

      {/* Progress dots */}
      <div className="mt-8 flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-[#FFCC00]"
            animate={{
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Bottom text */}
      <div className="absolute bottom-12 left-0 right-0 text-center">
        <p className="text-[#1E1E1E]/60 text-[13px]">
          잠시만 기다려주세요 ✨
        </p>
      </div>
    </div>
  );
}

function FloatingIcon({ Icon, delay }: { Icon: React.ComponentType<{ className?: string }>; delay: number }) {
  const randomX = Math.random() * 100;
  const randomDuration = 3 + Math.random() * 2;

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${randomX}%`,
        top: '20%'
      }}
      animate={{
        y: [0, -100, -200, -300],
        opacity: [0, 1, 1, 0],
        rotate: [0, 180, 360]
      }}
      transition={{
        duration: randomDuration,
        repeat: Infinity,
        delay: delay,
        ease: "linear"
      }}
    >
      <Icon className="w-5 h-5 text-[#FFCC00]" />
    </motion.div>
  );
}
