import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import type { ScheduleCategory } from "@/types";
import { PRESET_CATEGORY_COLORS } from "@/features/schedule/colors";
import { getApiErrorMessage } from "../api";
import {
  useCreateAdminScheduleCategory,
  useDeleteAdminScheduleCategory,
  useUpdateAdminScheduleCategory,
} from "../hooks/useAdminSchedule";

interface ScheduleCategoryManagerProps {
  categories: ScheduleCategory[];
}

function ColorSwatchPicker({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      {PRESET_CATEGORY_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          aria-label={color}
          style={{ backgroundColor: color }}
          className={
            "h-5 w-5 shrink-0 rounded-full ring-offset-2 transition-transform hover:scale-110" +
            (value.toLowerCase() === color.toLowerCase() ? " ring-2 ring-slate-900" : "")
          }
        />
      ))}
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label="사용자 지정 색상"
        className="h-5 w-6 shrink-0 cursor-pointer rounded border border-slate-200 bg-transparent p-0"
      />
    </div>
  );
}

export function ScheduleCategoryManager({ categories }: ScheduleCategoryManagerProps) {
  const [draftName, setDraftName] = useState("");
  const [draftColor, setDraftColor] = useState(PRESET_CATEGORY_COLORS[0]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingColor, setEditingColor] = useState("");

  const createMutation = useCreateAdminScheduleCategory();
  const updateMutation = useUpdateAdminScheduleCategory();
  const deleteMutation = useDeleteAdminScheduleCategory();

  const handleCreate = (event: FormEvent) => {
    event.preventDefault();
    const name = draftName.trim();
    if (!name) return;

    createMutation.mutate(
      { name, color: draftColor },
      {
        onSuccess: () => setDraftName(""),
        onError: (error) => toast.error(getApiErrorMessage(error, "카테고리 추가에 실패했습니다.")),
      },
    );
  };

  const startEdit = (category: ScheduleCategory) => {
    setEditingId(category.id);
    setEditingName(category.name);
    setEditingColor(category.color);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
    setEditingColor("");
  };

  const confirmEdit = () => {
    const name = editingName.trim();
    if (!name || editingId === null) return;

    updateMutation.mutate(
      { id: editingId, input: { name, color: editingColor } },
      {
        onSuccess: () => cancelEdit(),
        onError: (error) => toast.error(getApiErrorMessage(error, "카테고리 수정에 실패했습니다.")),
      },
    );
  };

  const handleDelete = (category: ScheduleCategory) => {
    if (!window.confirm(`"${category.name}" 카테고리를 삭제할까요? 이 카테고리의 일정들은 미분류로 남아요.`)) {
      return;
    }
    deleteMutation.mutate(category.id, {
      onError: (error) => toast.error(getApiErrorMessage(error, "카테고리 삭제에 실패했습니다.")),
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-display text-base font-bold text-slate-900">카테고리</h2>
      <p className="mt-1 text-xs text-slate-500">일정을 분류할 카테고리와 색상을 관리해요.</p>

      <div className="mt-4 flex flex-col gap-2">
        {categories.map((category) =>
          editingId === category.id ? (
            <div
              key={category.id}
              className="flex flex-wrap items-center gap-2.5 rounded-xl border border-brand-300 bg-brand-50 px-3 py-2"
            >
              <ColorSwatchPicker value={editingColor} onChange={setEditingColor} />
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
                className="min-w-0 flex-1 border-none bg-transparent text-sm font-semibold text-slate-900 outline-none"
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
              className="group flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700"
            >
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
              <span className="flex-1">{category.name}</span>
              <button
                type="button"
                onClick={() => startEdit(category)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                aria-label={`${category.name} 수정`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(category)}
                className="rounded-full p-1 text-slate-400 hover:bg-rose-100 hover:text-rose-600"
                aria-label={`${category.name} 삭제`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ),
        )}

        {categories.length === 0 && <p className="py-1 text-sm text-slate-400">아직 카테고리가 없어요.</p>}
      </div>

      <form onSubmit={handleCreate} className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
        <ColorSwatchPicker value={draftColor} onChange={setDraftColor} />
        <input
          value={draftName}
          onChange={(event) => setDraftName(event.target.value)}
          placeholder="새 카테고리 이름"
          className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
        />
        <button
          type="submit"
          disabled={createMutation.isPending || !draftName.trim()}
          className="btn-secondary shrink-0"
        >
          <Plus className="h-4 w-4" /> 추가
        </button>
      </form>
    </div>
  );
}
