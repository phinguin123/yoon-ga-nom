import type { PokemonType } from "@/types";
import type { PokedexEntry } from "./types";

/**
 * Data fetching strategy: fetching 1000+ species individually over REST
 * would take forever, so we hit PokeAPI's public GraphQL endpoint once and
 * pull every species' Korean name, generation, and types in a single
 * request. The result is then cached in localStorage — this dataset is
 * effectively static, so after the very first visit no fan ever needs to
 * hit the network for it again.
 */
const GRAPHQL_ENDPOINT = "https://graphql.pokeapi.co/v1beta2";
const CACHE_KEY = "pokedex-ko-v1";
const KOREAN_LANGUAGE_ID = 3;

const GENERATION_NUMBERS: Record<string, number> = {
  "generation-i": 1,
  "generation-ii": 2,
  "generation-iii": 3,
  "generation-iv": 4,
  "generation-v": 5,
  "generation-vi": 6,
  "generation-vii": 7,
  "generation-viii": 8,
  "generation-ix": 9,
};

const POKEDEX_QUERY = `
  query PokedexKorean {
    pokemonspecies(order_by: { id: asc }, limit: 1100) {
      id
      name
      generation { name }
      pokemonspeciesnames(where: { language_id: { _eq: ${KOREAN_LANGUAGE_ID} } }) {
        name
      }
      pokemons(where: { is_default: { _eq: true } }) {
        id
        pokemontypes(order_by: { slot: asc }) {
          type { name }
        }
      }
    }
  }
`;

interface RawSpecies {
  id: number;
  name: string;
  generation: { name: string } | null;
  pokemonspeciesnames: { name: string }[];
  pokemons: { id: number; pokemontypes: { type: { name: string } }[] }[];
}

/** Official artwork sprite, addressable directly by dex/form id — no need
 * to store per-Pokémon image URLs, they're all derivable from the id. */
function imageUrlFor(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

function toPokedexEntry(raw: RawSpecies): PokedexEntry | null {
  const defaultForm = raw.pokemons[0];
  if (!defaultForm) return null;

  return {
    id: raw.id,
    nameKo: raw.pokemonspeciesnames[0]?.name ?? raw.name,
    nameEn: raw.name,
    generation: raw.generation ? (GENERATION_NUMBERS[raw.generation.name] ?? 0) : 0,
    types: defaultForm.pokemontypes.map((t) => t.type.name as PokemonType),
    imageUrl: imageUrlFor(defaultForm.id),
  };
}

async function fetchFromGraphQL(): Promise<PokedexEntry[]> {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: POKEDEX_QUERY }),
  });

  if (!response.ok) {
    throw new Error(`PokeAPI GraphQL request failed (${response.status})`);
  }

  const json = await response.json();
  if (json.errors?.length) {
    throw new Error(json.errors[0]?.message ?? "PokeAPI GraphQL returned an error");
  }

  const species: RawSpecies[] = json.data?.pokemonspecies ?? [];
  return species
    .map(toPokedexEntry)
    .filter((entry): entry is PokedexEntry => entry !== null)
    .sort((a, b) => a.id - b.id);
}

function readCache(): PokedexEntry[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed as PokedexEntry[]) : null;
  } catch {
    return null;
  }
}

function writeCache(entries: PokedexEntry[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage can be unavailable (private mode, quota) — caching is
    // just an optimization, so failing silently here is fine.
  }
}

export async function fetchPokedex(): Promise<PokedexEntry[]> {
  const cached = readCache();
  if (cached) return cached;

  const entries = await fetchFromGraphQL();
  writeCache(entries);
  return entries;
}
