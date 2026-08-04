import { api } from "@/lib/api";
import type { Drip, DripSort, DripYearFilter } from "@/types";

export async function fetchDrips(sort: DripSort, year: DripYearFilter): Promise<Drip[]> {
  const params: Record<string, string> = { sort };
  if (year !== "all") params.year = String(year);

  const { data } = await api.get<{ data: Drip[] }>("/drips", { params });
  return data.data;
}

export async function fetchDripYears(): Promise<number[]> {
  const { data } = await api.get<{ data: number[] }>("/drips/years");
  return data.data;
}

export async function likeDrip(id: number): Promise<Drip> {
  const { data } = await api.patch<{ data: Drip }>(`/drips/${id}/like`);
  return data.data;
}
