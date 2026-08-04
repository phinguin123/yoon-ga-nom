import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminDrip,
  deleteAdminDrip,
  fetchAdminDrips,
  updateAdminDrip,
  type DripInput,
} from "../api";

const ADMIN_DRIPS_QUERY_KEY = ["admin-drips"];

function useInvalidateAfterMutation() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ADMIN_DRIPS_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ["drips"] });
    queryClient.invalidateQueries({ queryKey: ["drip-years"] });
  };
}

export function useAdminDrips() {
  return useQuery({
    queryKey: ADMIN_DRIPS_QUERY_KEY,
    queryFn: fetchAdminDrips,
  });
}

export function useCreateAdminDrip() {
  const invalidate = useInvalidateAfterMutation();
  return useMutation({
    mutationFn: (input: DripInput) => createAdminDrip(input),
    onSuccess: invalidate,
  });
}

export function useUpdateAdminDrip() {
  const invalidate = useInvalidateAfterMutation();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: DripInput }) => updateAdminDrip(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteAdminDrip() {
  const invalidate = useInvalidateAfterMutation();
  return useMutation({
    mutationFn: (id: number) => deleteAdminDrip(id),
    onSuccess: invalidate,
  });
}
