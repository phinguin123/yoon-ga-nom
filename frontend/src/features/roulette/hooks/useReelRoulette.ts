import { useCallback, useRef, useState } from "react";
import { useRouletteSound } from "./useRouletteSound";

/** Visual reel length — bounded regardless of pool size, so a pool of 1 or
 * 1000+ items costs the same to render. The winner always sits last. */
const REEL_LENGTH = 28;

function buildReel<T>(pool: T[], winner: T, length: number): T[] {
  const reel: T[] = [];
  for (let i = 0; i < length - 1; i++) {
    reel.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  reel.push(winner);
  return reel;
}

interface UseReelRouletteResult<T> {
  /** Bounded list of items to render in the spinning strip (winner is last). */
  reel: T[];
  isSpinning: boolean;
  winner: T | null;
  /** Bump on every spin so the spinner can force-reset its animation state. */
  spinToken: number;
  spin: () => void;
  /** Call once the spin animation visually settles on the winner. */
  handleSettle: () => void;
}

/**
 * Drives a "slot machine" style roulette: the winner is picked instantly
 * from the full pool (cheap, no rendering involved), then a small bounded
 * reel is built for the spinning visual. This is what keeps pools of
 * hundreds of Pokémon from ever lagging the spin animation.
 */
export function useReelRoulette<T>(pool: T[]): UseReelRouletteResult<T> {
  const [reel, setReel] = useState<T[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<T | null>(null);
  const [spinToken, setSpinToken] = useState(0);
  const pendingWinnerRef = useRef<T | null>(null);
  const { playWin } = useRouletteSound();

  const spin = useCallback(() => {
    if (isSpinning || pool.length === 0) return;

    const chosen = pool[Math.floor(Math.random() * pool.length)];
    pendingWinnerRef.current = chosen;

    setWinner(null);
    setReel(buildReel(pool, chosen, REEL_LENGTH));
    setIsSpinning(true);
    setSpinToken((t) => t + 1);
  }, [isSpinning, pool]);

  const handleSettle = useCallback(() => {
    setIsSpinning(false);
    setWinner(pendingWinnerRef.current);
    playWin();
  }, [playWin]);

  return { reel, isSpinning, winner, spinToken, spin, handleSettle };
}
