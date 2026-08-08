import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Eye, Film, CalendarClock } from "lucide-react";
import { useChallengeSeries } from "@/features/type-challenge/hooks/useChallengeSeries";
import { EpisodeRow } from "@/features/type-challenge/components/EpisodeRow";
import { ChallengeRules } from "@/features/type-challenge/components/ChallengeRules";
import { getSeriesChallengeRules } from "@/features/type-challenge/challengeRules";
import { POKEMON_TYPE_META } from "@/features/type-challenge/pokemonTypeMeta";
import { LoadingState, ErrorState } from "@/components/ui/QueryState";
import { formatViews } from "@/lib/utils";

export default function TypeChallengeSeriesPage() {
  const { seriesKey } = useParams<{ seriesKey: string }>();
  const { data: series, isLoading, isError, refetch } = useChallengeSeries(seriesKey);

  return (
    <div className="container-page py-10 sm:py-14">
      <Link
        to="/type-challenge"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" />
        전체 시리즈로 돌아가기
      </Link>

      {isLoading && <LoadingState label="시리즈를 불러오는 중..." />}
      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && !series && (
        <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-20 text-center">
          <p className="text-lg font-bold text-slate-700">시리즈를 찾을 수 없어요</p>
          <Link to="/type-challenge" className="btn-primary mt-4">
            전체 시리즈 보기
          </Link>
        </div>
      )}

      {series && (
        <>
          <div className="mt-6 flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:p-8">
            <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl sm:w-64">
              <img
                src={series.episodes[series.episodes.length - 1].thumbnailUrl}
                alt={series.seriesTitle}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <span
                className="badge mb-2 text-white"
                style={{ backgroundColor: POKEMON_TYPE_META[series.type].color }}
              >
                {POKEMON_TYPE_META[series.type].label}
              </span>
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                {series.seriesTitle}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Film className="h-4 w-4 text-brand-500" />총{" "}
                  <span className="font-bold text-slate-700">{series.episodeCount}개</span> 영상
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-brand-500" />
                  <span className="font-bold text-slate-700">{formatViews(series.totalViews)}</span>{" "}
                  누적 조회수
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarClock className="h-4 w-4 text-brand-500" />
                  최신 업로드{" "}
                  <span className="font-bold text-slate-700">
                    {new Date(series.latestPublishedAt).toLocaleDateString("ko-KR")}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <ChallengeRules rules={getSeriesChallengeRules(series.key)} className="mt-6" />

          <h2 className="mb-4 mt-10 font-display text-lg font-bold text-slate-900">
            전체 에피소드 ({series.episodeCount})
          </h2>
          <div className="space-y-3">
            {series.episodes.map((episode, i) => (
              <EpisodeRow key={episode.id} episode={episode} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
