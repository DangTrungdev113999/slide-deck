import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Slide15Toggle — two-column motion graphic.
 * LEFT: organic free shapes drifting / morphing (Free-style)
 * RIGHT: elements snapping to a strict grid (Design System)
 * A toggle divider pulses between them.
 */

const W = 1540;
const H = 400;
const CX = W / 2;

// Free-style blobs (left side) — irregular polygons that drift/morph
const BLOBS = [
  { x: 120, y: 120, rx: 90, ry: 70, rotate: 12, color: "rgba(0,113,227,0.15)" },
  { x: 310, y: 200, rx: 120, ry: 80, rotate: -18, color: "rgba(10,132,255,0.10)" },
  { x: 180, y: 300, rx: 80, ry: 60, rotate: 30, color: "rgba(0,88,176,0.12)" },
  { x: 450, y: 130, rx: 70, ry: 90, rotate: -5, color: "rgba(0,113,227,0.08)" },
  { x: 420, y: 310, rx: 100, ry: 65, rotate: 22, color: "rgba(10,132,255,0.13)" },
];

// Design System tokens grid (right side) — elements that snap to perfect positions
interface GridItem { col: number; row: number; variant: "rect" | "sq" | "pill" }
const GRID_ITEMS: GridItem[] = [
  { col: 0, row: 0, variant: "pill" },
  { col: 1, row: 0, variant: "rect" },
  { col: 2, row: 0, variant: "sq" },
  { col: 0, row: 1, variant: "rect" },
  { col: 1, row: 1, variant: "sq" },
  { col: 2, row: 1, variant: "pill" },
  { col: 0, row: 2, variant: "sq" },
  { col: 1, row: 2, variant: "rect" },
  { col: 2, row: 2, variant: "sq" },
];
const GRID_X0 = CX + 70;
const GRID_COL_W = 148;
const GRID_ROW_H = 110;
const GRID_Y0 = 55;

function gridItemBounds(item: GridItem) {
  const x = GRID_X0 + item.col * GRID_COL_W;
  const y = GRID_Y0 + item.row * GRID_ROW_H;
  const w = item.variant === "sq" ? 100 : item.variant === "pill" ? 120 : 130;
  const h = item.variant === "sq" ? 70 : item.variant === "pill" ? 44 : 70;
  const r = item.variant === "pill" ? 22 : 14;
  return { x, y, w, h, r };
}

