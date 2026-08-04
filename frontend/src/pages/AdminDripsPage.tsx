import { useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { DripForm } from "@/features/admin/components/DripForm";
import { getApiErrorMessage, type DripInput } from "@/features/admin/api";
import {
  useAdminDrips,
  useCreateAdminDrip,
  useDeleteAdminDrip,
  useUpdateAdminDrip,
} from "@/features/admin/hooks/useAdminDrips";
import { LoadingState, ErrorState } from "@/components/ui/QueryState";
import { formatDripTimestampDisplay } from "@/features/doty/utils/timestamp";
import type { Drip } from "@/types";

type FormMode = "idle" | "create" | "edit";

function formatPublishedAt(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default function AdminDripsPage() {
  const { data: drips, isLoading, isError, refetch } = useAdminDrips();
  const createMutation = useCreateAdminDrip();
  const updateMutation = useUpdateAdminDrip();
  const deleteMutation = useDeleteAdminDrip();

  const [mode, setMode] = useState<FormMode>("idle");
  const [editingDrip, setEditingDrip] = useState<Drip | null>(null);

  const startCreate = () => {
    setEditingDrip(null);
    setMode("create");
  };

  const startEdit = (drip: Drip) => {
    setEditingDrip(drip);
    setMode("edit");
  };

  const closeForm = () => {
    setMode("idle");
    setEditingDrip(null);
  };

  const handleSubmit = (input: DripInput) => {
    if (mode === "edit" && editingDrip) {
      updateMutation.mutate(
        { id: editingDrip.id, input },
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
          toast.success("드립이 추가되었습니다.");
          closeForm();
        },
        onError: (error) => toast.error(getApiErrorMessage(error, "추가에 실패했습니다.")),
      });
    }
  };

  const handleDelete = (drip: Drip) => {
    if (!window.confirm(`"${drip.title}" 드립을 삭제할까요?`)) return;
    deleteMutation.mutate(drip.id, {
      onSuccess: () => toast.success("삭제되었습니다."),
      onError: (error) => toast.error(getApiErrorMessage(error, "삭제에 실패했습니다.")),
    });
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-extrabold text-slate-900">DOTY 드립</h2>
          <p className="mt-1 text-sm text-slate-500">
            Drip of the Year 페이지에 표시되는 레전드 밈을 관리해요.
          </p>
        </div>
        {mode === "idle" && (
          <button onClick={startCreate} className="btn-primary">
            <Plus className="h-4 w-4" /> 드립 추가
          </button>
        )}
      </div>

      {mode !== "idle" && (
        <div className="mt-6">
          <DripForm
            key={editingDrip?.id ?? "new"}
            initial={editingDrip ?? undefined}
            onSubmit={handleSubmit}
            onCancel={closeForm}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
          />
        </div>
      )}

      <div className="mt-8">
        {isLoading && <LoadingState label="드립 목록을 불러오는 중..." />}
        {isError && <ErrorState onRetry={() => refetch()} />}

        {drips && drips.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3">썸네일</th>
                  <th className="px-4 py-3">제목</th>
                  <th className="px-4 py-3">유튜브 ID</th>
                  <th className="px-4 py-3">타임스탬프</th>
                  <th className="px-4 py-3">태그</th>
                  <th className="px-4 py-3">좋아요</th>
                  <th className="px-4 py-3">댓글</th>
                  <th className="px-4 py-3">업로드</th>
                  <th className="px-4 py-3 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {drips.map((drip) => (
                  <tr key={drip.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="h-10 w-16 overflow-hidden rounded-lg bg-slate-100">
                        {drip.thumbnailUrl && (
                          <img
                            src={drip.thumbnailUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                    </td>
                    <td className="max-w-[200px] px-4 py-3">
                      <p className="truncate font-medium text-slate-900">{drip.title}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{drip.youtubeVideoId}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatDripTimestampDisplay(drip.timestamp)}
                    </td>
                    <td className="max-w-[160px] px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {drip.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-rose-600">{drip.likes.toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-500">{drip.comments.toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatPublishedAt(drip.publishedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => startEdit(drip)}
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-brand-50 hover:text-brand-600"
                          aria-label="수정"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(drip)}
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

        {drips && drips.length === 0 && mode === "idle" && (
          <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center text-slate-400">
            아직 등록된 드립이 없어요. 위에서 새 드립을 추가해보세요.
          </div>
        )}
      </div>
    </>
  );
}
