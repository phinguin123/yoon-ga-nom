// Central domain types shared across features.
// Feature-specific types that are not reused elsewhere should live inside
// that feature's own folder instead of here.

export type PokemonType =
  | "normal" | "fire" | "water" | "electric" | "grass" | "ice"
  | "fighting" | "poison" | "ground" | "flying" | "psychic" | "bug"
  | "rock" | "ghost" | "dragon" | "dark" | "steel" | "fairy";

export interface TypeChallengeVideo {
  id: string;
  title: string;
  youtubeId: string;
  thumbnailUrl: string;
  types: PokemonType[];
  result: "clear" | "fail" | "in-progress";
  durationSeconds: number;
  publishedAt: string; // ISO date
  views: number;
  tags: string[];
}

export interface RoulettePreset {
  id: string;
  name: string;
  description?: string;
  options: RouletteOption[];
}

export interface RouletteOption {
  id: string;
  label: string;
  color?: string;
  weight?: number;
}

export type ScheduleEventType = "stream" | "collab" | "event" | "notice";

export interface ScheduleEvent {
  id: string;
  title: string;
  type: ScheduleEventType;
  start: string; // ISO datetime
  end?: string;
  description?: string;
  isPinned?: boolean;
}

export interface StreamLogEntry {
  id: string;
  timestampSeconds: number;
  label: string;
  quote?: string;
  screenshotUrl?: string;
  tags?: string[];
}

export interface StreamLog {
  id: string;
  streamTitle: string;
  streamDate: string; // ISO date
  vodUrl?: string;
  coverImageUrl?: string;
  entries: StreamLogEntry[];
}

export type DyangEventType = "collab-stream" | "sns-interaction" | "milestone" | "cute-moment";

export interface DyangEvent {
  id: string;
  type: DyangEventType;
  title: string;
  date: string; // ISO date
  description: string;
  imageUrl?: string;
  sourceUrl?: string;
}
