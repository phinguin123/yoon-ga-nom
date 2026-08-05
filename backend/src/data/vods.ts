import { db } from "../db/client.js";
import { fetchChzzkVideo } from "../services/chzzk.service.js";
import type { Vod } from "../types/index.js";

interface VodRow {
  id: number;
  chzzk_video_no: number;
  category_id: number | null;
  title: string;
  thumbnail_url: string;
  duration_seconds: number;
  views: number;
  published_at: string | null;
  created_at: string;
}

function rowToVod(row: VodRow): Vod {
  return {
    id: row.id,
    chzzkVideoNo: row.chzzk_video_no,
    categoryId: row.category_id,
    title: row.title,
    thumbnailUrl: row.thumbnail_url,
    durationSeconds: row.duration_seconds,
    views: row.views,
    publishedAt: row.published_at ?? row.created_at,
    createdAt: row.created_at,
  };
}

/** Thrown when CHZZK's undocumented API doesn't return usable data for a `videoNo` (bad ID, private/deleted video, or CHZZK unreachable). */
export class ChzzkFetchError extends Error {
  constructor(videoNo: number) {
    super(`Could not fetch CHZZK metadata for videoNo ${videoNo}`);
  }
}

/** Raw catalog, newest first. Used by both the public `/api/vods` list and the admin dashboard — there's no draft/unpublished state, everything an admin adds is immediately public. */
export function listVods(): Vod[] {
  const rows = db
    .prepare("SELECT * FROM vods ORDER BY published_at DESC, id DESC")
    .all() as unknown as VodRow[];
  return rows.map(rowToVod);
}

export function getVodById(id: number): Vod | undefined {
  const row = db.prepare("SELECT * FROM vods WHERE id = ?").get(id) as VodRow | undefined;
  return row ? rowToVod(row) : undefined;
}

export interface VodInput {
  chzzkVideoNo: number;
  categoryId: number | null;
}

/** Fetches live metadata from CHZZK and inserts a new row. Title/thumbnail/duration/views/publishedAt are never taken from the client — always re-derived server-side. */
export async function createVod(input: VodInput): Promise<Vod> {
  const meta = await fetchChzzkVideo(input.chzzkVideoNo);
  if (!meta) throw new ChzzkFetchError(input.chzzkVideoNo);

  const result = db
    .prepare(
      `INSERT INTO vods (chzzk_video_no, category_id, title, thumbnail_url, duration_seconds, views, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.chzzkVideoNo,
      input.categoryId,
      meta.title,
      meta.thumbnailUrl,
      meta.durationSeconds,
      meta.views,
      meta.publishedAt,
    );

  return getVodById(Number(result.lastInsertRowid)) as Vod;
}

/** Re-fetches CHZZK metadata and updates the row (also used by `refreshVod` below, passing the existing chzzkVideoNo/categoryId back in). */
export async function updateVod(id: number, input: VodInput): Promise<Vod | undefined> {
  if (!getVodById(id)) return undefined;

  const meta = await fetchChzzkVideo(input.chzzkVideoNo);
  if (!meta) throw new ChzzkFetchError(input.chzzkVideoNo);

  db.prepare(
    `UPDATE vods SET
       chzzk_video_no = ?, category_id = ?, title = ?, thumbnail_url = ?,
       duration_seconds = ?, views = ?, published_at = ?
     WHERE id = ?`,
  ).run(
    input.chzzkVideoNo,
    input.categoryId,
    meta.title,
    meta.thumbnailUrl,
    meta.durationSeconds,
    meta.views,
    meta.publishedAt,
    id,
  );

  return getVodById(id);
}

/** Re-pulls live stats (views/duration/thumbnail/title) for an existing VOD without changing its category. */
export async function refreshVod(id: number): Promise<Vod | undefined> {
  const existing = getVodById(id);
  if (!existing) return undefined;
  return updateVod(id, { chzzkVideoNo: existing.chzzkVideoNo, categoryId: existing.categoryId });
}

export function deleteVod(id: number): boolean {
  const result = db.prepare("DELETE FROM vods WHERE id = ?").run(id);
  return Number(result.changes) > 0;
}
