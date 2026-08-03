import type { ScheduleEvent } from "@/types";

export const MOCK_SCHEDULE_EVENTS: ScheduleEvent[] = [
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
    description: "댱 채널과 동시 송출 예정",
    isPinned: true,
  },
  {
    id: "ev-3",
    title: "채널 20만 구독자 기념 이벤트",
    type: "event",
    start: "2026-08-15T00:00:00+09:00",
    description: "구독자 이벤트 상세 공지는 추후 업데이트",
    isPinned: true,
  },
  {
    id: "ev-4",
    title: "다음 주 스케줄 관련 공지",
    type: "notice",
    start: "2026-08-03T12:00:00+09:00",
    description: "8/10~8/16 은 개인 사정으로 방송 횟수가 줄어들 수 있어요.",
  },
  {
    id: "ev-5",
    title: "전기 타입 챌린지 방송",
    type: "stream",
    start: "2026-08-12T20:00:00+09:00",
  },
  {
    id: "ev-6",
    title: "구독자 랜덤 듀오 방송",
    type: "stream",
    start: "2026-08-19T21:00:00+09:00",
  },
];
