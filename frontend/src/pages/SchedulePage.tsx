import { useMemo, useState } from "react";
import type { ScheduleEventType } from "@/types";
import { MOCK_SCHEDULE_EVENTS } from "@/features/schedule/data/mockEvents";
import { ScheduleTimeline } from "@/features/schedule/components/ScheduleTimeline";
import { EVENT_TYPE_META } from "@/features/schedule/eventMeta";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

const FILTERS: Array<{ id: ScheduleEventType | "all"; label: string }> = [
  { id: "all", label: "전체" },
  { id: "stream", label: "방송" },
  { id: "collab", label: "콜라보" },
  { id: "event", label: "이벤트" },
  { id: "notice", label: "공지" },
];

export default function SchedulePage() {
  const [filter, setFilter] = useState<ScheduleEventType | "all">("all");

  const filteredEvents = useMemo(() => {
    if (filter === "all") return MOCK_SCHEDULE_EVENTS;
    return MOCK_SCHEDULE_EVENTS.filter((e) => e.type === filter);
  }, [filter]);

  return (
    <div className="container-page py-10 sm:py-14">
      <SectionHeading
        eyebrow="Schedule"
        title="방송 일정 & 공지사항"
        description="다가오는 방송, 콜라보, 이벤트를 한눈에 확인하세요. 놓치면 안 되는 공지는 상단에 고정돼요."
      />

      <div className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const meta = f.id === "all" ? null : EVENT_TYPE_META[f.id];
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                filter === f.id
                  ? "border-brand-500 bg-brand-600 text-white shadow-md shadow-brand-600/20"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
              )}
            >
              {meta && <span className={cn("mr-1.5 inline-block h-2 w-2 rounded-full", meta.dot)} />}
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="mt-10 max-w-3xl">
        <ScheduleTimeline events={filteredEvents} />
      </div>
    </div>
  );
}
