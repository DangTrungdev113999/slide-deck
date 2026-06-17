import React from "react";
import { Slide01 } from "./Slide01";
import { Slide02 } from "./Slide02";
import { Slide03 } from "./Slide03";
import { Slide04 } from "./Slide04";
import { Slide05 } from "./Slide05";
import { Slide06 } from "./Slide06";
import { Slide07 } from "./Slide07";
import { Slide08 } from "./Slide08";
import { Slide09 } from "./Slide09";
import { Slide10 } from "./Slide10";
import { Slide11 } from "./Slide11";
import { Slide12 } from "./Slide12";
import { Slide13 } from "./Slide13";
import { Slide14 } from "./Slide14";
import { Slide15 } from "./Slide15";
import { Slide16 } from "./Slide16";
import { Slide17 } from "./Slide17";

export interface SlideEntry {
  id: string;
  Comp: React.FC<{ active: boolean }>;
}

export const SLIDES: SlideEntry[] = [
  { id: "host", Comp: Slide01 },
  { id: "poll", Comp: Slide02 },
  { id: "journey", Comp: Slide03 },
  { id: "cursor-vs-claude", Comp: Slide04 },
  { id: "prompts-speed", Comp: Slide05 },
  { id: "antigravity", Comp: Slide06 },
  { id: "non-linear", Comp: Slide07 },
  { id: "harness", Comp: Slide08 },
  { id: "skill-hook", Comp: Slide09 },
  { id: "subagent-plugin", Comp: Slide10 },
  { id: "context", Comp: Slide11 },
  { id: "context-engineering", Comp: Slide12 },
  { id: "frontend-split", Comp: Slide13 },
  { id: "pipeline", Comp: Slide14 },
  { id: "freestyle-vs-ds", Comp: Slide15 },
  { id: "figma-mcp", Comp: Slide16 },
  { id: "workflow-over-model", Comp: Slide17 },
];
