import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const TOKEN_TTL = "12h";
export const ADMIN_COOKIE_NAME = "yoon_admin_session";
export const ADMIN_COOKIE_MAX_AGE_MS = 12 * 60 * 60 * 1000; // keep in sync with TOKEN_TTL

interface AdminTokenPayload {
  role: "admin";
}

export function isAuthConfigured(): boolean {
  return Boolean(env.adminPasswordHash && env.jwtSecret);
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (!env.adminPasswordHash) return false;
  return bcrypt.compare(password, env.adminPasswordHash);
}

export function signAdminToken(): string {
  if (!env.jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }
  const payload: AdminTokenPayload = { role: "admin" };
  return jwt.sign(payload, env.jwtSecret, { expiresIn: TOKEN_TTL });
}

export function verifyAdminToken(token: string): boolean {
  if (!env.jwtSecret) return false;
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as AdminTokenPayload;
    return decoded.role === "admin";
  } catch {
    return false;
  }
}
