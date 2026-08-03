import axios from "axios";
import { api } from "@/lib/api";
import type { ChallengeSeries } from "@/types";

/**
 * All aggregation (episode grouping, total views, latest upload date) is
 * computed server-side in `backend/src/lib/groupSeries.ts` from data that's
 * enriched with live YouTube stats when `YOUTUBE_API_KEY` is configured —
 * the frontend just renders whatever the API returns.
 */
export async function fetchChallengeSeriesList(): Promise<ChallengeSeries[]> {
  const { data } = await api.get<{ data: ChallengeSeries[] }>("/type-challenge/series");
  return data.data;
}

export async function fetchChallengeSeriesByKey(key: string): Promise<ChallengeSeries | null> {
  try {
    const { data } = await api.get<{ data: ChallengeSeries }>(`/type-challenge/series/${key}`);
    return data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) return null;
    throw error;
  }
}
