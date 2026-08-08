import { useEffect, useMemo, useRef } from "react";
import confetti from "canvas-confetti";
import { Crown, Dices, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatRow } from "./StatRow";
import { NatureBrowser } from "./NatureBrowser";
import { useIvBoard } from "./useIvBoard";
import { describeNature, isNeutralNature, type Nature } from "./natures";
import { MAX_IV, MAX_TOTAL_IV, PERFECT_IV, STAT_KEYS, type StatKey } from "./stats";

/** Same confetti burst used when the Pokémon roulette lands on a winner —
 * reused here as the "special" celebration for rolling the max IV (31). */
function firePokemonRouletteConfetti() {
  confetti({
    particleCount: 130,
    spread: 85,
    origin: { y: 0.5 },
    colors: ["#327dff", "#59a3ff", "#ff9d1f", "#ffb84d"],
  });
}

function firePerfectConfetti() {
  confetti({
    particleCount: 160,
    spread: 90,
    origin: { y: 0.4 },
    colors: ["#facc15", "#fbbf24", "#f59e0b"],
  });
}

function natureEffectFor(nature: Nature | null, key: StatKey): "up" | "down" | null {
  if (!nature || key === "hp") return null;
  if (nature.increased === key) return "up";
  if (nature.decreased === key) return "down";
  return null;
}

/** Clean, modern "in-game stat screen" style board for rolling a Pokémon's
 * six individual values (IVs) one at a time — or all at once — plus its
 * nature, mirroring how the real games present ability points. */
export function IvRoulette() {
  const { values, rollingKeys, nature, natureRolling, isAnyRolling, rollStat, rollNature, rollAll, selectNature, reset } =
    useIvBoard();

  const prevRollingRef = useRef<Set<StatKey>>(new Set());
  useEffect(() => {
    prevRollingRef.current.forEach((key) => {
      if (rollingKeys.has(key)) return;
      const settled = values[key];
      if (settled === PERFECT_IV) firePerfectConfetti();
      else if (settled === PERFECT_IV) firePokemonRouletteConfetti();
    });
    prevRollingRef.current = new Set(rollingKeys);
  }, [rollingKeys, values]);

  const total = useMemo(
    () => STAT_KEYS.reduce((sum, key) => sum + (values[key] ?? 0), 0),
    [values],
  );
  const perfectCount = useMemo(
    () => STAT_KEYS.filter((key) => values[key] === PERFECT_IV).length,
    [values],
  );
  const hasAnyValue = useMemo(() => STAT_KEYS.some((key) => values[key] !== undefined), [values]);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 text-center">
        <p className="text-sm text-slate-500">
          능력치별로 하나씩 뽑거나, <span className="font-semibold text-brand-600">전체 뽑기</span>로 개체값과
          성격을 한 번에 굴려보세요. 개체값은{" "}
          <span className="font-semibold text-slate-700">낮을수록 좋아요</span> —
          <span className="font-semibold text-amber-600"> 0</span>이 나오면 완벽 개체!
          <span className="font-semibold text-amber-600"> 0</span>이 나오면 특별한 효과가 터져요.
        </p>
      </div>

      {/* Game-style stat board */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-5 shadow-2xl shadow-indigo-950/30 ring-1 ring-white/10 sm:p-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative mb-1 flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-white/70">
            <Sparkles className="h-3.5 w-3.5 text-brand-300" />
            개체값 (IV)
          </h3>
          <div className="flex items-center gap-2">
            {perfectCount > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-amber-400/15 px-2.5 py-1 text-xs font-extrabold text-amber-300 ring-1 ring-amber-400/30">
                <Crown className="h-3 w-3" strokeWidth={2.5} />
                완벽 {perfectCount}
              </span>
            )}
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-white/80">
              {total}/{MAX_TOTAL_IV}
            </span>
          </div>
        </div>

        <div className="relative divide-y divide-white/5">
          {STAT_KEYS.map((key) => (
            <StatRow
              key={key}
              statKey={key}
              value={values[key]}
              rolling={rollingKeys.has(key)}
              natureEffect={natureEffectFor(nature, key)}
              onRoll={() => rollStat(key)}
            />
          ))}
        </div>

        <div className="relative mt-3 border-t border-white/10 pt-4">
          <h3 className="mb-2 text-sm font-bold text-white/70">능력 보정 (성격)</h3>
          <button
            type="button"
            onClick={rollNature}
            disabled={natureRolling}
            className={cn(
              "flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition-all hover:bg-white/10 disabled:opacity-70",
            )}
          >
            <span>
              <span className="block font-display text-lg font-extrabold text-white">
                {nature ? nature.nameKo : "뽑아보세요"}
              </span>
              <span className="block text-xs font-medium text-white/50">
                {nature ? describeNature(nature) : "성격에 따라 능력치가 오르내려요"}
              </span>
            </span>
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/80",
                nature && !isNeutralNature(nature) && !natureRolling && "border-brand-300/40 bg-brand-500/20 text-brand-200",
              )}
            >
              <Dices className={cn("h-4 w-4", natureRolling && "animate-spin")} strokeWidth={2.5} />
            </span>
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={rollAll}
          disabled={isAnyRolling}
          className="btn-primary px-8 py-3 text-base"
        >
          <Dices className={isAnyRolling ? "h-5 w-5 animate-spin" : "h-5 w-5"} />
          {isAnyRolling ? "뽑는 중..." : "전체 뽑기"}
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={isAnyRolling || !hasAnyValue}
          className="btn-secondary px-5 py-3 text-sm"
        >
          <RotateCcw className="h-4 w-4" />
          초기화
        </button>
      </div>

      {/* Nature reference / manual picker */}
      <div className="mt-6">
        <NatureBrowser selectedId={nature?.id} onSelect={selectNature} disabled={natureRolling} />
      </div>
    </div>
  );
}
