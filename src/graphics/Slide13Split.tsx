import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Slide13Split — redesigned two-panel looping motion graphic.
 *
 * LEFT  (UI/UX):  A browser-frame mockup with labelled zones assembling
 *                 block-by-block, each zone has big readable text ≥22px.
 * RIGHT (Logic):  A data-flow graph with large nodes (r=40), edge draw-on,
 *                 and traveling pulse dots.
 * CENTER: A glowing gradient divider.
 *
 * StrictMode-safe: all animations inside gsap.context(fn, ref) + ctx.revert().
 * Reduced-motion: everything visible, no animation.
 */

const W = 1600;
const H = 500;
const CX = W / 2; // divider x

// ── LEFT SIDE: browser mockup zones ────────────────────────────────────────
// Rendered inside the left half (0 … CX-30).
// Each block has a label (text) to fill space meaningfully.
type Block = {
  x: number; y: number; w: number; h: number;
  accent?: boolean; label: string; sub?: string; icon?: string;
};

const BROWSER_X = 48;
const BROWSER_Y = 20;
const BROWSER_W = 680;
const BROWSER_H = 456;

// Zones inside the browser (relative to BROWSER_X/Y + chrome offset 48px)
const CHROME_H = 48; // top bar of browser chrome
const INNER_X = BROWSER_X + 16;
const INNER_Y = BROWSER_Y + CHROME_H + 12;
const INNER_W = BROWSER_W - 32;

const BLK: Block[] = [
  // Nav bar
  {
    x: INNER_X, y: INNER_Y,
    w: INNER_W, h: 58,
    accent: true, label: "Navigation Bar", sub: "layout · spacing"
  },
  // Left sidebar
  {
    x: INNER_X, y: INNER_Y + 70,
    w: 188, h: 280,
    label: "Sidebar", sub: "composition"
  },
  // Hero / main card
  {
    x: INNER_X + 200, y: INNER_Y + 70,
    w: 300, h: 130,
    accent: true, label: "Hero Card", sub: "visual polish", icon: "★"
  },
  // Content row A
  {
    x: INNER_X + 200, y: INNER_Y + 214,
    w: 144, h: 136,
    label: "Card A", sub: "variant"
  },
  // Content row B
  {
    x: INNER_X + 356, y: INNER_Y + 214,
    w: 144, h: 136,
    label: "Card B", sub: "variant"
  },
  // Footer
  {
    x: INNER_X, y: INNER_Y + 362,
    w: INNER_W, h: 52,
    label: "Footer", sub: "responsive"
  },
];

// ── RIGHT SIDE: logic flow nodes ────────────────────────────────────────────
const ND_START_X = CX + 60;

type LogicNode = { id: string; x: number; y: number; label: string; sub: string; color?: string };

const NDS: LogicNode[] = [
  { id: "api",    x: ND_START_X + 90,  y: 80,  label: "API",    sub: "fetch / REST" },
  { id: "state",  x: ND_START_X + 340, y: 80,  label: "State",  sub: "Zustand / Redux" },
  { id: "calc",   x: ND_START_X + 200, y: 240, label: "Calc",   sub: "derived data", color: "#0058b0" },
  { id: "cache",  x: ND_START_X + 90,  y: 390, label: "Cache",  sub: "memoize" },
  { id: "out",    x: ND_START_X + 500, y: 240, label: "Output", sub: "render", color: "#003d80" },
];

// Node radius
const NR = 44;

// Edges: [from, to]
const EDGES: [number, number][] = [
  [0, 1], // api → state
  [1, 2], // state → calc
  [0, 2], // api → calc
  [2, 3], // calc → cache
  [2, 4], // calc → output
  [1, 4], // state → output
];

// Pulse travel paths (index pairs)
const PULSE_PATHS: [number, number][] = [[0, 1], [1, 4], [0, 2], [2, 4]];

