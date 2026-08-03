import type { DyangEvent } from "@/types";

export const MOCK_DYANG_EVENTS: DyangEvent[] = [
  {
    id: "dy-1",
    type: "milestone",
    title: "첫 콜라보 방송",
    date: "2026-03-02",
    description: "포켓몬 랜덤 듀오 배틀로 처음 만난 두 사람. 이때부터 케미가 심상치 않았다는 후문.",
    imageUrl: "https://placehold.co/640x400/ffe4ee/911a46?text=First+Collab",
  },
  {
    id: "dy-2",
    type: "sns-interaction",
    title: "댱의 트윗에 좋아요 & 댓글",
    date: "2026-04-11",
    description: "\"오늘 방송 잘 봤어요 ㅎㅎ\" — 팬들 사이에서 난리 난 훈훈한 댓글창.",
  },
  {
    id: "dy-3",
    type: "cute-moment",
    title: "실시간 채팅 케미 대폭발",
    date: "2026-05-20",
    description: "\"저희 이러다 진짜 사귀는 거 아니에요?\" 라이브 도중 나온 발언에 채팅 폭발.",
    imageUrl: "https://placehold.co/640x400/ffc9de/591028?text=Cute+Moment",
  },
  {
    id: "dy-4",
    type: "collab-stream",
    title: "더블배틀 콜라보 방송",
    date: "2026-07-15",
    description: "손발이 척척 맞는 환상의 듀오. 티키타카 케미로 시청자 만족도 최고 기록.",
    imageUrl: "https://placehold.co/640x400/ff70a4/ffffff?text=Double+Battle",
  },
  {
    id: "dy-5",
    type: "milestone",
    title: "\"저희 그냥 친한 사이 아니에요\" 발언",
    date: "2026-07-30",
    description: "은근슬쩍 흘러나온 한 마디에 팬들 심장 폭행. \"그 사이\"가 정확히 뭘까?",
  },
];
