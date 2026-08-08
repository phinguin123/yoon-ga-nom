import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_IV, PERFECT_IV, STAT_META, type StatKey } from "./stats";

interface StatRowProps {
  statKey: StatKey;
  value?: number;
  rolling: boolean;
  natureEffect: "up" | "down" | null;
  onRoll: () => void;
}

export function StatRow({ statKey, value, rolling, natureEffect, onRoll }: StatRowProps) {
  const meta = STAT_META[statKey];
  const Icon = meta.icon;
  const isPerfect = value === PERFECT_IV && !rolling;
  const isWorst = value === MAX_IV && !rolling;
  const pct = value !== undefined ? (value / MAX_IV) * 100 : 0;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl py-2.5 pl-1 pr-1 transition-colors",
        isPerfect && "bg-amber-400/10 ring-1 ring-amber-400/30",
        isWorst && "bg-brand-400/10 ring-1 ring-brand-400/30",
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm ring-1",
          meta.gradient,
          meta.ring,
        )}
      >
        <Icon className="h-4 w-4" strokeWidth={2.25} />
      </div>

      <div className="w-[76px] shrink-0 text-[13px] font-bold text-white/90">
        <div className="flex items-center gap-1">
          {meta.label}
          {natureEffect === "up" && <ArrowUp className="h-3 w-3 text-orange-400" strokeWidth={3} />}
          {natureEffect === "down" && <ArrowDown className="h-3 w-3 text-sky-400" strokeWidth={3} />}
        </div>
      </div>

      <div className="w-9 shrink-0 text-right font-display text-lg font-extrabold tabular-nums text-white">
        {value === undefined ? (
          <span className="text-white/30">–</span>
        ) : (
          <motion.span
            key={rolling ? "rolling" : value}
            initial={{ opacity: 0.4, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.12 }}
            className={cn(
              "inline-block",
              isPerfect && "text-amber-300",
              isWorst && "text-brand-300",
            )}
          >
            {value}
          </motion.span>
        )}
      </div>

      <div className="relative h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-white/10">
        {/* Faint full-track glow for the perfect (0) roll, since its bar fill is empty. */}
        {isPerfect && <div className="absolute inset-0 animate-pulse rounded-full bg-amber-400/25" />}
        <motion.div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full bg-gradient-to-r",
            isWorst ? "from-brand-400 to-ember-500" : meta.gradient,
          )}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: rolling ? 0.06 : 0.35, ease: "easeOut" }}
        />
      </div>

      <button
        type="button"
        onClick={onRoll}
        disabled={rolling}
        aria-label={`${meta.label} 개체값 뽑기`}
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/80 transition-all hover:bg-white/20 hover:text-white disabled:opacity-60",
        )}
      >
        <RotateCw className={cn("h-3.5 w-3.5", rolling && "animate-spin")} strokeWidth={2.5} />
      </button>
    </div>
  );
}
