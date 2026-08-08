import { useMemo } from "react";
import { Howl } from "howler";

/**
 * Sound effects for the roulette wheel (spin tick + win chime). Loaded from
 * `public/sounds/` — playback fails silently if a file is ever missing, so
 * the feature still works without audio.
 */
export function useRouletteSound() {
  const tickSound = useMemo(
    () => new Howl({ src: ["/sounds/tick.wav"], volume: 0.25, onloaderror: () => {} }),
    [],
  );
  const winSound = useMemo(
    () => new Howl({ src: ["/sounds/win.wav"], volume: 0.55, onloaderror: () => {} }),
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
