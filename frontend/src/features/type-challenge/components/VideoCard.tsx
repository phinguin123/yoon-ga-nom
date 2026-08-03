import { motion } from "framer-motion";
import { Play, Eye, CheckCircle2, XCircle, Clock } from "lucide-react";
import type { TypeChallengeVideo } from "@/types";
import { POKEMON_TYPE_META } from "../pokemonTypeMeta";
import { formatDuration, formatViews, cn } from "@/lib/utils";

const RESULT_META = {
  clear: { icon: CheckCircle2, label: "클리어", className: "bg-emerald-100 text-emerald-700" },
  fail: { icon: XCircle, label: "실패", className: "bg-rose-100 text-rose-700" },
  "in-progress": { icon: Clock, label: "진행중", className: "bg-amber-100 text-amber-700" },
} as const;

interface VideoCardProps {
  video: TypeChallengeVideo;
}

export function VideoCard({ video }: VideoCardProps) {
  const result = RESULT_META[video.result];
  const ResultIcon = result.icon;

  return (
    <motion.a
      href={`https://youtube.com/watch?v=${video.youtubeId}`}
      target="_blank"
      rel="noreferrer"
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-xl hover:shadow-slate-900/10"
    >
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
          <span className="flex h-12 w-12 scale-75 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-lg transition-all group-hover:scale-100 group-hover:opacity-100">
            <Play className="ml-0.5 h-5 w-5 fill-brand-600 text-brand-600" />
          </span>
        </div>
        <span className="absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-xs font-semibold text-white">
          {formatDuration(video.durationSeconds)}
        </span>
        <span
          className={cn(
            "badge absolute left-2 top-2",
            result.className,
          )}
        >
          <ResultIcon className="h-3.5 w-3.5" />
          {result.label}
        </span>
      </div>

      <div className="p-4">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {video.types.map((type) => (
            <span
              key={type}
              className="badge text-white"
              style={{ backgroundColor: POKEMON_TYPE_META[type].color }}
            >
              {POKEMON_TYPE_META[type].label}
            </span>
          ))}
        </div>
        <h3 className="line-clamp-2 font-display text-sm font-bold leading-snug text-slate-900">
          {video.title}
        </h3>
        <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {formatViews(video.views)}
          </span>
          <span>{new Date(video.publishedAt).toLocaleDateString("ko-KR")}</span>
        </div>
      </div>
    </motion.a>
  );
}
