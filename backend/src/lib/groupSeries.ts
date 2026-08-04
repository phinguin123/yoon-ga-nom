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
    // Series completion is determined by the latest episode only — earlier
    // episodes stay "in-progress" even after the run finishes. Ignore
    // seriesStatus here; admins sometimes set it to "completed" prematurely.
    const status: ChallengeSeries["status"] =
      latest.result === "clear" ? "completed" : "ongoing";

    return {
      key,
      type: latest.type,
      seriesTitle: latest.seriesTitle,
      status,
      episodes: sorted,
      episodeCount: sorted.length,
      totalViews: sorted.reduce((sum, ep) => sum + ep.views, 0),
      latestPublishedAt: latest.publishedAt,
      finalResult: latest.result === "clear" ? "clear" : null,
    } satisfies ChallengeSeries;
  });
}
