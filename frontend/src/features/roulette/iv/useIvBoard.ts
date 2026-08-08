import { useCallback, useEffect, useRef, useState } from "react";
import { useRouletteSound } from "../hooks/useRouletteSound";
import { NATURES, type Nature } from "./natures";
import { MAX_IV, PERFECT_IV, STAT_KEYS, type StatKey } from "./stats";

/** How long a single stat/nature "roll" visually ticks before settling. */
const ROLL_MS = 750;
/** Tick speed while a value is rapidly cycling before it settles. */
const TICK_MS = 55;
/** Stagger between stats when rolling everything at once, purely cosmetic. */
const ALL_STAGGER_MS = 90;

function randomIv() {
  return Math.floor(Math.random() * (MAX_IV + 1));
}

function randomNature() {
  return NATURES[Math.floor(Math.random() * NATURES.length)];
}

export interface UseIvBoardResult {
  values: Partial<Record<StatKey, number>>;
  rollingKeys: Set<StatKey>;
  nature: Nature | null;
  natureRolling: boolean;
  isAnyRolling: boolean;
  rollStat: (key: StatKey) => void;
  rollNature: () => void;
  rollAll: () => void;
  selectNature: (nature: Nature) => void;
  reset: () => void;
}

/** Drives the per-stat + nature "quick tick" roll animation for the IV board. */
export function useIvBoard(): UseIvBoardResult {
  const [values, setValues] = useState<Partial<Record<StatKey, number>>>({});
  const [rollingKeys, setRollingKeys] = useState<Set<StatKey>>(new Set());
  const [nature, setNature] = useState<Nature | null>(null);
  const [natureRolling, setNatureRolling] = useState(false);
  const { playTick, playWin } = useRouletteSound();

  const rollingRef = useRef<Set<StatKey>>(new Set());
  const natureRollingRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      timersRef.current.forEach((id) => window.clearInterval(id));
      timersRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const rollStat = useCallback(
    (key: StatKey, delayMs = 0) => {
      if (rollingRef.current.has(key)) return;
      rollingRef.current.add(key);
      setRollingKeys(new Set(rollingRef.current));

      const start = () => {
        if (!mountedRef.current) return;
        const tickId = window.setInterval(() => {
          setValues((prev) => ({ ...prev, [key]: randomIv() }));
          playTick();
        }, TICK_MS);
        timersRef.current.push(tickId);

        const settleId = window.setTimeout(() => {
          window.clearInterval(tickId);
          if (!mountedRef.current) return;
          const final = randomIv();
          setValues((prev) => ({ ...prev, [key]: final }));
          rollingRef.current.delete(key);
          setRollingKeys(new Set(rollingRef.current));
          if (final === PERFECT_IV || final === MAX_IV) playWin();
        }, ROLL_MS);
        timersRef.current.push(settleId);
      };

      if (delayMs > 0) {
        const delayId = window.setTimeout(start, delayMs);
        timersRef.current.push(delayId);
      } else {
        start();
      }
    },
    [playTick, playWin],
  );

  const rollNature = useCallback(
    (delayMs = 0) => {
      if (natureRollingRef.current) return;
      natureRollingRef.current = true;
      setNatureRolling(true);

      const start = () => {
        if (!mountedRef.current) return;
        const tickId = window.setInterval(() => {
          setNature(randomNature());
          playTick();
        }, TICK_MS);
        timersRef.current.push(tickId);

        const settleId = window.setTimeout(() => {
          window.clearInterval(tickId);
          if (!mountedRef.current) return;
          setNature(randomNature());
          natureRollingRef.current = false;
          setNatureRolling(false);
          playWin();
        }, ROLL_MS);
        timersRef.current.push(settleId);
      };

      if (delayMs > 0) {
        const delayId = window.setTimeout(start, delayMs);
        timersRef.current.push(delayId);
      } else {
        start();
      }
    },
    [playTick, playWin],
  );

  const rollAll = useCallback(() => {
    STAT_KEYS.forEach((key, i) => rollStat(key, i * ALL_STAGGER_MS));
    rollNature(STAT_KEYS.length * ALL_STAGGER_MS);
  }, [rollStat, rollNature]);

  const selectNature = useCallback((picked: Nature) => {
    if (natureRollingRef.current) return;
    setNature(picked);
  }, []);

  const reset = useCallback(() => {
    setValues({});
    setNature(null);
  }, []);

  const isAnyRolling = rollingKeys.size > 0 || natureRolling;

  return {
    values,
    rollingKeys,
    nature,
    natureRolling,
    isAnyRolling,
    rollStat: (key: StatKey) => rollStat(key, 0),
    rollNature: () => rollNature(0),
    rollAll,
    selectNature,
    reset,
  };
}
