import { randomUUID } from "node:crypto";
import { db } from "../db/client.js";
import { fetchYoutubeStats } from "../services/youtube.service.js";
import type { ChallengeStatus, PokemonType, TypeChallengeVideo } from "../types/index.js";

interface EpisodeRow {
  id: string;
  series_title: string;
  series_status: string;
  episode_number: number;
  title: string;
  youtube_id: string;
  thumbnail_url: string;
  type: string;
  result: string;
  duration_seconds: number;
  published_at: string;
  views: number;
  tags: string;
}

function rowToVideo(row: EpisodeRow): TypeChallengeVideo {
  return {
    id: row.id,
    seriesTitle: row.series_title,
    seriesStatus: row.series_status as ChallengeStatus,
    episodeNumber: row.episode_number,
    title: row.title,
    youtubeId: row.youtube_id,
    thumbnailUrl: row.thumbnail_url,
    type: row.type as PokemonType,
    result: row.result as TypeChallengeVideo["result"],
    durationSeconds: row.duration_seconds,
    publishedAt: row.published_at,
    views: row.views,
    tags: JSON.parse(row.tags) as string[],
  };
}

/** Raw catalog rows, exactly as stored — no YouTube enrichment. Used by the admin API. */
function getRawVideos(): TypeChallengeVideo[] {
  const rows = db
    .prepare("SELECT * FROM episodes ORDER BY type ASC, episode_number ASC")
    .all() as unknown as EpisodeRow[];
  return rows.map(rowToVideo);
}

export function getRawVideoById(id: string): TypeChallengeVideo | undefined {
  const row = db.prepare("SELECT * FROM episodes WHERE id = ?").get(id) as
    | EpisodeRow
    | undefined;
  return row ? rowToVideo(row) : undefined;
}

/**
 * Public-facing read, merged with live YouTube stats where available
 * (see `services/youtube.service.ts`). Falls back to the stored
 * placeholder values when no `YOUTUBE_API_KEY` is configured.
 */
export async function getAllVideos(): Promise<TypeChallengeVideo[]> {
  const catalog = getRawVideos();
  const liveStats = await fetchYoutubeStats(catalog.map((v) => v.youtubeId));

  return catalog.map((video) => {
    const live = liveStats.get(video.youtubeId);
    if (!live) return video;

    return {
      ...video,
      title: live.title || video.title,
      thumbnailUrl: live.thumbnailUrl || video.thumbnailUrl,
      publishedAt: live.publishedAt || video.publishedAt,
      views: live.views || video.views,
      durationSeconds: live.durationSeconds || video.durationSeconds,
    };
  });
}

export async function getVideoById(id: string): Promise<TypeChallengeVideo | undefined> {
  const videos = await getAllVideos();
  return videos.find((v) => v.id === id);
}

// ---------------------------------------------------------------------------
// Admin CRUD — operates on the raw catalog (source of truth), no YouTube
// enrichment. Only reachable through routes guarded by requireAdmin.
// ---------------------------------------------------------------------------

export type EpisodeInput = Omit<TypeChallengeVideo, "id">;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function listAdminVideos(): TypeChallengeVideo[] {
  return getRawVideos();
}

export function createVideo(input: EpisodeInput): TypeChallengeVideo {
  const id = `${input.type}-${slugify(input.title).slice(0, 24) || randomUUID().slice(0, 8)}-${randomUUID().slice(0, 6)}`;

  db.prepare(
    `INSERT INTO episodes
      (id, series_title, series_status, episode_number, title, youtube_id,
       thumbnail_url, type, result, duration_seconds, published_at, views, tags)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    input.seriesTitle,
    input.seriesStatus,
    input.episodeNumber,
    input.title,
    input.youtubeId,
    input.thumbnailUrl,
    input.type,
    input.result,
    input.durationSeconds,
    input.publishedAt,
    input.views,
    JSON.stringify(input.tags),
  );

  return getRawVideoById(id) as TypeChallengeVideo;
}

export function updateVideo(id: string, input: EpisodeInput): TypeChallengeVideo | undefined {
  if (!getRawVideoById(id)) return undefined;

  db.prepare(
    `UPDATE episodes SET
       series_title = ?, series_status = ?, episode_number = ?, title = ?,
       youtube_id = ?, thumbnail_url = ?, type = ?, result = ?,
       duration_seconds = ?, published_at = ?, views = ?, tags = ?,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
     WHERE id = ?`,
  ).run(
    input.seriesTitle,
    input.seriesStatus,
    input.episodeNumber,
    input.title,
    input.youtubeId,
    input.thumbnailUrl,
    input.type,
    input.result,
    input.durationSeconds,
    input.publishedAt,
    input.views,
    JSON.stringify(input.tags),
    id,
  );

  return getRawVideoById(id);
}

export function deleteVideo(id: string): boolean {
  const result = db.prepare("DELETE FROM episodes WHERE id = ?").run(id);
  return Number(result.changes) > 0;
}
