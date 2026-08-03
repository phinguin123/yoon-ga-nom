import { motion } from "framer-motion";
import { Quote, Play } from "lucide-react";
import type { StreamLog } from "@/types";
import { formatTimestamp } from "@/lib/utils";

interface StreamLogTimelineProps {
  log: StreamLog;
}

export function StreamLogTimeline({ log }: StreamLogTimelineProps) {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-extrabold text-slate-900">{log.streamTitle}</h3>
          <p className="text-sm text-slate-400">
            {new Date(log.streamDate).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        {log.vodUrl && (
          <a href={log.vodUrl} target="_blank" rel="noreferrer" className="btn-secondary text-sm">
            <Play className="h-4 w-4" /> 다시보기
          </a>
        )}
      </div>

      <div className="space-y-4 border-l-2 border-slate-200 pl-6">
        {log.entries.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <span className="absolute -left-[31px] top-4 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-brand-500 shadow" />
            <a
              href={log.vodUrl ? `${log.vodUrl}&t=${entry.timestampSeconds}s` : undefined}
              target="_blank"
              rel="noreferrer"
              className="badge bg-slate-900 text-white hover:bg-brand-700"
            >
              {formatTimestamp(entry.timestampSeconds)}
            </a>
            <p className="mt-2 font-semibold text-slate-800">{entry.label}</p>
            {entry.quote && (
              <p className="mt-2 flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-sm italic text-slate-600">
                <Quote className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />"{entry.quote}"
              </p>
            )}
            {entry.screenshotUrl && (
              <img
                src={entry.screenshotUrl}
                alt=""
                className="mt-3 w-full max-w-sm rounded-lg border border-slate-200 object-cover"
              />
            )}
            {entry.tags && entry.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {entry.tags.map((tag) => (
                  <span key={tag} className="badge bg-brand-50 text-brand-600">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
