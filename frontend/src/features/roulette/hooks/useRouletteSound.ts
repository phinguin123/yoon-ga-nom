import { useMemo } from "react";
import { Howl } from "howler";

/**
 * Sound effects for the roulette wheel. Drop real audio files into
 * `public/sounds/` (tick.mp3, win.mp3) to enable them — until then,
 * playback fails silently so the feature still works without audio.
 */
export function useRouletteSound() {
  const tickSound = useMemo(
    () => new Howl({ src: ["/sounds/tick.mp3"], volume: 0.35, onloaderror: () => {} }),
    [],
  );
  const winSound = useMemo(
    () => new Howl({ src: ["/sounds/win.mp3"], volume: 0.6, onloaderror: () => {} }),
    [],
  );

  const playTick = () => {
    try {
      tickSound.play();
    } catch {
      // audio is optional — ignore if unavailable
    }
  };

  const playWin = () => {
    try {
      winSound.play();
    } catch {
      // audio is optional — ignore if unavailable
    }
  };

  return { playTick, playWin };
}
