/**
 * Extracts a numeric CHZZK video number ("videoNo") from a URL or bare
 * number string. This is the number shown in `chzzk.naver.com/video/{n}`
 * URLs — CHZZK also has a separate opaque alphanumeric `videoId` internally,
 * but that's never exposed to users and isn't needed for anything here.
 */
export function normalizeChzzkVideoNo(input: string): number | null {
  const trimmed = input.trim();

  const patterns = [/chzzk\.naver\.com\/video\/(\d+)/, /^(\d+)$/];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) return Number(match[1]);
  }

  return null;
}
