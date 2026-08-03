import type { StreamLog } from "@/types";

export const MOCK_STREAM_LOGS: StreamLog[] = [
  {
    id: "log-1",
    streamTitle: "고스트 타입 챌린지 방송",
    streamDate: "2026-07-28",
    coverImageUrl: "https://placehold.co/640x360/1c5cf5/white?text=2026.07.28",
    vodUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
    entries: [
      { id: "e1", timestampSeconds: 305, label: "방송 시작, 오늘의 챌린지 룰 설명", tags: ["설명"] },
      {
        id: "e2",
        timestampSeconds: 1820,
        label: "겐가 vs 체육관장 첫 대결",
        quote: "이거 못 이기면 저 오늘 방송 접습니다",
        screenshotUrl: "https://placehold.co/480x270/8ec4ff/1b378a?text=Clip+1",
        tags: ["명대사", "긴장"],
      },
      {
        id: "e3",
        timestampSeconds: 3120,
        label: "역전승! 채팅 폭발",
        quote: "미쳤다 진짜 미쳤다ㅋㅋㅋㅋㅋ",
        screenshotUrl: "https://placehold.co/480x270/59a3ff/142254?text=Clip+2",
        tags: ["하이라이트", "웃음"],
      },
      { id: "e4", timestampSeconds: 4900, label: "챌린지 클리어, 다음 예고", tags: ["클리어"] },
    ],
  },
  {
    id: "log-2",
    streamTitle: "댱과 함께 더블배틀 콜라보",
    streamDate: "2026-07-15",
    coverImageUrl: "https://placehold.co/640x360/fb4d8b/white?text=2026.07.15",
    entries: [
      {
        id: "e1",
        timestampSeconds: 210,
        label: "댱 입장, 인사 나누기",
        quote: "오랜만이에요! 오늘 잘 부탁드려요",
        tags: ["콜라보"],
      },
      {
        id: "e2",
        timestampSeconds: 2650,
        label: "티키타카 케미 폭발 구간",
        quote: "저희 이러다 진짜 사귀는 거 아니에요?",
        screenshotUrl: "https://placehold.co/480x270/ffc9de/911a46?text=Cute+Moment",
        tags: ["케미", "설렘"],
      },
    ],
  },
];
