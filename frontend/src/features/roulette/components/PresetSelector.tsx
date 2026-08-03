import type { RoulettePreset } from "@/types";
import { cn } from "@/lib/utils";

interface PresetSelectorProps {
  presets: RoulettePreset[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function PresetSelector({ presets, selectedId, onSelect }: PresetSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {presets.map((preset) => (
        <button
          key={preset.id}
          type="button"
          onClick={() => onSelect(preset.id)}
          className={cn(
            "rounded-xl border px-4 py-2.5 text-left text-sm font-semibold transition-all",
            selectedId === preset.id
              ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
          )}
        >
          {preset.name}
        </button>
      ))}
    </div>
  );
}
