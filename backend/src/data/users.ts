import { db } from "../db/client.js";
import type { User } from "../types/index.js";

interface UserRow {
  id: number;
  kakao_id: string;
  nickname: string;
  profile_image: string | null;
  role: "user" | "admin";
  created_at: string;
}

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    kakaoId: row.kakao_id,
    nickname: row.nickname,
    profileImage: row.profile_image,
    role: row.role,
    createdAt: row.created_at,
  };
}

export function findUserById(id: number): User | undefined {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
  return row ? rowToUser(row) : undefined;
}

export function findUserByKakaoId(kakaoId: string): User | undefined {
  const row = db.prepare("SELECT * FROM users WHERE kakao_id = ?").get(kakaoId) as UserRow | undefined;
  return row ? rowToUser(row) : undefined;
}

function createUser(input: { kakaoId: string; nickname: string; profileImage: string | null }): User {
  const result = db
    .prepare("INSERT INTO users (kakao_id, nickname, profile_image) VALUES (?, ?, ?)")
    .run(input.kakaoId, input.nickname, input.profileImage);
  return findUserById(Number(result.lastInsertRowid)) as User;
}

/** Keeps the cached nickname/avatar in sync with Kakao on every login, since fans can change either. */
function updateUserProfile(
  id: number,
  input: { nickname: string; profileImage: string | null },
): User {
  db.prepare("UPDATE users SET nickname = ?, profile_image = ? WHERE id = ?").run(
    input.nickname,
    input.profileImage,
    id,
  );
  return findUserById(id) as User;
}

/**
 * The core of the Kakao login flow (see controllers/userAuth.controller.ts):
 * sign up on first login, otherwise refresh the cached profile fields and
 * return the existing account untouched otherwise (id, role, created_at).
 */
/** Removes a fan account after Kakao sends an unlink webhook (privacy compliance). */
export function deleteUserByKakaoId(kakaoId: string): boolean {
  const result = db.prepare("DELETE FROM users WHERE kakao_id = ?").run(kakaoId);
  return result.changes > 0;
}

export function findOrCreateUserByKakaoProfile(profile: {
  kakaoId: string;
  nickname: string;
  profileImage: string | null;
}): User {
  const existing = findUserByKakaoId(profile.kakaoId);
  if (!existing) return createUser(profile);

  if (existing.nickname === profile.nickname && existing.profileImage === profile.profileImage) {
    return existing;
  }
  return updateUserProfile(existing.id, {
    nickname: profile.nickname,
    profileImage: profile.profileImage,
  });
}
