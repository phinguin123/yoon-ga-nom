import { useState, type FormEvent } from "react";
import type { Drip } from "@/types";
import { cn } from "@/lib/utils";
import type { DripInput } from "../api";
import {
  formatDripTimestamp,
  parseDripTimestampParts,
} from "@/features/doty/utils/timestamp";
import { TagInput } from "./TagInput";

interface DripFormProps {
  initial?: Drip;
  onSubmit: (input: DripInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const inputClassName =
  "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100";
const labelClassName = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400";

export function DripForm({ initial, onSubmit, onCancel, isSubmitting }: DripFormProps) {
  const initialParts = parseDripTimestampParts(initial?.timestamp ?? "0m0s");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [youtubeVideoId, setYoutubeVideoId] = useState(initial?.youtubeVideoId ?? "");
  const [minutes, setMinutes] = useState(initialParts.minutes);
  const [seconds, setSeconds] = useState(initialParts.seconds);
  const [likes, setLikes] = useState(initial?.likes ?? 0);
  const [comments, setComments] = useState(initial?.comments ?? 0);
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit({
      title: title.trim(),
      youtubeVideoId: youtubeVideoId.trim(),
      timestamp: formatDripTimestamp(minutes, seconds),
      likes,
      comments,
      tags,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <h2 className="font-display text-lg font-bold text-slate-900">
        {initial ? "드립 수정" : "새 드립 추가"}
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        DOTY 페이지에 표시되는 레전드 밈/드립을 등록해요. 유튜브 영상 ID만 입력하면 썸네일·영상
        길이·업로드 날짜는 자동으로 가져와요. 타임스탬프는 분과 초로 입력하면 해당 시점부터 영상이
        재생돼요.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClassName} htmlFor="drip-title">제목</label>
          <input
            id="drip-title"
            className={inputClassName}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 침착맨 역대급 반응 모음"
            required
          />
        </div>

        <div>
          <label className={labelClassName} htmlFor="drip-youtube-id">유튜브 영상 ID</label>
          <input
            id="drip-youtube-id"
            className={inputClassName}
            value={youtubeVideoId}
            onChange={(e) => setYoutubeVideoId(e.target.value)}
            placeholder="dQw4w9WgXcQ 또는 영상 URL"
            required
          />
        </div>

        <div>
          <label className={labelClassName}>타임스탬프</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className={inputClassName}
              aria-label="분"
            />
            <span className="shrink-0 text-sm text-slate-400">분</span>
            <input
              type="number"
              min={0}
              max={59}
              value={seconds}
              onChange={(e) => setSeconds(Number(e.target.value))}
              className={inputClassName}
              aria-label="초"
            />
            <span className="shrink-0 text-sm text-slate-400">초</span>
          </div>
        </div>

        <div>
          <label className={labelClassName} htmlFor="drip-likes">좋아요 수</label>
          <input
            id="drip-likes"
            type="number"
            min={0}
            className={inputClassName}
            value={likes}
            onChange={(e) => setLikes(Number(e.target.value))}
          />
        </div>

        <div>
          <label className={labelClassName} htmlFor="drip-comments">댓글 수</label>
          <input
            id="drip-comments"
            type="number"
            min={0}
            className={inputClassName}
            value={comments}
            onChange={(e) => setComments(Number(e.target.value))}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClassName}>태그</label>
          <TagInput tags={tags} onChange={setTags} />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="submit" className={cn("btn-primary")} disabled={isSubmitting}>
          {initial ? "수정하기" : "추가하기"}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary" disabled={isSubmitting}>
          취소
        </button>
      </div>
    </form>
  );
}
