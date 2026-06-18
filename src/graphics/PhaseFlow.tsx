import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * PhaseFlow — a generic animated pipeline of N phases on a gradient rail with
 * a comet running forever and each phase lighting up as the comet passes.
 * Used by the two "demo" slides (ai-chart + gen-video). Same motion language
 * as PipelineFlow but parameterized by a phases array.
 */
export type Phase = { label: string; sub?: string };

const W = 1680;
const H = 300;
const RAIL_Y = 150;
const MARGIN = 130;
const LOOP = 4.2;

export function PhaseFlow({ active, phases }: { active: boolean; phases: Phase[] }) {
  const root = useRef<HTMLDivElement>(null);
  const n = phases.length;
  const span = W - MARGIN * 2;
  const step = n > 1 ? span / (n - 1) : 0;
  const xs = phases.map((_, i) => MARGIN + i * step);
  const IN_X = xs[0];
  const OUT_X = xs[n - 1];
  const pillW = Math.min(220, step - 26);

  useEffect(() => {
    if (!active || !root.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context((self) => {
      const q = (s: string) => self.selector!(s);
      const rail = q(".ph-rail")[0] as SVGPathElement;
      const pills = q(".ph-pill");
      const comet = q(".ph-comet");
      const glows = q(".ph-glow");

      if (reduced) {
        gsap.set(pills, { opacity: 1, y: 0, scale: 1 });
        gsap.set(rail, { strokeDashoffset: 0 });
        gsap.set(comet, { opacity: 1 });
        return;
      }

      const len = rail.getTotalLength();
      gsap.set(rail, { strokeDasharray: len, strokeDashoffset: len });
      gsap.set(pills, { opacity: 0, y: 22, scale: 0.94, transformOrigin: "50% 50%" });
      gsap.set(comet, { opacity: 0 });
      gsap.set(glows, { opacity: 0, scale: 0.6, transformOrigin: "50% 50%" });

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
        .to(rail, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" }, 0)
        .to(pills, { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.1 }, 0.15);

      intro.add(() => {
        gsap.set(comet, { opacity: 1 });
        gsap.fromTo(comet, { x: IN_X, y: RAIL_Y }, { x: OUT_X, duration: LOOP, ease: "none", repeat: -1 });
        glows.forEach((g: Element, i: number) => {
          const frac = (xs[i] - IN_X) / (OUT_X - IN_X || 1);
          gsap.to(g, {
            keyframes: [
              { opacity: 0, scale: 0.6, duration: 0 },
              { opacity: 0.9, scale: 1, duration: 0.26, ease: "power2.out" },
              { opacity: 0, scale: 1.16, duration: 0.7, ease: "power2.in" },
            ],
            repeat: -1,
            repeatDelay: LOOP - 0.96,
            delay: frac * LOOP,
          });
        });
        gsap.to(pills, { y: "-=4", duration: 2.6, ease: "sine.inOut", repeat: -1, yoyo: true, stagger: { each: 0.14 } });
      });
    }, root);

    return () => ctx.revert();
  }, [active, n]);

  return (
    <div ref={root} style={{ position: "relative", width: W, height: H, margin: "0 auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }} aria-hidden>
        <defs>
          <linearGradient id="ph-rail-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#9cc6f5" />
            <stop offset="0.5" stopColor="#0071e3" />
            <stop offset="1" stopColor="#0058b0" />
          </linearGradient>
          <radialGradient id="ph-comet-grad">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.35" stopColor="#3a9bff" />
            <stop offset="1" stopColor="rgba(0,113,227,0)" />
          </radialGradient>
          <filter id="ph-comet-blur" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        <line x1={IN_X} y1={RAIL_Y} x2={OUT_X} y2={RAIL_Y} stroke="var(--line)" strokeWidth={3} strokeLinecap="round" />
        <path className="ph-rail" d={`M ${IN_X} ${RAIL_Y} L ${OUT_X} ${RAIL_Y}`} fill="none" stroke="url(#ph-rail-grad)" strokeWidth={4} strokeLinecap="round" />

        {xs.map((x, i) => (
          <circle key={i} className="ph-glow" cx={x} cy={RAIL_Y} r={58} fill="rgba(0,113,227,.16)" stroke="rgba(0,113,227,.4)" strokeWidth={1.5} />
        ))}

        <g className="ph-comet">
          <circle r={22} fill="url(#ph-comet-grad)" filter="url(#ph-comet-blur)" />
          <circle r={6} fill="#fff" />
          <circle r={6} fill="none" stroke="#0071e3" strokeWidth={2} opacity={0.6} />
        </g>
      </svg>

      {phases.map((p, i) => (
        <div
          key={i}
          className="ph-pill"
          style={{
            position: "absolute",
            left: xs[i] - pillW / 2,
            top: RAIL_Y - 64,
            width: pillW,
            minHeight: 128,
            background: "linear-gradient(180deg,#fff 0%,#f7f8fb 100%)",
            border: "1px solid var(--line)",
            borderRadius: 18,
            boxShadow: "var(--shadow-md)",
            padding: "22px 14px 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: -14,
              left: "50%",
              transform: "translateX(-50%)",
              minWidth: 30,
              height: 30,
              padding: "0 8px",
              borderRadius: 10,
              background: "var(--accent)",
              color: "#fff",
              fontFamily: "var(--font-display,'Inter'),sans-serif",
              fontWeight: 800,
              fontSize: 15,
              display: "grid",
              placeItems: "center",
              boxShadow: "0 8px 16px -6px rgba(0,113,227,.6)",
            }}
          >
            {i + 1}
          </span>
          <span style={{ fontFamily: "var(--font-display,'Inter'),sans-serif", fontWeight: 800, fontSize: 19, color: "var(--ink)", letterSpacing: "-0.01em", marginTop: 6, lineHeight: 1.15 }}>{p.label}</span>
          {p.sub && <span style={{ fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif", fontSize: 14, lineHeight: 1.3, color: "var(--muted)", marginTop: 6 }}>{p.sub}</span>}
        </div>
      ))}
    </div>
  );
}
