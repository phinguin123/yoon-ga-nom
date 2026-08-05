import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { Pencil, Pin, Plus, Trash2, X } from "lucide-react";
import type { ScheduleEvent } from "@/types";
import { ScheduleCategoryManager } from "@/features/admin/components/ScheduleCategoryManager";
import { ScheduleEventForm } from "@/features/admin/components/ScheduleEventForm";
import { getApiErrorMessage, type ScheduleEventInput } from "@/features/admin/api";
import {
  useAdminScheduleCategories,
  useAdminScheduleEvents,
  useCreateAdminScheduleEvent,
  useDeleteAdminScheduleEvent,
  useUpdateAdminScheduleEvent,
} from "@/features/admin/hooks/useAdminSchedule";
import { MonthCalendar } from "@/features/schedule/components/MonthCalendar";
import { CategoryFilterBar } from "@/features/schedule/components/CategoryFilterBar";
import { categoryColor, categoryTint } from "@/features/schedule/colors";
import { formatEventDateRange } from "@/features/schedule/dateUtils";
import { LoadingState, ErrorState } from "@/components/ui/QueryState";

type FormMode = "idle" | "create" | "edit";

interface DayListState {
  events: ScheduleEvent[];
}

/** Lightweight "N events this day" picker, opened from the calendar's "+N more" — clicking an item jumps straight into editing it. */
function DayEventsPickerModal({
  state,
  categories,
  onSelect,
  onClose,
}: {
  state: DayListState;
  categories: ReturnType<typeof useAdminScheduleCategories>["data"];
  onSelect: (event: ScheduleEvent) => void;
  onClose: () => void;
}) {
  const categoryById = useMemo(() => {
    const map = new Map<number, { name: string; color: string }>();
    for (const category of categories ?? []) map.set(category.id, category);
    return map;
  }, [categories]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 4 }}
        transition={{ duration: 0.16 }}
        className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-slate-900">이 날의 일정 ({state.events.length})</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <ul className="mt-3 max-h-[50vh] space-y-1.5 overflow-y-auto">
          {state.events.map((event) => {
            const category = event.categoryId ? categoryById.get(event.categoryId) : undefined;
            return (
              <li key={event.id}>
                <button
                  type="button"
                  onClick={() => onSelect(event)}
                  style={{ backgroundColor: categoryTint(category?.color, 0.1) }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left hover:-translate-y-px hover:shadow-sm"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: categoryColor(category?.color) }}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">{event.title}</span>
                  <Pencil className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                </button>
              </li>
            );
          })}
        </ul>
      </motion.div>
    </div>
  );
}

