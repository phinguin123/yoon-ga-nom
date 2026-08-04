import { useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { EpisodeForm } from "@/features/admin/components/EpisodeForm";
import { getApiErrorMessage, type EpisodeInput } from "@/features/admin/api";
import {
  useAdminVideos,
  useCreateAdminVideo,
  useDeleteAdminVideo,
  useUpdateAdminVideo,
} from "@/features/admin/hooks/useAdminVideos";
import { POKEMON_TYPE_META } from "@/features/type-challenge/pokemonTypeMeta";
import { LoadingState, ErrorState } from "@/components/ui/QueryState";
import { cn, formatDuration } from "@/lib/utils";
import type { TypeChallengeVideo } from "@/types";

type FormMode = "idle" | "create" | "edit";

export default function AdminVideosPage() {
  const { data: videos, isLoading, isError, refetch } = useAdminVideos();
  const createMutation = useCreateAdminVideo();
  const updateMutation = useUpdateAdminVideo();
  const deleteMutation = useDeleteAdminVideo();

  const [mode, setMode] = useState<FormMode>("idle");
  const [editingVideo, setEditingVideo] = useState<TypeChallengeVideo | null>(null);

  const startCreate = () => {
    setEditingVideo(null);
    setMode("create");
  };

  const startEdit = (video: TypeChallengeVideo) => {
    setEditingVideo(video);
    setMode("edit");
  };

  const closeForm = () => {
    setMode("idle");
    setEditingVideo(null);
  };

  const handleSubmit = (input: EpisodeInput) => {
    if (mode === "edit" && editingVideo) {
      updateMutation.mutate(
        { id: editingVideo.id, input },
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

  const handleDelete = (video: TypeChallengeVideo) => {
    console.log("Inside video", video);
    if (!window.confirm(`"${video.title}" 영상을 삭제할까요?`)) return;
    deleteMutation.mutate(video.id, {
      onSuccess: () => toast.success("삭제되었습니다."),
      onError: (error) => toast.error(getApiErrorMessage(error, "삭제에 실패했습니다.")),
    });
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-extrabold text-slate-900">챌린지 영상</h2>
          <p className="mt-1 text-sm text-slate-500">타입 챌린지 시리즈 영상을 관리해요.</p>
        </div>
        {mode === "idle" && (
          <button onClick={startCreate} className="btn-primary">
            <Plus className="h-4 w-4" /> 영상 추가
          </button>
        )}
      </div>

      {mode !== "idle" && (
        <div className="mt-6">
          <EpisodeForm
            key={editingVideo?.id ?? "new"}
            initial={editingVideo ?? undefined}
            onSubmit={handleSubmit}
            onCancel={closeForm}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
          />
        </div>
      )}

      <div className="mt-8">
        {isLoading && <LoadingState label="영상 목록을 불러오는 중..." />}
        {isError && <ErrorState onRetry={() => refetch()} />}

        {videos && videos.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3">타입</th>
                  <th className="px-4 py-3">시리즈</th>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">제목</th>
                  <th className="px-4 py-3">결과</th>
                  <th className="px-4 py-3">길이</th>
                  <th className="px-4 py-3">업로드</th>
                  <th className="px-4 py-3 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {videos.map((video) => (
                  <tr key={video.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <span
                        className="badge text-white"
                        style={{ backgroundColor: POKEMON_TYPE_META[video.type].color }}
                      >
                        {POKEMON_TYPE_META[video.type].label}
                      </span>
                    </td>
                    <td className="max-w-[180px] truncate px-4 py-3 text-slate-500">
                      {video.seriesTitle}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-700">#{video.episodeNumber}</td>
                    <td className="max-w-[260px] truncate px-4 py-3 font-medium text-slate-900">
                      {video.title}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "badge",
                          video.result === "clear"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700",
                        )}
                      >
                        {video.result === "clear" ? "클리어" : "진행중"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatDuration(video.durationSeconds)}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{video.publishedAt}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => startEdit(video)}
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-brand-50 hover:text-brand-600"
                          aria-label="수정"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(video)}
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

        {videos && videos.length === 0 && mode === "idle" && (
          <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center text-slate-400">
            아직 등록된 영상이 없어요. 위에서 새 영상을 추가해보세요.
          </div>
        )}
      </div>
    </>
  );
}
