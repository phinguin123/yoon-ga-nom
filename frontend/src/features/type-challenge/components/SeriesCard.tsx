import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Eye, Film, CheckCircle2, Clock } from "lucide-react";
import type { ChallengeSeries } from "@/types";
import { POKEMON_TYPE_META } from "../pokemonTypeMeta";
import { formatViews, cn } from "@/lib/utils";

const STATUS_META = {
  ongoing: { icon: Clock, label: "진행중", className: "bg-amber-100 text-amber-700" },
  clear: { icon: CheckCircle2, label: "클리어", className: "bg-emerald-100 text-emerald-700" },
} as const;

interface SeriesCardProps {
  series: ChallengeSeries;
}

/**
 * Represents an entire numbered challenge series (e.g. "전기타입 하트골드"),
 * not a single video. Clicking it drills into `/type-challenge/:key` to see
 * every episode. The corner badge shows "진행중" while the series is still
 * ongoing, or "클리어" once it's wrapped up.
 */
export function SeriesCard({ series }: SeriesCardProps) {
  const latestEpisode = series.episodes[series.episodes.length - 1];
  const typeMeta = POKEMON_TYPE_META[series.type];
  const status = series.status === "completed" ? STATUS_META.clear : STATUS_META.ongoing;
  const StatusIcon = status.icon;

  return (
    <motion.div whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
      <Link
        to={`/type-challenge/${series.key}`}
        className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-xl hover:shadow-slate-900/10"
      >
        <div className="relative aspect-video overflow-hidden bg-slate-100">
          <img
            src={latestEpisode.thumbnailUrl}
            alt={series.seriesTitle}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
            <span className="flex h-12 w-12 scale-75 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-lg transition-all group-hover:scale-100 group-hover:opacity-100">
              <Play className="ml-0.5 h-5 w-5 fill-brand-600 text-brand-600" />
            </span>
          </div>
          <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/75 px-2 py-1 text-xs font-bold text-white">
            <Film className="h-3.5 w-3.5" />총 {series.episodeCount}개 영상
          </span>
          <span className={cn("badge absolute left-2 top-2", status.className)}>
            <StatusIcon className="h-3.5 w-3.5" />
            {status.label}
          </span>
        </div>

        <div className="p-4">
          <span className="badge mb-2 text-white" style={{ backgroundColor: typeMeta.color }}>
            {typeMeta.label}
          </span>
          <h3 className="line-clamp-2 font-display text-sm font-bold leading-snug text-slate-900">
            {series.seriesTitle}
          </h3>
          <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {formatViews(series.totalViews)} 누적
            </span>
            <span>최신 {new Date(series.latestPublishedAt).toLocaleDateString("ko-KR")}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
