import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Slide16Triangle — animated triangular sync loop.
 * Three nodes: Figma ⇄ Code ⇄ Git, connected by gradient arcs.
 * A glowing TOKEN particle circulates the triangle forever.
 * Each node lights up as the token arrives.
 */

const W = 900;
const H = 440;

// Triangle vertices (centered in canvas)
const CX = W / 2;
const CY = H / 2 + 10;
const R_TRI = 170; // circumradius

const NODES_DEF = [
  { id: "figma", label: "Figma", sub: "variables · components", angle: -90 },        // top
  { id: "code", label: "Code", sub: "implementation", angle: -90 + 120 },             // bottom-right
  { id: "git", label: "Git", sub: "source of truth", angle: -90 + 240 },             // bottom-left
];

function angleToXY(deg: number, r: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
}

const NODES = NODES_DEF.map((n) => {
  const [x, y] = angleToXY(n.angle, R_TRI);
  return { ...n, x, y };
});

// The token travels: node0 → node1 → node2 → node0 ...
const LOOP_DURATION = 4.8; // seconds for one full trip
const LEG_DURATION = LOOP_DURATION / 3; // seconds per leg

export function Slide16Triangle({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !root.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context((self) => {
      const q = (s: string) => self.selector!(s) as Element[];

      const nodeEls = q(".s16-node");
      const glows = q(".s16-glow");
      const arcEls = q(".s16-arc") as SVGPathElement[];
      const tokenEl = q(".s16-token")[0] as HTMLElement;
      const arrowEls = q(".s16-arrow") as SVGPolylineElement[];

      if (reduced) {
        gsap.set([...nodeEls, ...glows, tokenEl], { opacity: 1, scale: 1 });
        arcEls.forEach((a) => gsap.set(a, { strokeDashoffset: 0 }));
        return;
      }

      // Initial hidden
      gsap.set(nodeEls, { opacity: 0, scale: 0.7, transformOrigin: "50% 50%" });
      gsap.set(glows, { opacity: 0, scale: 0.5, transformOrigin: "50% 50%" });
      gsap.set(tokenEl, { opacity: 0, scale: 0 });
      arcEls.forEach((a) => {
        const len = a.getTotalLength();
        gsap.set(a, { strokeDasharray: len, strokeDashoffset: len });
      });
      gsap.set(arrowEls, { opacity: 0 });

      // Intro
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
        .to(nodeEls, { opacity: 1, scale: 1, duration: 0.5, stagger: 0.15, ease: "back.out(1.8)" }, 0)
        .to(arcEls, { strokeDashoffset: 0, duration: 1.0, stagger: 0.2, ease: "power2.inOut" }, 0.4)
        .to(arrowEls, { opacity: 1, duration: 0.3, stagger: 0.15 }, 1.2)
        .to(tokenEl, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, 1.4);

      // Position token at node 0 initially
      gsap.set(tokenEl, { x: NODES[0].x - W / 2, y: NODES[0].y - H / 2 });

      // Sustain: token circulates the triangle
      intro.add(() => {
        const runLeg = (fromIdx: number) => {
          const toIdx = (fromIdx + 1) % 3;
          const to = NODES[toIdx];

          // glow at departure
          gsap.to(glows[fromIdx], {
            opacity: 0.8, scale: 1.2, duration: 0.25, ease: "power2.out",
            onComplete: () => {
              gsap.to(glows[fromIdx], { opacity: 0, scale: 0.5, duration: 0.6, ease: "power2.in" });
            }
          });

          gsap.to(tokenEl, {
            x: to.x - W / 2,
            y: to.y - H / 2,
            duration: LEG_DURATION,
            ease: "none",
            onComplete: () => {
              // glow at arrival
              gsap.to(glows[toIdx], {
                opacity: 0.9, scale: 1, duration: 0.22, ease: "power2.out",
                onComplete: () => {
                  gsap.to(glows[toIdx], { opacity: 0, scale: 0.5, duration: 0.55, ease: "power2.in" });
                }
              });
              runLeg(toIdx);
            }
          });
        };

        // Start from node 0
        gsap.delayedCall(0.3, () => runLeg(0));

        // Nodes gently breathe
        gsap.to(nodeEls, {
          scale: 1.04,
          duration: 1.8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: { each: 0.5, from: "start" },
        });
      });
    }, root);

    return () => ctx.revert();
  }, [active]);

  // Build triangle arc paths between nodes (straight lines with slight curve)
  const arcs = [
    { from: 0, to: 1 },
    { from: 1, to: 2 },
    { from: 2, to: 0 },
  ];

  function arcPath(fromIdx: number, toIdx: number): string {
    const f = NODES[fromIdx];
    const t = NODES[toIdx];
    const mx = (f.x + t.x) / 2;
    const my = (f.y + t.y) / 2;
    // slight inward curve
    const dx = mx - CX;
    const dy = my - CY;
    const len = Math.sqrt(dx * dx + dy * dy);
    const curveX = mx - (dx / len) * 22;
    const curveY = my - (dy / len) * 22;
    return `M ${f.x} ${f.y} Q ${curveX} ${curveY} ${t.x} ${t.y}`;
  }

  return (
    <div
      ref={root}
      style={{
        position: "relative",
        width: W,
        height: H,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* SVG layer */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
        aria-hidden
      >
        <defs>
          <linearGradient id="s16-arc0" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#9cc6f5" />
            <stop offset="1" stopColor="#0071e3" />
          </linearGradient>
          <linearGradient id="s16-arc1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0071e3" />
            <stop offset="1" stopColor="#0058b0" />
          </linearGradient>
          <linearGradient id="s16-arc2" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0" stopColor="#0058b0" />
            <stop offset="1" stopColor="#9cc6f5" />
          </linearGradient>
          <filter id="s16-glow-filter" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="s16-token-filter" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <marker id="s16-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="rgba(0,113,227,0.7)" />
          </marker>
        </defs>

        {/* Faint track lines */}
        {arcs.map((arc, i) => (
          <path
            key={i + "-bg"}
            d={arcPath(arc.from, arc.to)}
            fill="none"
            stroke="var(--line)"
            strokeWidth={2}
          />
        ))}

        {/* Animated arc overlays */}
        {arcs.map((arc, i) => (
          <path
            key={i}
            className="s16-arc"
            d={arcPath(arc.from, arc.to)}
            fill="none"
            stroke={`url(#s16-arc${i})`}
            strokeWidth={3}
            strokeLinecap="round"
            markerEnd="url(#s16-arrow)"
          />
        ))}

        {/* Arrow direction indicators */}
        {arcs.map((arc, i) => {
          const f = NODES[arc.from];
          const t = NODES[arc.to];
          const mx = (f.x + t.x) / 2;
          const my = (f.y + t.y) / 2;
          return (
            <polyline
              key={i}
              className="s16-arrow"
              points={`${mx - 5},${my - 5} ${mx + 5},${my} ${mx - 5},${my + 5}`}
              fill="none"
              stroke="rgba(0,113,227,0.6)"
              strokeWidth={2}
              strokeLinecap="round"
            />
          );
        })}

        {/* Node glow halos */}
        {NODES.map((nd) => (
          <circle
            key={nd.id + "-glow"}
            className="s16-glow"
            cx={nd.x}
            cy={nd.y}
            r={56}
            fill="rgba(0,113,227,0.15)"
            stroke="rgba(0,113,227,0.35)"
            strokeWidth={1.5}
          />
        ))}
      </svg>

      {/* Node cards (DOM) */}
      {NODES.map((nd) => (
        <div
          key={nd.id}
          className="s16-node"
          style={{
            position: "absolute",
            left: nd.x - 74,
            top: nd.y - 44,
            width: 148,
            height: 88,
            background: "linear-gradient(180deg, #fff 0%, #f5f6fb 100%)",
            border: "1.5px solid var(--line)",
            borderRadius: 20,
            boxShadow: "var(--shadow-md)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "10px 12px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display,'Inter'),sans-serif",
              fontWeight: 800,
              fontSize: 22,
              color: "var(--accent)",
              letterSpacing: "-0.01em",
            }}
          >
            {nd.label}
          </span>
          <span
            style={{
              fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
              fontSize: 13,
              color: "var(--muted)",
              lineHeight: 1.3,
              marginTop: 3,
            }}
          >
            {nd.sub}
          </span>
        </div>
      ))}

      {/* The circulating TOKEN (DOM element at center, moved by GSAP) */}
      <div
        className="s16-token"
        style={{
          position: "absolute",
          left: W / 2 - 18,
          top: H / 2 - 18,
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #0a84ff, #0058b0)",
          boxShadow: "0 0 0 4px rgba(0,113,227,0.25), 0 0 24px rgba(0,113,227,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display,'Inter'),sans-serif",
            fontWeight: 900,
            fontSize: 14,
            color: "#fff",
            letterSpacing: "-0.02em",
          }}
        >
          ⬡
        </span>
      </div>
    </div>
  );
}
