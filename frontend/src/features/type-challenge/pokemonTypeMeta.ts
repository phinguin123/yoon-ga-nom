import type { PokemonType } from "@/types";

export const POKEMON_TYPE_META: Record<PokemonType, { label: string; color: string }> = {
  normal: { label: "노말", color: "#A8A77A" },
  fire: { label: "불꽃", color: "#EE8130" },
  water: { label: "물", color: "#6390F0" },
  electric: { label: "전기", color: "#F7D02C" },
  grass: { label: "풀", color: "#7AC74C" },
  ice: { label: "얼음", color: "#96D9D6" },
  fighting: { label: "격투", color: "#C22E28" },
  poison: { label: "독", color: "#A33EA1" },
  ground: { label: "땅", color: "#E2BF65" },
  flying: { label: "비행", color: "#A98FF3" },
  psychic: { label: "에스퍼", color: "#F95587" },
  bug: { label: "벌레", color: "#A6B91A" },
  rock: { label: "바위", color: "#B6A136" },
  ghost: { label: "고스트", color: "#735797" },
  dragon: { label: "드래곤", color: "#6F35FC" },
  dark: { label: "악", color: "#705746" },
  steel: { label: "강철", color: "#B7B7CE" },
  fairy: { label: "페어리", color: "#D685AD" },
};

export const ALL_POKEMON_TYPES = Object.keys(POKEMON_TYPE_META) as PokemonType[];
