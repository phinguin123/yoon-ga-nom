import { motion } from "framer-motion";
import { Eye, Play } from "lucide-react";
import type { Vod } from "@/types";
import { formatDuration, formatViews } from "@/lib/utils";
import { chzzkVideoUrl } from "../api";

interface VodCardProps {
  vod: Vod;
  categoryName?: string;
}

function formatPublishedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "short", day: "numeric" }).format(date);
}

/** Clicking a VOD always opens the real CHZZK watch page in a new tab — we never embed/re-host playback, just point at the source. */
export function VodCard({ vod, categoryName }: VodCardProps) {
  return (
    <motion.div whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
      <a
        href={chzzkVideoUrl(vod.chzzkVideoNo)}
        target="_blank"
        rel="noreferrer"
        className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-xl hover:shadow-slate-900/10"
      >
        <div className="relative aspect-video overflow-hidden bg-slate-100">
          {vod.thumbnailUrl && (
            <img
              src={vod.thumbnailUrl}
              alt={vod.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
            <span className="flex h-12 w-12 scale-75 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-lg transition-all group-hover:scale-100 group-hover:opacity-100">
              <Play className="ml-0.5 h-5 w-5 fill-brand-600 text-brand-600" />
            </span>
          </div>
          <span className="absolute bottom-2 right-2 rounded bg-black/75 px-2 py-1 text-xs font-bold text-white">
            {formatDuration(vod.durationSeconds)}
          </span>
          {categoryName && (
            <span className="badge absolute left-2 top-2 bg-slate-900/80 text-white">{categoryName}</span>
          )}
        </div>

        <div className="p-4">
          <h3 className="line-clamp-2 font-display text-sm font-bold leading-snug text-slate-900">
            {vod.title}
          </h3>
          <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {formatViews(vod.views)}
            </span>
            <span>{formatPublishedAt(vod.publishedAt)}</span>
          </div>
        </div>
      </a>
    </motion.div>
  );
}
