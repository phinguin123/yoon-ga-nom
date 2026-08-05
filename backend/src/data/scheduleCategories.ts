import { db } from "../db/client.js";
import type { ScheduleCategory } from "../types/index.js";

interface ScheduleCategoryRow {
  id: number;
  name: string;
  color: string;
  sort_order: number;
  created_at: string;
}

function rowToCategory(row: ScheduleCategoryRow): ScheduleCategory {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

export function listScheduleCategories(): ScheduleCategory[] {
  const rows = db
    .prepare("SELECT * FROM schedule_categories ORDER BY sort_order ASC, id ASC")
    .all() as unknown as ScheduleCategoryRow[];
  return rows.map(rowToCategory);
}

export function getScheduleCategoryById(id: number): ScheduleCategory | undefined {
  const row = db.prepare("SELECT * FROM schedule_categories WHERE id = ?").get(id) as
    | ScheduleCategoryRow
    | undefined;
  return row ? rowToCategory(row) : undefined;
}

export interface ScheduleCategoryInput {
  name: string;
  color: string;
}

export function createScheduleCategory(input: ScheduleCategoryInput): ScheduleCategory {
  const { next } = db
    .prepare("SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM schedule_categories")
    .get() as { next: number };

  const result = db
    .prepare("INSERT INTO schedule_categories (name, color, sort_order) VALUES (?, ?, ?)")
    .run(input.name, input.color, next);

  return getScheduleCategoryById(Number(result.lastInsertRowid)) as ScheduleCategory;
}

export function updateScheduleCategory(
  id: number,
  input: ScheduleCategoryInput,
): ScheduleCategory | undefined {
  if (!getScheduleCategoryById(id)) return undefined;
  db.prepare("UPDATE schedule_categories SET name = ?, color = ? WHERE id = ?").run(
    input.name,
    input.color,
    id,
  );
  return getScheduleCategoryById(id);
}

/** Deleting a category leaves its events intact with `categoryId: null` (see the `ON DELETE SET NULL` FK). */
export function deleteScheduleCategory(id: number): boolean {
  const result = db.prepare("DELETE FROM schedule_categories WHERE id = ?").run(id);
  return Number(result.changes) > 0;
}
