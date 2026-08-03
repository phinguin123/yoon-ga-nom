import { motion } from "framer-motion";
import { Pin } from "lucide-react";
import type { ScheduleEvent } from "@/types";
import { EVENT_TYPE_META } from "../eventMeta";
import { cn } from "@/lib/utils";

interface ScheduleTimelineProps {
  events: ScheduleEvent[];
}

function groupByDate(events: ScheduleEvent[]) {
  const sorted = [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  );
  const groups = new Map<string, ScheduleEvent[]>();
  for (const event of sorted) {
    const key = new Date(event.start).toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
      weekday: "short",
    });
    groups.set(key, [...(groups.get(key) ?? []), event]);
  }
  return groups;
}

export function ScheduleTimeline({ events }: ScheduleTimelineProps) {
  const groups = groupByDate(events);

  return (
    <div className="relative space-y-8 border-l-2 border-dashed border-slate-200 pl-6 sm:pl-8">
      {Array.from(groups.entries()).map(([date, dayEvents], groupIndex) => (
        <div key={date} className="relative">
          <div className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-brand-500 shadow sm:-left-[41px]" />
          <p className="mb-3 text-sm font-bold text-slate-400">{date}</p>
          <div className="space-y-3">
            {dayEvents.map((event, i) => {
              const meta = EVENT_TYPE_META[event.type];
              const Icon = meta.icon;
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (groupIndex * 2 + i) * 0.04 }}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md",
                    event.isPinned && "border-ember-400/50 bg-ember-400/5",
                  )}
                >
                  <span className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full", meta.className)}>
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn("badge", meta.className)}>{meta.label}</span>
                      {event.isPinned && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-ember-600">
                          <Pin className="h-3 w-3" /> 고정
                        </span>
                      )}
                      <span className="text-xs font-medium text-slate-400">
                        {new Date(event.start).toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <h4 className="mt-1 truncate font-display text-sm font-bold text-slate-900">
                      {event.title}
                    </h4>
                    {event.description && (
                      <p className="mt-1 text-sm text-slate-500">{event.description}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