export default function AdminSchedulePage() {
  const { data: events, isLoading, isError, refetch } = useAdminScheduleEvents();
  const { data: categories = [] } = useAdminScheduleCategories();
  const createMutation = useCreateAdminScheduleEvent();
  const updateMutation = useUpdateAdminScheduleEvent();
  const deleteMutation = useDeleteAdminScheduleEvent();

  const [mode, setMode] = useState<FormMode>("idle");
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [createDate, setCreateDate] = useState<Date | undefined>(undefined);
  const [dayList, setDayList] = useState<DayListState | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<number | "all">("all");

  const categoryById = useMemo(() => {
    const map = new Map<number, (typeof categories)[number]>();
    for (const category of categories) map.set(category.id, category);
    return map;
  }, [categories]);

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    if (categoryFilter === "all") return events;
    return events.filter((e) => e.categoryId === categoryFilter);
  }, [events, categoryFilter]);

  const sortedEvents = useMemo(
    () => [...(events ?? [])].sort((a, b) => a.start.localeCompare(b.start)),
    [events],
  );

  const openCreate = (date?: Date) => {
    setEditingEvent(null);
    setCreateDate(date);
    setMode("create");
    setDayList(null);
  };

  const startEdit = (event: ScheduleEvent) => {
    setEditingEvent(event);
    setCreateDate(undefined);
    setMode("edit");
    setDayList(null);
  };

  const closeForm = () => {
    setMode("idle");
    setEditingEvent(null);
    setCreateDate(undefined);
  };

  const handleSubmit = (input: ScheduleEventInput) => {
    if (mode === "edit" && editingEvent) {
      updateMutation.mutate(
        { id: editingEvent.id, input },
        {
          onSuccess: () => {
            toast.success("일정이 수정되었습니다.");
            closeForm();
          },
          onError: (error) => toast.error(getApiErrorMessage(error, "수정에 실패했습니다.")),
        },
      );
    } else {
      createMutation.mutate(input, {
        onSuccess: () => {
          toast.success("일정이 추가되었습니다.");
          closeForm();
        },
        onError: (error) => toast.error(getApiErrorMessage(error, "추가에 실패했습니다.")),
      });
    }
  };

  const handleDelete = (event: ScheduleEvent) => {
    if (!window.confirm(`"${event.title}" 일정을 삭제할까요?`)) return;
    deleteMutation.mutate(event.id, {
      onSuccess: () => {
        toast.success("삭제되었습니다.");
        if (editingEvent?.id === event.id) closeForm();
      },
      onError: (error) => toast.error(getApiErrorMessage(error, "삭제에 실패했습니다.")),
    });
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-extrabold text-slate-900">일정</h2>
          <p className="mt-1 text-sm text-slate-500">
            방송, 콜라보, 이벤트, 공지를 캘린더에서 관리해요. 날짜의 빈 곳을 클릭하면 그 날짜로 새 일정을 바로 추가할
            수 있어요.
          </p>
        </div>
        {mode === "idle" && (
          <button onClick={() => openCreate()} className="btn-primary">
            <Plus className="h-4 w-4" /> 새 일정
          </button>
        )}
      </div>

      <div className="mt-6">
        <ScheduleCategoryManager categories={categories} />
      </div>

      {(mode === "create" || mode === "edit") && (
        <div className="mt-6">
          <ScheduleEventForm
            key={editingEvent?.id ?? createDate?.toISOString() ?? "new"}
            initial={editingEvent ?? undefined}
            initialDate={createDate}
            categories={categories}
            onSubmit={handleSubmit}
            onCancel={closeForm}
            onDelete={editingEvent ? () => handleDelete(editingEvent) : undefined}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
          />
        </div>
      )}

      <div className="mt-6">
        <CategoryFilterBar categories={categories} activeId={categoryFilter} onChange={setCategoryFilter} />
      </div>

      <div className="mt-4">
        {isLoading && <LoadingState label="일정을 불러오는 중..." />}
        {isError && <ErrorState onRetry={() => refetch()} />}
        {events && (
          <MonthCalendar
            events={filteredEvents}
            categories={categories}
            onEventClick={startEdit}
            onShowMore={(_date, dayEvents) => setDayList({ events: dayEvents })}
            onDayClick={openCreate}
          />
        )}
      </div>

      {sortedEvents.length > 0 && (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">카테고리</th>
                <th className="px-4 py-3">제목</th>
                <th className="px-4 py-3">일시</th>
                <th className="px-4 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedEvents.map((event) => {
                const category = event.categoryId ? categoryById.get(event.categoryId) : undefined;
                return (
                  <tr key={event.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <span
                        className="badge"
                        style={{
                          backgroundColor: categoryTint(category?.color, 0.14),
                          color: categoryColor(category?.color),
                        }}
                      >
                        {category?.name ?? "미분류"}
                      </span>
                    </td>
                    <td className="max-w-[280px] px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {event.isPinned && <Pin className="h-3.5 w-3.5 shrink-0 text-ember-500" />}
                        <p className="truncate font-medium text-slate-900">{event.title}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatEventDateRange(event)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => startEdit(event)}
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-brand-50 hover:text-brand-600"
                          aria-label="수정"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(event)}
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                          aria-label="삭제"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {events && events.length === 0 && mode === "idle" && (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 py-16 text-center text-slate-400">
          아직 등록된 일정이 없어요. 위에서 일정을 추가해보세요.
        </div>
      )}

      <AnimatePresence>
        {dayList && (
          <DayEventsPickerModal
            key="day-list"
            state={dayList}
            categories={categories}
            onSelect={startEdit}
            onClose={() => setDayList(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
