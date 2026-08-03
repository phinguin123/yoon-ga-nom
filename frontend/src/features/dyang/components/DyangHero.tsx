import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export function DyangHero() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-dyang-100 via-dyang-50 to-white px-6 py-16 text-center shadow-dyang-glow sm:py-24">
      {[...Array(6)].map((_, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute text-dyang-300/60"
          style={{
            left: `${10 + i * 15}%`,
            top: `${15 + (i % 3) * 20}%`,
            fontSize: `${16 + (i % 3) * 10}px`,
          }}
          animate={{ y: [0, -16, 0], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
        >
          <Heart fill="currentColor" />
        </motion.span>
      ))}

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-3 text-sm font-bold tracking-[0.3em] text-dyang-500"
      >
        SOME · 썸타는 중
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative font-romantic text-4xl font-bold text-dyang-800 sm:text-6xl"
      >
        윤가놈 <Heart className="mx-2 inline-block h-8 w-8 fill-dyang-500 text-dyang-500 sm:h-10 sm:w-10" /> 댱
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative mx-auto mt-4 max-w-xl text-base text-dyang-700/80 sm:text-lg"
      >
        두 사람의 케미가 쌓여가는 순간들을 기록합니다. 콜라보 방송부터 작은 SNS 반응까지, 놓치지 않고 전부.
      </motion.p>
    </div>
  );
}
