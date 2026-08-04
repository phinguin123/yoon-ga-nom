import { useLayoutEffect, useRef, type ReactNode } from "react";
import { motion, useAnimation } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const SPIN_DURATION_S = 4.2;
const SPIN_EASE = [0.17, 0.67, 0.2, 1] as const;
const ITEM_GAP = 12;

interface RouletteSpinnerProps<T> {
  /** Bounded list of items to render in the strip — winner is the last item. */
  reel: T[];
  isSpinning: boolean;
  /** Bumped by the parent on every spin to force the strip to reset + replay. */
  spinToken: number;
  onSettle: () => void;
  renderItem: (item: T, isWinner: boolean) => ReactNode;
  getKey: (item: T, index: number) => string;
  /** Width of a single reel slot in px. */
  itemWidth?: number;
  /** Height of the viewport in px. */
  height?: number;
  idleContent?: ReactNode;
  className?: string;
}

/**
 * Lag-free "slot machine" spinner core, shared by the Pokémon roulette and
 * the IV roulette. It only ever renders `reel.length` DOM nodes (a small,
 * fixed-size subset), regardless of how large the underlying pool is — the
 * actual winner is picked by the caller before the reel is even built.
 */
export function RouletteSpinner<T>({
  reel,
  isSpinning,
  spinToken,
  onSettle,
  renderItem,
  getKey,
  itemWidth = 140,
  height = 176,
  idleContent,
  className,
}: RouletteSpinnerProps<T>) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const step = itemWidth + ITEM_GAP;

  useLayoutEffect(() => {
    if (reel.length === 0) return;

    const viewportWidth = viewportRef.current?.offsetWidth ?? 0;
    const winnerIndex = reel.length - 1;
    const winnerCenter = winnerIndex * step + itemWidth / 2;
    const target = viewportWidth / 2 - winnerCenter;

    // Imperative start (rather than a declarative `animate` prop diff)
    // guarantees a real animation always runs, even on the very first spin
    // — with a declarative prop, the first render's `animate` value can
    // momentarily equal its `initial` value (both default to 0), which
    // lets framer-motion treat it as a no-op and resolve instantly, so the
    // result appears before the strip visually finishes moving.
    controls.set({ x: 0 });
    controls.start({ x: target }, { duration: SPIN_DURATION_S, ease: SPIN_EASE }).then(onSettle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinToken]);

  return (
    <div
      ref={viewportRef}
      className={cn(
        "relative w-full min-w-0 overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-b from-slate-100 to-slate-200 shadow-inner",
        className,
      )}
      style={{ height }}
    >
      {reel.length > 0 && (
        <motion.div
          className="flex h-full items-center"
          style={{ gap: ITEM_GAP, paddingLeft: 4 }}
          animate={controls}
        >
          {reel.map((item, i) => (
            <div
              key={getKey(item, i)}
              className="flex shrink-0 items-center justify-center"
              style={{ width: itemWidth, height: height - 24 }}
            >
              {renderItem(item, i === reel.length - 1)}
            </div>
          ))}
        </motion.div>
      )}

      {/* Edge fade masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-slate-100 to-transparent sm:w-20" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-slate-100 to-transparent sm:w-20" />

      {/* Center selection window */}
      <div
        className="pointer-events-none absolute inset-y-2 left-1/2 z-20 -translate-x-1/2"
        style={{ width: itemWidth + 16 }}
      >
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-2xl border-2 border-brand-500 px-2 shadow-[0_0_24px_-4px_rgba(50,125,255,0.7)] transition-opacity",
            isSpinning ? "opacity-100" : "opacity-70",
          )}
        >
          {reel.length === 0 && idleContent && (
            <p className="text-center text-xs font-medium leading-snug text-slate-500 sm:text-sm">
              {idleContent}
            </p>
          )}
        </div>
        <ChevronDown className="absolute -top-3.5 left-1/2 h-6 w-6 -translate-x-1/2 text-brand-500 drop-shadow" strokeWidth={3} />
        <ChevronUp className="absolute -bottom-3.5 left-1/2 h-6 w-6 -translate-x-1/2 text-brand-500 drop-shadow" strokeWidth={3} />
      </div>
    </div>
  );
}
