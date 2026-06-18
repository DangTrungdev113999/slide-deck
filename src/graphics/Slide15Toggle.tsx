import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Slide15Toggle — "Free-style vs Design System" motion graphic.
 *
 * LEFT HALF: Organic creative zone — blobs drift/morph, representing
 *   "no design → AI uses taste + intuition to compose freely".
 *   Labels: Taste, Cảm quan, Composition, Bố cục, Tương phản — at ≥22px.
 *
 * RIGHT HALF: Token grid zone — UI components snap to a strict baseline grid,
 *   highlighted one-by-one in a cycling sweep (like a linter checking each token).
 *   Token var labels at ≥20px, item names at ≥22px.
 *
 * CENTER: A vertical divider draws on, with a "VS" badge that pulses.
 *
 * Motion pattern: gsap.context((self) => { ... }, ref) + return () => ctx.revert()
 * — StrictMode-safe. Reduced-motion: all visible, no animation.
 */

const W = 1680;
const H = 480;
const CX = W / 2; // 840

// ─── LEFT: organic blobs ───────────────────────────────────────────────────
interface Blob {
  cx: number; cy: number; rx: number; ry: number;
  rotate: number; fill: string; stroke: string;
}
const BLOBS: Blob[] = [
  { cx: 110, cy: 115, rx: 96,  ry: 74,  rotate: 14,  fill: "rgba(0,113,227,0.12)", stroke: "rgba(0,113,227,0.28)" },
  { cx: 300, cy: 190, rx: 130, ry: 85,  rotate: -22, fill: "rgba(10,132,255,0.09)", stroke: "rgba(10,132,255,0.22)" },
  { cx: 170, cy: 330, rx: 88,  ry: 68,  rotate: 36,  fill: "rgba(0,88,176,0.10)",   stroke: "rgba(0,88,176,0.20)" },
  { cx: 480, cy: 140, rx: 75,  ry: 95,  rotate: -8,  fill: "rgba(0,113,227,0.08)",  stroke: "rgba(0,113,227,0.18)" },
  { cx: 450, cy: 340, rx: 108, ry: 68,  rotate: 26,  fill: "rgba(10,132,255,0.11)", stroke: "rgba(10,132,255,0.25)" },
  { cx: 620, cy: 240, rx: 70,  ry: 58,  rotate: -14, fill: "rgba(0,113,227,0.07)",  stroke: "rgba(0,113,227,0.16)" },
];
// small accent circles
const ACCENT_CIRCLES = [
  { cx: 255, cy: 165, r: 30 },
  { cx: 395, cy: 285, r: 22 },
  { cx: 570, cy: 155, r: 18 },
  { cx: 130, cy: 390, r: 16 },
];
// floating labels (left side — representing free-style principles)
interface FloatLabel { x: number; y: number; text: string; size: number; weight: number; alpha: number }
const FLOAT_LABELS: FloatLabel[] = [
  { x: 60,  y: 82,  text: "Taste",       size: 28, weight: 800, alpha: 0.80 },
  { x: 220, y: 145, text: "Composition", size: 24, weight: 700, alpha: 0.65 },
  { x: 100, y: 270, text: "Cảm quan",    size: 26, weight: 800, alpha: 0.72 },
  { x: 380, y: 195, text: "Tương phản",  size: 22, weight: 700, alpha: 0.55 },
  { x: 310, y: 350, text: "Bố cục",      size: 26, weight: 800, alpha: 0.68 },
  { x: 530, y: 100,  text: "Rhythm",      size: 22, weight: 700, alpha: 0.50 },
  { x: 500, y: 400, text: "Harmony",     size: 22, weight: 700, alpha: 0.50 },
];

// ─── RIGHT: token grid ─────────────────────────────────────────────────────
const GX0 = CX + 60;   // grid left edge
const GY0 = 32;         // grid top
const COL_W = 190;      // col stride
const ROW_H = 120;      // row stride
const COLS = 3;
const ROWS = 4;

