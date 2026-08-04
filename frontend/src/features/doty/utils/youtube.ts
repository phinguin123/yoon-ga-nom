import { dripTimestampToSeconds } from "./timestamp";

export function buildYoutubeEmbedUrl(
  videoId: string,
  timestamp: string,
  autoplay = false,
): string {
  const start = dripTimestampToSeconds(timestamp);
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
  });
  if (start > 0) params.set("start", String(start));
  if (autoplay) params.set("autoplay", "1");

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}
