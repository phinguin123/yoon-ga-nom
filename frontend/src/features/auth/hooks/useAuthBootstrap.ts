import { useEffect } from "react";
import { refreshSession } from "../api";
import { useAuthStore } from "../store/useAuthStore";

/**
 * Runs once on app load to silently restore a session from the HttpOnly
 * refresh cookie, so a page refresh doesn't log fans out. Mounted once in
 * `MainLayout`. Failure just means "not logged in" — never surfaced as an error.
 */
export function useAuthBootstrap() {
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    let cancelled = false;

    refreshSession()
      .then((session) => {
        if (!cancelled) setSession(session.accessToken, session.user);
      })
      .catch(() => {
        if (!cancelled) clearSession();
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
