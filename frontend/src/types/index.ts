// Central domain types shared across features.
// Feature-specific types that are not reused elsewhere should live inside
// that feature's own folder instead of here.

export type PokemonType =
  | "normal" | "fire" | "water" | "electric" | "grass" | "ice"
  | "fighting" | "poison" | "ground" | "flying" | "psychic" | "bug"
  | "rock" | "ghost" | "dragon" | "dark" | "steel" | "fairy";

/** Whether a challenge series has wrapped up or is still being worked on. */
export type ChallengeStatus = "ongoing" | "completed";

/**
 * A single uploaded episode. Type challenges are always a single Pokémon
 * type and are almost always a numbered series (e.g. "전기타입 하트골드
 * #1", "#2", "#3"...) rather than one-off videos, so every episode carries
 * a `seriesTitle` shared with its siblings plus its own `episodeNumber`.
 *
 * `result` is this specific episode's outcome: either the type was cleared
 * in this video ("clear"), or the run continues into a future episode
 * ("in-progress"). Whether the *series as a whole* is still ongoing lives
 * separately on `seriesStatus`.
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
  publishedAt: string; // ISO date
  views: number;
  tags: string[];
}

/** A group of episodes that share the same Pokémon type + series title. */
export interface ChallengeSeries {
  key: string;
  type: PokemonType;
  seriesTitle: string;
  status: ChallengeStatus;
  episodes: TypeChallengeVideo[];
  episodeCount: number;
  totalViews: number;
  latestPublishedAt: string;
  /** "clear" once the series is completed and its final episode cleared, otherwise null. */
  finalResult: "clear" | null;
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
  /** YouTube video upload date — merged server-side from the Data API. */
  publishedAt: string;
  createdAt: string;
}

export type DripSort = "likes" | "recent";
export type DripYearFilter = number | "all";
