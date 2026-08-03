import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAdminSession, loginAdmin, logoutAdmin } from "../api";

export const ADMIN_SESSION_QUERY_KEY = ["admin-session"];

export function useAdminSession() {
  return useQuery({
    queryKey: ADMIN_SESSION_QUERY_KEY,
    queryFn: fetchAdminSession,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: loginAdmin,
    onSuccess: () => {
      queryClient.setQueryData(ADMIN_SESSION_QUERY_KEY, true);
    },
  });
}

export function useAdminLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logoutAdmin,
    onSuccess: () => {
      queryClient.setQueryData(ADMIN_SESSION_QUERY_KEY, false);
    },
  });
}
