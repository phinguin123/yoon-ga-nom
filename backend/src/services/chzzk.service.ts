/**
 * CHZZK (치지직) has no official public API. Everything below talks to the
 * same undocumented JSON endpoints the chzzk.naver.com web app itself calls
 * (confirmed by inspecting its network tab) — no API key or login is needed
 * to read public VOD metadata, but a browser-like `User-Agent` is required
 * or requests get silently dropped.
 *
 * Endpoints used:
 *   - GET /service/v2/videos/{videoNo}
 *       -> single VOD's title/thumbnail/duration/views/publish date.
 *   - GET /service/v1/channels/{channelId}/videos?sortType=LATEST&pagingType=PAGE&page&size
 *       -> a channel's VOD list, newest first (powers the admin "치지직에서
 *          찾기" browser so admins don't have to hand-copy video IDs).
 *
 * These are unofficial and could change or start requiring auth at any
 * time — every call here is defensive (never throws into a broken UI state
 * beyond a clear error) and results are cached briefly to avoid hammering
 * CHZZK's servers.
 */

const CHZZK_API_BASE = "https://api.chzzk.naver.com/service";
const CACHE_TTL_MS = 30 * 60 * 1000; // VOD metadata (views especially) changes slowly enough for this.

// A real browser UA is required — CHZZK silently hangs/drops requests from
// default HTTP client user agents (e.g. Node's or curl's).
const REQUEST_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "application/json",
};

export interface ChzzkVideoStats {
  title: string;
  thumbnailUrl: string;
  durationSeconds: number;
  /** ISO datetime, derived from CHZZK's epoch-ms `publishDateAt`. */
  publishedAt: string;
  views: number;
}

export interface ChzzkChannelVideoItem extends ChzzkVideoStats {
  videoNo: number;
}

export interface ChzzkChannelVideosPage {
  items: ChzzkChannelVideoItem[];
  page: number;
  totalPages: number;
  totalCount: number;
}

interface ChzzkApiVideoItem {
  videoNo: number;
  videoTitle: string;
  thumbnailImageUrl: string | null;
  duration: number | null;
  readCount: number | null;
  publishDateAt: number;
}

interface ChzzkApiEnvelope<T> {
  code: number;
  message: string | null;
  content: T;
}

const videoCache = new Map<number, { stats: ChzzkVideoStats; expiresAt: number }>();

function toStats(item: ChzzkApiVideoItem): ChzzkVideoStats {
  return {
    title: item.videoTitle,
    thumbnailUrl: item.thumbnailImageUrl ?? "",
    durationSeconds: item.duration ?? 0,
    publishedAt: new Date(item.publishDateAt).toISOString(),
    views: item.readCount ?? 0,
  };
}

async function chzzkFetch<T>(path: string, params?: Record<string, string>): Promise<ChzzkApiEnvelope<T>> {
  const url = new URL(`${CHZZK_API_BASE}${path}`);
  for (const [key, value] of Object.entries(params ?? {})) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, { headers: REQUEST_HEADERS });
  if (!response.ok) {
    throw new Error(`CHZZK API responded with ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as ChzzkApiEnvelope<T>;
}

/**
 * Fetches a single VOD's metadata by its `videoNo` (the number in
 * `chzzk.naver.com/video/{videoNo}`), with a short TTL cache. Returns
 * `undefined` (never throws) if the video doesn't exist, is private, or the
 * request fails for any reason — callers decide how to handle that.
 */
export async function fetchChzzkVideo(videoNo: number): Promise<ChzzkVideoStats | undefined> {
  const cached = videoCache.get(videoNo);
  if (cached && cached.expiresAt > Date.now()) return cached.stats;

  try {
    const json = await chzzkFetch<ChzzkApiVideoItem | null>(`/v2/videos/${videoNo}`);
    if (json.code !== 200 || !json.content) return undefined;

    const stats = toStats(json.content);
    videoCache.set(videoNo, { stats, expiresAt: Date.now() + CACHE_TTL_MS });
    return stats;
  } catch (error) {
    console.error(`[chzzk] Failed to fetch video ${videoNo}:`, error);
    return undefined;
  }
}

/**
 * Lists a channel's public VODs, newest first — powers the admin "치지직
 * 채널에서 찾기" browser. Throws on failure (unlike `fetchChzzkVideo`) since
 * callers need to distinguish "no results" from "CHZZK is unreachable".
 */
export async function fetchChzzkChannelVideos(
  channelId: string,
  { page = 0, size = 20 }: { page?: number; size?: number } = {},
): Promise<ChzzkChannelVideosPage> {
  const json = await chzzkFetch<{
    page: number;
    totalPages: number;
    totalCount: number;
    data: ChzzkApiVideoItem[];
  } | null>(`/v1/channels/${channelId}/videos`, {
    sortType: "LATEST",
    pagingType: "PAGE",
    page: String(page),
    size: String(size),
  });

  if (json.code !== 200 || !json.content) {
    throw new Error(json.message ?? "CHZZK API returned an unexpected response");
  }

  return {
    items: json.content.data.map((item) => ({ videoNo: item.videoNo, ...toStats(item) })),
    page: json.content.page,
    totalPages: json.content.totalPages,
    totalCount: json.content.totalCount,
  };
}
