import { AlertTriangle, LoaderCircle } from "lucide-react";

export function LoadingState({ label = "불러오는 중..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
      <LoaderCircle className="h-8 w-8 animate-spin text-brand-500" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function ErrorState({
  message = "데이터를 불러오지 못했어요. 잠시 후 다시 시도해주세요.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-rose-200 bg-rose-50/50 py-20 text-center">
      <AlertTriangle className="h-8 w-8 text-rose-400" />
      <p className="text-sm font-semibold text-rose-600">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-secondary mt-1 text-sm">
          다시 시도
        </button>
      )}
    </div>
  );
}
