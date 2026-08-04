import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import type { User } from "../types/index.js";

// ACCESS_TOKEN_TTL/REFRESH_TOKEN_TTL come from .env as plain strings (e.g.
// "2h", "14d") — jsonwebtoken's types want its own branded `StringValue`,
// so this narrows the env value down to what `expiresIn` actually accepts.
type ExpiresIn = SignOptions["expiresIn"];

/** HttpOnly cookie carrying the refresh token. Separate from the admin session cookie (see services/auth.service.ts). */
export const REFRESH_COOKIE_NAME = "yoon_refresh_token";
// Keep in sync with REFRESH_TOKEN_TTL — the JWT's own `exp` is the real
// enforcement, this only controls how long the browser retains the cookie.
export const REFRESH_COOKIE_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

export interface AccessTokenPayload {
  sub: number;
  kakaoId: string;
  nickname: string;
  role: User["role"];
}

interface RefreshTokenPayload {
  sub: number;
}

export function isUserAuthConfigured(): boolean {
  return Boolean(env.jwtAccessSecret && env.jwtRefreshSecret);
}

function requireSecret(secret: string | undefined, name: string): string {
  if (!secret) {
    throw new Error(`${name} is not configured`);
  }
  return secret;
}

/** Short-lived (default 2h) — sent back in the JSON body, kept in memory on the client, never persisted to a cookie. */
export function signAccessToken(user: User): string {
  const secret = requireSecret(env.jwtAccessSecret, "JWT_ACCESS_SECRET");
  const payload: AccessTokenPayload = {
    sub: user.id,
    kakaoId: user.kakaoId,
    nickname: user.nickname,
    role: user.role,
  };
  return jwt.sign(payload, secret, { expiresIn: env.accessTokenTtl as ExpiresIn });
}

/** Long-lived (default 14d) — only ever travels as an HttpOnly/Secure/SameSite=Strict cookie, never exposed to JS. */
export function signRefreshToken(user: User): string {
  const secret = requireSecret(env.jwtRefreshSecret, "JWT_REFRESH_SECRET");
  const payload: RefreshTokenPayload = { sub: user.id };
  return jwt.sign(payload, secret, { expiresIn: env.refreshTokenTtl as ExpiresIn });
}

/** Throws if the token is missing, malformed, expired, or signed with the wrong secret. */
export function verifyAccessToken(token: string): AccessTokenPayload {
  const secret = requireSecret(env.jwtAccessSecret, "JWT_ACCESS_SECRET");
  return jwt.verify(token, secret) as unknown as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const secret = requireSecret(env.jwtRefreshSecret, "JWT_REFRESH_SECRET");
  return jwt.verify(token, secret) as unknown as RefreshTokenPayload;
}
