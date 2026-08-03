import { motion } from "framer-motion";
import type { RouletteOption } from "@/types";
import { ROULETTE_SPIN_DURATION_MS } from "../hooks/useRoulette";

interface RouletteWheelProps {
  options: RouletteOption[];
  rotation: number;
  isSpinning: boolean;
}

export function RouletteWheel({ options, rotation, isSpinning }: RouletteWheelProps) {
  const segmentAngle = 360 / options.length;

  const gradient = options
    .map((opt, i) => {
      const from = i * segmentAngle;
      const to = from + segmentAngle;
      return `${opt.color ?? "#327dff"} ${from}deg ${to}deg`;
    })
    .join(", ");

  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      {/* Pointer */}
      <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/4">
        <div className="h-8 w-8 rotate-180 drop-shadow-lg [clip-path:polygon(50%_100%,0_0,100%_0)] bg-brand-700" />
      </div>

      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-700 to-brand-900 p-3 shadow-2xl">
        <motion.div
          className="relative h-full w-full rounded-full border-4 border-white shadow-inner"
          style={{ background: `conic-gradient(${gradient})` }}
          animate={{ rotate: rotation }}
          transition={{
            duration: ROULETTE_SPIN_DURATION_MS / 1000,
            ease: [0.17, 0.67, 0.2, 1],
          }}
        >
          {options.map((opt, i) => {
            const angle = i * segmentAngle + segmentAngle / 2;
            return (
              <div
                key={opt.id}
                className="absolute inset-0 flex justify-center"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <span
                  className="mt-[12%] max-w-[38%] truncate text-center text-xs font-extrabold text-white drop-shadow-sm sm:text-sm"
                  style={{ transform: "rotate(0deg)" }}
                >
                  {opt.label}
                </span>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Center hub */}
      <div
        className={`absolute left-1/2 top-1/2 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-brand-100 bg-white text-2xl shadow-lg transition-transform ${
          isSpinning ? "animate-pulse" : ""
        }`}
      >
        🎯
      </div>
    </div>
  );
}
