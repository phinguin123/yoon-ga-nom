import { useCallback } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useLoginPromptStore } from "../store/useLoginPromptStore";

/**
 * Gate for actions that need a logged-in fan (liking a drip, commenting...).
 * If the user is authenticated, runs `action` immediately; otherwise opens
 * the global "로그인이 필요해요" dialog and skips it.
 *
 * @example
 * const requireAuth = useRequireAuth();
 * const handleLike = () => requireAuth(() => like(drip.id));
 */
export function useRequireAuth() {
  const isAuthenticated = useAuthStore((state) => state.status === "authenticated");
  const openLoginPrompt = useLoginPromptStore((state) => state.open);

  return useCallback(
    (action: () => void) => {
      if (!isAuthenticated) {
        openLoginPrompt();
        return false;
      }
      action();
      return true;
    },
    [isAuthenticated, openLoginPrompt],
  );
}
