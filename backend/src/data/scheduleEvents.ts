import type { ScheduleEvent } from "../types/index.js";

const events: ScheduleEvent[] = [
  {
    id: "ev-1",
    title: "고스트 타입 챌린지 방송",
    type: "stream",
    start: "2026-08-05T20:00:00+09:00",
    description: "8체육관 고스트 타입 단일 클리어 도전",
  },
  {
    id: "ev-2",
    title: "댱과 함께하는 더블배틀 콜라보",
    type: "collab",
    start: "2026-08-08T19:00:00+09:00",
    end: "2026-08-08T22:00:00+09:00",
    isPinned: true,
  },
];

export function getAllEvents(): ScheduleEvent[] {
  return events;
}
