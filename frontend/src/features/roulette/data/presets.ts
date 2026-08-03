import type { RoulettePreset } from "@/types";

const WHEEL_COLORS = [
  "#327dff", "#59a3ff", "#1c5cf5", "#8ec4ff",
  "#ff9d1f", "#ffb84d", "#1747d6", "#bcdcff",
];

function withColors(options: { id: string; label: string }[]): RoulettePreset["options"] {
  return options.map((opt, i) => ({ ...opt, color: WHEEL_COLORS[i % WHEEL_COLORS.length] }));
}

export const ROULETTE_PRESETS: RoulettePreset[] = [
  {
    id: "starter-pokemon",
    name: "스타팅 포켓몬 뽑기",
    description: "이번 챌린지에 쓸 스타팅을 랜덤으로 결정해요",
    options: withColors([
      { id: "1", label: "이상해씨" },
      { id: "2", label: "파이리" },
      { id: "3", label: "꼬부기" },
      { id: "4", label: "치코리타" },
      { id: "5", label: "브케인" },
      { id: "6", label: "리아코" },
    ]),
  },
  {
    id: "punishment",
    name: "벌칙 룰렛",
    description: "챌린지 실패 시 받을 벌칙",
    options: withColors([
      { id: "1", label: "성대모사" },
      { id: "2", label: "노래 한 소절" },
      { id: "3", label: "10분 정지짤" },
      { id: "4", label: "다음 방송 예고 없음" },
      { id: "5", label: "매운 음식 먹기" },
    ]),
  },
  {
    id: "gym-type",
    name: "다음 챌린지 타입 뽑기",
    description: "다음 방송에서 도전할 타입을 결정해요",
    options: withColors([
      { id: "1", label: "고스트" },
      { id: "2", label: "드래곤" },
      { id: "3", label: "강철" },
      { id: "4", label: "페어리" },
      { id: "5", label: "악" },
      { id: "6", label: "얼음" },
      { id: "7", label: "격투" },
    ]),
  },
];