interface GridCell {
  col: number; row: number;
  label: string;          // component name ≥22px
  token: string;          // CSS var shown below ≥20px
  variant: "rect" | "pill" | "sq" | "wide";
  isAccent?: boolean;
}
const GRID_CELLS: GridCell[] = [
  { col: 0, row: 0, label: "Button",   token: "--radius",       variant: "pill",  isAccent: true  },
  { col: 1, row: 0, label: "Card",     token: "--shadow-md",    variant: "rect"                   },
  { col: 2, row: 0, label: "Badge",    token: "--accent",       variant: "sq",    isAccent: true  },
  { col: 0, row: 1, label: "Input",    token: "--line",         variant: "wide"                   },
  { col: 1, row: 1, label: "Chip",     token: "--surface",      variant: "pill",  isAccent: false },
  { col: 2, row: 1, label: "Divider",  token: "--line-soft",    variant: "sq"                     },
  { col: 0, row: 2, label: "Tag",      token: "--ink-soft",     variant: "pill",  isAccent: true  },
  { col: 1, row: 2, label: "Icon",     token: "--accent-700",   variant: "sq",    isAccent: true  },
  { col: 2, row: 2, label: "Avatar",   token: "--radius",       variant: "rect"                   },
  { col: 0, row: 3, label: "Tooltip",  token: "--shadow-lg",    variant: "rect"                   },
  { col: 1, row: 3, label: "Modal",    token: "--bg",           variant: "wide",  isAccent: false },
  { col: 2, row: 3, label: "Switch",   token: "--accent-soft",  variant: "pill",  isAccent: true  },
];

function cellGeom(cell: GridCell) {
  const x = GX0 + cell.col * COL_W;
  const y = GY0 + cell.row * ROW_H;
  const w = cell.variant === "wide" ? 172 : cell.variant === "sq" ? 108 : 148;
  const h = cell.variant === "sq" ? 90 : 74;
  const r = cell.variant === "pill" ? 31 : 14;
  return { x, y, w, h, r };
}

// Snap guide lines (right half, horizontal and vertical)
const SNAP_H: Array<{ y: number }> = Array.from({ length: ROWS + 1 }, (_, i) => ({ y: GY0 + i * ROW_H - 16 }));
const SNAP_V: Array<{ x: number }> = Array.from({ length: COLS + 1 }, (_, i) => ({ x: GX0 + i * COL_W - 10 }));

// Right-side token strip at bottom
const TOKEN_STRIP = [
  "--color-primary", "--spacing-base", "--radius-md", "--font-display",
];

