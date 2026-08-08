import { Eye, Heart, Shield, ShieldCheck, Swords, Zap, type LucideIcon } from "lucide-react";

/** The six core stats every Pokémon has. HP is never affected by nature. */
export type StatKey = "hp" | "atk" | "def" | "spAtk" | "spDef" | "spd";

export const STAT_KEYS: StatKey[] = ["hp", "atk", "def", "spAtk", "spDef", "spd"];

export interface StatMeta {
  label: string;
  icon: LucideIcon;
  /** Gradient classes for the icon chip + progress bar fill. */
  gradient: string;
  ring: string;
  glow: string;
}

export const STAT_META: Record<StatKey, StatMeta> = {
  hp: {
    label: "HP",
    icon: Heart,
    gradient: "from-rose-400 to-rose-600",
    ring: "ring-rose-300/60",
    glow: "shadow-rose-500/30",
  },
  atk: {
    label: "공격",
    icon: Swords,
    gradient: "from-orange-400 to-orange-600",
    ring: "ring-orange-300/60",
    glow: "shadow-orange-500/30",
  },
  def: {
    label: "방어",
    icon: Shield,
    gradient: "from-amber-400 to-amber-500",
    ring: "ring-amber-300/60",
    glow: "shadow-amber-500/30",
  },
  spAtk: {
    label: "특수공격",
    icon: Eye,
    gradient: "from-sky-400 to-sky-600",
    ring: "ring-sky-300/60",
    glow: "shadow-sky-500/30",
  },
  spDef: {
    label: "특수방어",
    icon: ShieldCheck,
    gradient: "from-emerald-400 to-emerald-600",
    ring: "ring-emerald-300/60",
    glow: "shadow-emerald-500/30",
  },
  spd: {
    label: "스피드",
    icon: Zap,
    gradient: "from-fuchsia-400 to-pink-500",
    ring: "ring-fuchsia-300/60",
    glow: "shadow-fuchsia-500/30",
  },
};

export const MAX_IV = 31;
export const MAX_TOTAL_IV = MAX_IV * STAT_KEYS.length;

/**
 * In this roulette, lower is better — 0 is the perfect individual value.
 * (Yes, that's inverted from the real games' "31 is best" convention —
 * that's the joke.)
 */
export const PERFECT_IV = 0;
