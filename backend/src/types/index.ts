// Domain types shared across backend modules.
// Mirrors the frontend's `src/types/index.ts` so payloads stay in sync;
// once a real database is introduced, these can be generated from the schema.

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
  publishedAt: string;
  views: number;
  tags: string[];
}

export interface RoulettePreset {
  id: string;
  name: string;
  description?: string;
  options: { id: string; label: string; color?: string; weight?: number }[];
}

export type ScheduleEventType = "stream" | "collab" | "event" | "notice";

export interface ScheduleEvent {
  id: string;
  title: string;
  type: ScheduleEventType;
  start: string;
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
  streamDate: string;
  vodUrl?: string;
  coverImageUrl?: string;
  entries: StreamLogEntry[];
}

export type DyangEventType = "collab-stream" | "sns-interaction" | "milestone" | "cute-moment";

export interface DyangEvent {
  id: string;
  type: DyangEventType;
  title: string;
  date: string;
  description: string;
  imageUrl?: string;
  sourceUrl?: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: { message: string; details?: unknown };
}
