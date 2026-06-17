import React from "react";
import { Slide14 } from "./Slide14";

export interface SlideEntry {
  id: string;
  Comp: React.FC<{ active: boolean }>;
}

export const SLIDES: SlideEntry[] = [
  {
    id: "pipeline",
    Comp: Slide14,
  },
];
