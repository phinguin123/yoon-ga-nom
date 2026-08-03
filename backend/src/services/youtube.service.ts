import { env } from "../config/env.js";

export interface YoutubeVideoStats {
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
  views: number;
  durationSeconds: number;
}

interface YoutubeApiThumbnail {
  url: string;
}

interface YoutubeApiVideoItem {
  id: string;
  snippet: {
    title: string;
    publishedAt: string;
    thumbnails: Record<string, YoutubeApiThumbnail | undefined>;
  };
  statistics: { viewCount?: string };
  contentDetails: { duration: string };
}

interface YoutubeApiResponse {
  items: YoutubeApiVideoItem[];
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour — well within the API's free daily quota
const YOUTUBE_MAX_IDS_PER_REQUEST = 50;

const cache = new Map<string, { stats: YoutubeVideoStats; expiresAt: number }>();
let hasWarnedMissingKey = false;

/** Parses an ISO-8601 duration ("PT1H23M45S") into whole seconds. */
function parseIsoDuration(iso: string): number {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
  if (!match) return 0;
  const [, hours, minutes, seconds] = match;
  return Number(hours ?? 0) * 3600 + Number(minutes ?? 0) * 60 + Number(seconds ?? 0);
}

function pickThumbnail(thumbnails: YoutubeApiVideoItem["snippet"]["thumbnails"]): string {
  return (
    thumbnails.maxres?.url ??
    thumbnails.standard?.url ??
    thumbnails.high?.url ??
    thumbnails.medium?.url ??
    thumbnails.default?.url ??
    ""
  );
}

/**
 * Fetches live view counts, durations, publish dates, thumbnails, and
 * titles for a batch of YouTube video IDs via the official Data API v3,
 * with an in-memory TTL cache to stay well under the daily quota.
 *
 * Falls back to an empty map — callers should keep their own placeholder
 * data as a fallback — when `YOUTUBE_API_KEY` isn't configured or the
 * request fails, so the app keeps working out of the box without a key.
 */
export async function fetchYoutubeStats(
  videoIds: string[],
): Promise<Map<string, YoutubeVideoStats>> {
  const result = new Map<string, YoutubeVideoStats>();
  const uniqueIds = [...new Set(videoIds)];
  const now = Date.now();
  const idsToFetch: string[] = [];

  for (const id of uniqueIds) {
    const cached = cache.get(id);
    if (cached && cached.expiresAt > now) {
      result.set(id, cached.stats);
    } else {
      idsToFetch.push(id);
    }
  }

  if (idsToFetch.length === 0) return result;

  if (!env.youtubeApiKey) {
    if (!hasWarnedMissingKey) {
      console.warn(
        "[youtube] YOUTUBE_API_KEY is not set — serving placeholder video stats. " +
          "Set it in backend/.env to pull live view counts, durations, and thumbnails.",
      );
      hasWarnedMissingKey = true;
    }
    return result;
  }

  try {
    for (let i = 0; i < idsToFetch.length; i += YOUTUBE_MAX_IDS_PER_REQUEST) {
      const batch = idsToFetch.slice(i, i + YOUTUBE_MAX_IDS_PER_REQUEST);
      const url = new URL("https://www.googleapis.com/youtube/v3/videos");
      url.searchParams.set("part", "snippet,statistics,contentDetails");
      url.searchParams.set("id", batch.join(","));
      url.searchParams.set("key", env.youtubeApiKey);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`YouTube API responded with ${response.status} ${response.statusText}`);
      }

      const json = (await response.json()) as YoutubeApiResponse;
      for (const item of json.items) {
        const stats: YoutubeVideoStats = {
          title: item.snippet.title,
          thumbnailUrl: pickThumbnail(item.snippet.thumbnails),
          publishedAt: item.snippet.publishedAt,
          views: Number(item.statistics.viewCount ?? 0),
          durationSeconds: parseIsoDuration(item.contentDetails.duration),
        };
        cache.set(item.id, { stats, expiresAt: now + CACHE_TTL_MS });
        result.set(item.id, stats);
      }
    }
  } catch (error) {
    console.error("[youtube] Failed to fetch live video stats, using placeholders instead:", error);
  }

  return result;
}
