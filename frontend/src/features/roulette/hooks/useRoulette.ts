import { useCallback, useRef, useState } from "react";
import type { RouletteOption } from "@/types";
import { useRouletteSound } from "./useRouletteSound";

const MIN_EXTRA_SPINS = 5;
const MAX_EXTRA_SPINS = 8;
const SPIN_DURATION_MS = 4200;

function pickWeightedIndex(options: RouletteOption[]): number {
  const weights = options.map((o) => o.weight ?? 1);
  const total = weights.reduce((sum, w) => sum + w, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return i;
  }
  return options.length - 1;
}

interface UseRouletteResult {
  rotation: number;
  isSpinning: boolean;
  winner: RouletteOption | null;
  spin: () => void;
}

/**
 * Drives the roulette wheel's rotation math + spin lifecycle.
 * The wheel's pointer is fixed at the top (12 o'clock / 0deg); this hook
 * computes how far to rotate so a randomly (weighted) chosen segment ends
 * up under the pointer, then reveals the winner after the CSS/JS transition.
 */
export function useRoulette(options: RouletteOption[]) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<RouletteOption | null>(null);
  const { playWin } = useRouletteSound();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const spin = useCallback(() => {
    if (isSpinning || options.length === 0) return;

    setIsSpinning(true);
    setWinner(null);

    const segmentAngle = 360 / options.length;
    const winningIndex = pickWeightedIndex(options);
    const segmentCenter = winningIndex * segmentAngle + segmentAngle / 2;
    const jitter = (Math.random() - 0.5) * (segmentAngle * 0.6);

    const extraSpins =
      MIN_EXTRA_SPINS + Math.random() * (MAX_EXTRA_SPINS - MIN_EXTRA_SPINS);

    setRotation((prev) => {
      const baseline = prev - (prev % 360);
      const targetWithinSpin = 360 - segmentCenter - jitter;
      const next = baseline + extraSpins * 360 + targetWithinSpin;
      return next > prev ? next : next + 360;
    });

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsSpinning(false);
      setWinner(options[winningIndex]);
      playWin();
    }, SPIN_DURATION_MS);
  }, [isSpinning, options, playWin]);

  return { rotation, isSpinning, winner, spin } satisfies UseRouletteResult;
}

export const ROULETTE_SPIN_DURATION_MS = SPIN_DURATION_MS;
