// Domain types shared across backend modules.
// Mirrors the frontend's `src/types/index.ts` so payloads stay in sync;
// once a real database is introduced, these can be generated from the schema.

export type PokemonType =
  | "normal" | "fire" | "water" | "electric" | "grass" | "ice"
  | "fighting" | "poison" | "ground" | "flying" | "psychic" | "bug"
  | "rock" | "ghost" | "dragon" | "dark" | "steel" | "fairy";

export type ChallengeStatus = "ongoing" | "completed";

/**
 * `result` is this specific episode's outcome: either the type was cleared
 * in this video ("clear"), or the run continues into a future episode
 * ("in-progress"). `seriesStatus` tracks whether the overall numbered
 * challenge has wrapped up yet, independent of any single episode.
 */
export interface TypeChallengeVideo {
  id: string;
  seriesTitle: string;
  seriesStatus: ChallengeStatus;
  episodeNumber: number;
  title: string;
  youtubeId: string;
  thumbnailUrl: string;
  type: PokemonType;
  result: "clear" | "in-progress";
  durationSeconds: number;
  publishedAt: string;
  views: number;
  tags: string[];
}

export interface ChallengeSeries {
  key: string;
  type: PokemonType;
  seriesTitle: string;
  status: ChallengeStatus;
  episodes: TypeChallengeVideo[];
  episodeCount: number;
  totalViews: number;
  latestPublishedAt: string;
  finalResult: "clear" | null;
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

export interface Drip {
  id: number;
  title: string;
  youtubeVideoId: string;
  /** Clip start point within the video, e.g. "23m45s". */
  timestamp: string;
  /** Derived from the YouTube Data API when available, otherwise the static thumbnail CDN — never entered by hand. */
  thumbnailUrl: string;
  /** Derived from the YouTube Data API — 0 if not (yet) fetched. */
  durationSeconds: number;
  likes: number;
  comments: number;
  tags: string[];
  /** YouTube video upload date, merged from the Data API on read. */
  publishedAt: string;
  /** When this drip was added in admin — not shown on the public DOTY page. */
  createdAt: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: { message: string; details?: unknown };
}
