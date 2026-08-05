import { useQuery } from "@tanstack/react-query";
import { fetchScheduleCategories, fetchScheduleEvents } from "../api";

export const SCHEDULE_EVENTS_QUERY_KEY = ["schedule-events"];
export const SCHEDULE_CATEGORIES_QUERY_KEY = ["schedule-categories"];

export function useScheduleEvents() {
  return useQuery({ queryKey: SCHEDULE_EVENTS_QUERY_KEY, queryFn: fetchScheduleEvents });
}

export function useScheduleCategories() {
  return useQuery({ queryKey: SCHEDULE_CATEGORIES_QUERY_KEY, queryFn: fetchScheduleCategories });
}
