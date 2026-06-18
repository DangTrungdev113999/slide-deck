import { createContext, useContext } from "react";

/**
 * Slide numbering is derived from registry position (deck.tsx), NOT hardcoded
 * per slide. This kills the recurring "renumber every slide" bug class: the
 * displayed "NN / TOTAL" always matches the slide's real index in SLIDES.
 */
export const SlideNoContext = createContext<{ no: number; total: number }>({
  no: 1,
  total: 1,
});

export const useSlideNo = () => useContext(SlideNoContext);
