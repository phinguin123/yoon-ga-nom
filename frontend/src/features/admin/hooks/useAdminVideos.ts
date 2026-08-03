import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminVideo,
  deleteAdminVideo,
  fetchAdminVideos,
  updateAdminVideo,
  type EpisodeInput,
} from "../api";

const ADMIN_VIDEOS_QUERY_KEY = ["admin-videos"];

function useInvalidateAfterMutation() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ADMIN_VIDEOS_QUERY_KEY });
    // The public type-challenge pages read from the same underlying data.
    queryClient.invalidateQueries({ queryKey: ["type-challenge-series"] });
  };
}

export function useAdminVideos() {
  return useQuery({
    queryKey: ADMIN_VIDEOS_QUERY_KEY,
    queryFn: fetchAdminVideos,
  });
}

export function useCreateAdminVideo() {
  const invalidate = useInvalidateAfterMutation();
  return useMutation({
    mutationFn: (input: EpisodeInput) => createAdminVideo(input),
    onSuccess: invalidate,
  });
}

export function useUpdateAdminVideo() {
  const invalidate = useInvalidateAfterMutation();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: EpisodeInput }) => updateAdminVideo(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteAdminVideo() {
  const invalidate = useInvalidateAfterMutation();
  return useMutation({
    mutationFn: (id: string) => deleteAdminVideo(id),
    onSuccess: invalidate,
  });
}
