import { useMemo, useState } from "react";
import { isSameMonth } from "date-fns";
import { ChevronLeft, ChevronRight, Pin, Plus } from "lucide-react";
import type { ScheduleCategory, ScheduleEvent } from "@/types";
import { cn } from "@/lib/utils";
import { categoryColor, categoryTint } from "../colors";
import {
  WEEKDAY_LABELS,
  dateKey,
  formatMonthTitle,
  getMonthGridDays,
  groupEventsByDate,
  isoTimeLabel,
  nextMonth,
  previousMonth,
} from "../dateUtils";

const MAX_VISIBLE_EVENTS = 3;

interface MonthCalendarProps {
  events: ScheduleEvent[];
  categories: ScheduleCategory[];
  onEventClick: (event: ScheduleEvent) => void;
  onShowMore: (date: Date, dayEvents: ScheduleEvent[]) => void;
  /** Admin-only: clicking empty space on a day cell starts a new event pre-filled with that date. */
  onDayClick?: (date: Date) => void;
}

export function MonthCalendar({ events, categories, onEventClick, onShowMore, onDayClick }: MonthCalendarProps) {
  const [viewMonth, setViewMonth] = useState(() => new Date());

  const categoryById = useMemo(() => {
    const map = new Map<number, ScheduleCategory>();
    for (const category of categories) map.set(category.id, category);
    return map;
  }, [categories]);

  const eventsByDate = useMemo(() => groupEventsByDate(events), [events]);
  const gridDays = useMemo(() => getMonthGridDays(viewMonth), [viewMonth]);
  const today = dateKey(new Date());

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4">
        <h3 className="font-display text-lg font-extrabold text-slate-900 sm:text-xl">
          {formatMonthTitle(viewMonth)}
        </h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewMonth(previousMonth)}
            aria-label="이전 달"
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMonth(new Date())}
            className="rounded-full px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            오늘
          </button>
          <button
            type="button"
            onClick={() => setViewMonth(nextMonth)}
            aria-label="다음 달"
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/60 text-center text-xs font-bold uppercase tracking-wide text-slate-400">
        {WEEKDAY_LABELS.map((label, i) => (
          <div
            key={label}
            className={cn(
              "py-2.5",
              i === 0 && "text-rose-400",
              i === 6 && "text-brand-400",
            )}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {gridDays.map((day) => {
          const key = dateKey(day);
          const dayEvents = eventsByDate.get(key) ?? [];
          const isCurrentMonth = isSameMonth(day, viewMonth);
          const isToday = key === today;
          const visible = dayEvents.slice(0, MAX_VISIBLE_EVENTS);
          const overflowCount = dayEvents.length - visible.length;

          return (
            <div
              key={key}
              onClick={() => onDayClick?.(day)}
              className={cn(
                "group relative flex min-h-[104px] flex-col gap-1 border-b border-r border-slate-100 p-1.5 sm:min-h-[128px] sm:p-2",
                !isCurrentMonth && "bg-slate-50/50",
                onDayClick && "cursor-pointer hover:bg-brand-50/40",
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                    !isCurrentMonth && "text-slate-300",
                    isCurrentMonth && !isToday && "text-slate-700",
                    isToday && "bg-brand-600 text-white shadow-sm shadow-brand-600/30",
                  )}
                >
                  {day.getDate()}
                </span>
                {onDayClick && (
                  <Plus className="h-3.5 w-3.5 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
                )}
              </div>

              <div className="flex flex-1 flex-col gap-1">
                {visible.map((event) => {
                  const category = event.categoryId ? categoryById.get(event.categoryId) : undefined;
                  const color = categoryColor(category?.color);
                  return (
                    <button
                      key={event.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      style={{ backgroundColor: categoryTint(category?.color, 0.14) }}
                      className="flex items-center gap-1 truncate rounded-md px-1.5 py-0.5 text-left text-[11px] font-semibold text-slate-700 transition-transform hover:-translate-y-px hover:shadow-sm sm:text-xs"
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                      {event.isPinned && <Pin className="h-2.5 w-2.5 shrink-0" style={{ color }} />}
                      {!event.allDay && (
                        <span className="shrink-0 font-mono text-[10px] leading-none text-slate-400">
                          {isoTimeLabel(event.start)}
                        </span>
                      )}
                      <span className="truncate">{event.title}</span>
                    </button>
                  );
                })}
                {overflowCount > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowMore(day, dayEvents);
                    }}
                    className="rounded-md px-1.5 py-0.5 text-left text-[11px] font-bold text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    +{overflowCount}개 더보기
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
