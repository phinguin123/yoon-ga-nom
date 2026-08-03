import { motion } from "framer-motion";
import { Play, Eye, CheckCircle2, XCircle } from "lucide-react";
import type { TypeChallengeVideo } from "@/types";
import { POKEMON_TYPE_META } from "../pokemonTypeMeta";
import { formatDuration, formatViews, cn } from "@/lib/utils";

const RESULT_META = {
  clear: { icon: CheckCircle2, label: "클리어", className: "bg-emerald-100 text-emerald-700" },
  fail: { icon: XCircle, label: "실패", className: "bg-rose-100 text-rose-700" },
} as const;

interface EpisodeRowProps {
  episode: TypeChallengeVideo;
  index: number;
}

export function EpisodeRow({ episode, index }: EpisodeRowProps) {
  const result = RESULT_META[episode.result];
  const ResultIcon = result.icon;
  const typeColor = POKEMON_TYPE_META[episode.type].color;

  return (
    <motion.a
      href={`https://youtube.com/watch?v=${episode.youtubeId}`}
      target="_blank"
      rel="noreferrer"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg hover:shadow-slate-900/5 sm:p-4"
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 font-display text-lg font-extrabold sm:h-12 sm:w-12"
        style={{
          backgroundColor: `${typeColor}1a`,
          borderColor: `${typeColor}55`,
          color: typeColor,
        }}
      >
        {episode.episodeNumber}
      </span>

      <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:w-44">
        <img
          src={episode.thumbnailUrl}
          alt={episode.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
          <span className="flex h-8 w-8 scale-75 items-center justify-center rounded-full bg-white/90 opacity-0 shadow transition-all group-hover:scale-100 group-hover:opacity-100">
            <Play className="ml-0.5 h-3.5 w-3.5 fill-brand-600 text-brand-600" />
          </span>
        </div>
        <span className="absolute bottom-1 right-1 rounded bg-black/75 px-1 py-0.5 text-[10px] font-semibold text-white">
          {formatDuration(episode.durationSeconds)}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <span className={cn("badge mb-1.5", result.className)}>
          <ResultIcon className="h-3 w-3" />
          {result.label}
        </span>
        <h3 className="truncate font-display text-sm font-bold text-slate-900 group-hover:text-brand-700 sm:text-base">
          {episode.title}
        </h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {formatViews(episode.views)}
          </span>
          <span>{new Date(episode.publishedAt).toLocaleDateString("ko-KR")}</span>
        </div>
      </div>
    </motion.a>
  );
}