export function Slide15Toggle({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !root.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context((self) => {
      const q = (s: string) => self.selector!(s) as Element[];

      const blobs = q(".s15-blob");
      const blobLabels = q(".s15-blob-label");
      const gridItems = q(".s15-grid-item");
      const snapLines = q(".s15-snap-line") as SVGLineElement[];
      const dividerLine = q(".s15-divider")[0];
      const dividerDot = q(".s15-divider-dot")[0];
      const tokenBadges = q(".s15-token");

      if (reduced) {
        gsap.set([...blobs, ...blobLabels, ...gridItems, ...tokenBadges, dividerLine, dividerDot], {
          opacity: 1, scale: 1, x: 0, y: 0,
        });
        snapLines.forEach((l) => gsap.set(l, { strokeDashoffset: 0, opacity: 0.3 }));
        return;
      }

      // Initial hidden
      gsap.set(blobs, { opacity: 0, scale: 0.6, transformOrigin: "50% 50%" });
      gsap.set(blobLabels, { opacity: 0 });
      gsap.set(gridItems, { opacity: 0, y: -20, scale: 0.85, transformOrigin: "50% 50%" });
      gsap.set(tokenBadges, { opacity: 0, x: 10 });
      gsap.set(dividerLine, { scaleY: 0, transformOrigin: "50% 0%" });
      gsap.set(dividerDot, { opacity: 0, scale: 0 });
      snapLines.forEach((l) => {
        const len = l.getTotalLength ? l.getTotalLength() : 300;
        gsap.set(l, { strokeDasharray: len, strokeDashoffset: len, opacity: 0.3 });
      });

      // Intro
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
        .to(dividerLine, { scaleY: 1, duration: 0.65, ease: "power2.inOut" }, 0)
        .to(dividerDot, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, 0.3)
        .to(blobs, { opacity: 1, scale: 1, duration: 0.55, stagger: 0.1 }, 0.1)
        .to(blobLabels, { opacity: 1, duration: 0.4, stagger: 0.1 }, 0.5)
        .to(gridItems, { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.07, ease: "back.out(1.5)" }, 0.3)
        .to(tokenBadges, { opacity: 1, x: 0, duration: 0.35, stagger: 0.1 }, 0.9);

      // Sustain loops
      intro.add(() => {
        // LEFT: blobs drift organically
        blobs.forEach((b, i) => {
          const angle = (i / blobs.length) * Math.PI * 2;
          gsap.to(b, {
            x: Math.cos(angle) * 14,
            y: Math.sin(angle) * 10,
            rotate: `+=${(i % 2 === 0 ? 6 : -8)}`,
            duration: 2.4 + i * 0.5,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });
        });

        // RIGHT: grid items snap (slight bounce on each, staggered cycle)
        const snapLoop = () => {
          gsap.to(gridItems, {
            y: -4,
            duration: 0.18,
            ease: "power2.out",
            stagger: { each: 0.08, from: "random" },
            onComplete: () => {
              gsap.to(gridItems, {
                y: 0,
                duration: 0.25,
                ease: "bounce.out",
                stagger: { each: 0.08, from: "random" },
                onComplete: () => {
                  gsap.delayedCall(2.2, snapLoop);
                },
              });
            },
          });
        };
        gsap.delayedCall(0.5, snapLoop);

        // snap lines re-draw
        snapLines.forEach((l, i) => {
          const len = l.getTotalLength ? l.getTotalLength() : 300;
          gsap.fromTo(
            l,
            { strokeDashoffset: len },
            { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut", repeat: -1, repeatDelay: 2.8, delay: i * 0.25 }
          );
        });

        // divider dot pulse
        gsap.to(dividerDot, {
          boxShadow: "0 0 0 12px rgba(0,113,227,0.18), 0 0 32px rgba(0,113,227,0.35)",
          scale: 1.15,
          duration: 1.1,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });

        // token badges flash in sequence
        gsap.to(tokenBadges, {
          background: "rgba(0,113,227,0.22)",
          duration: 0.4,
          ease: "power2.inOut",
          repeat: -1,
          yoyo: true,
          stagger: { each: 0.4, repeat: -1, from: "start" },
        });
      });
    }, root);

    return () => ctx.revert();
  }, [active]);

  // SVG snap guide lines (right side)
  const SNAP_LINES = [
    { x1: GRID_X0 - 10, y1: GRID_Y0, x2: GRID_X0 + GRID_COL_W * 3 + 10, y2: GRID_Y0 },
    { x1: GRID_X0 - 10, y1: GRID_Y0 + GRID_ROW_H, x2: GRID_X0 + GRID_COL_W * 3 + 10, y2: GRID_Y0 + GRID_ROW_H },
    { x1: GRID_X0 - 10, y1: GRID_Y0 + GRID_ROW_H * 2, x2: GRID_X0 + GRID_COL_W * 3 + 10, y2: GRID_Y0 + GRID_ROW_H * 2 },
    { x1: GRID_X0, y1: GRID_Y0 - 10, x2: GRID_X0, y2: GRID_Y0 + GRID_ROW_H * 3 + 10 },
    { x1: GRID_X0 + GRID_COL_W, y1: GRID_Y0 - 10, x2: GRID_X0 + GRID_COL_W, y2: GRID_Y0 + GRID_ROW_H * 3 + 10 },
    { x1: GRID_X0 + GRID_COL_W * 2, y1: GRID_Y0 - 10, x2: GRID_X0 + GRID_COL_W * 2, y2: GRID_Y0 + GRID_ROW_H * 3 + 10 },
  ];

  const TOKEN_LABELS = ["--color-primary", "--spacing-4", "--radius-md"];

  return (
    <div ref={root} style={{ position: "relative", width: W, height: H, margin: "0 auto" }}>
      {/* SVG layer */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
        aria-hidden
      >
        <defs>
          <linearGradient id="s15-divider-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(0,113,227,0)" />
            <stop offset="0.3" stopColor="rgba(0,113,227,0.6)" />
            <stop offset="0.5" stopColor="#0071e3" />
            <stop offset="0.7" stopColor="rgba(0,113,227,0.6)" />
            <stop offset="1" stopColor="rgba(0,113,227,0)" />
          </linearGradient>
        </defs>

        {/* Snap guide lines (right side) */}
        {SNAP_LINES.map((l, i) => (
          <line
            key={i}
            className="s15-snap-line"
            x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke="rgba(0,113,227,0.35)"
            strokeWidth={1}
            strokeDasharray="5,5"
          />
        ))}

        {/* LEFT side blobs */}
        {BLOBS.map((b, i) => (
          <ellipse
            key={i}
            className="s15-blob"
            cx={b.x}
            cy={b.y}
            rx={b.rx}
            ry={b.ry}
            fill={b.color}
            stroke="rgba(0,113,227,0.2)"
            strokeWidth={1.5}
            transform={`rotate(${b.rotate}, ${b.x}, ${b.y})`}
          />
        ))}

        {/* Small accent circle blobs */}
        <circle className="s15-blob" cx={260} cy={170} r={28} fill="rgba(0,113,227,0.18)" />
        <circle className="s15-blob" cx={390} cy={280} r={20} fill="rgba(10,132,255,0.14)" />

        {/* Divider */}
        <line
          className="s15-divider"
          x1={CX}
          y1={10}
          x2={CX}
          y2={H - 10}
          stroke="url(#s15-divider-grad)"
          strokeWidth={2.5}
        />
      </svg>

      {/* RIGHT: Grid items (DOM, for crisp text) */}
      {GRID_ITEMS.map((item, i) => {
        const { x, y, w, h, r } = gridItemBounds(item);
        const isAccent = i % 3 === 0;
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
              background: isAccent
                ? "linear-gradient(135deg, rgba(0,113,227,0.16), rgba(10,132,255,0.08))"
                : "linear-gradient(180deg, #fff, #f5f6fb)",
              border: isAccent ? "1.5px solid rgba(0,113,227,0.28)" : "1px solid var(--line)",
              boxShadow: "var(--shadow-sm)",
            }}
          />
        );
      })}

      {/* Token badges (right side, bottom) */}
      {TOKEN_LABELS.map((label, i) => (
        <div
          key={label}
          className="s15-token"
          style={{
            position: "absolute",
            left: GRID_X0 + i * 148,
            top: H - 48,
            background: "rgba(0,113,227,0.10)",
            border: "1px solid rgba(0,113,227,0.22)",
            borderRadius: 8,
            padding: "4px 10px",
            fontFamily: "ui-monospace,'SF Mono',Menlo,monospace",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--accent)",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      ))}

      {/* Divider dot (DOM for box-shadow animation) */}
      <div
        className="s15-divider-dot"
        style={{
          position: "absolute",
          left: CX - 14,
          top: H / 2 - 14,
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "var(--accent)",
          boxShadow: "0 0 0 6px rgba(0,113,227,0.18), var(--glow-accent)",
          zIndex: 2,
        }}
      />

      {/* LEFT column label */}
      <div
        style={{
          position: "absolute",
          left: 60,
          top: H - 32,
          fontFamily: "var(--font-display,'Inter'),sans-serif",
          fontWeight: 800,
          fontSize: 13,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--accent)",
          opacity: 0.65,
        }}
      >
        Free-style · thẩm mỹ tự do
      </div>
      <div
        style={{
          position: "absolute",
          left: CX + 60,
          top: H - 32,
          fontFamily: "var(--font-display,'Inter'),sans-serif",
          fontWeight: 800,
          fontSize: 13,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--accent)",
          opacity: 0.65,
        }}
      >
        Design System · token + snap
      </div>
    </div>
  );
}
