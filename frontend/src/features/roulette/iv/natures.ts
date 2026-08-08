import { STAT_META, type StatKey } from "./stats";

/** Nature never touches HP — only the four battle stats besides HP + Speed. */
export type NatureStatKey = Exclude<StatKey, "hp">;

export interface Nature {
  id: number;
  nameKo: string;
  nameEn: string;
  increased: NatureStatKey | null;
  decreased: NatureStatKey | null;
}

/**
 * All 25 Pokémon natures, in the game's canonical internal order.
 * 20 of them boost one stat by 10% and cut another by 10%; the remaining
 * 5 (Hardy, Docile, Serious, Bashful, Quirky) have no effect at all.
 */
export const NATURES: Nature[] = [
  { id: 0, nameKo: "노력하는", nameEn: "Hardy", increased: null, decreased: null },
  { id: 1, nameKo: "외로움을 타는", nameEn: "Lonely", increased: "atk", decreased: "def" },
  { id: 2, nameKo: "용감한", nameEn: "Brave", increased: "atk", decreased: "spd" },
  { id: 3, nameKo: "고집스런", nameEn: "Adamant", increased: "atk", decreased: "spAtk" },
  { id: 4, nameKo: "개구쟁이같은", nameEn: "Naughty", increased: "atk", decreased: "spDef" },
  { id: 5, nameKo: "대담한", nameEn: "Bold", increased: "def", decreased: "atk" },
  { id: 6, nameKo: "온순한", nameEn: "Docile", increased: null, decreased: null },
  { id: 7, nameKo: "무사태평한", nameEn: "Relaxed", increased: "def", decreased: "spd" },
  { id: 8, nameKo: "장난꾸러기같은", nameEn: "Impish", increased: "def", decreased: "spAtk" },
  { id: 9, nameKo: "촐랑거리는", nameEn: "Lax", increased: "def", decreased: "spDef" },
  { id: 10, nameKo: "겁쟁이같은", nameEn: "Timid", increased: "spd", decreased: "atk" },
  { id: 11, nameKo: "성급한", nameEn: "Hasty", increased: "spd", decreased: "def" },
  { id: 12, nameKo: "성실한", nameEn: "Serious", increased: null, decreased: null },
  { id: 13, nameKo: "명랑한", nameEn: "Jolly", increased: "spd", decreased: "spAtk" },
  { id: 14, nameKo: "천진난만한", nameEn: "Naive", increased: "spd", decreased: "spDef" },
  { id: 15, nameKo: "조심스러운", nameEn: "Modest", increased: "spAtk", decreased: "atk" },
  { id: 16, nameKo: "의젓한", nameEn: "Mild", increased: "spAtk", decreased: "def" },
  { id: 17, nameKo: "냉정한", nameEn: "Quiet", increased: "spAtk", decreased: "spd" },
  { id: 18, nameKo: "수줍음을 타는", nameEn: "Bashful", increased: null, decreased: null },
  { id: 19, nameKo: "덜렁거리는", nameEn: "Rash", increased: "spAtk", decreased: "spDef" },
  { id: 20, nameKo: "차분한", nameEn: "Calm", increased: "spDef", decreased: "atk" },
  { id: 21, nameKo: "얌전한", nameEn: "Gentle", increased: "spDef", decreased: "def" },
  { id: 22, nameKo: "건방진", nameEn: "Sassy", increased: "spDef", decreased: "spd" },
  { id: 23, nameKo: "신중한", nameEn: "Careful", increased: "spDef", decreased: "spAtk" },
  { id: 24, nameKo: "변덕스러운", nameEn: "Quirky", increased: null, decreased: null },
];

export function isNeutralNature(nature: Nature): boolean {
  return !nature.increased && !nature.decreased;
}

/** Human-readable "Attack ↑ · Sp. Atk ↓" style summary of a nature's effect. */
export function describeNature(nature: Nature): string {
  if (isNeutralNature(nature)) return "능력치 변화 없음";
  return `${STAT_META[nature.increased!].label} ↑  ·  ${STAT_META[nature.decreased!].label} ↓`;
}
