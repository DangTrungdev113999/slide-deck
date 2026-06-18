import { useEffect, useRef, ReactNode } from "react";
import gsap from "gsap";
import { Atmosphere } from "./Atmosphere";

/**
 * SlideFrame — the canonical frame every slide (except the bespoke hero #14)
 * is built on. Provides: the Atmosphere background, a top bar (kicker chip +
 * "NN / 17" index), consistent 68x120 padding, and a one-shot staggered
 * reveal of any descendant marked [data-reveal] when the slide becomes active.
 *
 * StrictMode-safe: gsap.context() + revert() restores original opacity so the
 * double-invoked dev effect never freezes content at opacity 0.
 *
 * Slide bodies place their own motion-graphics; those graphics run their own
 * sustain loops keyed on `active` (see PipelineFlow for the reference pattern).
 */
export function SlideFrame({
  index,
  kicker,
  active,
  children,
}: {
  index: number;
  kicker: string;
  active: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !ref.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context((self) => {
      const els = self.selector!("[data-reveal]");
      if (!els.length) return;
      if (reduced) {
        gsap.set(els, { opacity: 1, y: 0 });
        return;
      }
      gsap.from(els, { opacity: 0, y: 28, duration: 0.6, stagger: 0.09, ease: "power3.out" });
    }, ref);
    return () => ctx.revert();
  }, [active]);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <Atmosphere />
      <div ref={ref} style={{ position: "absolute", inset: 0, padding: "68px 120px", display: "flex", flexDirection: "column" }}>
        {/* top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flex: "0 0 auto" }}>
          <span
            data-reveal
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              fontFamily: "var(--font-display,'Inter'),sans-serif",
              fontWeight: 700,
              fontSize: 15,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--accent)",
            }}
          >
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 0 4px rgba(0,113,227,.15)" }} />
            {kicker}
          </span>
          <span data-reveal style={{ fontFamily: "var(--font-display,'Inter'),sans-serif", fontWeight: 800, fontSize: 17, color: "var(--muted)" }}>
            <span style={{ color: "var(--ink)" }}>{String(index).padStart(2, "0")}</span> / 16
          </span>
        </div>
        {/* body */}
        {children}
      </div>
    </div>
  );
}

/** Shared heading block — eyebrow + big title. Mark items data-reveal upstream. */
export const TYPE = {
  eyebrow: {
    display: "block",
    fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
    fontWeight: 700,
    fontSize: 22,
    letterSpacing: "0.04em",
    color: "var(--muted)",
    textTransform: "uppercase" as const,
  },
  h1: {
    fontFamily: "var(--font-display,'Inter'),sans-serif",
    fontWeight: 800,
    fontSize: 104,
    lineHeight: 0.98,
    letterSpacing: "-0.04em",
    margin: "12px 0 0",
    color: "var(--ink)",
  },
  h2: {
    fontFamily: "var(--font-display,'Inter'),sans-serif",
    fontWeight: 800,
    fontSize: 72,
    lineHeight: 1.0,
    letterSpacing: "-0.03em",
    margin: "10px 0 0",
    color: "var(--ink)",
  },
  lead: {
    fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
    fontSize: 26,
    lineHeight: 1.45,
    color: "var(--ink-soft)",
    margin: "22px 0 0",
    maxWidth: 1000,
  },
};
