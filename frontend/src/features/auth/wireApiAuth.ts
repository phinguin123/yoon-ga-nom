import { configureAuthInterceptor } from "@/lib/api";
import { refreshSession } from "./api";
import { useAuthStore } from "./store/useAuthStore";

/**
 * Wires the auth store into the shared axios instance's interceptors
 * (attach bearer token, silent-refresh on 401). Imported once for its
 * side effect in `main.tsx`, before the app renders.
 */
configureAuthInterceptor({
  getAccessToken: () => useAuthStore.getState().accessToken,
  refreshAccessToken: async () => {
    const session = await refreshSession();
    useAuthStore.getState().setSession(session.accessToken, session.user);
    return session.accessToken;
  },
  onUnauthorized: () => {
    useAuthStore.getState().clearSession();
  },
});
