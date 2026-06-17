import { useEffect, useRef, ReactNode } from "react";
import gsap from "gsap";

interface SlideProps {
  kicker?: string;
  active: boolean;
  children: ReactNode;
}

export function Slide({ kicker, active, children }: SlideProps) {
  const ref = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!active || !ref.current) return;

    const els = ref.current.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!els.length) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // gsap.context() scopes the tweens and lets ctx.revert() restore the
    // ORIGINAL inline state on cleanup. This is what makes the reveal
    // StrictMode-safe: without revert, gsap.from() leaves opacity:0 behind,
    // and the second (StrictMode) effect run reads that 0 as its target —
    // freezing the content invisible. revert() clears it so the rerun
    // animates from 0 back to the real opacity:1.
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(els, { opacity: 1, y: 0 });
        return;
      }
      tlRef.current = gsap.timeline().from(els, {
        opacity: 0,
        y: 24,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out",
      });
    }, ref);

    return () => ctx.revert();
  }, [active]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        inset: 0,
        padding: "7% 8%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background: "var(--bg)",
      }}
    >
      {kicker && (
        <span
          style={{
            display: "block",
            fontSize: "0.75rem",
            fontFamily: "var(--font-display, 'Inter'), sans-serif",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--accent)",
            marginBottom: "1.25rem",
          }}
          data-reveal
        >
          {kicker}
        </span>
      )}
      {children}
    </div>
  );
}
