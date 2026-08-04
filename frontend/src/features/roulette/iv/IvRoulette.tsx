import { useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Crown, RotateCw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { RouletteSpinner } from "../components/RouletteSpinner";
import { useReelRoulette } from "../hooks/useReelRoulette";

function ivTier(value: number) {
  if (value === 0) return { label: "완벽", tone: "perfect" as const };
  if (value >= 16) return { label: "중", tone: "high" as const };
  if (value >= 1) return { label: "상", tone: "mid" as const };
  return { label: "하", tone: "low" as const };
}

function ivChipClass(tone: ReturnType<typeof ivTier>["tone"], isWinner = false) {
  const base =
    "flex h-[76px] w-[76px] items-center justify-center rounded-full font-display text-3xl font-extrabold shadow-lg ring-4 transition-transform";
  switch (tone) {
    case "low":
      return cn(
        base,
        "bg-gradient-to-br from-amber-400 to-amber-600 text-white ring-amber-200/80 shadow-amber-500/40",
        isWinner && "scale-110 shadow-amber-500/50",
      );
    case "mid":
      return cn(
        base,
        "bg-gradient-to-br from-brand-400 to-brand-600 text-white ring-brand-200/80 shadow-brand-500/30",
        isWinner && "scale-110",
      );
    case "high":
      return cn(
        base,
        "bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800 ring-white/80 shadow-slate-400/25",
        isWinner && "scale-110",
      );
    case "perfect":
      return cn(
        base,
        "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 ring-white/80 shadow-slate-200/50",
        isWinner && "scale-110",
      );
  }
}

const TIER_LEGEND = [
  { label: "완벽 (0)", tone: "perfect" as const },
  { label: "상 (1–15)", tone: "high" as const },
  { label: "중 (16–30)", tone: "mid" as const },
  { label: "하 (31)", tone: "low" as const },
];

function legendDotClass(tone: ReturnType<typeof ivTier>["tone"]) {
  switch (tone) {
    case "perfect":
      return "bg-gradient-to-br from-amber-400 to-amber-600";
    case "high":
      return "bg-gradient-to-br from-brand-400 to-brand-600";
    case "mid":
      return "bg-gradient-to-br from-slate-300 to-slate-400";
    default:
      return "bg-gradient-to-br from-slate-100 to-slate-200";
  }
}

/** Simple 0-31 spinner for rolling a random Individual Value, sharing the
 * exact same reel mechanics as the Pokémon roulette. */
export function IvRoulette() {
  const pool = useMemo(() => Array.from({ length: 32 }, (_, i) => i), []);
  const { reel, isSpinning, winner, spinToken, spin, handleSettle } = useReelRoulette(pool);

  useEffect(() => {
    if (winner === null) return;
    const isPerfect = winner === 31;
    confetti({
      particleCount: isPerfect ? 160 : 90,
      spread: isPerfect ? 100 : 70,
      origin: { y: 0.5 },
      colors: isPerfect ? ["#facc15", "#fbbf24", "#f59e0b"] : ["#327dff", "#59a3ff", "#ff9d1f"],
    });
  }, [winner]);

  const winnerTier = winner !== null ? ivTier(winner) : null;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="glass-panel rounded-3xl p-6 sm:p-8">
        <div className="mb-6 text-center">
          <p className="text-sm text-slate-500">
            0부터 31까지 랜덤으로 뽑아보세요.
            <span className="font-semibold text-amber-600"> 0</span>이 나오면 완벽 개체!
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            {TIER_LEGEND.map(({ label, tone }) => (
              <span key={label} className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span className={cn("h-2.5 w-2.5 rounded-full", legendDotClass(tone))} />
                {label}
              </span>
            ))}
          </div>
        </div>

        <RouletteSpinner
          reel={reel}
          isSpinning={isSpinning}
          spinToken={spinToken}
          onSettle={handleSettle}
          itemWidth={108}
          height={190}
          idleContent="스핀 버튼을 눌러 개체값을 뽑아보세요!"
          renderItem={(value: number, isWinner) => {
            const { tone } = ivTier(value);
            return (
              <div className={ivChipClass(tone, isWinner && !isSpinning)}>
                {value}
              </div>
            );
          }}
          getKey={(value, i) => `${value}-${i}`}
        />

        <div className="mt-8 flex flex-col items-center gap-6">
          <button
            type="button"
            onClick={spin}
            disabled={isSpinning}
            className="btn-primary px-8 py-3 text-base"
          >
            <RotateCw className={isSpinning ? "h-5 w-5 animate-spin" : "h-5 w-5"} />
            {isSpinning ? "돌아가는 중..." : "개체값 뽑기"}
          </button>

          <AnimatePresence mode="wait">
            {winner !== null && !isSpinning && winnerTier && (
              <motion.div
                key={winner}
                initial={{ opacity: 0, scale: 0.85, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-2xl px-10 py-6",
                  winner === 31
                    ? "border border-amber-200/80 bg-gradient-to-b from-amber-50 to-white shadow-lg shadow-amber-500/15"
                    : "glass-panel",
                )}
              >
                <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-brand-500">
                  {winner === 31 ? (
                    <>
                      <Crown className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-amber-600">완벽 개체</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      개체값
                    </>
                  )}
                </span>

                <div className={ivChipClass(winnerTier.tone, true)}>{winner}</div>

                <span className="text-sm font-semibold text-slate-500">
                  등급 <span className="text-slate-700">{winnerTier.label}</span>
                  {winner === 31 && (
                    <span className="ml-1 font-bold text-amber-600">(V)</span>
                  )}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
