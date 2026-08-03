import type { RoulettePreset } from "../types/index.js";

const presets: RoulettePreset[] = [
  {
    id: "starter-pokemon",
    name: "스타팅 포켓몬 뽑기",
    description: "이번 챌린지에 쓸 스타팅을 랜덤으로 결정해요",
    options: [
      { id: "1", label: "이상해씨" },
      { id: "2", label: "파이리" },
      { id: "3", label: "꼬부기" },
    ],
  },
  {
    id: "punishment",
    name: "벌칙 룰렛",
    description: "챌린지 실패 시 받을 벌칙",
    options: [
      { id: "1", label: "성대모사" },
      { id: "2", label: "노래 한 소절" },
      { id: "3", label: "10분 정지짤" },
    ],
  },
];

export function getAllPresets(): RoulettePreset[] {
  return presets;
}

export function getPresetById(id: string): RoulettePreset | undefined {
  return presets.find((p) => p.id === id);
}
