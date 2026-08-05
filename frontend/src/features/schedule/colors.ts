/** Category colors are stored as arbitrary hex strings (admin-picked), so they're applied via inline styles rather than Tailwind classes. */
const FALLBACK_COLOR = "#94a3b8"; // slate-400, used for events whose category was deleted

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const value = match[1];
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

export function categoryColor(color: string | undefined | null): string {
  return color && hexToRgb(color) ? color : FALLBACK_COLOR;
}

/** Soft tinted background for pills/badges, e.g. `rgba(50, 125, 255, 0.14)`. */
export function categoryTint(color: string | undefined | null, alpha = 0.14): string {
  const rgb = hexToRgb(categoryColor(color));
  if (!rgb) return `rgba(148, 163, 184, ${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export const PRESET_CATEGORY_COLORS = [
  "#327dff", // brand blue
  "#fb4d8b", // dyang pink
  "#ff9d1f", // ember orange
  "#22c55e", // green
  "#a855f7", // purple
  "#14b8a6", // teal
  "#ef4444", // red
  "#64748b", // slate
];
