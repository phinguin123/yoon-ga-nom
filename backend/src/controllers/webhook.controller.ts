import type { Request, Response } from "express";
import { deleteUserByKakaoId } from "../data/users.js";
import {
  isKakaoWebhookConfigured,
  isUnlinkEvent,
  parseKakaoWebhookRequest,
  verifyKakaoAdminKey,
} from "../services/kakaoWebhook.service.js";

/**
 * POST /api/webhook/kakao
 *
 * Handles Kakao "User Unlinked" webhooks for privacy compliance.
 * Kakao requires a 200 OK within 3 seconds — no response body is needed.
 */
export async function kakaoWebhookHandler(req: Request, res: Response) {
  if (!isKakaoWebhookConfigured()) {
    console.error("Kakao webhook received but KAKAO_ADMIN_KEY is not configured.");
    res.status(503).end();
    return;
  }

  if (!verifyKakaoAdminKey(req.headers.authorization)) {
    res.status(401).end();
    return;
  }

  const event = parseKakaoWebhookRequest(req);
  if (!event) {
    // Kakao asks services to return 200 even when the user is not found;
    // treat unparseable payloads the same way and log internally.
    console.warn("Kakao webhook: could not parse event payload.", {
      contentType: req.headers["content-type"],
    });
    res.status(200).end();
    return;
  }

  if (isUnlinkEvent(event.eventType)) {
    const deleted = deleteUserByKakaoId(event.kakaoUserId);
    if (deleted) {
      console.info("Kakao unlink webhook: deleted user.", {
        kakaoUserId: event.kakaoUserId,
        reason: event.reason,
        appId: event.appId,
      });
    } else {
      console.info("Kakao unlink webhook: user not found (already deleted?).", {
        kakaoUserId: event.kakaoUserId,
        reason: event.reason,
      });
    }
  }

  res.status(200).end();
}