export function Slide13Split({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !root.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context((self) => {
      const q = (s: string) => self.selector!(s) as Element[];

      const blocks = q(".s13-block");
      const browserFrame = q(".s13-browser")[0];
      const divider = q(".s13-divider")[0] as SVGLineElement;
      const dividerGlow = q(".s13-divider-glow")[0];
      const nodes = q(".s13-node");
      const nodeLabels = q(".s13-node-label");
      const edges = q(".s13-edge") as SVGPathElement[];
      const pulseDots = q(".s13-pulse-dot");
      const sectionLabels = q(".s13-section-label");

      if (reduced) {
        // All visible in final state
        gsap.set(
          [...blocks, ...nodes, ...nodeLabels, ...pulseDots, ...sectionLabels, browserFrame, dividerGlow],
          { opacity: 1, scale: 1, y: 0, x: 0 }
        );
        gsap.set(divider, { scaleY: 1 });
        edges.forEach((e) => gsap.set(e, { strokeDashoffset: 0 }));
        return;
      }

      // ── initial hidden state ──
      gsap.set(browserFrame, { opacity: 0, y: 20, scale: 0.97, transformOrigin: "50% 0%" });
      gsap.set(blocks, { opacity: 0, y: 16, scale: 0.9, transformOrigin: "50% 50%" });
      gsap.set(nodes, { opacity: 0, scale: 0, transformOrigin: "50% 50%" });
      gsap.set(nodeLabels, { opacity: 0, y: 8 });
      gsap.set(pulseDots, { opacity: 0 });
      gsap.set(sectionLabels, { opacity: 0, y: 12 });
      gsap.set(divider, { scaleY: 0, transformOrigin: "50% 0%" });
      gsap.set(dividerGlow, { opacity: 0 });
      edges.forEach((e) => {
        const len = e.getTotalLength();
        gsap.set(e, { strokeDasharray: len, strokeDashoffset: len });
      });

      // ── intro timeline ──
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
        // section labels appear first
        .to(sectionLabels, { opacity: 1, y: 0, duration: 0.4, stagger: 0.12 }, 0)
        // divider draws down
        .to(divider, { scaleY: 1, duration: 0.65, ease: "power2.inOut" }, 0.05)
        .to(dividerGlow, { opacity: 1, duration: 0.5 }, 0.2)
        // browser frame fades in
        .to(browserFrame, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.4)" }, 0.15)
        // blocks assemble one by one
        .to(blocks, { opacity: 1, y: 0, scale: 1, duration: 0.42, stagger: 0.1 }, 0.4)
        // right-side nodes pop in
        .to(nodes, { opacity: 1, scale: 1, duration: 0.4, stagger: 0.1, ease: "back.out(2)" }, 0.5)
        .to(nodeLabels, { opacity: 1, y: 0, duration: 0.35, stagger: 0.08 }, 0.7)
        // edges draw on
        .to(edges, { strokeDashoffset: 0, duration: 0.65, stagger: 0.1, ease: "power2.inOut" }, 0.85);

      // ── sustain loops ──
      intro.add(() => {
        // LEFT: blocks breathe with gentle float
        gsap.to(blocks, {
          y: "-=7",
          duration: 2.6,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: { each: 0.22, from: "start" },
        });

        // LEFT: accent blocks shimmer
        const accentBlocks = q(".s13-block-accent");
        gsap.to(accentBlocks, {
          boxShadow: "0 0 0 2px rgba(0,113,227,.45), 0 12px 36px -10px rgba(0,113,227,.3)",
          duration: 1.8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: { each: 0.4, from: "random" },
        });

        // RIGHT: nodes breathe
        gsap.to(nodes, {
          scale: 1.07,
          duration: 1.6,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: { each: 0.2, from: "center" },
        });

        // RIGHT: output node pulses with glow
        const outNode = q(".s13-node-out")[0];
        if (outNode) {
          gsap.to(outNode, {
            filter: "drop-shadow(0 0 18px rgba(0,113,227,.75))",
            duration: 1.3,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });
        }

        // RIGHT: traveling pulse dots along edges — loop each independently
        pulseDots.forEach((dot, i) => {
          const idx = i % PULSE_PATHS.length;
          const [fromIdx, toIdx] = PULSE_PATHS[idx];
          const from = NDS[fromIdx];
          const to = NDS[toIdx];
          const delay = i * 0.7;
          const travelDur = 1.2;
          const pauseDur = 2.4;

          const loop = () => {
            gsap.set(dot, { x: from.x, y: from.y, opacity: 0.9 });
            gsap.to(dot, {
              x: to.x,
              y: to.y,
              duration: travelDur,
              ease: "power1.inOut",
              onComplete: () => {
                gsap.to(dot, {
                  opacity: 0,
                  duration: 0.2,
                  onComplete: () => {
                    gsap.delayedCall(pauseDur - 0.3, loop);
                  }
                });
              }
            });
          };
          gsap.delayedCall(delay, loop);
        });

        // divider glow breathes
        gsap.to(dividerGlow, {
          opacity: 0.25,
          duration: 2.0,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      });
    }, root);

    return () => ctx.revert();
  }, [active]);

  return (
    <div ref={root} style={{ position: "relative", width: W, height: H, margin: "0 auto" }}>

      {/* ── SVG layer: edges + divider + pulse dots ── */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}
        aria-hidden
      >
        <defs>
          <linearGradient id="s13-edge-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#9cc6f5" />
            <stop offset="1" stopColor="#0071e3" />
          </linearGradient>
          <linearGradient id="s13-divider-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0"    stopColor="rgba(0,113,227,0)" />
            <stop offset="0.2"  stopColor="rgba(0,113,227,0.6)" />
            <stop offset="0.5"  stopColor="rgba(0,113,227,0.9)" />
            <stop offset="0.8"  stopColor="rgba(0,113,227,0.6)" />
            <stop offset="1"    stopColor="rgba(0,113,227,0)" />
          </linearGradient>
          <filter id="s13-node-blur" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id="s13-pulse-blur" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Edges */}
        {EDGES.map(([a, b], i) => {
          const from = NDS[a];
          const to = NDS[b];
          // Slightly curved via quadratic bezier
          const mx = (from.x + to.x) / 2;
          const my = (from.y + to.y) / 2 - 28;
          return (
            <path
              key={i}
              className="s13-edge"
              d={`M${from.x},${from.y} Q${mx},${my} ${to.x},${to.y}`}
              fill="none"
              stroke="url(#s13-edge-grad)"
              strokeWidth={3}
              strokeLinecap="round"
              opacity={0.75}
            />
          );
        })}

        {/* Node glow halos (behind nodes) */}
        {NDS.map((nd) => (
          <circle
            key={nd.id + "-halo"}
            cx={nd.x}
            cy={nd.y}
            r={NR + 14}
            fill="rgba(0,113,227,0.12)"
            filter="url(#s13-node-blur)"
          />
        ))}

        {/* Traveling pulse dots */}
        {PULSE_PATHS.map((_, i) => (
          <circle
            key={"pulse-" + i}
            className="s13-pulse-dot"
            r={6}
            fill="#0a84ff"
            filter="url(#s13-pulse-blur)"
          />
        ))}

        {/* Divider */}
        <line
          className="s13-divider"
          x1={CX}
          y1={10}
          x2={CX}
          y2={H - 10}
          stroke="url(#s13-divider-grad)"
          strokeWidth={2.5}
        />
        {/* Divider glow halo */}
        <rect
          className="s13-divider-glow"
          x={CX - 24}
          y={0}
          width={48}
          height={H}
          fill="rgba(0,113,227,0.06)"
          rx={24}
        />
      </svg>

      {/* ── LEFT SIDE ── ────────────────────────────────────────────────── */}

      {/* Section label: UI/UX */}
      <div
        className="s13-section-label"
        style={{
          position: "absolute",
          left: BROWSER_X,
          top: H - 34,
          fontFamily: "var(--font-display,'Inter'),sans-serif",
          fontWeight: 800,
          fontSize: 20,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          color: "var(--accent)",
        }}
      >
        UI / UX — layout &amp; composition
      </div>

      {/* Browser chrome frame */}
      <div
        className="s13-browser"
        style={{
          position: "absolute",
          left: BROWSER_X,
          top: BROWSER_Y,
          width: BROWSER_W,
          height: BROWSER_H,
          background: "#ffffff",
          border: "1.5px solid var(--line)",
          borderRadius: 18,
          boxShadow: "var(--shadow-md)",
          overflow: "hidden",
        }}
      >
        {/* Browser chrome top bar */}
        <div style={{
          height: CHROME_H,
          background: "var(--surface)",
          borderBottom: "1px solid var(--line)",
          display: "flex",
          alignItems: "center",
          paddingLeft: 20,
          gap: 8,
        }}>
          <span style={{ width: 13, height: 13, borderRadius: "50%", background: "#ff5f57", display: "inline-block" }} />
          <span style={{ width: 13, height: 13, borderRadius: "50%", background: "#febc2e", display: "inline-block" }} />
          <span style={{ width: 13, height: 13, borderRadius: "50%", background: "#28c840", display: "inline-block" }} />
          <div style={{
            flex: 1,
            marginLeft: 20,
            marginRight: 20,
            height: 26,
            background: "var(--line-soft)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            paddingLeft: 10,
            fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
            fontSize: 18,
            color: "var(--muted)",
          }}>
            myapp.vn
          </div>
        </div>
      </div>

      {/* Wireframe blocks overlaid on the browser */}
      {BLK.map((b, i) => (
        <div
          key={i}
          className={`s13-block${b.accent ? " s13-block-accent" : ""}`}
          style={{
            position: "absolute",
            left: b.x,
            top: b.y,
            width: b.w,
            height: b.h,
            background: b.accent
              ? "linear-gradient(135deg, rgba(0,113,227,0.13) 0%, rgba(10,132,255,0.07) 100%)"
              : "linear-gradient(180deg, #ffffff 0%, #f5f6fb 100%)",
            border: b.accent
              ? "1.5px solid rgba(0,113,227,0.35)"
              : "1px solid var(--line)",
            borderRadius: 12,
            boxShadow: b.accent ? "var(--shadow-sm)" : "none",
            display: "flex",
            flexDirection: "column",
            alignItems: b.accent ? "center" : "flex-start",
            justifyContent: "center",
            padding: "0 16px",
            gap: 2,
          }}
        >
          <span style={{
            fontFamily: "var(--font-display,'Inter'),sans-serif",
            fontWeight: 800,
            fontSize: b.accent ? 22 : 20,
            color: b.accent ? "var(--accent)" : "var(--ink)",
            letterSpacing: "-0.01em",
            lineHeight: 1.1,
          }}>
            {b.icon ? `${b.icon} ` : ""}{b.label}
          </span>
          {b.sub && (
            <span style={{
              fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
              fontSize: 18,
              color: "var(--muted)",
              lineHeight: 1.2,
            }}>
              {b.sub}
            </span>
          )}
        </div>
      ))}

      {/* ── RIGHT SIDE ── ───────────────────────────────────────────────── */}

      {/* Section label: Logic business */}
      <div
        className="s13-section-label"
        style={{
          position: "absolute",
          left: CX + 60,
          top: H - 34,
          fontFamily: "var(--font-display,'Inter'),sans-serif",
          fontWeight: 800,
          fontSize: 20,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          color: "var(--accent)",
        }}
      >
        Logic business — state &amp; data flow
      </div>

      {/* Logic nodes (HTML — crisp text) */}
      {NDS.map((nd) => (
        <div
          key={nd.id}
          className={`s13-node${nd.id === "out" ? " s13-node-out" : ""}`}
          style={{
            position: "absolute",
            left: nd.x - NR,
            top: nd.y - NR,
            width: NR * 2,
            height: NR * 2,
            borderRadius: "50%",
            background: `linear-gradient(145deg, ${nd.color ?? "var(--accent)"} 0%, var(--accent-700) 100%)`,
            boxShadow: nd.id === "out"
              ? "var(--glow-accent)"
              : "0 8px 24px -8px rgba(0,113,227,0.55), var(--shadow-sm)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
          }}
        >
          <span style={{
            fontFamily: "var(--font-display,'Inter'),sans-serif",
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}>
            {nd.label}
          </span>
        </div>
      ))}

      {/* Node subtitles (below circles) */}
      {NDS.map((nd) => (
        <div
          key={nd.id + "-label"}
          className="s13-node-label"
          style={{
            position: "absolute",
            left: nd.x - 70,
            top: nd.y + NR + 8,
            width: 140,
            textAlign: "center",
            fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
            fontSize: 18,
            fontWeight: 600,
            color: "var(--muted)",
            lineHeight: 1.2,
          }}
        >
          {nd.sub}
        </div>
      ))}
    </div>
  );
}
