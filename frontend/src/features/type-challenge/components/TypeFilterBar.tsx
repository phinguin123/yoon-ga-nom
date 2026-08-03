import { Search } from "lucide-react";
import type { PokemonType } from "@/types";
import { ALL_POKEMON_TYPES, POKEMON_TYPE_META } from "../pokemonTypeMeta";
import { cn } from "@/lib/utils";

interface TypeFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedTypes: PokemonType[];
  onToggleType: (type: PokemonType) => void;
  onClear: () => void;
}

export function TypeFilterBar({
  search,
  onSearchChange,
  selectedTypes,
  onToggleType,
  onClear,
}: TypeFilterBarProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          type="text"
          placeholder="영상 제목, 태그로 검색..."
          className="w-full rounded-full border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm shadow-sm outline-none transition-shadow focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {ALL_POKEMON_TYPES.map((type) => {
          const meta = POKEMON_TYPE_META[type];
          const isSelected = selectedTypes.includes(type);
          return (
            <button
              key={type}
              type="button"
              onClick={() => onToggleType(type)}
              style={
                isSelected
                  ? { backgroundColor: meta.color, borderColor: meta.color }
                  : undefined
              }
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all",
                isSelected
                  ? "text-white shadow-md"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
              )}
            >
              {meta.label}
            </button>
          );
        })}
        {selectedTypes.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-full px-3.5 py-1.5 text-xs font-bold text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline"
          >
            초기화
          </button>
        )}
      </div>
    </div>
  );
}
