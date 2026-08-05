import { api } from "@/lib/api";
import type { Vod, VodCategory } from "@/types";

/** Builds the actual CHZZK watch URL for a stored `chzzkVideoNo` — this is the only "player" we have, we always send viewers to CHZZK itself. */
export function chzzkVideoUrl(chzzkVideoNo: number): string {
  return `https://chzzk.naver.com/video/${chzzkVideoNo}`;
}

export async function fetchVods(): Promise<Vod[]> {
  const { data } = await api.get<{ data: Vod[] }>("/vods");
  return data.data;
}

export async function fetchVodCategories(): Promise<VodCategory[]> {
  const { data } = await api.get<{ data: VodCategory[] }>("/vods/categories");
  return data.data;
}
