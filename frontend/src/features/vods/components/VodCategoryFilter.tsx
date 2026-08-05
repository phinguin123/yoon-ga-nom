import type { VodCategory } from "@/types";
import { cn } from "@/lib/utils";

interface VodCategoryFilterProps {
  categories: VodCategory[];
  selectedCategoryId: number | null;
  onSelect: (categoryId: number | null) => void;
}

export function VodCategoryFilter({ categories, selectedCategoryId, onSelect }: VodCategoryFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          "rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all",
          selectedCategoryId === null
            ? "border-brand-600 bg-brand-600 text-white shadow-md"
            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
        )}
      >
        전체
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onSelect(category.id)}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all",
            selectedCategoryId === category.id
              ? "border-brand-600 bg-brand-600 text-white shadow-md"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
