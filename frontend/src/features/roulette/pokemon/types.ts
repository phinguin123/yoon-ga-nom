import type { PokemonType } from "@/types";

/** A single Pokémon species entry in the Korean-localized pokedex used by
 * the roulette — one row per national dex number. */
export interface PokedexEntry {
  id: number;
  nameKo: string;
  nameEn: string;
  /** National dex generation, 1-9. */
  generation: number;
  types: PokemonType[];
  imageUrl: string;
}
