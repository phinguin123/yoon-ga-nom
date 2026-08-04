import { useQuery } from "@tanstack/react-query";
import { fetchPokedex } from "./api";

/** The full Korean-localized pokedex — fetched once (see api.ts), then kept
 * around for the whole session since the dataset never changes at runtime. */
export function usePokedex() {
  return useQuery({
    queryKey: ["pokedex-ko"],
    queryFn: fetchPokedex,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
