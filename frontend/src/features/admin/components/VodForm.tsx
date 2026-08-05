import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { cn, formatDuration, formatViews } from "@/lib/utils";
import type { Vod, VodCategory } from "@/types";
import { getApiErrorMessage, type ChzzkVideoPreview, type VodInput } from "../api";
import { useLookupChzzkVideo } from "../hooks/useAdminVods";

interface VodFormProps {
  initial?: Vod;
  categories: VodCategory[];
  onSubmit: (input: VodInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const inputClassName =
  "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100";
const labelClassName = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400";

function formatPublishedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "short", day: "numeric" }).format(date);
}

export function VodForm({ initial, categories, onSubmit, onCancel, isSubmitting }: VodFormProps) {
  const [chzzkVideoId, setChzzkVideoId] = useState(
    initial ? String(initial.chzzkVideoNo) : "",
  );
  const [categoryId, setCategoryId] = useState<number | null>(initial?.categoryId ?? null);
  const [preview, setPreview] = useState<ChzzkVideoPreview | null>(
    initial
      ? {
          videoNo: initial.chzzkVideoNo,
          title: initial.title,
          thumbnailUrl: initial.thumbnailUrl,
          durationSeconds: initial.durationSeconds,
          publishedAt: initial.publishedAt,
          views: initial.views,
        }
      : null,
  );
  const [previewError, setPreviewError] = useState<string | null>(null);
  const lookupMutation = useLookupChzzkVideo();

  const handlePreview = () => {
    const query = chzzkVideoId.trim();
    if (!query) return;

    setPreviewError(null);
    lookupMutation.mutate(query, {
      onSuccess: (data) => setPreview(data),
      onError: (error) => {
        setPreview(null);
        setPreviewError(getApiErrorMessage(error, "치지직에서 영상 정보를 가져오지 못했어요."));
      },
    });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit({ chzzkVideoId: chzzkVideoId.trim(), categoryId });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-display text-lg font-bold text-slate-900">
        {initial ? "영상 수정" : "새 다시보기 추가"}
      </h2>
      <p className="text-sm text-slate-500">
        치지직 영상 ID 또는 주소를 입력하면 제목·썸네일·길이·조회수·업로드일을 자동으로 가져와요. (예:{" "}
        <span className="font-mono text-xs">14487229</span> 또는{" "}
        <span className="font-mono text-xs">chzzk.naver.com/video/14487229</span>)
      </p>

      <div>
        <label className={labelClassName}>치지직 영상 ID 또는 URL</label>
        <div className="flex gap-2">
          <input
            value={chzzkVideoId}
            onChange={(event) => {
              setChzzkVideoId(event.target.value);
              setPreviewError(null);
            }}
            required
            placeholder="14487229"
            className={cn(inputClassName, "flex-1")}
          />
          <button
            type="button"
            onClick={handlePreview}
            disabled={lookupMutation.isPending || !chzzkVideoId.trim()}
            className="btn-secondary shrink-0"
          >
            <Search className="h-4 w-4" />
            {lookupMutation.isPending ? "확인 중..." : "정보 가져오기"}
          </button>
        </div>
        {previewError && <p className="mt-1.5 text-xs font-semibold text-rose-600">{previewError}</p>}
      </div>

      {preview && (
        <div className="flex gap-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
          <div className="h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-slate-200">
            {preview.thumbnailUrl && (
              <img src={preview.thumbnailUrl} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-900">{preview.title}</p>
            <p className="mt-1 text-xs text-slate-500">
              {formatDuration(preview.durationSeconds)} · {formatViews(preview.views)} · {formatPublishedAt(preview.publishedAt)}
            </p>
          </div>
        </div>
      )}

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

      <div className="flex items-center justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          취소
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? "저장 중..." : initial ? "수정 저장" : "영상 추가"}
        </button>
      </div>
    </form>
  );
}
