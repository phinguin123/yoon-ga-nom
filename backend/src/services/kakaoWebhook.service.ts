import { timingSafeEqual } from "node:crypto";
import type { Request } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const USER_UNLINKED_SCHEMA = "https://schemas.openid.net/secevent/oauth/event-type/user-unlinked";

export interface KakaoWebhookEvent {
  eventType: string;
  kakaoUserId: string;
  reason?: string;
  appId?: string;
}

export function isKakaoWebhookConfigured(): boolean {
  return Boolean(env.kakaoAdminKey?.trim());
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

/** Kakao unlink webhooks authenticate with `Authorization: KakaoAK ${PRIMARY_ADMIN_KEY}`. */
export function verifyKakaoAdminKey(authHeader: string | undefined): boolean {
  const adminKey = env.kakaoAdminKey?.trim();
  if (!adminKey || typeof authHeader !== "string") return false;
  return safeEqual(authHeader, `KakaoAK ${adminKey}`);
}

function firstString(value: unknown): string | undefined {
  if (typeof value === "string" && value.length > 0) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].length > 0) {
    return value[0];
  }
  return undefined;
}

function parseSetEvents(
  events: Record<string, { subject?: { sub?: string }; reason?: string }>,
): KakaoWebhookEvent | undefined {
  for (const [schema, event] of Object.entries(events)) {
    if (!schema.includes("user-unlinked")) continue;
    const kakaoUserId = event.subject?.sub;
    if (!kakaoUserId) continue;
    return {
      eventType: schema,
      kakaoUserId,
      reason: event.reason,
    };
  }
  return undefined;
}

function parseSetJwtBody(body: string): KakaoWebhookEvent | undefined {
  const decoded = jwt.decode(body) as
    | { events?: Record<string, { subject?: { sub?: string }; reason?: string }> }
    | null;
  if (!decoded?.events) return undefined;
  return parseSetEvents(decoded.events);
}

function parseLegacyUnlinkPayload(req: Request): KakaoWebhookEvent | undefined {
  const userId = firstString(req.body?.user_id) ?? firstString(req.query.user_id);
  if (!userId) return undefined;

  return {
    eventType: USER_UNLINKED_SCHEMA,
    kakaoUserId: userId,
    reason: firstString(req.body?.referrer_type) ?? firstString(req.query.referrer_type),
    appId: firstString(req.body?.app_id) ?? firstString(req.query.app_id),
  };
}

/**
 * Supports Kakao's unlink webhook (form/query params) and account-status
 * change webhooks (SET JWT or decoded JSON `events` object).
 */
export function parseKakaoWebhookRequest(req: Request): KakaoWebhookEvent | undefined {
  if (typeof req.body === "string" && req.body.includes(".")) {
    const fromJwt = parseSetJwtBody(req.body);
    if (fromJwt) return fromJwt;
  }

  if (req.body?.events && typeof req.body.events === "object") {
    const fromEvents = parseSetEvents(req.body.events);
    if (fromEvents) return fromEvents;
  }

  return parseLegacyUnlinkPayload(req);
}

export function isUnlinkEvent(eventType: string): boolean {
  return eventType === "user-unlinked" || eventType.includes("user-unlinked");
}
