import { api } from "@/lib/api";
import type { ScheduleCategory, ScheduleEvent } from "@/types";

export async function fetchScheduleEvents(): Promise<ScheduleEvent[]> {
  const { data } = await api.get<{ data: ScheduleEvent[] }>("/schedule");
  return data.data;
}

export async function fetchScheduleCategories(): Promise<ScheduleCategory[]> {
  const { data } = await api.get<{ data: ScheduleCategory[] }>("/schedule/categories");
  return data.data;
}
