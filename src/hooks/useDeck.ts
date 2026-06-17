import { useEffect, useState, useCallback } from "react";

export function useDeck(total: number) {
  const fromHash = () => {
    const n = parseInt((location.hash.match(/^#\/(\d+)/)?.[1] ?? "1"), 10);
    return Math.min(Math.max(n - 1, 0), total - 1);
  };

  const [index, setIndex] = useState(fromHash);

  const clamp = (n: number) => Math.min(Math.max(n, 0), total - 1);

  const go = useCallback((n: number) => setIndex(clamp(n)), [total]);
  const next = useCallback(() => setIndex(i => clamp(i + 1)), [total]);
  const prev = useCallback(() => setIndex(i => clamp(i - 1)), [total]);

  // Sync hash on index change
  useEffect(() => {
    history.replaceState(null, "", `#/${index + 1}`);
  }, [index]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setIndex(i => clamp(i + 1));
      } else if (e.key === "ArrowLeft" || e.key === "Backspace") {
        e.preventDefault();
        setIndex(i => clamp(i - 1));
      } else if (e.key.toLowerCase() === "f") {
        document.fullscreenElement
          ? document.exitFullscreen()
          : document.documentElement.requestFullscreen();
      }
    };
    const onHash = () => setIndex(fromHash());
    window.addEventListener("keydown", onKey);
    window.addEventListener("hashchange", onHash);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("hashchange", onHash);
    };
  }, [total]);

  // Touch swipe
  useEffect(() => {
    let x0 = 0;
    const ts = (e: TouchEvent) => (x0 = e.touches[0].clientX);
    const te = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 60) {
        setIndex(i => clamp(i + (dx < 0 ? 1 : -1)));
      }
    };
    window.addEventListener("touchstart", ts);
    window.addEventListener("touchend", te);
    return () => {
      window.removeEventListener("touchstart", ts);
      window.removeEventListener("touchend", te);
    };
  }, [total]);

  return { index, go, next, prev };
}
