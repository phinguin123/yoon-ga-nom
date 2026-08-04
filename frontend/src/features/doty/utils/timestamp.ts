/** Parses stored drip timestamps (`23m45s`, legacy seconds, or `1h23m45s`). */
export function parseDripTimestampParts(timestamp: string): { minutes: number; seconds: number } {
  const trimmed = timestamp.trim();
  if (!trimmed || trimmed === "0") return { minutes: 0, seconds: 0 };

  if (/^\d+$/.test(trimmed)) {
    const total = parseInt(trimmed, 10);
    return { minutes: Math.floor(total / 60), seconds: total % 60 };
  }

  let minutes = 0;
  let seconds = 0;
  const hours = trimmed.match(/(\d+)h/i);
  const mins = trimmed.match(/(\d+)m/i);
  const secs = trimmed.match(/(\d+)s/i);

  if (hours) minutes += parseInt(hours[1], 10) * 60;
  if (mins) minutes += parseInt(mins[1], 10);
  if (secs) seconds = parseInt(secs[1], 10);

  return { minutes, seconds };
}

export function formatDripTimestamp(minutes: number, seconds: number): string {
  const clampedSeconds = Math.min(59, Math.max(0, seconds));
  const clampedMinutes = Math.max(0, minutes);
  return `${clampedMinutes}m${clampedSeconds}s`;
}

export function dripTimestampToSeconds(timestamp: string): number {
  const { minutes, seconds } = parseDripTimestampParts(timestamp);
  return minutes * 60 + seconds;
}

/** Display as `23:45` (minutes:seconds). */
export function formatDripTimestampDisplay(timestamp: string): string {
  const { minutes, seconds } = parseDripTimestampParts(timestamp);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
