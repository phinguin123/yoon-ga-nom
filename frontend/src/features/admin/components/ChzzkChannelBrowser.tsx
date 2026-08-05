import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { LoadingState, ErrorState } from "@/components/ui/QueryState";
import { formatDuration, formatViews } from "@/lib/utils";
import type { VodCategory } from "@/types";
import { useChzzkChannelVideos } from "../hooks/useAdminVods";

interface ChzzkChannelBrowserProps {
  categories: VodCategory[];
  existingVideoNos: Set<number>;
  onAdd: (videoNo: number, categoryId: number | null) => void;
  isAdding: boolean;
}

function formatPublishedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "short", day: "numeric" }).format(date);
}

/**
 * Lets an admin browse the streamer's own CHZZK VODs (via the undocumented
 * `/service/v1/channels/{id}/videos` endpoint, proxied through our backend)
 * and add them with one click, instead of hand-copying video IDs/URLs.
 */
export function ChzzkChannelBrowser({ categories, existingVideoNos, onAdd, isAdding }: ChzzkChannelBrowserProps) {
  const [page, setPage] = useState(0);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const { data, isLoading, isError, refetch, isFetching } = useChzzkChannelVideos(page, true);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">치지직 채널의 최근 다시보기 목록이에요. 추가할 카테고리를 먼저 고르고 원하는 영상의 추가 버튼을 누르세요.</p>
        <select
          value={categoryId ?? ""}
          onChange={(event) => setCategoryId(event.target.value ? Number(event.target.value) : null)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
        >
          <option value="">미분류로 추가</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}에 추가
            </option>
          ))}
        </select>
      </div>

      {isLoading && <LoadingState label="치지직 영상 목록을 불러오는 중..." />}
      {isError && <ErrorState onRetry={() => refetch()} />}

      {data && (
        <>
          <div className="space-y-2">
            {data.items.map((item) => {
              const alreadyAdded = existingVideoNos.has(item.videoNo);
              return (
                <div
                  key={item.videoNo}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-2.5"
                >
                  <div className="h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {item.thumbnailUrl && (
                      <img src={item.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatDuration(item.durationSeconds)} · {formatViews(item.views)} · {formatPublishedAt(item.publishedAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={alreadyAdded || isAdding}
                    onClick={() => onAdd(item.videoNo, categoryId)}
                    className="btn-secondary shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {alreadyAdded ? (
                      "추가됨"
                    ) : (
                      <>
                        <Plus className="h-4 w-4" /> 추가
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || isFetching}
              className="rounded-full p-2 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="이전 페이지"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-semibold text-slate-500">
              {page + 1} / {Math.max(data.totalPages, 1)}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={page + 1 >= data.totalPages || isFetching}
              className="rounded-full p-2 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="다음 페이지"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
