import axios from "axios";
import { env } from "../config/env.js";
import { HttpError } from "../lib/response.js";

const KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token";
const KAKAO_USER_INFO_URL = "https://kapi.kakao.com/v2/user/me";

interface KakaoTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
}

interface KakaoUserResponse {
  id: number;
  kakao_account?: {
    profile?: {
      nickname?: string;
      profile_image_url?: string;
      thumbnail_image_url?: string;
    };
  };
  properties?: {
    nickname?: string;
    profile_image?: string;
    thumbnail_image?: string;
  };
}

export interface KakaoProfile {
  kakaoId: string;
  nickname: string;
  profileImage: string | null;
}

export function isKakaoConfigured(): boolean {
  return Boolean(env.kakaoClientId && env.kakaoRedirectUri);
}

/**
 * Exchanges the frontend's OAuth `authorization_code` for a Kakao access
 * token. This token is used *only* for the single profile lookup below and
 * is discarded immediately after — it is never persisted or handed back to
 * the client. Our own JWTs (see userAuth.service.ts) are what the frontend
 * actually uses for every request after login.
 */
async function exchangeCodeForKakaoAccessToken(code: string, redirectUri?: string): Promise<string> {
  if (!env.kakaoClientId) {
    throw new HttpError(
      503,
      "카카오 로그인이 설정되지 않았습니다. KAKAO_CLIENT_ID를 backend/.env에 설정해주세요.",
    );
  }

  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: env.kakaoClientId,
    redirect_uri: redirectUri ?? env.kakaoRedirectUri ?? "",
    code,
  });
  if (env.kakaoClientSecret) {
    params.set("client_secret", env.kakaoClientSecret);
  }

  try {
    const { data } = await axios.post<KakaoTokenResponse>(KAKAO_TOKEN_URL, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
    });
    return data.access_token;
  } catch (error) {
    console.error(
      "[kakao] Token exchange failed:",
      axios.isAxiosError(error) ? error.response?.data : error,
    );
    throw new HttpError(401, "카카오 인증 코드가 유효하지 않거나 만료되었습니다.");
  }
}

async function fetchKakaoProfile(kakaoAccessToken: string): Promise<KakaoProfile> {
  try {
    const { data } = await axios.get<KakaoUserResponse>(KAKAO_USER_INFO_URL, {
      headers: { Authorization: `Bearer ${kakaoAccessToken}` },
    });

    const nickname = data.kakao_account?.profile?.nickname ?? data.properties?.nickname ?? "카카오 사용자";
    const profileImage =
      data.kakao_account?.profile?.profile_image_url ?? data.properties?.profile_image ?? null;

    return { kakaoId: String(data.id), nickname, profileImage };
  } catch (error) {
    console.error(
      "[kakao] Profile fetch failed:",
      axios.isAxiosError(error) ? error.response?.data : error,
    );
    throw new HttpError(502, "카카오 프로필 조회에 실패했습니다.");
  }
}

/**
 * Full handshake used by POST /api/auth/kakao: authorization code -> Kakao
 * access token -> Kakao profile. `redirectUri` must match whatever the
 * frontend used to obtain `code` (Kakao validates this server-side).
 */
export async function authenticateWithKakao(code: string, redirectUri?: string): Promise<KakaoProfile> {
  const kakaoAccessToken = await exchangeCodeForKakaoAccessToken(code, redirectUri);
  return fetchKakaoProfile(kakaoAccessToken);
}
