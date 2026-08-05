import { db } from "../db/client.js";
import type { VodCategory } from "../types/index.js";

interface VodCategoryRow {
  id: number;
  name: string;
  sort_order: number;
  created_at: string;
}

function rowToCategory(row: VodCategoryRow): VodCategory {
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

export function listVodCategories(): VodCategory[] {
  const rows = db
    .prepare("SELECT * FROM vod_categories ORDER BY sort_order ASC, id ASC")
    .all() as unknown as VodCategoryRow[];
  return rows.map(rowToCategory);
}

export function getVodCategoryById(id: number): VodCategory | undefined {
  const row = db.prepare("SELECT * FROM vod_categories WHERE id = ?").get(id) as
    | VodCategoryRow
    | undefined;
  return row ? rowToCategory(row) : undefined;
}

export function createVodCategory(name: string): VodCategory {
  const { next } = db
    .prepare("SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM vod_categories")
    .get() as { next: number };

  const result = db
    .prepare("INSERT INTO vod_categories (name, sort_order) VALUES (?, ?)")
    .run(name, next);

  return getVodCategoryById(Number(result.lastInsertRowid)) as VodCategory;
}

export function updateVodCategory(id: number, name: string): VodCategory | undefined {
  if (!getVodCategoryById(id)) return undefined;
  db.prepare("UPDATE vod_categories SET name = ? WHERE id = ?").run(name, id);
  return getVodCategoryById(id);
}

/** Deleting a category leaves its VODs intact with `categoryId: null` (see the `ON DELETE SET NULL` FK). */
export function deleteVodCategory(id: number): boolean {
  const result = db.prepare("DELETE FROM vod_categories WHERE id = ?").run(id);
  return Number(result.changes) > 0;
}
