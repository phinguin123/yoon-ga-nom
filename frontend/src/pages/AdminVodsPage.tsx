import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { VodForm } from "@/features/admin/components/VodForm";
import { VodCategoryManager } from "@/features/admin/components/VodCategoryManager";
import { ChzzkChannelBrowser } from "@/features/admin/components/ChzzkChannelBrowser";
import { getApiErrorMessage, type VodInput } from "@/features/admin/api";
import {
  useAdminVodCategories,
  useAdminVods,
  useCreateAdminVod,
  useDeleteAdminVod,
  useRefreshAdminVod,
  useUpdateAdminVod,
} from "@/features/admin/hooks/useAdminVods";
import { LoadingState, ErrorState } from "@/components/ui/QueryState";
import { cn, formatDuration, formatViews } from "@/lib/utils";
import type { Vod } from "@/types";

type FormMode = "idle" | "manual" | "browse" | "edit";

function formatPublishedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "short", day: "numeric" }).format(date);
}

export default function AdminVodsPage() {
  const { data: vods, isLoading, isError, refetch } = useAdminVods();
  const { data: categories = [] } = useAdminVodCategories();
  const createMutation = useCreateAdminVod();
  const updateMutation = useUpdateAdminVod();
  const deleteMutation = useDeleteAdminVod();
  const refreshMutation = useRefreshAdminVod();

  const [mode, setMode] = useState<FormMode>("idle");
  const [editingVod, setEditingVod] = useState<Vod | null>(null);

  const categoryNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const category of categories) map.set(category.id, category.name);
    return map;
  }, [categories]);

  const existingVideoNos = useMemo(() => new Set((vods ?? []).map((v) => v.chzzkVideoNo)), [vods]);

  const closeForm = () => {
    setMode("idle");
    setEditingVod(null);
  };

  const startEdit = (vod: Vod) => {
    setEditingVod(vod);
    setMode("edit");
  };

  const handleSubmit = (input: VodInput) => {
    if (mode === "edit" && editingVod) {
      updateMutation.mutate(
        { id: editingVod.id, input },
        {
          onSuccess: () => {
            toast.success("수정되었습니다.");
            closeForm();
          },
          onError: (error) => toast.error(getApiErrorMessage(error, "수정에 실패했습니다.")),
        },
      );
    } else {
      createMutation.mutate(input, {
        onSuccess: () => {
          toast.success("영상이 추가되었습니다.");
          closeForm();
        },
        onError: (error) => toast.error(getApiErrorMessage(error, "추가에 실패했습니다.")),
      });
    }
  };

  const handleBrowseAdd = (videoNo: number, categoryId: number | null) => {
    createMutation.mutate(
      { chzzkVideoId: String(videoNo), categoryId },
      {
        onSuccess: () => toast.success("영상이 추가되었습니다."),
        onError: (error) => toast.error(getApiErrorMessage(error, "추가에 실패했습니다.")),
      },
    );
  };

  const handleCategoryChange = (vod: Vod, categoryId: number | null) => {
    updateMutation.mutate(
      { id: vod.id, input: { chzzkVideoId: String(vod.chzzkVideoNo), categoryId } },
      { onError: (error) => toast.error(getApiErrorMessage(error, "카테고리 변경에 실패했습니다.")) },
    );
  };

  const handleRefresh = (vod: Vod) => {
    refreshMutation.mutate(vod.id, {
      onSuccess: () => toast.success("최신 정보로 갱신되었습니다."),
      onError: (error) => toast.error(getApiErrorMessage(error, "갱신에 실패했습니다.")),
    });
  };

  const handleDelete = (vod: Vod) => {
    if (!window.confirm(`"${vod.title}" 영상을 삭제할까요?`)) return;
    deleteMutation.mutate(vod.id, {
      onSuccess: () => toast.success("삭제되었습니다."),
      onError: (error) => toast.error(getApiErrorMessage(error, "삭제에 실패했습니다.")),
    });
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-extrabold text-slate-900">다시보기</h2>
          <p className="mt-1 text-sm text-slate-500">
            치지직 다시보기(VOD)를 카테고리별로 관리해요. 치지직은 공식 API가 없어서, 비공식으로
            공개된 웹 데이터를 이용해 제목·썸네일·길이·조회수를 자동으로 가져와요.
          </p>
        </div>
        {mode === "idle" && (
          <div className="flex gap-2">
            <button onClick={() => setMode("browse")} className="btn-secondary">
              치지직 채널에서 찾기
            </button>
            <button onClick={() => setMode("manual")} className="btn-primary">
              <Plus className="h-4 w-4" /> 영상 추가
            </button>
          </div>
        )}
      </div>

      <div className="mt-6">
        <VodCategoryManager categories={categories} />
      </div>

      {(mode === "manual" || mode === "edit") && (
        <div className="mt-6">
          <VodForm
            key={editingVod?.id ?? "new"}
            initial={editingVod ?? undefined}
            categories={categories}
            onSubmit={handleSubmit}
            onCancel={closeForm}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
          />
        </div>
      )}

      {mode === "browse" && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-lg font-bold text-slate-900">치지직 채널에서 찾기</h2>
            <button onClick={closeForm} className="btn-secondary">
              닫기
            </button>
          </div>
          <div className="mt-4">
            <ChzzkChannelBrowser
              categories={categories}
              existingVideoNos={existingVideoNos}
              onAdd={handleBrowseAdd}
              isAdding={createMutation.isPending}
            />
          </div>
        </div>
      )}

      <div className="mt-8">
        {isLoading && <LoadingState label="영상 목록을 불러오는 중..." />}
        {isError && <ErrorState onRetry={() => refetch()} />}

        {vods && vods.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3">썸네일</th>
                  <th className="px-4 py-3">제목</th>
                  <th className="px-4 py-3">카테고리</th>
                  <th className="px-4 py-3">길이</th>
                  <th className="px-4 py-3">조회수</th>
                  <th className="px-4 py-3">업로드</th>
                  <th className="px-4 py-3 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vods.map((vod) => (
                  <tr key={vod.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <a
                        href={`https://chzzk.naver.com/video/${vod.chzzkVideoNo}`}
                        target="_blank"
                        rel="noreferrer"
                        className="block h-10 w-16 overflow-hidden rounded-lg bg-slate-100"
                      >
                        {vod.thumbnailUrl && (
                          <img src={vod.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                        )}
                      </a>
                    </td>
                    <td className="max-w-[260px] px-4 py-3">
                      <p className="truncate font-medium text-slate-900">{vod.title}</p>
                      <p className="font-mono text-[11px] text-slate-400">#{vod.chzzkVideoNo}</p>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={vod.categoryId ?? ""}
                        onChange={(event) =>
                          handleCategoryChange(vod, event.target.value ? Number(event.target.value) : null)
                        }
                        className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-semibold outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                      >
                        <option value="">미분류</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {vod.categoryId !== null && !categoryNameById.has(vod.categoryId) && (
                        <p className="mt-1 text-[11px] text-rose-500">알 수 없는 카테고리</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDuration(vod.durationSeconds)}</td>
                    <td className="px-4 py-3 text-slate-500">{formatViews(vod.views)}</td>
                    <td className="px-4 py-3 text-slate-500">{formatPublishedAt(vod.publishedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleRefresh(vod)}
                          disabled={refreshMutation.isPending}
                          className={cn(
                            "rounded-lg p-2 text-slate-400 transition-colors hover:bg-brand-50 hover:text-brand-600",
                            refreshMutation.isPending && "cursor-not-allowed opacity-50",
                          )}
                          aria-label="새로고침"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => startEdit(vod)}
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-brand-50 hover:text-brand-600"
                          aria-label="수정"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(vod)}
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                          aria-label="삭제"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {vods && vods.length === 0 && mode === "idle" && (
          <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center text-slate-400">
            아직 등록된 다시보기가 없어요. 위에서 영상을 추가해보세요.
          </div>
        )}
      </div>
    </>
  );
}
