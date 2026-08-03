import type { TypeChallengeVideo } from "../types/index.js";

/**
 * In-memory placeholder store. Swap this module for a real database
 * (Postgres/Prisma, MongoDB, etc.) once persistence is needed — the
 * controller layer only depends on the exported functions below, not
 * on how the data is stored.
 */
const videos: TypeChallengeVideo[] = [
  {
    id: "tc-1",
    title: "고스트 타입만으로 8체육관 클리어 가능?!",
    youtubeId: "dQw4w9WgXcQ",
    thumbnailUrl: "https://placehold.co/640x360/1c5cf5/white?text=Ghost+Type",
    types: ["ghost"],
    result: "clear",
    durationSeconds: 5423,
    publishedAt: "2026-06-12",
    views: 182000,
    tags: ["챌린지", "고스트", "풀클리어"],
  },
  {
    id: "tc-2",
    title: "불꽃 타입 vs 물 체육관장.. 이길 수 있을까",
    youtubeId: "dQw4w9WgXcQ",
    thumbnailUrl: "https://placehold.co/640x360/ff9d1f/white?text=Fire+Type",
    types: ["fire"],
    result: "fail",
    durationSeconds: 3311,
    publishedAt: "2026-05-28",
    views: 97400,
    tags: ["챌린지", "불꽃"],
  },
  {
    id: "tc-3",
    title: "드래곤+얼음 듀얼 타입 챌린지 (역대급 난이도)",
    youtubeId: "dQw4w9WgXcQ",
    thumbnailUrl: "https://placehold.co/640x360/59a3ff/white?text=Dragon+Ice",
    types: ["dragon", "ice"],
    result: "in-progress",
    durationSeconds: 4820,
    publishedAt: "2026-07-02",
    views: 64200,
    tags: ["챌린지", "드래곤", "얼음"],
  },
];

export function getAllVideos(): TypeChallengeVideo[] {
  return videos;
}

export function getVideoById(id: string): TypeChallengeVideo | undefined {
  return videos.find((v) => v.id === id);
}
