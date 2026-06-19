import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Slide15Toggle — "Free-style vs Design System" motion graphic.
 *
 * Two clearly separated halves with a centered VS divider.
 *
 *  LEFT  (organic / fluid):  soft drifting blobs + loosely floating concept
 *    words (Taste, Cảm quan, Bố cục, Tương phản, Rhythm, Harmony). Represents
 *    "no design given → use frontend-design / Taste to compose freely".
 *
 *  RIGHT (structured / snapped): a tidy 3×2 grid of component tiles, each tagged
 *    with a design token, snapping onto a baseline grid. A token-lint highlight
 *    sweeps tile-by-tile; a token-chip row sits below. Represents
 *    "have a DS → force AI onto base components + tokens".
 *
 *  CENTER: a vertical gradient divider draws on, with a pulsing "VS" badge.
 *
 * Composition is fully computed (no eyeballing) so nothing overlaps and the
 * whole band clears the bottom progress nav (see Slide15 wrapper paddingBottom).
 *
 * Motion: gsap.context((self) => {...}, ref) + ctx.revert() — StrictMode-safe.
 * Reduced-motion → everything visible, no loops. Tokens-only palette.
 */

const W = 1680;
const H = 520;
const CX = W / 2; // 840

// VS center column reserved: x ∈ [CX-44, CX+44] = [796, 884] — both halves stay clear.
const RIGHT_MIN = 928; // structured content keeps x > this

// ─── LEFT: organic blobs (all cx < LEFT_MAX, clear of VS column) ─────────────
interface Blob {
  cx: number; cy: number; rx: number; ry: number;
  rotate: number; fill: string; stroke: string;
}
const BLOBS: Blob[] = [
  { cx: 150, cy: 150, rx: 110, ry: 84, rotate: 14, fill: "rgba(0,113,227,0.12)", stroke: "rgba(0,113,227,0.28)" },
  { cx: 380, cy: 110, rx: 132, ry: 86, rotate: -20, fill: "rgba(10,132,255,0.08)", stroke: "rgba(10,132,255,0.20)" },
  { cx: 230, cy: 360, rx: 100, ry: 78, rotate: 32, fill: "rgba(0,88,176,0.10)", stroke: "rgba(0,88,176,0.20)" },
  { cx: 560, cy: 200, rx: 92, ry: 110, rotate: -8, fill: "rgba(0,113,227,0.08)", stroke: "rgba(0,113,227,0.18)" },
  { cx: 540, cy: 400, rx: 118, ry: 74, rotate: 24, fill: "rgba(10,132,255,0.11)", stroke: "rgba(10,132,255,0.24)" },
  { cx: 680, cy: 300, rx: 64, ry: 56, rotate: -14, fill: "rgba(0,113,227,0.07)", stroke: "rgba(0,113,227,0.16)" },
];
// soft glow accent circles
const ACCENT_CIRCLES = [
  { cx: 300, cy: 230, r: 26 },
  { cx: 460, cy: 330, r: 20 },
  { cx: 640, cy: 160, r: 16 },
  { cx: 170, cy: 410, r: 14 },
];
// floating concept words (left, all x < LEFT_MAX, ≥24px)
interface FloatLabel { x: number; y: number; text: string; size: number; weight: number; alpha: number }
const FLOAT_LABELS: FloatLabel[] = [
  { x: 70, y: 120, text: "Taste", size: 34, weight: 800, alpha: 0.85 },
  { x: 300, y: 90, text: "Composition", size: 26, weight: 700, alpha: 0.62 },
  { x: 110, y: 300, text: "Cảm quan", size: 30, weight: 800, alpha: 0.74 },
  { x: 420, y: 215, text: "Tương phản", size: 24, weight: 700, alpha: 0.55 },
  { x: 250, y: 410, text: "Bố cục", size: 30, weight: 800, alpha: 0.70 },
  { x: 510, y: 130, text: "Rhythm", size: 24, weight: 700, alpha: 0.52 },
  { x: 470, y: 460, text: "Harmony", size: 24, weight: 700, alpha: 0.52 },
];

// ─── RIGHT: tidy 3×2 token grid (clarity over completeness) ──────────────────
const COLS = 3;
const ROWS = 2;
const TILE_W = 200;
const TILE_H = 120;
const GAP = 24;
const COL_STRIDE = TILE_W + GAP; // 224
const ROW_STRIDE = TILE_H + GAP; // 144
const GX0 = RIGHT_MIN + 32; // 960 — grid left edge (clear of VS column)
const GY0 = 64; // grid top (band below the caption at y 0–40)

