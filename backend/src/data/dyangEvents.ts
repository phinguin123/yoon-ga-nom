import type { DyangEvent } from "../types/index.js";

const events: DyangEvent[] = [
  {
    id: "dy-1",
    type: "milestone",
    title: "첫 콜라보 방송",
    date: "2026-03-02",
    description: "포켓몬 랜덤 듀오 배틀로 처음 만난 두 사람.",
  },
  {
    id: "dy-2",
    type: "cute-moment",
    title: "실시간 채팅 케미 대폭발",
    date: "2026-05-20",
    description: "\"저희 이러다 진짜 사귀는 거 아니에요?\"",
  },
];

export function getAllDyangEvents(): DyangEvent[] {
  return events;
}
