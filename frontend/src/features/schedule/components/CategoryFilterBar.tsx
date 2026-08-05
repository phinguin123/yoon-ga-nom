import type { ScheduleCategory } from "@/types";
import { categoryColor } from "../colors";
import { cn } from "@/lib/utils";

interface CategoryFilterBarProps {
  categories: ScheduleCategory[];
  activeId: number | "all";
  onChange: (id: number | "all") => void;
}

export function CategoryFilterBar({ categories, activeId, onChange }: CategoryFilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange("all")}
        className={cn(
          "rounded-full border px-4 py-2 text-sm font-semibold transition-all",
          activeId === "all"
            ? "border-brand-500 bg-brand-600 text-white shadow-md shadow-brand-600/20"
            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
        )}
      >
        전체
      </button>
      {categories.map((category) => {
        const isActive = activeId === category.id;
        const color = categoryColor(category.color);
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onChange(category.id)}
            style={
              isActive
                ? { backgroundColor: color, borderColor: color }
                : { borderColor: "transparent" }
            }
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition-all",
              isActive
                ? "text-white shadow-md"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300",
            )}
          >
            <span
              className="mr-1.5 inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: isActive ? "rgba(255,255,255,0.85)" : color }}
            />
            {category.name}
          </button>
        );
      })}
      {categories.length === 0 && <span className="py-2 text-sm text-slate-400">아직 카테고리가 없어요.</span>}
    </div>
  );
}