export function Slide15Toggle({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !root.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context((self) => {
      const q = (s: string) => Array.from(self.selector!(s) as NodeListOf<Element>);

      const blobs      = q(".s15-blob");
      const floatLbls  = q(".s15-float-label");
      const gridItems  = q(".s15-grid-item");
      const snapLines  = q(".s15-snap-line") as SVGLineElement[];
      const tokenChips = q(".s15-token-chip");
      const divLine    = q(".s15-divider-line")[0] as SVGLineElement;
      const vsBadge    = q(".s15-vs-badge")[0];

      // ── Reduced motion: everything visible, no loops ──────────────────────
      if (reduced) {
        gsap.set([...blobs, ...floatLbls, ...gridItems, ...tokenChips, vsBadge], {
          opacity: 1, scale: 1, x: 0, y: 0,
        });
        gsap.set(divLine, { strokeDashoffset: 0 });
        snapLines.forEach((l) => gsap.set(l, { strokeDashoffset: 0, opacity: 0.25 }));
        return;
      }

      // ── Initial hidden state ──────────────────────────────────────────────
      gsap.set(blobs,      { opacity: 0, scale: 0.55, transformOrigin: "50% 50%" });
      gsap.set(floatLbls,  { opacity: 0, y: 12 });
      gsap.set(gridItems,  { opacity: 0, y: -18, scale: 0.88, transformOrigin: "50% 50%" });
      gsap.set(tokenChips, { opacity: 0, x: 14 });
      gsap.set(vsBadge,    { opacity: 0, scale: 0.4, transformOrigin: "50% 50%" });

      const divLen = divLine.getTotalLength ? divLine.getTotalLength() : H;
      gsap.set(divLine, { strokeDasharray: divLen, strokeDashoffset: divLen });
      snapLines.forEach((l) => {
        const len = l.getTotalLength ? l.getTotalLength() : 200;
        gsap.set(l, { strokeDasharray: len, strokeDashoffset: len, opacity: 0.25 });
      });

      // ── Intro timeline ────────────────────────────────────────────────────
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
        .to(blobs,     { opacity: 1, scale: 1, duration: 0.6, stagger: 0.08 }, 0)
        .to(floatLbls, { opacity: 1, y: 0,     duration: 0.5, stagger: 0.10 }, 0.35)
        .to(divLine,   { strokeDashoffset: 0,  duration: 0.7, ease: "power2.inOut" }, 0.1)
        .to(vsBadge,   { opacity: 1, scale: 1,  duration: 0.5, ease: "back.out(2.2)" }, 0.5)
        .to(gridItems, { opacity: 1, y: 0, scale: 1, duration: 0.42, stagger: 0.055, ease: "back.out(1.4)" }, 0.45)
        .to(tokenChips,{ opacity: 1, x: 0,     duration: 0.38, stagger: 0.09 }, 1.1);

      // ── Sustain loops ─────────────────────────────────────────────────────
      intro.add(() => {

        // LEFT: blobs drift organically (each blob on its own trajectory)
        blobs.forEach((b, i) => {
          const dx = Math.cos((i / blobs.length) * Math.PI * 2) * 18;
          const dy = Math.sin((i / blobs.length) * Math.PI * 2) * 12;
          const rot = (i % 2 === 0 ? 8 : -10);
          gsap.to(b, {
            x: dx, y: dy,
            rotate: `+=${rot}`,
            duration: 2.8 + i * 0.45,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });
        });

        // LEFT: float labels gently pulse opacity
        floatLbls.forEach((l, i) => {
          gsap.to(l, {
            opacity: 0.35,
            duration: 1.8 + i * 0.3,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: i * 0.22,
          });
        });

        // RIGHT: cycling highlight — visits each grid item in turn, 0.9s each
        let cycleIdx = 0;
        function runCycle() {
          const cur = gridItems[cycleIdx % gridItems.length];
          // flash this item
          const tl = gsap.timeline({
            onComplete: () => {
              cycleIdx++;
              runCycle();
            },
          });
          tl.to(cur, { boxShadow: "0 0 0 2px var(--accent), 0 8px 28px -8px rgba(0,113,227,0.55)", scale: 1.07, duration: 0.22, ease: "power2.out" })
            .to(cur, { boxShadow: "var(--shadow-sm)", scale: 1, duration: 0.55, ease: "power2.inOut" }, 0.28);
        }
        gsap.delayedCall(0.3, runCycle);

        // RIGHT: snap lines re-draw (staggered pulse)
        snapLines.forEach((l, i) => {
          const len = l.getTotalLength ? l.getTotalLength() : 200;
          gsap.fromTo(
            l,
            { strokeDashoffset: len },
            { strokeDashoffset: 0, duration: 0.65, ease: "power2.inOut", repeat: -1, repeatDelay: 3.5, delay: i * 0.18 }
          );
        });

        // RIGHT: token chips shimmer in sequence
        gsap.to(tokenChips, {
          background: "rgba(0,113,227,0.22)",
          duration: 0.42,
          ease: "power2.inOut",
          repeat: -1,
          yoyo: true,
          stagger: { each: 0.38, from: "start", repeat: -1 },
        });

        // VS badge: pulse scale + glow
        gsap.to(vsBadge, {
          scale: 1.12,
          boxShadow: "0 0 0 8px rgba(0,113,227,0.16), 0 18px 50px -16px rgba(0,113,227,0.55)",
          duration: 1.3,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      });
    }, root);

    return () => ctx.revert();
  }, [active]);

  return (
    <div
      ref={root}
      style={{
        position: "relative",
        width: W,
        height: H,
        margin: "0 auto",
      }}
    >
      {/* ── SVG layer ──────────────────────────────────────────────────────── */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}
        aria-hidden
      >
        <defs>
          <linearGradient id="s15-div-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0"   stopColor="rgba(0,113,227,0)"   />
            <stop offset="0.2" stopColor="rgba(0,113,227,0.5)" />
            <stop offset="0.5" stopColor="#0071e3"             />
            <stop offset="0.8" stopColor="rgba(0,113,227,0.5)" />
            <stop offset="1"   stopColor="rgba(0,113,227,0)"   />
          </linearGradient>
          <filter id="s15-blob-blur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* ── Blobs (left side) ── */}
        {BLOBS.map((b, i) => (
          <ellipse
            key={i}
            className="s15-blob"
            cx={b.cx} cy={b.cy} rx={b.rx} ry={b.ry}
            fill={b.fill}
            stroke={b.stroke}
            strokeWidth={1.5}
            transform={`rotate(${b.rotate}, ${b.cx}, ${b.cy})`}
          />
        ))}
        {/* soft glow accent circles */}
        {ACCENT_CIRCLES.map((c, i) => (
          <circle
            key={i}
            className="s15-blob"
            cx={c.cx} cy={c.cy} r={c.r}
            fill="rgba(0,113,227,0.20)"
            filter="url(#s15-blob-blur)"
          />
        ))}

        {/* ── Snap guide lines (right half) ── */}
        {SNAP_H.map((l, i) => (
          <line
            key={`h${i}`}
            className="s15-snap-line"
            x1={GX0 - 20} y1={l.y}
            x2={GX0 + COL_W * COLS + 20} y2={l.y}
            stroke="rgba(0,113,227,0.30)"
            strokeWidth={1}
            strokeDasharray="6 4"
          />
        ))}
        {SNAP_V.map((l, i) => (
          <line
            key={`v${i}`}
            className="s15-snap-line"
            x1={l.x} y1={GY0 - 20}
            x2={l.x} y2={GY0 + ROW_H * ROWS + 20}
            stroke="rgba(0,113,227,0.30)"
            strokeWidth={1}
            strokeDasharray="6 4"
          />
        ))}

        {/* ── Divider line ── */}
        <line
          className="s15-divider-line"
          x1={CX} y1={12}
          x2={CX} y2={H - 12}
          stroke="url(#s15-div-grad)"
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {/* ── Float labels (left side, rendered in SVG for transform support) ── */}
        {FLOAT_LABELS.map((l, i) => (
          <text
            key={i}
            className="s15-float-label"
            x={l.x}
            y={l.y}
            fontFamily="var(--font-display,'Inter'),sans-serif"
            fontWeight={l.weight}
            fontSize={l.size}
            fill={`rgba(0,113,227,${l.alpha})`}
            letterSpacing="-0.01em"
          >
            {l.text}
          </text>
        ))}
      </svg>

      {/* ── RIGHT: Grid cell items (DOM for crisp text + box-shadow animation) ── */}
      {GRID_CELLS.map((cell, i) => {
        const { x, y, w, h, r } = cellGeom(cell);
        return (
          <div
            key={i}
            className="s15-grid-item"
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: w,
              height: h,
              borderRadius: r,
              background: cell.isAccent
                ? "linear-gradient(135deg, rgba(0,113,227,0.13), rgba(10,132,255,0.06))"
                : "linear-gradient(180deg, #ffffff 0%, #f5f6fb 100%)",
              border: cell.isAccent
                ? "1.5px solid rgba(0,113,227,0.30)"
                : "1px solid var(--line)",
              boxShadow: "var(--shadow-sm)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              padding: "6px 10px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display,'Inter'),sans-serif",
                fontWeight: 800,
                fontSize: 22,
                color: cell.isAccent ? "var(--accent)" : "var(--ink)",
                letterSpacing: "-0.01em",
                lineHeight: 1,
              }}
            >
              {cell.label}
            </span>
            <span
              style={{
                fontFamily: "ui-monospace,'SF Mono',Menlo,monospace",
                fontSize: 18,
                fontWeight: 600,
                color: "var(--muted)",
                lineHeight: 1,
                opacity: 0.80,
              }}
            >
              {cell.token}
            </span>
          </div>
        );
      })}

      {/* ── LEFT: section header ── */}
      <div
        style={{
          position: "absolute",
          left: 40,
          top: H - 52,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display,'Inter'),sans-serif",
            fontWeight: 800,
            fontSize: 20,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            color: "var(--accent)",
            opacity: 0.70,
          }}
        >
          Free-style · Thẩm mỹ tự do
        </span>
      </div>

      {/* ── RIGHT: section header + token strip ── */}
      <div
        style={{
          position: "absolute",
          left: CX + 44,
          top: H - 52,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display,'Inter'),sans-serif",
            fontWeight: 800,
            fontSize: 20,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            color: "var(--accent)",
            opacity: 0.70,
          }}
        >
          Design System · Token + Snap
        </span>
        {TOKEN_STRIP.map((tok) => (
          <span
            key={tok}
            className="s15-token-chip"
            style={{
              background: "rgba(0,113,227,0.10)",
              border: "1px solid rgba(0,113,227,0.24)",
              borderRadius: 8,
              padding: "3px 10px",
              fontFamily: "ui-monospace,'SF Mono',Menlo,monospace",
              fontSize: 18,
              fontWeight: 600,
              color: "var(--accent)",
              whiteSpace: "nowrap",
            }}
          >
            {tok}
          </span>
        ))}
      </div>

      {/* ── CENTER: VS badge ── */}
      <div
        className="s15-vs-badge"
        style={{
          position: "absolute",
          left: CX - 28,
          top: H / 2 - 28,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "var(--accent)",
          color: "#fff",
          fontFamily: "var(--font-display,'Inter'),sans-serif",
          fontWeight: 800,
          fontSize: 20,
          display: "grid",
          placeItems: "center",
          boxShadow: "0 0 0 6px rgba(0,113,227,0.18), var(--glow-accent)",
          zIndex: 10,
          letterSpacing: "-0.01em",
        }}
      >
        VS
      </div>
    </div>
  );
}
