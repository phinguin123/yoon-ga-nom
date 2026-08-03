import { Navigate, Outlet } from "react-router-dom";
import { LoadingState } from "@/components/ui/QueryState";
import { useAdminSession } from "../hooks/useAdminAuth";

/**
 * Client-side route guard for UX only — the real enforcement happens on the
 * backend, where every /api/admin/* route independently verifies the
 * session cookie via the `requireAdmin` middleware.
 */
export function RequireAdmin() {
  const { data: isAuthenticated, isLoading } = useAdminSession();

  if (isLoading) {
    return <LoadingState label="인증 확인 중..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
