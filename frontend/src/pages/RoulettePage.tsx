import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { RotateCw } from "lucide-react";
import { ROULETTE_PRESETS } from "@/features/roulette/data/presets";
import { PresetSelector } from "@/features/roulette/components/PresetSelector";
import { RouletteWheel } from "@/features/roulette/components/RouletteWheel";
import { useRoulette } from "@/features/roulette/hooks/useRoulette";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default function RoulettePage() {
  const [presetId, setPresetId] = useState(ROULETTE_PRESETS[0].id);
  const preset = ROULETTE_PRESETS.find((p) => p.id === presetId) ?? ROULETTE_PRESETS[0];
  const { rotation, isSpinning, winner, spin } = useRoulette(preset.options);

  useEffect(() => {
    if (!winner) return;
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
      colors: ["#327dff", "#59a3ff", "#ff9d1f", "#ffb84d"],
    });
  }, [winner]);

  return (
    <div className="container-page py-10 sm:py-14">
      <SectionHeading
        eyebrow="Interactive Tool"
        title="포켓몬 룰렛"
        description="스타팅, 벌칙, 다음 챌린지 타입까지! 방송 중 실시간으로 돌려보세요. 프리셋을 고르고 스핀 버튼만 누르면 끝."
        align="center"
      />

      <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400">프리셋</h3>
          <PresetSelector presets={ROULETTE_PRESETS} selectedId={presetId} onSelect={setPresetId} />
          {preset.description && (
            <p className="rounded-xl bg-brand-50 p-3 text-sm text-brand-700">{preset.description}</p>
          )}
        </aside>

        <div className="flex flex-col items-center">
          <RouletteWheel options={preset.options} rotation={rotation} isSpinning={isSpinning} />

          <button
            type="button"
            onClick={spin}
            disabled={isSpinning}
            className="btn-primary mt-8 px-8 py-3 text-base"
          >
            <RotateCw className={isSpinning ? "h-5 w-5 animate-spin" : "h-5 w-5"} />
            {isSpinning ? "돌아가는 중..." : "룰렛 돌리기"}
          </button>

          <AnimatePresence mode="wait">
            {winner && !isSpinning && (
              <motion.div
                key={winner.id}
                initial={{ opacity: 0, scale: 0.85, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="glass-panel mt-8 flex flex-col items-center gap-1 rounded-2xl px-8 py-5"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-brand-500">결과</span>
                <span className="font-display text-2xl font-extrabold text-slate-900">
                  {winner.label}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
