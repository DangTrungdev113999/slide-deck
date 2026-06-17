import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Slide13Split — two-column looping motion graphic.
 * LEFT: wireframe/layout blocks assembling (UI/UX)
 * RIGHT: data nodes connecting with flowing edges (Logic business)
 * Both loops run forever, side-by-side with a central glowing divider.
 */

const W = 1540;
const H = 420;
const CX = W / 2; // divider x

export function Slide13Split({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !root.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context((self) => {
      const q = (s: string) => self.selector!(s) as Element[];

      // LEFT: wireframe blocks
      const blocks = q(".s13-block");
      const divider = q(".s13-divider")[0];
      const dividerGlow = q(".s13-divider-glow")[0];

      // RIGHT: nodes + edges
      const nodes = q(".s13-node");
      const edges = q(".s13-edge") as SVGPathElement[];
      const pulses = q(".s13-pulse");

      if (reduced) {
        gsap.set([...blocks, ...nodes, ...pulses, divider, dividerGlow], { opacity: 1, scale: 1, y: 0, x: 0 });
        edges.forEach((e) => gsap.set(e, { strokeDashoffset: 0 }));
        return;
      }

      // ---- initial state ----
      gsap.set(blocks, { opacity: 0, y: 30, scale: 0.88, transformOrigin: "50% 50%" });
      gsap.set(nodes, { opacity: 0, scale: 0, transformOrigin: "50% 50%" });
      gsap.set(pulses, { opacity: 0, scale: 0.5, transformOrigin: "50% 50%" });
      gsap.set(divider, { scaleY: 0, transformOrigin: "50% 0%" });
      gsap.set(dividerGlow, { opacity: 0 });
      edges.forEach((e) => {
        const len = e.getTotalLength();
        gsap.set(e, { strokeDasharray: len, strokeDashoffset: len });
      });

      // ---- intro ----
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
        .to(divider, { scaleY: 1, duration: 0.7, ease: "power2.inOut" }, 0)
        .to(dividerGlow, { opacity: 1, duration: 0.6 }, 0.2)
        .to(blocks, { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1 }, 0.1)
        .to(nodes, { opacity: 1, scale: 1, duration: 0.45, stagger: 0.12, ease: "back.out(1.8)" }, 0.3)
        .to(edges, { strokeDashoffset: 0, duration: 0.7, stagger: 0.15, ease: "power2.inOut" }, 0.7)
        .to(pulses, { opacity: 1, scale: 1, duration: 0.3, stagger: 0.1 }, 1.1);

      // ---- sustain loops ----
      intro.add(() => {
        // LEFT: blocks breathe in/out — staggered, slight y float
        gsap.to(blocks, {
          y: "-=6",
          duration: 2.8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: { each: 0.22, from: "start" },
        });
        // blocks shimmer highlight
        gsap.to(blocks, {
          boxShadow: "0 0 0 2px rgba(0,113,227,.35), 0 16px 40px -12px rgba(0,113,227,.25)",
          duration: 1.6,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: { each: 0.3, from: "random" },
        });

        // RIGHT: pulse rings radiate from nodes
        pulses.forEach((p, i) => {
          gsap.fromTo(
            p,
            { scale: 0.5, opacity: 0.9 },
            { scale: 2.2, opacity: 0, duration: 1.6, ease: "power1.out", repeat: -1, delay: i * 0.55 }
          );
        });

        // RIGHT: nodes breathe
        gsap.to(nodes, {
          scale: 1.08,
          duration: 1.4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: { each: 0.18, from: "center" },
        });

        // RIGHT: edges re-draw on loop
        edges.forEach((e, i) => {
          const len = e.getTotalLength();
          gsap.fromTo(
            e,
            { strokeDashoffset: len },
            { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut", repeat: -1, repeatDelay: 1.8, delay: i * 0.4 }
          );
        });

        // divider glow breathe
        gsap.to(dividerGlow, {
          opacity: 0.3,
          duration: 1.8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      });
    }, root);

    return () => ctx.revert();
  }, [active]);

  // Block positions for the LEFT side (wireframe mockup)
  const BLK: { x: number; y: number; w: number; h: number; accent?: boolean }[] = [
    { x: 60, y: 30, w: 520, h: 52, accent: true },   // top nav bar
    { x: 60, y: 108, w: 240, h: 200 },               // left panel
    { x: 320, y: 108, w: 260, h: 90, accent: true }, // main content top
    { x: 320, y: 218, w: 260, h: 90 },               // main content bottom
    { x: 60, y: 328, w: 180, h: 62 },                // bottom left
    { x: 260, y: 328, w: 320, h: 62 },               // bottom right
  ];

  // Node positions for the RIGHT side (logic flow graph)
  // Offset by CX + 80 since we're in a 1540-wide canvas
  const ND_OFFSET = CX + 60;
  const NDS: { id: string; x: number; y: number; label: string }[] = [
    { id: "api", x: ND_OFFSET + 100, y: 70, label: "API" },
    { id: "state", x: ND_OFFSET + 330, y: 130, label: "State" },
    { id: "calc", x: ND_OFFSET + 200, y: 250, label: "Calc" },
    { id: "out", x: ND_OFFSET + 430, y: 270, label: "Output" },
    { id: "cache", x: ND_OFFSET + 100, y: 340, label: "Cache" },
  ];

  // Edges between nodes (pairs of indices into NDS)
  const EDGES_IDX: [number, number][] = [[0, 1], [1, 2], [1, 3], [2, 4], [4, 3]];

  return (
    <div ref={root} style={{ position: "relative", width: W, height: H, margin: "0 auto" }}>
      {/* SVG layer for edges + divider */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
        aria-hidden
      >
        <defs>
          <linearGradient id="s13-edge-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#9cc6f5" />
            <stop offset="1" stopColor="#0071e3" />
          </linearGradient>
          <linearGradient id="s13-divider-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(0,113,227,0)" />
            <stop offset="0.25" stopColor="rgba(0,113,227,0.55)" />
            <stop offset="0.5" stopColor="rgba(0,113,227,0.85)" />
            <stop offset="0.75" stopColor="rgba(0,113,227,0.55)" />
            <stop offset="1" stopColor="rgba(0,113,227,0)" />
          </linearGradient>
          <filter id="s13-node-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Edges */}
        {EDGES_IDX.map(([a, b], i) => {
          const from = NDS[a];
          const to = NDS[b];
          const mx = (from.x + to.x) / 2;
          const my = (from.y + to.y) / 2 - 30;
          return (
            <path
              key={i}
              className="s13-edge"
              d={`M${from.x},${from.y} Q${mx},${my} ${to.x},${to.y}`}
              fill="none"
              stroke="url(#s13-edge-grad)"
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          );
        })}

        {/* Pulse rings (one per node) */}
        {NDS.map((nd) => (
          <circle
            key={nd.id + "-pulse"}
            className="s13-pulse"
            cx={nd.x}
            cy={nd.y}
            r={22}
            fill="none"
            stroke="rgba(0,113,227,0.5)"
            strokeWidth={2}
          />
        ))}

        {/* Node circles */}
        {NDS.map((nd) => (
          <g key={nd.id} className="s13-node">
            <circle cx={nd.x} cy={nd.y} r={22} fill="var(--accent)" filter="url(#s13-node-glow)" />
            <circle cx={nd.x} cy={nd.y} r={22} fill="white" opacity={0.15} />
            <text
              x={nd.x}
              y={nd.y + 5}
              textAnchor="middle"
              fill="#fff"
              fontSize={13}
              fontWeight={700}
              fontFamily="var(--font-display,'Inter'),sans-serif"
            >
              {nd.label}
            </text>
          </g>
        ))}

        {/* Divider line */}
        <line
          className="s13-divider"
          x1={CX}
          y1={0}
          x2={CX}
          y2={H}
          stroke="url(#s13-divider-grad)"
          strokeWidth={2}
        />
        {/* Divider glow halo */}
        <rect
          className="s13-divider-glow"
          x={CX - 18}
          y={0}
          width={36}
          height={H}
          fill="rgba(0,113,227,0.07)"
          rx={18}
        />
      </svg>

      {/* LEFT side: wireframe blocks */}
      {BLK.map((b, i) => (
        <div
          key={i}
          className="s13-block"
          style={{
            position: "absolute",
            left: b.x,
            top: b.y,
            width: b.w,
            height: b.h,
            background: b.accent
              ? "linear-gradient(135deg, rgba(0,113,227,0.12), rgba(10,132,255,0.06))"
              : "linear-gradient(180deg, #ffffff 0%, #f5f6fb 100%)",
            border: b.accent ? "1.5px solid rgba(0,113,227,0.3)" : "1px solid var(--line)",
            borderRadius: 14,
            boxShadow: "var(--shadow-sm)",
          }}
        />
      ))}

      {/* RIGHT: node labels below nodes */}
      {NDS.map((nd) => (
        <div
          key={nd.id + "-label"}
          style={{
            position: "absolute",
            left: nd.x - 36,
            top: nd.y + 28,
            width: 72,
            textAlign: "center",
            fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--ink-soft)",
          }}
        />
      ))}

      {/* Column labels */}
      <div
        style={{
          position: "absolute",
          left: 60,
          top: H - 28,
          fontFamily: "var(--font-display,'Inter'),sans-serif",
          fontWeight: 800,
          fontSize: 13,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--accent)",
          opacity: 0.7,
        }}
      >
        UI / UX — layout &amp; composition
      </div>
      <div
        style={{
          position: "absolute",
          left: CX + 60,
          top: H - 28,
          fontFamily: "var(--font-display,'Inter'),sans-serif",
          fontWeight: 800,
          fontSize: 13,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--accent)",
          opacity: 0.7,
        }}
      >
        Logic business — state &amp; data flow
      </div>
    </div>
  );
}
