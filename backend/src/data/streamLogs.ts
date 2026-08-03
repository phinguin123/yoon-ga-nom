import type { StreamLog } from "../types/index.js";

const logs: StreamLog[] = [
  {
    id: "log-1",
    streamTitle: "고스트 타입 챌린지 방송",
    streamDate: "2026-07-28",
    coverImageUrl: "https://placehold.co/640x360/1c5cf5/white?text=2026.07.28",
    vodUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
    entries: [
      { id: "e1", timestampSeconds: 305, label: "방송 시작, 오늘의 챌린지 룰 설명" },
      {
        id: "e2",
        timestampSeconds: 1820,
        label: "겐가 vs 체육관장 첫 대결",
        quote: "이거 못 이기면 저 오늘 방송 접습니다",
      },
    ],
  },
];

export function getAllLogs(): StreamLog[] {
  return logs;
}

export function getLogById(id: string): StreamLog | undefined {
  return logs.find((l) => l.id === id);
}
