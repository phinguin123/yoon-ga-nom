import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminVod,
  createAdminVodCategory,
  deleteAdminVod,
  deleteAdminVodCategory,
  fetchAdminVodCategories,
  fetchAdminVods,
  fetchChzzkChannelVideos,
  lookupChzzkVideo,
  refreshAdminVod,
  updateAdminVod,
  updateAdminVodCategory,
  type VodInput,
} from "../api";

const ADMIN_VODS_QUERY_KEY = ["admin-vods"];
const ADMIN_VOD_CATEGORIES_QUERY_KEY = ["admin-vod-categories"];

function useInvalidateAfterVodMutation() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ADMIN_VODS_QUERY_KEY });
}

function useInvalidateAfterCategoryMutation() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ADMIN_VOD_CATEGORIES_QUERY_KEY });
    // Vods embed their category, but nothing else needs to change client-side on rename/delete.
    queryClient.invalidateQueries({ queryKey: ADMIN_VODS_QUERY_KEY });
  };
}

export function useAdminVods() {
  return useQuery({ queryKey: ADMIN_VODS_QUERY_KEY, queryFn: fetchAdminVods });
}

export function useCreateAdminVod() {
  const invalidate = useInvalidateAfterVodMutation();
  return useMutation({
    mutationFn: (input: VodInput) => createAdminVod(input),
    onSuccess: invalidate,
  });
}

export function useUpdateAdminVod() {
  const invalidate = useInvalidateAfterVodMutation();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: VodInput }) => updateAdminVod(id, input),
    onSuccess: invalidate,
  });
}

export function useRefreshAdminVod() {
  const invalidate = useInvalidateAfterVodMutation();
  return useMutation({
    mutationFn: (id: number) => refreshAdminVod(id),
    onSuccess: invalidate,
  });
}

export function useDeleteAdminVod() {
  const invalidate = useInvalidateAfterVodMutation();
  return useMutation({
    mutationFn: (id: number) => deleteAdminVod(id),
    onSuccess: invalidate,
  });
}

export function useAdminVodCategories() {
  return useQuery({ queryKey: ADMIN_VOD_CATEGORIES_QUERY_KEY, queryFn: fetchAdminVodCategories });
}

export function useCreateAdminVodCategory() {
  const invalidate = useInvalidateAfterCategoryMutation();
  return useMutation({
    mutationFn: (name: string) => createAdminVodCategory(name),
    onSuccess: invalidate,
  });
}

export function useUpdateAdminVodCategory() {
  const invalidate = useInvalidateAfterCategoryMutation();
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => updateAdminVodCategory(id, name),
    onSuccess: invalidate,
  });
}

export function useDeleteAdminVodCategory() {
  const invalidate = useInvalidateAfterCategoryMutation();
  return useMutation({
    mutationFn: (id: number) => deleteAdminVodCategory(id),
    onSuccess: invalidate,
  });
}

/** Manual trigger (not a `useQuery`) since it runs on-demand as the admin types/pastes an ID, not on mount. */
export function useLookupChzzkVideo() {
  return useMutation({ mutationFn: (query: string) => lookupChzzkVideo(query) });
}

export function useChzzkChannelVideos(page: number, enabled: boolean) {
  return useQuery({
    queryKey: ["chzzk-channel-videos", page],
    queryFn: () => fetchChzzkChannelVideos(page),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
