import { create } from "zustand";
import type { AuthUser } from "@/types";

type AuthStatus = "checking" | "authenticated" | "unauthenticated";

interface AuthState {
  /** Kept in memory only (never localStorage) — a page refresh re-derives it via /api/auth/refresh. */
  accessToken: string | null;
  user: AuthUser | null;
  status: AuthStatus;
  setSession: (accessToken: string, user: AuthUser) => void;
  clearSession: () => void;
  setStatus: (status: AuthStatus) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  status: "checking",
  setSession: (accessToken, user) => set({ accessToken, user, status: "authenticated" }),
  clearSession: () => set({ accessToken: null, user: null, status: "unauthenticated" }),
  setStatus: (status) => set({ status }),
}));

export function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}
