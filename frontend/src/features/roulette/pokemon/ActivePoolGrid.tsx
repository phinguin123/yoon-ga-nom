import { X } from "lucide-react";
import type { PokedexEntry } from "./types";

interface ActivePoolGridProps {
  pool: PokedexEntry[];
  onRemove: (id: number) => void;
}

/**
 * Static (non-animating) preview grid of the current active pool. Lazy-
 * loaded images keep this cheap to render even with a large pool, since
 * only the thumbnails scrolled into view actually load.
 */
export function ActivePoolGrid({ pool, onRemove }: ActivePoolGridProps) {
  if (pool.length === 0) {
    return (
      <div className="flex h-28 items-center justify-center rounded-2xl border border-dashed border-slate-200 px-4 text-center text-sm text-slate-400">
        조건에 맞는 포켓몬이 없어요. 필터를 조정하거나 검색으로 추가해보세요.
      </div>
    );
  }

  return (
    <div className="grid max-h-64 grid-cols-4 gap-2 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50/70 p-3 sm:grid-cols-6 md:grid-cols-8">
      {pool.map((entry) => (
        <div
          key={entry.id}
          className="group relative flex flex-col items-center rounded-xl bg-white p-1.5 shadow-sm transition-shadow hover:shadow-md"
        >
          <button
            type="button"
            onClick={() => onRemove(entry.id)}
            aria-label={`${entry.nameKo} 제외`}
            className="absolute -right-1.5 -top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white opacity-0 shadow transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          >
            <X className="h-3 w-3" />
          </button>
          <img src={entry.imageUrl} alt={entry.nameKo} loading="lazy" className="h-10 w-10 object-contain" />
          <span className="mt-0.5 w-full truncate text-center text-[10px] font-semibold text-slate-600">
            {entry.nameKo}
          </span>
        </div>
      ))}
    </div>
  );
}
