import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Slide10SubPlugin — two-zone motion graphic for slide #9 "Subagent · Plugin"
 *
 * LEFT zone  — Subagent: coordinator node fans out to 3 parallel agent lanes,
 *              each fills a progress bar concurrently, then merges back.
 * RIGHT zone — Plugin: four piece chips (skill/hook/MCP/subagent) fly in from
 *              corners and assemble into a glowing bundle box.
 *
 * Animation: single master timeline with repeat:-1 so ctx.revert() catches it.
 * StrictMode-safe: gsap.context(fn, ref) + return () => ctx.revert().
 * Reduced-motion: all elements set to final visible state, no motion.
 * Color: token-only (#0071e3 family + --danger + neutrals, zero foreign hues).
 * Text: node labels ≥22px/700, captions ≥20px, chips ≥20px.
 */

const W = 1680;
const H = 480;

/* ---- Subagent zone geometry ---- */
const SA_LEFT = 0;
const SA_RIGHT = 800;

// Coordinator node (top-centre of left zone)
const COORD_CX = 170;
const COORD_CY = 68;
const COORD_R = 38;

// Three parallel lanes (agent cards)
const LANES = [
  { x: 130, y: 210, label: "Agent A", color: "#0071e3" },
  { x: 350, y: 210, label: "Agent B", color: "#0058b0" },
  { x: 570, y: 210, label: "Agent C", color: "#3a9bff" },
];

// Merge node (bottom-centre of left zone)
const MERGE_CX = 350;
const MERGE_CY = 400;
const MERGE_R = 38;

/* ---- Plugin zone geometry ---- */
const PL_OFFSET = 880; // left offset for plugin section

const BUNDLE_CX = 400; // relative to PL_OFFSET
const BUNDLE_CY = 220;
const BUNDLE_W = 240;
const BUNDLE_H = 140;

// Four piece chips, positioned around the bundle; fly in from further out
const PIECES = [
  {
    id: "skill",
    label: "skill",
    icon: "/",
    toX: 100,
    toY: 120,
    fromDX: -160,
    fromDY: -120,
    color: "#0071e3",
  },
  {
    id: "hook",
    label: "hook",
    icon: "⚡",
    toX: 660,
    toY: 120,
    fromDX: 160,
    fromDY: -120,
    color: "#ff3b30",
  },
  {
    id: "mcp",
    label: "MCP",
    icon: "⚙",
    toX: 100,
    toY: 320,
    fromDX: -160,
    fromDY: 120,
    color: "#0058b0",
  },
  {
    id: "subagent",
    label: "subagent",
    icon: "◳",
    toX: 660,
    toY: 320,
    fromDX: 160,
    fromDY: 120,
    color: "#3a9bff",
  },
];

const CARD_W = 160;
const CARD_H = 100;
const PIECE_W = 136;
const PIECE_H = 58;

// One full animation cycle (seconds) — both zones share the same period
const CYCLE = 5.2;

export function Slide10SubPlugin({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !root.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context((self) => {
      const q = (s: string) => self.selector!(s) as HTMLElement[];

      const coord = q(".sa-coord")[0];
      const mergeNode = q(".sa-merge")[0];
      const cards = q(".sa-card");
      const fills = q(".sa-fill");
      const svgForkLines = root.current!.querySelectorAll<SVGLineElement>(".sa-fork-line");
      const svgMergeLines = root.current!.querySelectorAll<SVGLineElement>(".sa-merge-line");
      const pieces = q(".pl-piece");
      const bundle = q(".pl-bundle")[0];
      const bundleLabel = q(".pl-bundle-label")[0];
      const bundleIcon = q(".pl-bundle-icon")[0];
      // connector lines inside SVG for plugin
      const plLines = root.current!.querySelectorAll<SVGLineElement>(".pl-conn");

      // ---- Reduced motion: show everything immediately ----
      if (reduced) {
        gsap.set([coord, mergeNode, ...cards, bundle, bundleLabel, bundleIcon], {
          opacity: 1,
          scale: 1,
          y: 0,
        });
        gsap.set(fills, { scaleX: 1, transformOrigin: "left center" });
        gsap.set(pieces, { opacity: 1, x: 0, y: 0 });
        gsap.set([...svgForkLines, ...svgMergeLines, ...plLines], { opacity: 1 });
        return;
      }

      // ---- Initial hidden state ----
      gsap.set([coord, mergeNode, bundle, bundleLabel, bundleIcon], {
        opacity: 0,
        scale: 0.7,
        transformOrigin: "50% 50%",
      });
      gsap.set(cards, { opacity: 0, y: 20 });
      gsap.set(fills, { scaleX: 0, transformOrigin: "left center" });
      gsap.set(pieces, { opacity: 0, x: 0, y: 0 });
      gsap.set([...svgForkLines, ...svgMergeLines, ...plLines], { opacity: 0 });

      // ---- Master loop timeline (repeat:-1 → ctx.revert() cleans it up) ----
      const tl = gsap.timeline({ repeat: -1, defaults: { ease: "power3.out" } });

      /* ===== SUBAGENT zone beats ===== */

      // 0.0 — coordinator pops in
      tl.to(coord, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" }, 0);

      // 0.35 — fork lines draw on (stagger)
      tl.to([...svgForkLines], { opacity: 1, duration: 0.35, stagger: 0.08 }, 0.35);

      // 0.65 — agent cards land in (stagger)
      tl.to(cards, { opacity: 1, y: 0, duration: 0.38, stagger: 0.1, ease: "back.out(1.5)" }, 0.65);

      // 1.0 — all three fills race concurrently (song song!)
      tl.to(fills, { scaleX: 1, duration: 0.9, ease: "power2.inOut", stagger: 0.06 }, 1.0);

      // 2.0 — merge lines appear
      tl.to([...svgMergeLines], { opacity: 1, duration: 0.35, stagger: 0.08 }, 2.0);

      // 2.35 — merge node pops + micro-pulse
      tl.to(mergeNode, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" }, 2.35);
      tl.to(mergeNode, { scale: 1.1, duration: 0.25, ease: "sine.inOut", yoyo: true, repeat: 2 }, 2.75);

      /* ===== PLUGIN zone beats (offset slightly so they start together but feel independent) ===== */

      // 0.2 — connector lines fade in
      tl.to([...plLines], { opacity: 1, duration: 0.3, stagger: 0.07 }, 0.2);

      // 0.4 — piece chips fly in from corners
      PIECES.forEach((p, i) => {
        const el = pieces[i];
        tl.fromTo(
          el,
          { opacity: 0, x: p.fromDX * 0.6, y: p.fromDY * 0.6 },
          { opacity: 1, x: 0, y: 0, duration: 0.45, ease: "back.out(1.5)" },
          0.4 + i * 0.11
        );
      });

      // 1.1 — bundle box assembles
      tl.to(bundle, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.7)" }, 1.1);
      tl.to([bundleLabel, bundleIcon], { opacity: 1, duration: 0.3 }, 1.4);

      // 1.7 — pieces merge into box
      tl.to(pieces, {
        opacity: 0,
        scale: 0.3,
        x: 0,
        y: 0,
        duration: 0.38,
        ease: "power2.in",
        stagger: 0.06,
        transformOrigin: "50% 50%",
      }, 1.7);

      // 2.1 — bundle glows + pulses
      tl.to(bundle, {
        boxShadow:
          "0 0 0 6px rgba(0,113,227,.22), 0 20px 70px -14px rgba(0,113,227,.55)",
        scale: 1.06,
        duration: 0.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: 2,
      }, 2.1);

      /* ===== Hold at end, then reset for next cycle ===== */
      // At CYCLE - 0.4 seconds, reset everything
      tl.set(
        [coord, mergeNode, bundle, bundleLabel, bundleIcon],
        { opacity: 0, scale: 0.7 },
        CYCLE - 0.4
      );
      tl.set(cards, { opacity: 0, y: 20 }, CYCLE - 0.4);
      tl.set(fills, { scaleX: 0 }, CYCLE - 0.4);
      tl.set(pieces, { opacity: 0, x: 0, y: 0, scale: 1 }, CYCLE - 0.4);
      tl.set([...svgForkLines, ...svgMergeLines, ...plLines], { opacity: 0 }, CYCLE - 0.4);
      // Pad to full CYCLE duration
      tl.to({}, { duration: 0.4 }, CYCLE - 0.4);
    }, root);

    return () => ctx.revert();
  }, [active]);

  return (
    <div
      ref={root}
      style={{ position: "relative", width: W, height: H, margin: "0 auto" }}
    >
      {/* ============================================================
          SECTION LABELS — large, full-zone headers
      ============================================================ */}
      <div
        style={{
          position: "absolute",
          left: SA_LEFT,
          top: 0,
          width: SA_RIGHT - SA_LEFT,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display,'Inter'),sans-serif",
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--accent)",
            background: "var(--accent-soft)",
            padding: "4px 14px",
            borderRadius: 8,
          }}
        >
          Subagent
        </span>
        <span
          style={{
            fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
            fontSize: 20,
            color: "var(--muted)",
          }}
        >
          3 agent · chạy song song
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          left: PL_OFFSET,
          top: 0,
          width: W - PL_OFFSET,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display,'Inter'),sans-serif",
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--accent-700)",
            background: "rgba(0,88,176,.08)",
            padding: "4px 14px",
            borderRadius: 8,
          }}
        >
          Plugin
        </span>
        <span
          style={{
            fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
            fontSize: 20,
            color: "var(--muted)",
          }}
        >
          skill + hook + MCP + subagent = 1 bundle
        </span>
      </div>

      {/* Vertical divider between zones */}
      <div
        style={{
          position: "absolute",
          left: (PL_OFFSET + SA_RIGHT) / 2,
          top: 40,
          width: 1,
          bottom: 0,
          background:
            "linear-gradient(to bottom, transparent, var(--line) 20%, var(--line) 80%, transparent)",
        }}
      />

      {/* ============================================================
          LEFT ZONE: SVG connector lines
      ============================================================ */}
      <svg
        viewBox={`0 0 ${SA_RIGHT} ${H}`}
        width={SA_RIGHT}
        height={H}
        style={{ position: "absolute", left: SA_LEFT, top: 0, overflow: "visible" }}
        aria-hidden
      >
        <defs>
          <linearGradient id="sa-fill-a" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#9cc6f5" />
            <stop offset="1" stopColor="#0071e3" />
          </linearGradient>
          <linearGradient id="sa-fill-b" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#7aa8e0" />
            <stop offset="1" stopColor="#0058b0" />
          </linearGradient>
          <linearGradient id="sa-fill-c" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#c5dff7" />
            <stop offset="1" stopColor="#3a9bff" />
          </linearGradient>
        </defs>

        {/* Fork lines: coordinator → each lane top */}
        {LANES.map((lane, i) => (
          <line
            key={`fork-${i}`}
            className="sa-fork-line"
            x1={COORD_CX}
            y1={COORD_CY + COORD_R}
            x2={lane.x + CARD_W / 2}
            y2={lane.y}
            stroke={lane.color}
            strokeWidth={2.5}
            strokeDasharray="7 5"
            opacity={0}
          />
        ))}

        {/* Merge lines: lane bottom → merge node */}
        {LANES.map((lane, i) => (
          <line
            key={`merge-${i}`}
            className="sa-merge-line"
            x1={lane.x + CARD_W / 2}
            y1={lane.y + CARD_H}
            x2={MERGE_CX}
            y2={MERGE_CY - MERGE_R}
            stroke={lane.color}
            strokeWidth={2.5}
            strokeDasharray="7 5"
            opacity={0}
          />
        ))}
      </svg>

      {/* Coordinator node */}
      <div
        className="sa-coord"
        style={{
          position: "absolute",
          left: COORD_CX - COORD_R,
          top: COORD_CY - COORD_R,
          width: COORD_R * 2,
          height: COORD_R * 2,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #0071e3 0%, #0058b0 100%)",
          boxShadow: "var(--glow-accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display,'Inter'),sans-serif",
            fontWeight: 800,
            fontSize: 22,
            color: "#fff",
            letterSpacing: "-0.01em",
          }}
        >
          ◳
        </span>
      </div>

      {/* Coordinator label */}
      <div
        style={{
          position: "absolute",
          left: COORD_CX + COORD_R + 14,
          top: COORD_CY - 14,
          fontFamily: "var(--font-display,'Inter'),sans-serif",
          fontWeight: 700,
          fontSize: 22,
          color: "var(--ink-soft)",
        }}
      >
        coordinator
      </div>

      {/* Agent lane cards */}
      {LANES.map((lane, i) => (
        <div
          key={lane.label}
          className="sa-card"
          style={{
            position: "absolute",
            left: lane.x,
            top: lane.y,
            width: CARD_W,
            height: CARD_H,
            background: "linear-gradient(180deg, #fff 0%, #f5f7fb 100%)",
            border: `2px solid ${lane.color}44`,
            borderRadius: 18,
            boxShadow: "var(--shadow-md)",
            padding: "14px 16px 12px",
            opacity: 0,
          }}
        >
          {/* badge */}
          <span
            style={{
              position: "absolute",
              top: -14,
              left: 16,
              width: 28,
              height: 28,
              borderRadius: 8,
              background: lane.color,
              color: "#fff",
              fontFamily: "var(--font-display,'Inter'),sans-serif",
              fontWeight: 800,
              fontSize: 14,
              display: "grid",
              placeItems: "center",
              boxShadow: `0 6px 14px -4px ${lane.color}99`,
            }}
          >
            {i + 1}
          </span>
          <span
            style={{
              display: "block",
              fontFamily: "var(--font-display,'Inter'),sans-serif",
              fontWeight: 800,
              fontSize: 22,
              color: lane.color,
              marginBottom: 10,
            }}
          >
            {lane.label}
          </span>
          {/* Progress bar */}
          <div
            style={{
              height: 10,
              background: "var(--line)",
              borderRadius: 5,
              overflow: "hidden",
            }}
          >
            <div
              className="sa-fill"
              style={{
                height: "100%",
                borderRadius: 5,
                background:
                  i === 0
                    ? "linear-gradient(90deg, #9cc6f5, #0071e3)"
                    : i === 1
                    ? "linear-gradient(90deg, #7aa8e0, #0058b0)"
                    : "linear-gradient(90deg, #c5dff7, #3a9bff)",
              }}
            />
          </div>
          <span
            style={{
              display: "block",
              fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
              fontSize: 20,
              color: "var(--muted)",
              marginTop: 8,
            }}
          >
            running…
          </span>
        </div>
      ))}

      {/* Merge node */}
      <div
        className="sa-merge"
        style={{
          position: "absolute",
          left: MERGE_CX - MERGE_R,
          top: MERGE_CY - MERGE_R,
          width: MERGE_R * 2,
          height: MERGE_R * 2,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #0071e3 0%, #0058b0 100%)",
          boxShadow: "var(--glow-accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display,'Inter'),sans-serif",
            fontWeight: 800,
            fontSize: 20,
            color: "#fff",
          }}
        >
          ✓
        </span>
      </div>
      {/* Merge label */}
      <div
        style={{
          position: "absolute",
          left: MERGE_CX + MERGE_R + 14,
          top: MERGE_CY - 13,
          fontFamily: "var(--font-display,'Inter'),sans-serif",
          fontWeight: 700,
          fontSize: 22,
          color: "var(--ink-soft)",
        }}
      >
        merge result
      </div>

      {/* Song song indicator */}
      <div
        style={{
          position: "absolute",
          left: SA_LEFT + 440,
          top: COORD_CY - 10,
          fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
          fontSize: 20,
          fontWeight: 700,
          color: "var(--accent)",
          letterSpacing: "0.02em",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--accent)",
            boxShadow: "0 0 0 4px var(--accent-soft)",
            display: "inline-block",
          }}
        />
        song song
      </div>

      {/* ============================================================
          RIGHT ZONE: Plugin graphic
      ============================================================ */}
      <div
        style={{
          position: "absolute",
          left: PL_OFFSET,
          top: 0,
          width: W - PL_OFFSET,
          height: H,
        }}
      >
        {/* SVG connector lines from pieces to bundle */}
        <svg
          viewBox={`0 0 ${W - PL_OFFSET} ${H}`}
          width={W - PL_OFFSET}
          height={H}
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
          aria-hidden
        >
          {PIECES.map((p, i) => (
            <line
              key={`plconn-${i}`}
              className="pl-conn"
              x1={p.toX + PIECE_W / 2}
              y1={p.toY + PIECE_H / 2}
              x2={BUNDLE_CX + BUNDLE_W / 2}
              y2={BUNDLE_CY + BUNDLE_H / 2}
              stroke={p.color}
              strokeWidth={1.5}
              strokeDasharray="5 4"
              opacity={0}
            />
          ))}
        </svg>

        {/* Piece chips */}
        {PIECES.map((p) => (
          <div
            key={p.id}
            className="pl-piece"
            style={{
              position: "absolute",
              left: p.toX,
              top: p.toY,
              width: PIECE_W,
              height: PIECE_H,
              background: "#fff",
              border: `2px solid ${p.color}55`,
              borderRadius: 14,
              boxShadow: "var(--shadow-sm)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              opacity: 0,
            }}
          >
            <span
              style={{
                fontSize: 24,
                color: p.color,
                fontFamily: "var(--font-display,'Inter'),sans-serif",
                lineHeight: 1,
              }}
            >
              {p.icon}
            </span>
            <span
              style={{
                fontFamily: "var(--font-display,'Inter'),sans-serif",
                fontWeight: 800,
                fontSize: 22,
                color: "var(--ink-soft)",
              }}
            >
              {p.label}
            </span>
          </div>
        ))}

        {/* Bundle box */}
        <div
          className="pl-bundle"
          style={{
            position: "absolute",
            left: BUNDLE_CX,
            top: BUNDLE_CY,
            width: BUNDLE_W,
            height: BUNDLE_H,
            background:
              "linear-gradient(160deg, rgba(0,113,227,.10) 0%, rgba(0,88,176,.05) 100%)",
            border: "2px solid rgba(0,113,227,.35)",
            borderRadius: 24,
            boxShadow: "var(--shadow-md)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            opacity: 0,
          }}
        >
          {/* 2×2 grid icon */}
          <svg
            className="pl-bundle-icon"
            width={44}
            height={44}
            viewBox="0 0 44 44"
            aria-hidden
            style={{ opacity: 0 }}
          >
            <rect
              x={3}
              y={3}
              width={38}
              height={38}
              rx={9}
              fill="none"
              stroke="#0071e3"
              strokeWidth={2}
            />
            <rect x={8}  y={8}  width={12} height={12} rx={3} fill="#0071e3" opacity={0.8} />
            <rect x={24} y={8}  width={12} height={12} rx={3} fill="#0058b0" opacity={0.7} />
            <rect x={8}  y={24} width={12} height={12} rx={3} fill="#ff3b30" opacity={0.75} />
            <rect x={24} y={24} width={12} height={12} rx={3} fill="#3a9bff" opacity={0.7} />
          </svg>
          <span
            className="pl-bundle-label"
            style={{
              fontFamily: "var(--font-display,'Inter'),sans-serif",
              fontWeight: 800,
              fontSize: 30,
              color: "var(--accent)",
              letterSpacing: "-0.02em",
              opacity: 0,
            }}
          >
            plugin
          </span>
        </div>
      </div>
    </div>
  );
}
