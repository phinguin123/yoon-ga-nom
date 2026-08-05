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

/** A named, colored grouping for schedule events (e.g. "방송", "콜라보"), fully admin-managed — no fixed set of types. */
export interface ScheduleCategory {
  id: number;
  name: string;
  /** Hex color, e.g. "#327dff" — drives the calendar dot/pill/badge color everywhere. */
  color: string;
  sortOrder: number;
  createdAt: string;
}

/**
 * A calendar event. `start`/`end` are ISO datetimes (always carrying the
 * `+09:00` KST offset — this site has no multi-timezone audience). `end` is
 * null for point-in-time events. `allDay` events still populate `start`
 * (at 00:00 KST) so date math stays uniform.
 */
export interface ScheduleEvent {
  id: number;
  categoryId: number | null;
  title: string;
  description: string;
  start: string; // ISO datetime
  end: string | null; // ISO datetime
  allDay: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
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

/** A named grouping for "다시보기" (VOD) entries, e.g. "타입 챌린지", "저챔". */
export interface VodCategory {
  id: number;
  name: string;
  sortOrder: number;
  createdAt: string;
}

/**
 * A single CHZZK "다시보기" (VOD) entry. Title/thumbnail/duration/views/
 * publishedAt are fetched server-side from CHZZK's undocumented web API and
 * stored — never entered by hand (see backend `services/chzzk.service.ts`).
 */
export interface Vod {
  id: number;
  chzzkVideoNo: number;
  categoryId: number | null;
  title: string;
  thumbnailUrl: string;
  durationSeconds: number;
  views: number;
  publishedAt: string; // ISO datetime
  createdAt: string;
}

/** The fan account returned after a successful Kakao login. See backend `services/userAuth.service.ts`. */
export interface AuthUser {
  id: number;
  nickname: string;
  profileImage: string | null;
  role: "user" | "admin";
}
