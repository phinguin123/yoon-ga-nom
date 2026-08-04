import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { RotateCw } from "lucide-react";
import type { PokemonType } from "@/types";
import { ALL_POKEMON_TYPES, POKEMON_TYPE_META } from "@/features/type-challenge/pokemonTypeMeta";
import { LoadingState, ErrorState } from "@/components/ui/QueryState";
import { cn } from "@/lib/utils";
import { usePokedex } from "./usePokedex";
import type { PokedexEntry } from "./types";
import { PokemonFilterBar } from "./PokemonFilterBar";
import { PokemonSearchAdd } from "./PokemonSearchAdd";
import { ActivePoolGrid } from "./ActivePoolGrid";
import { RouletteSpinner } from "../components/RouletteSpinner";
import { useReelRoulette } from "../hooks/useReelRoulette";

const ALL_GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export function PokemonRoulette() {
  const { data: fullList, isLoading, isError, refetch } = usePokedex();

  const [selectedGenerations, setSelectedGenerations] = useState<Set<number>>(
    () => new Set(ALL_GENERATIONS),
  );
  const [selectedTypes, setSelectedTypes] = useState<Set<PokemonType>>(
    () => new Set(ALL_POKEMON_TYPES),
  );
  const [excludedIds, setExcludedIds] = useState<Set<number>>(() => new Set());
  const [addedIds, setAddedIds] = useState<Set<number>>(() => new Set());

  const list = useMemo(() => fullList ?? [], [fullList]);

  const filteredPool = useMemo(
    () =>
      list.filter(
        (p) => selectedGenerations.has(p.generation) && p.types.some((t) => selectedTypes.has(t)),
      ),
    [list, selectedGenerations, selectedTypes],
  );

  const activePool = useMemo(() => {
    const filteredIds = new Set(filteredPool.map((p) => p.id));
    const kept = filteredPool.filter((p) => !excludedIds.has(p.id));
    const manuallyAdded = list.filter((p) => addedIds.has(p.id) && !filteredIds.has(p.id));
    return [...kept, ...manuallyAdded];
  }, [filteredPool, excludedIds, addedIds, list]);

  const activeIds = useMemo(() => new Set(activePool.map((p) => p.id)), [activePool]);

  const resetFilters = () => {
    setSelectedGenerations(new Set(ALL_GENERATIONS));
    setSelectedTypes(new Set(ALL_POKEMON_TYPES));
    setExcludedIds(new Set());
    setAddedIds(new Set());
  };

  const toggleGeneration = (gen: number) => {
    setSelectedGenerations((prev) => {
      const next = new Set(prev);
      if (next.has(gen)) next.delete(gen);
      else next.add(gen);
      return next;
    });
    setExcludedIds(new Set());
    setAddedIds(new Set());
  };

  const toggleType = (type: PokemonType) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
    setExcludedIds(new Set());
    setAddedIds(new Set());
  };

  const toggleMembership = (entry: PokedexEntry) => {
    const inFilteredPool = filteredPool.some((p) => p.id === entry.id);
    const isActive = activeIds.has(entry.id);

    if (isActive) {
      if (inFilteredPool) {
        setExcludedIds((prev) => new Set(prev).add(entry.id));
      } else {
        setAddedIds((prev) => {
          const next = new Set(prev);
          next.delete(entry.id);
          return next;
        });
      }
    } else if (inFilteredPool) {
      setExcludedIds((prev) => {
        const next = new Set(prev);
        next.delete(entry.id);
        return next;
      });
    } else {
      setAddedIds((prev) => new Set(prev).add(entry.id));
    }
  };

  const handleRemove = (id: number) => {
    const entry = list.find((p) => p.id === id);
    if (entry) toggleMembership(entry);
  };

  const { reel, isSpinning, winner, spinToken, spin, handleSettle } = useReelRoulette(activePool);

  useEffect(() => {
    if (!winner) return;
    confetti({
      particleCount: 130,
      spread: 85,
      origin: { y: 0.5 },
      colors: ["#327dff", "#59a3ff", "#ff9d1f", "#ffb84d"],
    });
  }, [winner]);

  if (isLoading) return <LoadingState label="포켓도감을 불러오는 중..." />;
  if (isError) {
    return <ErrorState message="포켓몬 데이터를 불러오지 못했어요." onRetry={() => refetch()} />;
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_1fr]">
      <aside className="space-y-5">
        <PokemonFilterBar
          selectedGenerations={selectedGenerations}
          onToggleGeneration={toggleGeneration}
          selectedTypes={selectedTypes}
          onToggleType={toggleType}
          onReset={resetFilters}
          filteredCount={filteredPool.length}
        />
        <PokemonSearchAdd fullList={list} activeIds={activeIds} onToggle={toggleMembership} />
      </aside>

      <div className="min-w-0 space-y-6">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400">
              활성 룰렛 풀
            </h3>
            <span className="text-sm font-bold text-brand-600">{activePool.length}마리</span>
          </div>
          <ActivePoolGrid pool={activePool} onRemove={handleRemove} />
        </div>

        <RouletteSpinner
          reel={reel}
          isSpinning={isSpinning}
          spinToken={spinToken}
          onSettle={handleSettle}
          itemWidth={140}
          height={190}
          idleContent="스핀 버튼을 눌러 포켓몬을 뽑아보세요!"
          renderItem={(entry: PokedexEntry, isWinner) => (
            <div
              className={cn(
                "flex flex-col items-center gap-1.5 transition-transform",
                isWinner && !isSpinning && "scale-105",
              )}
            >
              <img
                src={entry.imageUrl}
                alt={entry.nameKo}
                loading="lazy"
                className="h-24 w-24 object-contain drop-shadow-md"
              />
              <span className="max-w-[130px] truncate text-sm font-bold text-slate-700">
                {entry.nameKo}
              </span>
            </div>
          )}
          getKey={(entry, i) => `${entry.id}-${i}`}
        />

        <div className="flex flex-col items-center gap-6">
          <button
            type="button"
            onClick={spin}
            disabled={isSpinning || activePool.length === 0}
            className="btn-primary px-8 py-3 text-base"
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
                className="glass-panel flex flex-col items-center gap-2 rounded-2xl px-8 py-5"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-brand-500">결과</span>
                <img src={winner.imageUrl} alt={winner.nameKo} className="h-20 w-20 object-contain" />
                <span className="font-display text-2xl font-extrabold text-slate-900">
                  {winner.nameKo}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  전국도감 #{String(winner.id).padStart(4, "0")}
                </span>
                <div className="mt-1 flex gap-1.5">
                  {winner.types.map((type) => (
                    <span
                      key={type}
                      className="badge text-white"
                      style={{ backgroundColor: POKEMON_TYPE_META[type].color }}
                    >
                      {POKEMON_TYPE_META[type].label}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
