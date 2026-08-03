import { ListVideo } from "lucide-react";
import type { StreamLog } from "@/types";
import { cn } from "@/lib/utils";

interface StreamLogCardProps {
  log: StreamLog;
  isActive: boolean;
  onClick: () => void;
}

export function StreamLogCard({ log, isActive, onClick }: StreamLogCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all",
        isActive
          ? "border-brand-400 bg-brand-50 shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300",
      )}
    >
      <img
        src={log.coverImageUrl}
        alt=""
        className="h-14 w-24 shrink-0 rounded-lg object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-900">{log.streamTitle}</p>
        <p className="mt-0.5 text-xs text-slate-400">
          {new Date(log.streamDate).toLocaleDateString("ko-KR")}
        </p>
        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-brand-600">
          <ListVideo className="h-3.5 w-3.5" />
          {log.entries.length}개의 기록
        </p>
      </div>
    </button>
  );
}
