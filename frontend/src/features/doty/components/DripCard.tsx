import { useState } from "react";
import toast from "react-hot-toast";
import type { Drip, DripSort, DripYearFilter } from "@/types";
import { formatDuration } from "@/lib/utils";
import { useRequireAuth } from "@/features/auth/hooks/useRequireAuth";
import { useLikeDrip } from "../hooks/useDrips";
import { buildYoutubeEmbedUrl } from "../utils/youtube";

const MEDALS: Record<number, { bg: string; color: string }> = {
  1: { bg: "#f5c542", color: "#3d2c00" },
  2: { bg: "#d0d0d0", color: "#2a2a2a" },
  3: { bg: "#d4956a", color: "#2e1200" },
};

function RankBadge({ rank }: { rank: number }) {
  const medal = MEDALS[rank];
  return (
    <div
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
      style={medal ? { background: medal.bg, color: medal.color } : { background: "rgba(0,0,0,0.07)", color: "#6e6e73" }}
    >
      {rank}
    </div>
  );
}

interface DripCardProps {
  drip: Drip;
  sort: DripSort;
  year: DripYearFilter;
  showYear: boolean;
  rank: number;
}

export function DripCard({ drip, sort, year, showYear, rank }: DripCardProps) {
  const { mutate: like, isPending } = useLikeDrip(sort, year);
  const [liked, setLiked] = useState(false);
  const [playing, setPlaying] = useState(false);
  const requireAuth = useRequireAuth();

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    requireAuth(() => {
      if (isPending) return;
      setLiked(true);
      like(drip.id);
    });
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    requireAuth(() => {
      toast("댓글 기능은 곧 만나요! 🚧");
    });
  };

  const formattedDate = new Date(drip.publishedAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.09)]"
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      {/* Video area */}
      <div className="relative bg-black" style={{ aspectRatio: "16/9" }}>
        {playing ? (
          <iframe
            src={buildYoutubeEmbedUrl(drip.youtubeVideoId, drip.timestamp, true)}
            title={drip.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="absolute inset-0 h-full w-full cursor-pointer"
            aria-label={`${drip.title} 재생`}
          >
            {drip.thumbnailUrl && (
              <img
                src={drip.thumbnailUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.15)" }}
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full backdrop-blur-md"
                style={{ background: "rgba(255,255,255,0.88)" }}
              >
                <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
                  <path d="M2 1.5L16 10L2 18.5V1.5Z" fill="#1d1d1f" />
                </svg>
              </div>
            </div>

            {/* Duration pill */}
            {drip.durationSeconds > 0 && (
              <div
                className="absolute bottom-3 right-3 rounded-md px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md"
                style={{ background: "rgba(0,0,0,0.55)" }}
              >
                {formatDuration(drip.durationSeconds)}
              </div>
            )}
          </button>
        )}
      </div>

      {/* Meta */}
      <div className="px-4 py-4 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {sort === "likes" && <RankBadge rank={rank} />}
            <h3 className="text-[14px] font-semibold leading-snug tracking-tight text-[#1d1d1f]">
              {drip.title}
            </h3>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] text-[#86868b]">{formattedDate}</span>
            {showYear && (
              <span className="rounded-full bg-[#f5f5f7] px-2 py-0.5 text-[11px] font-medium text-[#6e6e73]">
                {new Date(drip.publishedAt).getFullYear()}년
              </span>
            )}
            {drip.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#f5f5f7] px-2 py-0.5 text-[11px] font-medium text-[#6e6e73]"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCommentClick}
              className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] text-[#86868b] transition-colors duration-150 hover:text-[#1d1d1f]"
              aria-label={`${drip.title} 댓글`}
            >
              💬 {drip.comments.toLocaleString()}
            </button>
            <button
              type="button"
              onClick={handleLike}
              disabled={isPending}
              className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-medium transition-all duration-150 disabled:cursor-not-allowed"
              style={{
                background: liked ? "rgba(255,45,85,0.08)" : "transparent",
                color: liked ? "#ff2d55" : "#86868b",
              }}
              aria-label={`${drip.title} 좋아요`}
            >
              <span style={{ fontSize: 13 }}>{liked ? "♥" : "♡"}</span>
              {drip.likes.toLocaleString()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
