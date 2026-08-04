import { api } from "@/lib/api";
import type { AuthUser } from "@/types";

const KAKAO_AUTHORIZE_URL = "https://kauth.kakao.com/oauth/authorize";

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}

/** Builds the URL that kicks off the Kakao Login redirect flow (see `pages/LoginPage.tsx`). */
export function getKakaoAuthorizeUrl(): string {
  const clientId = import.meta.env.VITE_KAKAO_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_KAKAO_REDIRECT_URI ?? `${window.location.origin}/auth/kakao/callback`;

  const params = new URLSearchParams({
    client_id: clientId ?? "",
    redirect_uri: redirectUri,
    response_type: "code",
  });
  return `${KAKAO_AUTHORIZE_URL}?${params.toString()}`;
}

/** POST /api/auth/kakao — trades the authorization_code from the Kakao redirect for our own session. */
export async function loginWithKakao(code: string): Promise<AuthSession> {
  const redirectUri = import.meta.env.VITE_KAKAO_REDIRECT_URI ?? `${window.location.origin}/auth/kakao/callback`;
  const { data } = await api.post<{ data: AuthSession }>("/auth/kakao", { code, redirectUri });
  return data.data;
}

/** POST /api/auth/refresh — silently restores a session from the HttpOnly refresh cookie (called on app load). */
export async function refreshSession(): Promise<AuthSession> {
  const { data } = await api.post<{ data: AuthSession }>("/auth/refresh");
  return data.data;
}

export async function logoutUser(): Promise<void> {
  await api.post("/auth/logout");
}
