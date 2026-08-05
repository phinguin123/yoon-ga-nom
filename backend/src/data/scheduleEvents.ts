import { db } from "../db/client.js";
import type { ScheduleEvent } from "../types/index.js";

interface ScheduleEventRow {
  id: number;
  category_id: number | null;
  title: string;
  description: string;
  start_at: string;
  end_at: string | null;
  all_day: number;
  is_pinned: number;
  created_at: string;
  updated_at: string;
}

function rowToEvent(row: ScheduleEventRow): ScheduleEvent {
  return {
    id: row.id,
    categoryId: row.category_id,
    title: row.title,
    description: row.description,
    start: row.start_at,
    end: row.end_at,
    allDay: row.all_day === 1,
    isPinned: row.is_pinned === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Small dataset (a streamer's own calendar) — always fetched in full and filtered/grouped by month client-side rather than paginated. */
export function listScheduleEvents(): ScheduleEvent[] {
  const rows = db
    .prepare("SELECT * FROM schedule_events ORDER BY start_at ASC, id ASC")
    .all() as unknown as ScheduleEventRow[];
  return rows.map(rowToEvent);
}

export function getScheduleEventById(id: number): ScheduleEvent | undefined {
  const row = db.prepare("SELECT * FROM schedule_events WHERE id = ?").get(id) as
    | ScheduleEventRow
    | undefined;
  return row ? rowToEvent(row) : undefined;
}

export interface ScheduleEventInput {
  categoryId: number | null;
  title: string;
  description: string;
  start: string;
  end: string | null;
  allDay: boolean;
  isPinned: boolean;
}

export function createScheduleEvent(input: ScheduleEventInput): ScheduleEvent {
  const result = db
    .prepare(
      `INSERT INTO schedule_events (category_id, title, description, start_at, end_at, all_day, is_pinned)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.categoryId,
      input.title,
      input.description,
      input.start,
      input.end,
      input.allDay ? 1 : 0,
      input.isPinned ? 1 : 0,
    );

  return getScheduleEventById(Number(result.lastInsertRowid)) as ScheduleEvent;
}

export function updateScheduleEvent(id: number, input: ScheduleEventInput): ScheduleEvent | undefined {
  if (!getScheduleEventById(id)) return undefined;

  db.prepare(
    `UPDATE schedule_events SET
       category_id = ?, title = ?, description = ?, start_at = ?, end_at = ?,
       all_day = ?, is_pinned = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
     WHERE id = ?`,
  ).run(
    input.categoryId,
    input.title,
    input.description,
    input.start,
    input.end,
    input.allDay ? 1 : 0,
    input.isPinned ? 1 : 0,
    id,
  );

  return getScheduleEventById(id);
}

export function deleteScheduleEvent(id: number): boolean {
  const result = db.prepare("DELETE FROM schedule_events WHERE id = ?").run(id);
  return Number(result.changes) > 0;
}
