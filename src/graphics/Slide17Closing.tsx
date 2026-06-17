import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Slide17Closing — model chips fade to the back while "WORKFLOW" rises to focal.
 * Optionally a comet does a final pass (like Slide14).
 */

const W = 1540;
const H = 340;

const CHIPS = [
  { label: "Claude", color: "#d97706", x: 160, y: 80 },
  { label: "Cursor", color: "#7c3aed", x: 360, y: 170 },
  { label: "Codex", color: "#0891b2", x: 560, y: 60 },
  { label: "Gemini", color: "#059669", x: 730, y: 190 },
  { label: "Copilot", color: "#6366f1", x: 260, y: 240 },
  { label: "Grok", color: "#374151", x: 470, y: 260 },
];

const WORKFLOW_X = 920;
const WORKFLOW_Y = H / 2;

const COMET_Y = 90;
const COMET_DURATION = 3.2;

export function Slide17Closing({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !root.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context((self) => {
      const q = (s: string) => self.selector!(s) as Element[];

      const chips = q(".s17-chip");
      const workflowBadge = q(".s17-workflow")[0];
      const glowRing = q(".s17-glow-ring")[0];
      const comet = q(".s17-comet")[0];
      const rail = q(".s17-rail")[0] as SVGPathElement;

      if (reduced) {
        gsap.set([...chips, workflowBadge, glowRing, comet], { opacity: 1, scale: 1, y: 0 });
        gsap.set(chips, { opacity: 0.25, scale: 0.8 });
        gsap.set(rail, { strokeDashoffset: 0 });
        return;
      }

      // Initial states
      gsap.set(chips, { opacity: 0, scale: 0.8, y: 20, transformOrigin: "50% 50%" });
      gsap.set(workflowBadge, { opacity: 0, scale: 0.75, y: 30, transformOrigin: "50% 50%" });
      gsap.set(glowRing, { opacity: 0, scale: 0.5, transformOrigin: "50% 50%" });
      gsap.set(comet, { opacity: 0 });
      if (rail) {
        const len = rail.getTotalLength();
        gsap.set(rail, { strokeDasharray: len, strokeDashoffset: len });
      }

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
        // chips appear then fade to dimmed
        .to(chips, { opacity: 1, scale: 1, y: 0, duration: 0.45, stagger: 0.08 }, 0)
        .to(chips, { opacity: 0.22, scale: 0.82, duration: 0.7, stagger: 0.06, ease: "power2.in" }, 0.7)
        // WORKFLOW rises
        .to(workflowBadge, { opacity: 1, scale: 1, y: 0, duration: 0.65, ease: "back.out(1.6)" }, 1.0)
        .to(glowRing, { opacity: 1, scale: 1, duration: 0.5 }, 1.2);

      // Comet pass
      if (rail) {
        intro.add(() => {
          const len = rail.getTotalLength();
          gsap.to(rail, { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut" });
          gsap.delayedCall(0.9, () => {
            gsap.set(comet, { opacity: 1 });
            gsap.fromTo(
              comet,
              { x: 0, y: COMET_Y },
              { x: W, duration: COMET_DURATION, ease: "power2.in", repeat: -1, repeatDelay: 3.5,
                onRepeat: () => { gsap.set(comet, { x: 0, y: COMET_Y }); }
              }
            );
          });
        });
      }

      // Sustain: WORKFLOW breathes with accent glow
      intro.add(() => {
        gsap.to(workflowBadge, {
          scale: 1.03,
          duration: 2.0,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
        gsap.to(glowRing, {
          scale: 1.18,
          opacity: 0.4,
          duration: 2.0,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
        // chips drift slightly (very subtle, they're in background)
        gsap.to(chips, {
          y: "-=4",
          duration: 3.2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: { each: 0.4, from: "random" },
        });
      });
    }, root);

    return () => ctx.revert();
  }, [active]);

  return (
    <div ref={root} style={{ position: "relative", width: W, height: H, margin: "0 auto" }}>
      {/* SVG: comet rail + comet */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}
        aria-hidden
      >
        <defs>
          <linearGradient id="s17-rail-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="rgba(0,113,227,0)" />
            <stop offset="0.4" stopColor="rgba(0,113,227,0.5)" />
            <stop offset="1" stopColor="rgba(0,113,227,0)" />
          </linearGradient>
          <radialGradient id="s17-comet-grad">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.3" stopColor="#3a9bff" />
            <stop offset="1" stopColor="rgba(0,113,227,0)" />
          </radialGradient>
          <filter id="s17-comet-blur">
            <feGaussianBlur stdDeviation="7" />
          </filter>
          <radialGradient id="s17-glow-grad">
            <stop offset="0" stopColor="rgba(0,113,227,0.35)" />
            <stop offset="1" stopColor="rgba(0,113,227,0)" />
          </radialGradient>
        </defs>

        {/* Rail track */}
        <line x1={0} y1={COMET_Y} x2={W} y2={COMET_Y} stroke="var(--line)" strokeWidth={1.5} />
        <path
          className="s17-rail"
          d={`M 0 ${COMET_Y} L ${W} ${COMET_Y}`}
          fill="none"
          stroke="url(#s17-rail-grad)"
          strokeWidth={2}
        />

        {/* Comet */}
        <g className="s17-comet">
          <circle r={32} fill="url(#s17-comet-grad)" filter="url(#s17-comet-blur)" />
          <circle r={8} fill="#fff" />
          <circle r={8} fill="none" stroke="#0071e3" strokeWidth={1.5} opacity={0.5} />
        </g>

        {/* WORKFLOW glow ring (SVG layer) */}
        <circle
          className="s17-glow-ring"
          cx={WORKFLOW_X}
          cy={WORKFLOW_Y}
          r={120}
          fill="url(#s17-glow-grad)"
        />
      </svg>

      {/* Model chips (background) */}
      {CHIPS.map((chip) => (
        <div
          key={chip.label}
          className="s17-chip"
          style={{
            position: "absolute",
            left: chip.x,
            top: chip.y,
            padding: "10px 20px",
            borderRadius: 40,
            background: `${chip.color}18`,
            border: `1.5px solid ${chip.color}55`,
            fontFamily: "var(--font-display,'Inter'),sans-serif",
            fontWeight: 700,
            fontSize: 20,
            color: chip.color,
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
          }}
        >
          {chip.label}
        </div>
      ))}

      {/* WORKFLOW badge — focal */}
      <div
        className="s17-workflow"
        style={{
          position: "absolute",
          left: WORKFLOW_X - 200,
          top: WORKFLOW_Y - 70,
          width: 400,
          height: 140,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, rgba(0,113,227,0.14) 0%, rgba(0,88,176,0.08) 100%)",
          border: "2px solid rgba(0,113,227,0.45)",
          borderRadius: 28,
          boxShadow: "var(--glow-accent), var(--shadow-lg)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display,'Inter'),sans-serif",
            fontWeight: 900,
            fontSize: 58,
            letterSpacing: "-0.04em",
            color: "var(--accent)",
            textTransform: "uppercase",
          }}
        >
          WORKFLOW
        </span>
      </div>
    </div>
  );
}
