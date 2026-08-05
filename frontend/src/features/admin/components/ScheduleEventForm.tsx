import { useState, type FormEvent } from "react";
import { Pin } from "lucide-react";
import type { ScheduleCategory, ScheduleEvent } from "@/types";
import {
  dateKey,
  dateTimeLocalValueToIso,
  dateValueToIso,
  isoToDateTimeLocalValue,
  isoToDateValue,
} from "@/features/schedule/dateUtils";
import type { ScheduleEventInput } from "../api";

interface ScheduleEventFormProps {
  initial?: ScheduleEvent;
  /** Pre-fills the start date when opened from clicking a specific day on the calendar. */
  initialDate?: Date;
  categories: ScheduleCategory[];
  onSubmit: (input: ScheduleEventInput) => void;
  onCancel: () => void;
  onDelete?: () => void;
  isSubmitting?: boolean;
}

const inputClassName =
  "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100";
const labelClassName = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400";

export function ScheduleEventForm({
  initial,
  initialDate,
  categories,
  onSubmit,
  onCancel,
  onDelete,
  isSubmitting,
}: ScheduleEventFormProps) {
  const defaultDateKey = dateKey(initialDate ?? new Date());

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categoryId, setCategoryId] = useState<number | null>(initial?.categoryId ?? categories[0]?.id ?? null);
  const [isPinned, setIsPinned] = useState(initial?.isPinned ?? false);
  const [allDay, setAllDay] = useState(initial?.allDay ?? false);

  const [startDateTime, setStartDateTime] = useState(
    initial && !initial.allDay ? isoToDateTimeLocalValue(initial.start) : `${defaultDateKey}T20:00`,
  );
  const [endDateTime, setEndDateTime] = useState(initial?.end && !initial.allDay ? isoToDateTimeLocalValue(initial.end) : "");
  const [startDate, setStartDate] = useState(initial && initial.allDay ? isoToDateValue(initial.start) : defaultDateKey);
  const [endDate, setEndDate] = useState(initial?.end && initial.allDay ? isoToDateValue(initial.end) : "");

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const start = allDay ? dateValueToIso(startDate) : dateTimeLocalValueToIso(startDateTime);
    const end = allDay
      ? endDate
        ? dateValueToIso(endDate, true)
        : null
      : endDateTime
        ? dateTimeLocalValueToIso(endDateTime)
        : null;

    if (end && new Date(end).getTime() < new Date(start).getTime()) {
      setError("종료 일시는 시작 일시보다 빠를 수 없어요.");
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      categoryId,
      start,
      end,
      allDay,
      isPinned,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-display text-lg font-bold text-slate-900">{initial ? "일정 수정" : "새 일정 추가"}</h2>

      <div>
        <label className={labelClassName}>제목</label>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          placeholder="예: 고스트 타입 챌린지 방송"
          className={inputClassName}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClassName}>카테고리</label>
          <select
            value={categoryId ?? ""}
            onChange={(event) => setCategoryId(event.target.value ? Number(event.target.value) : null)}
            className={inputClassName}
          >
            <option value="">미분류</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end pb-1">
          <label className="inline-flex select-none items-center gap-2 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={allDay}
              onChange={(event) => setAllDay(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
            />
            종일 일정
          </label>
        </div>
      </div>

      {allDay ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClassName}>시작 날짜</label>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              required
              className={inputClassName}
            />
          </div>
          <div>
            <label className={labelClassName}>종료 날짜 (선택)</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(event) => setEndDate(event.target.value)}
              className={inputClassName}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClassName}>시작 일시</label>
            <input
              type="datetime-local"
              value={startDateTime}
              onChange={(event) => setStartDateTime(event.target.value)}
              required
              className={inputClassName}
            />
          </div>
          <div>
            <label className={labelClassName}>종료 일시 (선택)</label>
            <input
              type="datetime-local"
              value={endDateTime}
              min={startDateTime}
              onChange={(event) => setEndDateTime(event.target.value)}
              className={inputClassName}
            />
          </div>
        </div>
      )}

      <div>
        <label className={labelClassName}>설명 (선택)</label>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          placeholder="일정에 대한 추가 설명을 입력해주세요."
          className={inputClassName}
        />
      </div>

      <label className="inline-flex select-none items-center gap-2 text-sm font-semibold text-slate-700">
        <input
          type="checkbox"
          checked={isPinned}
          onChange={(event) => setIsPinned(event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
        />
        <Pin className="h-3.5 w-3.5 text-ember-500" />
        상단 고정 (중요 공지)
      </label>

      {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

      <div className="flex items-center justify-between gap-2 pt-2">
        {initial && onDelete ? (
          <button type="button" onClick={onDelete} className="text-xs font-bold text-rose-500 hover:text-rose-600">
            일정 삭제
          </button>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          <button type="button" onClick={onCancel} className="btn-secondary">
            취소
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? "저장 중..." : initial ? "수정 저장" : "일정 추가"}
          </button>
        </div>
      </div>
    </form>
  );
}
