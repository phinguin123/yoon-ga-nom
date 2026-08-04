import { db } from "../db/client.js";
import { normalizeYoutubeVideoId, youtubeThumbnailFallback } from "../lib/youtubeVideoId.js";
import { fetchYoutubeStats, type YoutubeVideoStats } from "../services/youtube.service.js";
import type { Drip } from "../types/index.js";

interface DripRow {
  id: number;
  title: string;
  youtube_video_id: string;
  timestamp: string;
  thumbnail_url: string | null;
  duration_seconds: number;
  likes: number;
  comments: number;
  tags: string;
  published_at: string | null;
  created_at: string;
}

function rowToDrip(row: DripRow): Drip {
  return {
    id: row.id,
    title: row.title,
    youtubeVideoId: row.youtube_video_id,
    timestamp: row.timestamp,
    thumbnailUrl: row.thumbnail_url ?? youtubeThumbnailFallback(row.youtube_video_id),
    durationSeconds: row.duration_seconds,
    likes: row.likes,
    comments: row.comments,
    tags: JSON.parse(row.tags) as string[],
    publishedAt: row.published_at ?? row.created_at,
    createdAt: row.created_at,
  };
}

export type DripSort = "likes" | "recent";

export type DripInput = Pick<Drip, "title" | "youtubeVideoId" | "timestamp" | "tags"> & {
  likes?: number;
  comments?: number;
};

function orderClause(sort: DripSort): string {
  return sort === "likes"
    ? "ORDER BY likes DESC, created_at DESC"
    : "ORDER BY created_at DESC";
}

function publishedYear(publishedAt: string): number {
  return new Date(publishedAt).getFullYear();
}

async function fetchYoutubeMeta(videoId: string): Promise<YoutubeVideoStats | undefined> {
  if (!videoId) return undefined;
  const stats = await fetchYoutubeStats([videoId]);
  return stats.get(videoId);
}

function persistYoutubeMeta(id: number, meta: YoutubeVideoStats) {
  db.prepare("UPDATE drips SET thumbnail_url = ?, duration_seconds = ?, published_at = ? WHERE id = ?").run(
    meta.thumbnailUrl || null,
    meta.durationSeconds,
    meta.publishedAt,
    id,
  );
}

export function listDripsFromDb(sort: DripSort = "recent"): Drip[] {
  const rows = db
    .prepare(`SELECT * FROM drips ${orderClause(sort)}`)
    .all() as unknown as DripRow[];
  return rows.map(rowToDrip);
}

/** Merges live YouTube thumbnail/duration/publish-date and persists them for future reads. */
export async function enrichDripsWithYoutube(drips: Drip[]): Promise<Drip[]> {
  const videoIds = drips.map((drip) => drip.youtubeVideoId).filter(Boolean);
  const liveStats = await fetchYoutubeStats(videoIds);

  return drips.map((drip) => {
    const live = liveStats.get(drip.youtubeVideoId);
    if (!live) return drip;

    persistYoutubeMeta(drip.id, live);
    return {
      ...drip,
      thumbnailUrl: live.thumbnailUrl || drip.thumbnailUrl,
      durationSeconds: live.durationSeconds || drip.durationSeconds,
      publishedAt: live.publishedAt || drip.publishedAt,
    };
  });
}

export async function listDrips(sort: DripSort = "recent", year?: number): Promise<Drip[]> {
  let drips = await enrichDripsWithYoutube(listDripsFromDb(sort));

  if (year !== undefined) {
    drips = drips.filter((drip) => publishedYear(drip.publishedAt) === year);
  }

  if (sort === "likes") {
    drips = [...drips].sort(
      (a, b) =>
        b.likes - a.likes ||
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
  } else {
    drips = [...drips].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
  }

  return drips;
}

export async function listDripYears(): Promise<number[]> {
  const drips = await enrichDripsWithYoutube(listDripsFromDb("recent"));
  const years = new Set(drips.map((drip) => publishedYear(drip.publishedAt)));
  return Array.from(years).sort((a, b) => b - a);
}

export function getDripById(id: number): Drip | undefined {
  const row = db.prepare("SELECT * FROM drips WHERE id = ?").get(id) as DripRow | undefined;
  return row ? rowToDrip(row) : undefined;
}

export async function getDripByIdEnriched(id: number): Promise<Drip | undefined> {
  const drip = getDripById(id);
  if (!drip) return undefined;
  const [enriched] = await enrichDripsWithYoutube([drip]);
  return enriched;
}

export async function createDrip(input: DripInput): Promise<Drip> {
  const youtubeVideoId = normalizeYoutubeVideoId(input.youtubeVideoId);
  const meta = await fetchYoutubeMeta(youtubeVideoId);

  const result = db
    .prepare(
      `INSERT INTO drips (title, youtube_video_id, timestamp, thumbnail_url, duration_seconds, likes, comments, tags, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.title,
      youtubeVideoId,
      input.timestamp,
      meta?.thumbnailUrl || null,
      meta?.durationSeconds ?? 0,
      input.likes ?? 0,
      input.comments ?? 0,
      JSON.stringify(input.tags),
      meta?.publishedAt ?? null,
    );

  return getDripById(Number(result.lastInsertRowid)) as Drip;
}

export async function incrementDripLikes(id: number): Promise<Drip | undefined> {
  const result = db
    .prepare("UPDATE drips SET likes = likes + 1 WHERE id = ?")
    .run(id);

  if (Number(result.changes) === 0) return undefined;
  return getDripByIdEnriched(id);
}

export async function updateDrip(id: number, input: DripInput): Promise<Drip | undefined> {
  if (!getDripById(id)) return undefined;

  const youtubeVideoId = normalizeYoutubeVideoId(input.youtubeVideoId);
  const meta = await fetchYoutubeMeta(youtubeVideoId);

  db.prepare(
    `UPDATE drips SET
       title = ?, youtube_video_id = ?, timestamp = ?, thumbnail_url = ?, duration_seconds = ?,
       likes = ?, comments = ?, tags = ?, published_at = ?
     WHERE id = ?`,
  ).run(
    input.title,
    youtubeVideoId,
    input.timestamp,
    meta?.thumbnailUrl || null,
    meta?.durationSeconds ?? 0,
    input.likes ?? 0,
    input.comments ?? 0,
    JSON.stringify(input.tags),
    meta?.publishedAt ?? null,
    id,
  );

  return getDripById(id);
}

export function deleteDrip(id: number): boolean {
  const result = db.prepare("DELETE FROM drips WHERE id = ?").run(id);
  return Number(result.changes) > 0;
}
