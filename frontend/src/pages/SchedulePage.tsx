import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { ScheduleEvent } from "@/types";
import { useScheduleCategories, useScheduleEvents } from "@/features/schedule/hooks/useSchedule";
import { CategoryFilterBar } from "@/features/schedule/components/CategoryFilterBar";
import { MonthCalendar } from "@/features/schedule/components/MonthCalendar";
import { EventDetailModal } from "@/features/schedule/components/EventDetailModal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LoadingState, ErrorState } from "@/components/ui/QueryState";

interface ModalState {
  events: ScheduleEvent[];
}

export default function SchedulePage() {
  const { data: events, isLoading, isError, refetch } = useScheduleEvents();
  const { data: categories = [] } = useScheduleCategories();
  const [categoryFilter, setCategoryFilter] = useState<number | "all">("all");
  const [modal, setModal] = useState<ModalState | null>(null);

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    if (categoryFilter === "all") return events;
    return events.filter((e) => e.categoryId === categoryFilter);
  }, [events, categoryFilter]);

  return (
    <div className="container-page py-10 sm:py-14">
      <SectionHeading
        eyebrow="Schedule"
        title="방송 일정 & 공지사항"
        description="구글 캘린더처럼 한눈에 보는 방송, 콜라보, 이벤트 일정이에요. 날짜의 일정을 클릭하면 자세한 내용을 볼 수 있어요."
      />

      <div className="mt-8">
        <CategoryFilterBar categories={categories} activeId={categoryFilter} onChange={setCategoryFilter} />
      </div>

      <div className="mt-6">
        {isLoading && <LoadingState label="일정을 불러오는 중..." />}
        {isError && <ErrorState onRetry={() => refetch()} />}
        {events && (
          <MonthCalendar
            events={filteredEvents}
            categories={categories}
            onEventClick={(event) => setModal({ events: [event] })}
            onShowMore={(_date, dayEvents) => setModal({ events: dayEvents })}
          />
        )}
      </div>

      <AnimatePresence>
        {modal && (
          <EventDetailModal
            key="schedule-event-modal"
            events={modal.events}
            categories={categories}
            onClose={() => setModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
