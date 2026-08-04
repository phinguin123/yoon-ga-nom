import { useMemo, useState } from "react";
import { Check, Plus, Search } from "lucide-react";
import type { PokedexEntry } from "./types";
import { cn } from "@/lib/utils";

interface PokemonSearchAddProps {
  fullList: PokedexEntry[];
  activeIds: Set<number>;
  onToggle: (entry: PokedexEntry) => void;
}

/**
 * Korean-input search bar for manually adding/removing specific Pokémon
 * from the active roulette pool, independent of the generation/type
 * filters. Plain <input> — Korean IME composition just works natively.
 */
export function PokemonSearchAdd({ fullList, activeIds, onToggle }: PokemonSearchAddProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const matches = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return [];
    return fullList.filter((p) => p.nameKo.includes(trimmed)).slice(0, 8);
  }, [fullList, query]);

  const showDropdown = isFocused && matches.length > 0;

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 120)}
          placeholder="포켓몬 이름으로 직접 추가/제외하기 (예: 피카츄)"
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400"
        />
      </div>

      {showDropdown && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          {matches.map((entry) => {
            const isActive = activeIds.has(entry.id);
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => onToggle(entry)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-brand-50"
              >
                <img
                  src={entry.imageUrl}
                  alt=""
                  loading="lazy"
                  className="h-9 w-9 shrink-0 object-contain"
                />
                <span className="flex-1 truncate text-sm font-semibold text-slate-700">
                  {entry.nameKo}
                </span>
                <span className="text-xs text-slate-400">#{String(entry.id).padStart(4, "0")}</span>
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                    isActive ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-400",
                  )}
                >
                  {isActive ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
