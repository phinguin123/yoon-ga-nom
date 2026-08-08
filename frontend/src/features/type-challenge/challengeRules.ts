/**
 * Type challenge rules — edit this file to update what viewers see on the site.
 *
 * `variant: "special"` renders with a chromatic gradient for rules that are
 * unique to a specific series (e.g. banned Pokémon). Everything else uses
 * the default style.
 */

export interface ChallengeRule {
  text: string;
  variant?: "default" | "special";
}

/** Rules that apply to every type challenge series. */
export const GLOBAL_CHALLENGE_RULES: ChallengeRule[] = [
  { text: "토핑템 금지" },
  { text: "회복약, 풀회복약 금지" },
  { text: "죽으면 유기" },
  { text: "다시쓰기 없기" },
  { text: "이로치 포켓몬 이유불문 사용 가능 (가랴도스 x)" },
  { text: "전멸시 구독권인데 구독자는 햄버거" },
  { text: "레벨제한 - 네임드 +3 (유동적)" },
];

/**
 * Extra rules for a specific series, keyed by `ChallengeSeries.key` (the Pokémon type,
 * e.g. `"electric"`, `"ghost"`).
 * These are shown on that series' detail page, after the global rules.
 */
export const SERIES_CHALLENGE_RULES: Record<string, ChallengeRule[]> = {
  // Example — swap in a real type key:
  electric: [
    { text: "운명공동체룰 (삐죽귀피츄와 전룡(메리프, 보송송 포함) 중 하나가 기절한다면 기절한 포켓몬과 다른 포켓몬을 기절한 취급을 하며 (예외: 단 배틀이 틀중일시 그 배틀이 끝난 이후로 취급한다) 사용하지 못하는 룰", variant: "special" },
    { text: "조로룰", variant: "special" },
  ],
  ice: [
     { text: "꼭두까지 프레젠트로만 깨기", variant: "special" },
  ],
  rock: [
    { text: "조로룰 (도망치기 금지)", variant: "special" },
    { text: "꼭두까지 1마리로만 깨기", variant: "special" },
  ],
  fighting: [
    { text: "카포에라로 운명에 맡겨서 스탯확인 안하고 진화(삼대귀철룰)", variant: "special" },
    { text: "조로룰 (도망치기 금지)", variant: "special" },
  ],
  psychic: [
    { text: "조로룰 (도망치기 금지)", variant: "special" },
  ],
  ground: [
    { text: "좌살박도룰", variant: "special" },
    { text: "DMZ 조로룰 - 부우부피하기 트라이 4회당 버거 1개", variant: "special" },
  ],
  fire: [
    { text: "옥문강룰 - 브죠 사토루 엘리트 트레이너 동숙 앞에서 해방", variant: "special" },
    { text: "조로룰 (도망치기 금지)", variant: "special" },
  ],
};

export function getSeriesChallengeRules(seriesKey: string): ChallengeRule[] {
  return [...GLOBAL_CHALLENGE_RULES, ...(SERIES_CHALLENGE_RULES[seriesKey] ?? [])];
}
