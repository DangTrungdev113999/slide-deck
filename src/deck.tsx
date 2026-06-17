import { useState, useEffect, useRef } from "react";
import { Stage } from "./components/Stage";
import { Nav } from "./components/Nav";
import { Progress } from "./components/Progress";
import { useDeck } from "./hooks/useDeck";
import { SLIDES } from "./slides/index";

// Outgoing fade transition duration (ms)
const FADE_MS = 200;

export function Deck() {
  const { index, next, prev } = useDeck(SLIDES.length);
  const [displayIndex, setDisplayIndex] = useState(index);
  const [fading, setFading] = useState(false);
  const pendingIndex = useRef(index);

  useEffect(() => {
    if (index === displayIndex) return;
    pendingIndex.current = index;
    // Start outgoing fade
    setFading(true);
    const t = setTimeout(() => {
      setDisplayIndex(pendingIndex.current);
      setFading(false);
    }, FADE_MS);
    return () => clearTimeout(t);
  }, [index]);

  const { Comp } = SLIDES[displayIndex];

  return (
    <Stage>
      {/* key by displayIndex so Slide mounts fresh → enter timeline reruns */}
      <div
        key={displayIndex}
        style={{
          position: "absolute",
          inset: 0,
          opacity: fading ? 0 : 1,
          transition: `opacity ${FADE_MS}ms ease`,
        }}
      >
        <Comp active={!fading} />
      </div>
      <Nav onPrev={prev} onNext={next} />
      <Progress index={index} total={SLIDES.length} />
    </Stage>
  );
}
