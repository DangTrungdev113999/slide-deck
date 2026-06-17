// Deck registry — add real slides here as tasks complete.
// PLACEHOLDER entries: Task 7+ will replace these.
import React from "react";
import { PlaceholderSlide } from "./Placeholder";

export interface SlideEntry {
  id: string;
  Comp: React.FC<{ active: boolean }>;
}

// Temporary: 3 placeholder slides so navigation is demonstrably working.
// Task 7 replaces entry 0 with the real hero slide.
export const SLIDES: SlideEntry[] = [
  {
    id: "placeholder-1",
    Comp: ({ active }) => React.createElement(PlaceholderSlide, { n: 1, active }),
  },
  {
    id: "placeholder-2",
    Comp: ({ active }) => React.createElement(PlaceholderSlide, { n: 2, active }),
  },
  {
    id: "placeholder-3",
    Comp: ({ active }) => React.createElement(PlaceholderSlide, { n: 3, active }),
  },
];
