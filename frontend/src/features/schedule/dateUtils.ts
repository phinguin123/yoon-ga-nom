import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, startOfMonth, startOfWeek, subMonths } from "date-fns";
import type { ScheduleEvent } from "@/types";

export const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * Events always carry a fixed `+09:00` (KST) offset from the backend, so the
 * "calendar date" an event belongs to is read directly off the ISO string
 * instead of going through `new Date(...)` — that would silently shift the
 * day for anyone whose browser isn't in KST.
 */
export function isoDateKey(iso: string): string {
  return iso.slice(0, 10);
}

export function isoTimeLabel(iso: string): string {
  return iso.slice(11, 16);
}

/** Grid days are plain local calendar dates (never parsed from an event's ISO string), so this key always lines up with `isoDateKey`. */
export function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getMonthGridDays(monthAnchor: Date): Date[] {
  const start = startOfWeek(startOfMonth(monthAnchor), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(monthAnchor), { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end });
}

export function nextMonth(date: Date): Date {
  return addMonths(date, 1);
}

export function previousMonth(date: Date): Date {
  return subMonths(date, 1);
}

export function formatMonthTitle(date: Date): string {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

function weekdayOf(y: number, m: number, d: number): string {
  return WEEKDAY_LABELS[new Date(y, m - 1, d).getDay()];
}

/** Groups events by the KST calendar date (`YYYY-MM-DD`) they fall on, sorted within each day (all-day/pinned first, then by start time). */
export function groupEventsByDate(events: ScheduleEvent[]): Map<string, ScheduleEvent[]> {
  const groups = new Map<string, ScheduleEvent[]>();
  for (const event of events) {
    const key = isoDateKey(event.start);
    const list = groups.get(key) ?? [];
    list.push(event);
    groups.set(key, list);
  }
  for (const list of groups.values()) {
    list.sort((a, b) => {
      if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
      return a.start.localeCompare(b.start);
    });
  }
  return groups;
}

// ---------------------------------------------------------------------------
// <input> <-> ISO conversions for the admin event form. Every event is
// always KST (`+09:00`), so these are pure string manipulation — no Date
// object / timezone conversion involved, which keeps them correct
// regardless of the admin's own browser timezone.
// ---------------------------------------------------------------------------

const KST_OFFSET = "+09:00";

/** ISO datetime -> `<input type="datetime-local">` value, e.g. "2026-08-08T19:00:00+09:00" -> "2026-08-08T19:00". */
export function isoToDateTimeLocalValue(iso: string): string {
  return iso.slice(0, 16);
}

/** `<input type="datetime-local">` value -> ISO datetime with the fixed KST offset. */
export function dateTimeLocalValueToIso(value: string): string {
  return `${value}:00${KST_OFFSET}`;
}

/** ISO datetime -> `<input type="date">` value, e.g. "2026-08-08T19:00:00+09:00" -> "2026-08-08". */
export function isoToDateValue(iso: string): string {
  return iso.slice(0, 10);
}

/** `<input type="date">` value -> ISO datetime at the start (00:00) or end (23:59) of that KST day. */
export function dateValueToIso(value: string, endOfDay = false): string {
  return `${value}T${endOfDay ? "23:59:00" : "00:00:00"}${KST_OFFSET}`;
}

export function formatEventDateRange(event: ScheduleEvent): string {
  const [y, m, d] = isoDateKey(event.start).split("-").map(Number);
  const dateLabel = `${y}년 ${m}월 ${d}일 (${weekdayOf(y, m, d)})`;
  const startTime = isoTimeLabel(event.start);

  if (event.allDay) return `${dateLabel} · 종일`;
  if (!event.end) return `${dateLabel} · ${startTime}`;

  const endKey = isoDateKey(event.end);
  const endTime = isoTimeLabel(event.end);
  if (endKey === isoDateKey(event.start)) return `${dateLabel} · ${startTime} - ${endTime}`;

  const [ey, em, ed] = endKey.split("-").map(Number);
  return `${dateLabel} ${startTime} - ${ey}년 ${em}월 ${ed}일 (${weekdayOf(ey, em, ed)}) ${endTime}`;
}
