import type { PokemonType } from "@/types";
import { ALL_POKEMON_TYPES, POKEMON_TYPE_META } from "@/features/type-challenge/pokemonTypeMeta";
import { cn } from "@/lib/utils";

const GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

interface PokemonFilterBarProps {
  selectedGenerations: Set<number>;
  onToggleGeneration: (gen: number) => void;
  selectedTypes: Set<PokemonType>;
  onToggleType: (type: PokemonType) => void;
  onReset: () => void;
  filteredCount: number;
}

export function PokemonFilterBar({
  selectedGenerations,
  onToggleGeneration,
  selectedTypes,
  onToggleType,
  onReset,
  filteredCount,
}: PokemonFilterBarProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400">세대</h3>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700"
        >
          필터 초기화
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {GENERATIONS.map((gen) => {
          const active = selectedGenerations.has(gen);
          return (
            <button
              key={gen}
              type="button"
              onClick={() => onToggleGeneration(gen)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-bold transition-all",
                active
                  ? "border-brand-500 bg-brand-500 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300",
              )}
            >
              {gen}세대
            </button>
          );
        })}
      </div>

      <h3 className="pt-1 text-sm font-bold uppercase tracking-wide text-slate-400">타입</h3>
      <div className="flex flex-wrap gap-1.5">
        {ALL_POKEMON_TYPES.map((type) => {
          const meta = POKEMON_TYPE_META[type];
          const active = selectedTypes.has(type);
          return (
            <button
              key={type}
              type="button"
              onClick={() => onToggleType(type)}
              style={active ? { backgroundColor: meta.color, borderColor: meta.color } : undefined}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-bold transition-all",
                active ? "text-white shadow-sm" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300",
              )}
            >
              {meta.label}
            </button>
          );
        })}
      </div>

      <p className="pt-1 text-sm text-slate-500">
        조건에 맞는 포켓몬 <span className="font-bold text-brand-600">{filteredCount}</span>마리
      </p>
    </div>
  );
}