interface GridCell {
  col: number; row: number;
  label: string; // component name ≥22px
  token: string; // CSS var ≥20px
  isAccent?: boolean;
}
const GRID_CELLS: GridCell[] = [
  { col: 0, row: 0, label: "Button", token: "--radius", isAccent: true },
  { col: 1, row: 0, label: "Card", token: "--shadow-md" },
  { col: 2, row: 0, label: "Badge", token: "--accent", isAccent: true },
  { col: 0, row: 1, label: "Input", token: "--line" },
  { col: 1, row: 1, label: "Chip", token: "--surface", isAccent: true },
  { col: 2, row: 1, label: "Divider", token: "--line-soft" },
];

function cellGeom(cell: GridCell) {
  return {
    x: GX0 + cell.col * COL_STRIDE,
    y: GY0 + cell.row * ROW_STRIDE,
    w: TILE_W,
    h: TILE_H,
  };
}

// Grid extents (computed)
const GRID_RIGHT = GX0 + COLS * TILE_W + (COLS - 1) * GAP; // 960 + 600 + 48 = 1608
const GRID_BOTTOM = GY0 + ROWS * TILE_H + (ROWS - 1) * GAP; // 64 + 240 + 24 = 328

// Snap guide lines framing the grid
const SNAP_PAD = 18;
const SNAP_H = Array.from({ length: ROWS + 1 }, (_, i) => ({ y: GY0 + i * ROW_STRIDE - GAP / 2 }));
const SNAP_V = Array.from({ length: COLS + 1 }, (_, i) => ({ x: GX0 + i * COL_STRIDE - GAP / 2 }));

// Token-chip row band: y 360–400 (below grid bottom 328, clear)
const CHIP_Y = 364;
const TOKEN_STRIP = ["--color-primary", "--spacing-base", "--font-display"];

// Caption baseline band (top, y 0–40) — both halves
const CAP_Y = 26;

