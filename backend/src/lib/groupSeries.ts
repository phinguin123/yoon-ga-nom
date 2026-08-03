import type { ChallengeSeries, TypeChallengeVideo } from "../types/index.js";

/** Mirrors `frontend/src/features/type-challenge` grouping conventions. */
export function groupVideosBySeries(videos: TypeChallengeVideo[]): ChallengeSeries[] {
  const groups = new Map<string, TypeChallengeVideo[]>();

  for (const video of videos) {
    groups.set(video.type, [...(groups.get(video.type) ?? []), video]);
  }

  return Array.from(groups.entries()).map(([key, episodes]) => {
    const sorted = [...episodes].sort((a, b) => a.episodeNumber - b.episodeNumber);
    const latest = sorted[sorted.length - 1];

    return {
      key,
      type: latest.type,
      seriesTitle: latest.seriesTitle,
      status: latest.seriesStatus,
      episodes: sorted,
      episodeCount: sorted.length,
      totalViews: sorted.reduce((sum, ep) => sum + ep.views, 0),
      latestPublishedAt: latest.publishedAt,
      finalResult: latest.seriesStatus === "completed" ? latest.result : null,
    } satisfies ChallengeSeries;
  });
}
