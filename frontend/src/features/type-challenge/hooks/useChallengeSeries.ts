import { useQuery } from "@tanstack/react-query";
import { fetchChallengeSeriesByKey, fetchChallengeSeriesList } from "../api";

export function useChallengeSeriesList() {
  return useQuery({
    queryKey: ["type-challenge-series"],
    queryFn: fetchChallengeSeriesList,
  });
}

export function useChallengeSeries(key: string | undefined) {
  return useQuery({
    queryKey: ["type-challenge-series", key],
    queryFn: () => fetchChallengeSeriesByKey(key as string),
    enabled: Boolean(key),
  });
}
