import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import type { VodCategory } from "@/types";
import { getApiErrorMessage } from "../api";
import {
  useCreateAdminVodCategory,
  useDeleteAdminVodCategory,
  useUpdateAdminVodCategory,
} from "../hooks/useAdminVods";

interface VodCategoryManagerProps {
  categories: VodCategory[];
}

export function VodCategoryManager({ categories }: VodCategoryManagerProps) {
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const createMutation = useCreateAdminVodCategory();
  const updateMutation = useUpdateAdminVodCategory();
  const deleteMutation = useDeleteAdminVodCategory();

  const handleCreate = (event: FormEvent) => {
    event.preventDefault();
    const name = draft.trim();
    if (!name) return;

    createMutation.mutate(name, {
      onSuccess: () => setDraft(""),
      onError: (error) => toast.error(getApiErrorMessage(error, "카테고리 추가에 실패했습니다.")),
    });
  };

  const startEdit = (category: VodCategory) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const confirmEdit = () => {
    const name = editingName.trim();
    if (!name || editingId === null) return;

    updateMutation.mutate(
      { id: editingId, name },
      {
        onSuccess: () => cancelEdit(),
        onError: (error) => toast.error(getApiErrorMessage(error, "카테고리 수정에 실패했습니다.")),
      },
    );
  };

  const handleDelete = (category: VodCategory) => {
    if (!window.confirm(`"${category.name}" 카테고리를 삭제할까요? 이 카테고리의 영상들은 미분류로 남아요.`)) {
      return;
    }
    deleteMutation.mutate(category.id, {
      onError: (error) => toast.error(getApiErrorMessage(error, "카테고리 삭제에 실패했습니다.")),
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-display text-base font-bold text-slate-900">카테고리</h2>
      <p className="mt-1 text-xs text-slate-500">다시보기 영상을 분류할 카테고리를 관리해요.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((category) =>
          editingId === category.id ? (
            <div
              key={category.id}
              className="flex items-center gap-1 rounded-full border border-brand-300 bg-brand-50 py-1 pl-3 pr-1.5"
            >
              <input
                autoFocus
                value={editingName}
                onChange={(event) => setEditingName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    confirmEdit();
                  } else if (event.key === "Escape") {
                    cancelEdit();
                  }
                }}
                className="w-28 border-none bg-transparent text-sm font-semibold text-slate-900 outline-none"
              />
              <button
                type="button"
                onClick={confirmEdit}
                className="rounded-full p-1 text-emerald-600 hover:bg-emerald-100"
                aria-label="저장"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-200"
                aria-label="취소"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div
              key={category.id}
              className="group flex items-center gap-1 rounded-full bg-slate-100 py-1 pl-3 pr-1.5 text-sm font-semibold text-slate-700"
            >
              {category.name}
              <button
                type="button"
                onClick={() => startEdit(category)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                aria-label={`${category.name} 수정`}
              >
                <Pencil className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(category)}
                className="rounded-full p-1 text-slate-400 hover:bg-rose-100 hover:text-rose-600"
                aria-label={`${category.name} 삭제`}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ),
        )}

        {categories.length === 0 && (
          <p className="py-1 text-sm text-slate-400">아직 카테고리가 없어요.</p>
        )}
      </div>

      <form onSubmit={handleCreate} className="mt-4 flex gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="새 카테고리 이름"
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
        />
        <button
          type="submit"
          disabled={createMutation.isPending || !draft.trim()}
          className="btn-secondary shrink-0"
        >
          <Plus className="h-4 w-4" /> 추가
        </button>
      </form>
    </div>
  );
}
