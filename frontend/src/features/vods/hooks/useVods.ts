import { useQuery } from "@tanstack/react-query";
import { fetchVodCategories, fetchVods } from "../api";

export function useVods() {
  return useQuery({ queryKey: ["vods"], queryFn: fetchVods });
}

export function useVodCategories() {
  return useQuery({ queryKey: ["vod-categories"], queryFn: fetchVodCategories });
}