export function Slide15Toggle({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !root.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context((self) => {
      const q = (s: string) => Array.from(self.selector!(s) as NodeListOf<Element>);

      const blobs = q(".s15-blob");
      const floatLbls = q(".s15-float-label");
      const gridItems = q(".s15-grid-item");
      const snapLines = q(".s15-snap-line") as SVGLineElement[];
      const tokenChips = q(".s15-token-chip");
      const captions = q(".s15-caption");
      const divLine = q(".s15-divider-line")[0] as SVGLineElement;
      const vsBadge = q(".s15-vs-badge")[0];

      // ── Reduced motion: everything visible, no loops ──────────────────────
      if (reduced) {
        gsap.set([...blobs, ...floatLbls, ...gridItems, ...tokenChips, ...captions, vsBadge], {
          opacity: 1, scale: 1, x: 0, y: 0,
        });
        gsap.set(divLine, { strokeDashoffset: 0 });
        snapLines.forEach((l) => gsap.set(l, { strokeDashoffset: 0, opacity: 0.22 }));
        return;
      }

      // ── Initial hidden state ──────────────────────────────────────────────
      gsap.set(blobs, { opacity: 0, scale: 0.55, transformOrigin: "50% 50%" });
      gsap.set(floatLbls, { opacity: 0, y: 14 });
      gsap.set(gridItems, { opacity: 0, y: -22, scale: 0.86, transformOrigin: "50% 50%" });
      gsap.set(tokenChips, { opacity: 0, x: 16 });
      gsap.set(captions, { opacity: 0, y: 8 });
      gsap.set(vsBadge, { opacity: 0, scale: 0.4, transformOrigin: "50% 50%" });

      const divLen = divLine.getTotalLength ? divLine.getTotalLength() : H;
      gsap.set(divLine, { strokeDasharray: divLen, strokeDashoffset: divLen });
      snapLines.forEach((l) => {
        const len = l.getTotalLength ? l.getTotalLength() : 200;
        gsap.set(l, { strokeDasharray: len, strokeDashoffset: len, opacity: 0.22 });
      });

      // ── Intro timeline ────────────────────────────────────────────────────
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
        .to(captions, { opacity: 1, y: 0, duration: 0.5, stagger: 0.12 }, 0)
        .to(blobs, { opacity: 1, scale: 1, duration: 0.6, stagger: 0.08 }, 0.05)
        .to(floatLbls, { opacity: 1, y: 0, duration: 0.5, stagger: 0.09 }, 0.3)
        .to(divLine, { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut" }, 0.1)
        .to(vsBadge, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2.2)" }, 0.5)
        .to(gridItems, { opacity: 1, y: 0, scale: 1, duration: 0.42, stagger: 0.07, ease: "back.out(1.5)" }, 0.45)
        .to(tokenChips, { opacity: 1, x: 0, duration: 0.4, stagger: 0.1 }, 1.05);

      // ── Sustain loops ─────────────────────────────────────────────────────
      intro.add(() => {
        // LEFT: blobs drift organically (each on its own trajectory)
        blobs.forEach((b, i) => {
          const dx = Math.cos((i / blobs.length) * Math.PI * 2) * 18;
          const dy = Math.sin((i / blobs.length) * Math.PI * 2) * 13;
          const rot = i % 2 === 0 ? 8 : -10;
          gsap.to(b, {
            x: dx, y: dy, rotate: `+=${rot}`,
            duration: 2.8 + i * 0.45,
            ease: "sine.inOut", repeat: -1, yoyo: true,
          });
        });

        // LEFT: concept words gently breathe in opacity
        floatLbls.forEach((l, i) => {
          gsap.to(l, {
            opacity: 0.38,
            duration: 1.8 + i * 0.3,
            ease: "sine.inOut", repeat: -1, yoyo: true,
            delay: i * 0.22,
          });
        });

        // RIGHT: token-lint highlight sweeps tile-by-tile (0.9s each)
        let cycleIdx = 0;
        const runCycle = () => {
          const cur = gridItems[cycleIdx % gridItems.length];
          const tl = gsap.timeline({
            onComplete: () => { cycleIdx++; runCycle(); },
          });
          tl.to(cur, {
            boxShadow: "0 0 0 2px rgba(0,113,227,1), 0 10px 30px -8px rgba(0,113,227,0.55)",
            scale: 1.06, duration: 0.22, ease: "power2.out",
          }).to(cur, {
            boxShadow: "0 2px 8px -2px rgba(20,20,30,0.10)", scale: 1,
            duration: 0.55, ease: "power2.inOut",
          }, 0.28);
        };
        gsap.delayedCall(0.3, runCycle);

        // RIGHT: snap lines re-draw (staggered pulse, snap-to-grid feel)
        snapLines.forEach((l, i) => {
          const len = l.getTotalLength ? l.getTotalLength() : 200;
          gsap.fromTo(
            l,
            { strokeDashoffset: len },
            { strokeDashoffset: 0, duration: 0.65, ease: "power2.inOut", repeat: -1, repeatDelay: 3.5, delay: i * 0.16 }
          );
        });

        // RIGHT: token chips shimmer in sequence
        gsap.to(tokenChips, {
          background: "rgba(0,113,227,0.22)",
          duration: 0.42, ease: "power2.inOut", repeat: -1, yoyo: true,
          stagger: { each: 0.38, from: "start", repeat: -1 },
        });

        // CENTER: VS badge pulse + glow
        gsap.to(vsBadge, {
          scale: 1.12,
          boxShadow: "0 0 0 8px rgba(0,113,227,0.16), 0 18px 50px -16px rgba(0,113,227,0.55)",
          duration: 1.3, ease: "sine.inOut", repeat: -1, yoyo: true,
        });
      });
    }, root);

    return () => ctx.revert();
  }, [active]);

  return (
    <div ref={root} style={{ position: "relative", width: W, height: H, margin: "0 auto" }}>
      {/* ── SVG layer (blobs, snap lines, divider, float words) ─────────────── */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}
        aria-hidden
      >
        <defs>
          <linearGradient id="s15-div-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(0,113,227,0)" />
            <stop offset="0.2" stopColor="rgba(0,113,227,0.5)" />
            <stop offset="0.5" stopColor="#0071e3" />
            <stop offset="0.8" stopColor="rgba(0,113,227,0.5)" />
            <stop offset="1" stopColor="rgba(0,113,227,0)" />
          </linearGradient>
          <filter id="s15-blob-blur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Blobs (left) */}
        {BLOBS.map((b, i) => (
          <ellipse
            key={i}
            className="s15-blob"
            cx={b.cx} cy={b.cy} rx={b.rx} ry={b.ry}
            fill={b.fill} stroke={b.stroke} strokeWidth={1.5}
            transform={`rotate(${b.rotate}, ${b.cx}, ${b.cy})`}
          />
        ))}
        {ACCENT_CIRCLES.map((c, i) => (
          <circle
            key={`ac${i}`}
            className="s15-blob"
            cx={c.cx} cy={c.cy} r={c.r}
            fill="rgba(0,113,227,0.20)"
            filter="url(#s15-blob-blur)"
          />
        ))}

        {/* Snap guide lines (right, frame the grid) */}
        {SNAP_H.map((l, i) => (
          <line
            key={`h${i}`}
            className="s15-snap-line"
            x1={GX0 - SNAP_PAD} y1={l.y}
            x2={GRID_RIGHT + SNAP_PAD} y2={l.y}
            stroke="rgba(0,113,227,0.30)" strokeWidth={1} strokeDasharray="6 4"
          />
        ))}
        {SNAP_V.map((l, i) => (
          <line
            key={`v${i}`}
            className="s15-snap-line"
            x1={l.x} y1={GY0 - SNAP_PAD}
            x2={l.x} y2={GRID_BOTTOM + SNAP_PAD}
            stroke="rgba(0,113,227,0.30)" strokeWidth={1} strokeDasharray="6 4"
          />
        ))}

        {/* Divider */}
        <line
          className="s15-divider-line"
          x1={CX} y1={14} x2={CX} y2={H - 14}
          stroke="url(#s15-div-grad)" strokeWidth={2.5} strokeLinecap="round"
        />

        {/* Float concept words (left) */}
        {FLOAT_LABELS.map((l, i) => (
          <text
            key={i}
            className="s15-float-label"
            x={l.x} y={l.y}
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

      {/* ── RIGHT: grid tiles (DOM for crisp text + box-shadow animation) ───── */}
      {GRID_CELLS.map((cell, i) => {
        const { x, y, w, h } = cellGeom(cell);
        return (
          <div
            key={i}
            className="s15-grid-item"
            style={{
              position: "absolute",
              left: x, top: y, width: w, height: h,
              borderRadius: 16,
              background: cell.isAccent
                ? "linear-gradient(135deg, rgba(0,113,227,0.13), rgba(10,132,255,0.06))"
                : "linear-gradient(180deg, #ffffff 0%, #f5f6fb 100%)",
              border: cell.isAccent
                ? "1.5px solid rgba(0,113,227,0.30)"
                : "1px solid var(--line)",
              boxShadow: "0 2px 8px -2px rgba(20,20,30,0.10)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display,'Inter'),sans-serif",
                fontWeight: 800,
                fontSize: 26,
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
                fontSize: 20,
                fontWeight: 600,
                color: "var(--muted)",
                lineHeight: 1,
              }}
            >
              {cell.token}
            </span>
          </div>
        );
      })}

      {/* ── RIGHT: token-chip row (below the grid) ─────────────────────────── */}
      <div
        style={{
          position: "absolute",
          left: GX0, top: CHIP_Y,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        {TOKEN_STRIP.map((tok) => (
          <span
            key={tok}
            className="s15-token-chip"
            style={{
              background: "rgba(0,113,227,0.10)",
              border: "1px solid rgba(0,113,227,0.24)",
              borderRadius: 10,
              padding: "8px 14px",
              fontFamily: "ui-monospace,'SF Mono',Menlo,monospace",
              fontSize: 20,
              fontWeight: 600,
              color: "var(--accent)",
              whiteSpace: "nowrap",
            }}
          >
            {tok}
          </span>
        ))}
      </div>

      {/* ── LEFT caption (top band) ────────────────────────────────────────── */}
      <div
        className="s15-caption"
        style={{
          position: "absolute",
          left: 8, top: CAP_Y,
          fontFamily: "var(--font-display,'Inter'),sans-serif",
          fontWeight: 800,
          fontSize: 20,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          color: "var(--accent)",
          opacity: 0.72,
          lineHeight: 1,
        }}
      >
        Free-style · Thẩm mỹ tự do
      </div>

      {/* ── RIGHT caption (top band) ───────────────────────────────────────── */}
      <div
        className="s15-caption"
        style={{
          position: "absolute",
          left: GX0, top: CAP_Y,
          fontFamily: "var(--font-display,'Inter'),sans-serif",
          fontWeight: 800,
          fontSize: 20,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          color: "var(--accent)",
          opacity: 0.72,
          lineHeight: 1,
        }}
      >
        Design System · Token + Snap
      </div>

      {/* ── CENTER: VS badge ───────────────────────────────────────────────── */}
      <div
        className="s15-vs-badge"
        style={{
          position: "absolute",
          left: CX - 30, top: H / 2 - 30,
          width: 60, height: 60,
          borderRadius: "50%",
          background: "var(--accent)",
          color: "#fff",
          fontFamily: "var(--font-display,'Inter'),sans-serif",
          fontWeight: 800,
          fontSize: 22,
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
