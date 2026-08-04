import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Drip, DripSort, DripYearFilter } from "@/types";
import { fetchDripYears, fetchDrips, likeDrip } from "../api";

function dripsQueryKey(sort: DripSort, year: DripYearFilter) {
  return ["drips", sort, year] as const;
}

export function useDripYears() {
  return useQuery({
    queryKey: ["drip-years"],
    queryFn: fetchDripYears,
  });
}

export function useDrips(sort: DripSort, year: DripYearFilter) {
  return useQuery({
    queryKey: dripsQueryKey(sort, year),
    queryFn: () => fetchDrips(sort, year),
  });
}

export function useLikeDrip(sort: DripSort, year: DripYearFilter) {
  const queryClient = useQueryClient();
  const queryKey = dripsQueryKey(sort, year);

  return useMutation({
    mutationFn: likeDrip,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ["drips"] });

      const previous = queryClient.getQueryData<Drip[]>(queryKey);

      queryClient.setQueryData<Drip[]>(queryKey, (old) =>
        old?.map((drip) => (drip.id === id ? { ...drip, likes: drip.likes + 1 } : drip)),
      );

      return { previous, queryKey };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<Drip[]>(queryKey, (old) =>
        old?.map((drip) => (drip.id === updated.id ? updated : drip)),
      );
    },
  });
}
