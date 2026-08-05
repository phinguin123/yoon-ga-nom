import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Pin, X } from "lucide-react";
import type { ScheduleCategory, ScheduleEvent } from "@/types";
import { categoryColor, categoryTint } from "../colors";
import { formatEventDateRange, isoTimeLabel } from "../dateUtils";

interface EventDetailModalProps {
  /** All events for the clicked day. A single-event list opens straight into detail; multiple opens a day list first. */
  events: ScheduleEvent[];
  categories: ScheduleCategory[];
  onClose: () => void;
}

/**
 * Event detail overlay. Mirrors the structure of `LoginRequiredDialog`
 * (dimmed full-screen backdrop + centered card, same motion transitions) but
 * tints the backdrop with the site's brand blue instead of plain black, so
 * opening an event visibly "turns the page blue" behind the card.
 */
export function EventDetailModal({ events, categories, onClose }: EventDetailModalProps) {
  const [selected, setSelected] = useState<ScheduleEvent | null>(events.length === 1 ? events[0] : null);

  const categoryById = useMemo(() => {
    const map = new Map<number, ScheduleCategory>();
    for (const category of categories) map.set(category.id, category);
    return map;
  }, [categories]);

  const showList = events.length > 1 && !selected;
  const category = selected?.categoryId ? categoryById.get(selected.categoryId) : undefined;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="absolute inset-0 bg-gradient-to-br from-brand-950/85 via-brand-900/75 to-brand-700/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-event-title"
        initial={{ opacity: 0, scale: 0.94, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 4 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        {showList ? (
          <div className="p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <h2 id="schedule-event-title" className="font-display text-lg font-bold text-slate-900">
                {formatEventDateRange(events[0]).split(" · ")[0]}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="닫기"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <p className="mt-1 text-sm text-slate-500">이 날의 일정 {events.length}개</p>

            <ul className="mt-4 max-h-[60vh] space-y-1.5 overflow-y-auto">
              {events.map((event) => {
                const eventCategory = event.categoryId ? categoryById.get(event.categoryId) : undefined;
                const color = categoryColor(eventCategory?.color);
                return (
                  <li key={event.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(event)}
                      style={{ backgroundColor: categoryTint(eventCategory?.color, 0.1) }}
                      className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left transition-transform hover:-translate-y-px hover:shadow-sm"
                    >
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900">{event.title}</p>
                        <p className="text-xs text-slate-500">
                          {event.allDay ? "종일" : isoTimeLabel(event.start)}
                          {eventCategory && ` · ${eventCategory.name}`}
                        </p>
                      </div>
                      {event.isPinned && <Pin className="h-3.5 w-3.5 shrink-0" style={{ color }} />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          selected && (
            <div>
              <div className="h-2 w-full" style={{ backgroundColor: categoryColor(category?.color) }} />
              <div className="p-6 sm:p-7">
                <div className="flex items-start justify-between gap-2">
                  {events.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      className="-ml-1.5 flex items-center gap-1 rounded-full py-1 pl-1.5 pr-2.5 text-xs font-semibold text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> 목록
                    </button>
                  ) : (
                    <span
                      className="badge"
                      style={{
                        backgroundColor: categoryTint(category?.color, 0.14),
                        color: categoryColor(category?.color),
                      }}
                    >
                      {category?.name ?? "미분류"}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    aria-label="닫기"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                {events.length > 1 && (
                  <span
                    className="badge mt-3"
                    style={{
                      backgroundColor: categoryTint(category?.color, 0.14),
                      color: categoryColor(category?.color),
                    }}
                  >
                    {category?.name ?? "미분류"}
                  </span>
                )}

                <div className="mt-3 flex items-start gap-2">
                  {selected.isPinned && (
                    <Pin className="mt-1 h-4 w-4 shrink-0" style={{ color: categoryColor(category?.color) }} />
                  )}
                  <h2 id="schedule-event-title" className="font-display text-xl font-extrabold text-slate-900">
                    {selected.title}
                  </h2>
                </div>

                <p className="mt-2 text-sm font-semibold text-slate-500">{formatEventDateRange(selected)}</p>

                {selected.description && (
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                    {selected.description}
                  </p>
                )}
              </div>
            </div>
          )
        )}
      </motion.div>
    </div>
  );
}
