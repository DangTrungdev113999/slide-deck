import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Slide09SkillHook — two-panel motion-graphic for the "Skill · Hook" slide.
 *
 * LEFT panel (0..W/2): Skill zone — three ordered step cards drop in, connect
 *   with arrows, then collapse into a "playbook" package that pops and pulses.
 *   Loop: one master gsap.timeline({ repeat:-1 }). StrictMode-safe.
 *
 * RIGHT panel (W/2..W): Hook zone — a `git push` token slides toward a red
 *   gate barrier, gets blocked (flash + X badge), bounces back, repeats.
 *   Loop: one master gsap.timeline({ repeat:-1 }). StrictMode-safe.
 *
 * Reduced-motion: all elements set to final VISIBLE state immediately.
 * Cleanup: gsap.context() + ctx.revert() — zero leaks under React StrictMode.
 */

// ── Canvas dimensions ─────────────────────────────────────────────────────────
const W = 1680;
const H = 780;

// ── LEFT PANEL (Skill) — all coords are within 0..W/2 = 0..840 ──────────────
const SK_PAD_L = 58;          // left pad inside left panel
const CARD_W = 430;
const CARD_H = 124;
const CARD_GAP = 30;
const CARD_TOP_FIRST = 208;   // y of first card within the full H (bumped to clear 3-line header)
const CARD_TOPS = [0, 1, 2].map((i) => CARD_TOP_FIRST + i * (CARD_H + CARD_GAP));

// Package box — sits to the RIGHT of the cards, vertically centred
const PKG_X = SK_PAD_L + CARD_W + 62;  // 550
const PKG_W = 206;
const PKG_H = 158;
const PKG_Y = H / 2 - PKG_H / 2;       // ~311

// ── RIGHT PANEL (Hook) — coords expressed as offsets from panel's left edge ──
// Panel itself is placed at x = W/2 + 40 = 880 in canvas coords,
// but elements inside use local coords within a div.
const HK_PANEL_L = W / 2 + 40;   // 880 (canvas x where panel starts)
const HK_PANEL_W = W - HK_PANEL_L; // 800

// Rail local coords
const RAIL_LOCAL_X1 = 0;
const RAIL_LOCAL_X2 = HK_PANEL_W - 60;
const RAIL_Y_LOCAL = H / 2 + 20;   // local y within panel

// Token
const TOKEN_W = 196;
const TOKEN_H = 72;
const TOKEN_START_X = 20;  // local x start
const TOKEN_Y_LOCAL = RAIL_Y_LOCAL - TOKEN_H / 2;

// Gate — sits near the end of the rail
const GATE_LOCAL_X = RAIL_LOCAL_X2 - 20;
const GATE_BAR_H = 260;
const GATE_BAR_TOP = RAIL_Y_LOCAL - GATE_BAR_H / 2;

// How far the token slides before bouncing (stops 90px before gate)
const TOKEN_TRAVEL = GATE_LOCAL_X - TOKEN_START_X - TOKEN_W - 90;

// Block X badge local coords (appears between token and gate)
const BX_SIZE = 52;
const BX_LOCAL_X = TOKEN_START_X + TOKEN_W + TOKEN_TRAVEL * 0.55;
const BX_LOCAL_Y = TOKEN_Y_LOCAL - BX_SIZE / 2 - 4;

// ── Step definitions ──────────────────────────────────────────────────────────
const STEPS = [
  { n: "1", icon: "⌖", label: "Dùng tool nào",  sub: "read_file · grep · bash…" },
  { n: "2", icon: "▦", label: "Theo thứ tự nào", sub: "search → analyse → write" },
  { n: "3", icon: "⚒", label: "Quy ước gì",     sub: "tokens · no raw hex · cleanup" },
];

// PKG midpoint Y (for connector curves)
const PKG_MID_Y = PKG_Y + PKG_H / 2;

// ── Animation timing ──────────────────────────────────────────────────────────
const SKILL_CYCLE = 5.0;
const HOOK_CYCLE  = 3.4;

// ─────────────────────────────────────────────────────────────────────────────
export function Slide09SkillHook({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !root.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context((self) => {
      const q = (s: string) => self.selector!(s);

      // ── element handles ──
      const cards    = q(".sk-card");
      const arrows   = q(".sk-arrow");
      const pkg      = q(".sk-pkg")[0]       as HTMLElement;
      const pkgLabel = q(".sk-pkg-label")[0]  as HTMLElement;
      const pkgGlow  = q(".sk-pkg-glow")[0]   as SVGCircleElement;

      const token     = q(".hk-token")[0]      as HTMLElement;
      const badge     = q(".hk-badge")[0]       as HTMLElement;
      const gateFlash = q(".hk-gate-flash")[0]  as SVGElement;
      const blockX    = q(".hk-block-x")[0]     as HTMLElement;

      // ── REDUCED MOTION — show everything visible, static ──
      if (reduced) {
        gsap.set(cards,              { opacity: 1, y: 0 });
        gsap.set(arrows,             { opacity: 0.5 });
        gsap.set([pkg, pkgLabel],    { opacity: 1, scale: 1 });
        gsap.set(pkgGlow,            { opacity: 0.55 });
        gsap.set(token,              { opacity: 1, x: 0 });
        gsap.set(badge,              { opacity: 1 });
        gsap.set(gateFlash,          { opacity: 0 });
        gsap.set(blockX,             { opacity: 1, scale: 1 });
        return;
      }

      // ── INITIAL HIDDEN STATE ──
      gsap.set(cards,           { opacity: 0, y: -26 });
      gsap.set(arrows,          { opacity: 0 });
      gsap.set([pkg, pkgLabel], { opacity: 0, scale: 0.72, transformOrigin: "50% 50%" });
      gsap.set(pkgGlow,         { opacity: 0, scale: 0.6,  transformOrigin: "50% 50%" });

      gsap.set(token,     { x: 0, opacity: 1 });
      gsap.set(badge,     { opacity: 0 });
      gsap.set(gateFlash, { opacity: 0 });
      gsap.set(blockX,    { opacity: 0, scale: 0.4, transformOrigin: "50% 50%" });

      // ══════════════════════════════════════════════════════════════════════
      //  SKILL TIMELINE — repeat:-1 (StrictMode-safe, fully tracked by ctx)
      // ══════════════════════════════════════════════════════════════════════
      gsap.timeline({
        repeat: -1,
        repeatDelay: 0.35,
        defaults: { ease: "power3.out" },
      })
        // Phase 1: cards drop in staggered
        .to(cards[0], { opacity: 1, y: 0, duration: 0.38, ease: "back.out(1.6)" }, 0.1)
        .to(cards[1], { opacity: 1, y: 0, duration: 0.38, ease: "back.out(1.6)" }, 0.33)
        .to(cards[2], { opacity: 1, y: 0, duration: 0.38, ease: "back.out(1.6)" }, 0.56)
        // Phase 2: connector arrows fade in
        .to(arrows, { opacity: 0.5, duration: 0.3, stagger: 0.08 }, 0.72)
        // Phase 3: reading pause
        .to({}, { duration: 0.9 }, 0.9)
        // Phase 4: cards collapse into package position
        .to(cards, {
          opacity: 0, scale: 0.3, y: 18,
          transformOrigin: "50% 50%",
          duration: 0.38, ease: "power2.in", stagger: 0.07,
        }, 1.65)
        .to(arrows, { opacity: 0, duration: 0.22 }, 1.65)
        // Phase 5: package pops
        .to(pkg, { opacity: 1, scale: 1, duration: 0.44, ease: "back.out(2.0)" }, 2.12)
        .to(pkgLabel, { opacity: 1, duration: 0.30, ease: "power2.out" }, 2.38)
        .to(pkgGlow, {
          opacity: 0.6, scale: 1,
          duration: 0.36, ease: "power2.out",
          transformOrigin: "50% 50%",
        }, 2.38)
        // Phase 6: package double-pulse
        .to(pkg,     { scale: 1.09, duration: 0.28, ease: "sine.inOut", yoyo: true, repeat: 1 }, 2.72)
        .to(pkgGlow, {
          opacity: 0.9, scale: 1.22,
          duration: 0.28, ease: "sine.inOut",
          yoyo: true, repeat: 1, transformOrigin: "50% 50%",
        }, 2.72)
        // Phase 7: hold readable
        .to({}, { duration: 0.96 }, 3.5)
        // Phase 8: reset for next loop
        .set(cards,           { opacity: 0, y: -26, scale: 1 }, SKILL_CYCLE - 0.04)
        .set([pkg, pkgLabel], { opacity: 0, scale: 0.72 },       SKILL_CYCLE - 0.04)
        .set(pkgGlow,         { opacity: 0, scale: 0.6 },         SKILL_CYCLE - 0.04)
        .set(arrows,          { opacity: 0 },                      SKILL_CYCLE - 0.04);

      // ══════════════════════════════════════════════════════════════════════
      //  HOOK TIMELINE — repeat:-1 (StrictMode-safe)
      // ══════════════════════════════════════════════════════════════════════
      gsap.timeline({
        repeat: -1,
        repeatDelay: 0.45,
        defaults: { ease: "power2.inOut" },
      })
        // Phase 0: badge fades in (shows "chưa verify →")
        .to(badge, { opacity: 1, duration: 0.28, ease: "power2.out" }, 0.15)
        // Phase 1: token slides toward gate
        .to(token, { x: TOKEN_TRAVEL, duration: 0.62, ease: "power2.in" }, 0.35)
        // Phase 2: gate flashes (double pulse)
        .to(gateFlash, { opacity: 1,   duration: 0.07, ease: "none" }, 0.92)
        .to(gateFlash, { opacity: 0,   duration: 0.18, ease: "power2.out" }, 0.99)
        .to(gateFlash, { opacity: 0.8, duration: 0.07, ease: "none" }, 1.24)
        .to(gateFlash, { opacity: 0,   duration: 0.22, ease: "power2.out" }, 1.31)
        // Phase 3: block X appears
        .to(blockX, {
          opacity: 1, scale: 1,
          duration: 0.24, ease: "back.out(2.4)",
          transformOrigin: "50% 50%",
        }, 0.92)
        // Phase 4: token bounces back
        .to(token, { x: -22, duration: 0.30, ease: "back.out(2.6)" }, 1.02)
        .to(token, { x: 0,   duration: 0.33, ease: "power2.out" },    1.32)
        // Phase 5: block X fades
        .to(blockX, {
          opacity: 0, scale: 0.4,
          duration: 0.26, ease: "power2.in",
          transformOrigin: "50% 50%",
        }, 1.30)
        // Phase 6: pause
        .to({}, { duration: 0.82 })
        // Phase 7: reset
        .set(badge, { opacity: 0 }, HOOK_CYCLE - 0.04)
        .set(token, { x: 0 },       HOOK_CYCLE - 0.04);

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
        flexShrink: 0,
      }}
    >
      {/* ==================================================================
          SHARED SVG LAYER — connectors, rail, gate
      ================================================================== */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}
        aria-hidden
      >
        <defs>
          {/* Package glow */}
          <radialGradient id="s9-pkg-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="rgba(0,113,227,.38)" />
            <stop offset="1" stopColor="rgba(0,113,227,0)" />
          </radialGradient>

          {/* Arrow marker */}
          <marker id="s9-arr" markerWidth="8" markerHeight="6" refX="7.5" refY="3" orient="auto">
            <path d="M0 0 L8 3 L0 6 Z" fill="var(--accent)" opacity="0.65" />
          </marker>

          {/* Gate glow filter */}
          <filter id="s9-gate-glow" x="-300%" y="-80%" width="700%" height="260%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
        </defs>

        {/* ── SKILL: vertical step-to-step arrows ── */}
        {[0, 1].map((i) => {
          const y1 = CARD_TOPS[i] + CARD_H + 4;
          const y2 = CARD_TOPS[i + 1] - 4;
          const mx = SK_PAD_L + 52; // center of badge
          return (
            <line
              key={`step-arr-${i}`}
              className="sk-arrow"
              x1={mx} y1={y1}
              x2={mx} y2={y2}
              stroke="var(--accent)"
              strokeWidth={2}
              strokeLinecap="round"
              markerEnd="url(#s9-arr)"
              opacity={0}
            />
          );
        })}

        {/* ── SKILL: curved connector from each card to package ── */}
        {STEPS.map((_, i) => {
          const cardMidY = CARD_TOPS[i] + CARD_H / 2;
          const cx1 = SK_PAD_L + CARD_W + 40;
          const cx2 = PKG_X - 30;
          return (
            <path
              key={`conn-${i}`}
              className="sk-arrow"
              d={`M ${SK_PAD_L + CARD_W} ${cardMidY} C ${cx1} ${cardMidY} ${cx2} ${PKG_MID_Y} ${PKG_X} ${PKG_MID_Y}`}
              stroke="var(--accent)"
              strokeWidth={1.5}
              strokeDasharray="7 5"
              fill="none"
              markerEnd="url(#s9-arr)"
              opacity={0}
            />
          );
        })}

        {/* ── SKILL: package glow ring ── */}
        <circle
          className="sk-pkg-glow"
          cx={PKG_X + PKG_W / 2}
          cy={PKG_MID_Y}
          r={122}
          fill="url(#s9-pkg-glow)"
          opacity={0}
        />

        {/* ── VERTICAL DIVIDER ── */}
        <line
          x1={W / 2} y1={24}
          x2={W / 2} y2={H - 24}
          stroke="var(--line)"
          strokeWidth={1.5}
          strokeDasharray="6 4"
          opacity={0.7}
        />

        {/* ── HOOK: horizontal rail ── */}
        {/* faint track */}
        <line
          x1={HK_PANEL_L + RAIL_LOCAL_X1} y1={RAIL_Y_LOCAL}
          x2={HK_PANEL_L + RAIL_LOCAL_X2} y2={RAIL_Y_LOCAL}
          stroke="var(--line)"
          strokeWidth={3}
          strokeLinecap="round"
        />
        {/* accent overlay */}
        <line
          x1={HK_PANEL_L + RAIL_LOCAL_X1} y1={RAIL_Y_LOCAL}
          x2={HK_PANEL_L + RAIL_LOCAL_X2 - 60} y2={RAIL_Y_LOCAL}
          stroke="var(--accent)"
          strokeWidth={2.5}
          strokeLinecap="round"
          opacity={0.22}
        />

        {/* ── HOOK: gate glow (animated opacity by GSAP) ── */}
        <rect
          className="hk-gate-flash"
          x={HK_PANEL_L + GATE_LOCAL_X - 24}
          y={GATE_BAR_TOP - 24}
          width={48}
          height={GATE_BAR_H + 48}
          rx={12}
          fill="var(--danger)"
          filter="url(#s9-gate-glow)"
          opacity={0}
        />

        {/* ── HOOK: gate barrier body ── */}
        <rect
          x={HK_PANEL_L + GATE_LOCAL_X - 7}
          y={GATE_BAR_TOP}
          width={14}
          height={GATE_BAR_H}
          rx={5}
          fill="var(--danger)"
          opacity={0.88}
        />
        {/* cap top */}
        <rect
          x={HK_PANEL_L + GATE_LOCAL_X - 30}
          y={GATE_BAR_TOP - 16}
          width={60}
          height={18}
          rx={7}
          fill="var(--danger)"
          opacity={0.92}
        />
        {/* cap bottom */}
        <rect
          x={HK_PANEL_L + GATE_LOCAL_X - 30}
          y={GATE_BAR_TOP + GATE_BAR_H - 2}
          width={60}
          height={18}
          rx={7}
          fill="var(--danger)"
          opacity={0.92}
        />
        {/* hazard chevrons on gate */}
        {[0, 1, 2, 3].map((ti) => (
          <path
            key={ti}
            d={`M ${HK_PANEL_L + GATE_LOCAL_X - 22} ${GATE_BAR_TOP + 46 + ti * 52} L ${HK_PANEL_L + GATE_LOCAL_X} ${GATE_BAR_TOP + 26 + ti * 52} L ${HK_PANEL_L + GATE_LOCAL_X + 22} ${GATE_BAR_TOP + 46 + ti * 52}`}
            stroke="rgba(255,255,255,.4)"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
        ))}

        {/* GATE label */}
        <text
          x={HK_PANEL_L + GATE_LOCAL_X}
          y={GATE_BAR_TOP - 34}
          textAnchor="middle"
          fontFamily="var(--font-display,'Inter'),sans-serif"
          fontWeight={800}
          fontSize={24}
          fill="var(--danger)"
          letterSpacing="0.14em"
        >
          GATE
        </text>
      </svg>

      {/* ==================================================================
          LEFT PANEL — SKILL section header (static, revealed by SlideFrame)
      ================================================================== */}
      <div
        style={{
          position: "absolute",
          left: SK_PAD_L,
          top: 36,
          width: W / 2 - SK_PAD_L - 40,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            fontFamily: "var(--font-display,'Inter'),sans-serif",
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: "0.14em",
            textTransform: "uppercase" as const,
            color: "var(--accent)",
            background: "rgba(0,113,227,.09)",
            padding: "7px 18px",
            borderRadius: 10,
            marginBottom: 14,
          }}
        >
          <span style={{ fontWeight: 400, fontSize: 20, opacity: 0.8 }}>/</span>
          Skill
        </span>
        <p
          style={{
            fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
            fontSize: 24,
            lineHeight: 1.45,
            color: "var(--ink-soft)",
            margin: "12px 0 0",
            maxWidth: 560,
          }}
        >
          Đóng gói quy trình thành{" "}
          <strong style={{ color: "var(--ink)" }}>playbook</strong> để Claude
          cứ thế làm theo, khỏi dặn lại.
        </p>
      </div>

      {/* ── SKILL: step cards ── */}
      {STEPS.map((step, i) => (
        <div
          key={step.n}
          className="sk-card"
          style={{
            position: "absolute",
            left: SK_PAD_L,
            top: CARD_TOPS[i],
            width: CARD_W,
            height: CARD_H,
            background: "linear-gradient(160deg,#ffffff 0%,#f3f6fc 100%)",
            border: "1px solid var(--line)",
            borderRadius: 22,
            boxShadow: "var(--shadow-md)",
            display: "flex",
            alignItems: "center",
            gap: 22,
            padding: "0 28px",
          }}
        >
          {/* Step number badge */}
          <span
            style={{
              flexShrink: 0,
              width: 54,
              height: 54,
              borderRadius: 15,
              background: "var(--accent)",
              color: "#fff",
              fontFamily: "var(--font-display,'Inter'),sans-serif",
              fontWeight: 800,
              fontSize: 28,
              display: "grid",
              placeItems: "center",
              boxShadow: "0 8px 22px -6px rgba(0,113,227,.55)",
            }}
          >
            {step.n}
          </span>
          {/* Text block */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <span
              style={{
                fontFamily: "var(--font-display,'Inter'),sans-serif",
                fontWeight: 800,
                fontSize: 26,
                color: "var(--ink)",
                letterSpacing: "-0.015em",
                lineHeight: 1.1,
              }}
            >
              <span style={{ marginRight: 10, color: "var(--accent)", fontSize: 22 }}>
                {step.icon}
              </span>
              {step.label}
            </span>
            <span
              style={{
                fontFamily: "ui-monospace,'SF Mono',Menlo,monospace",
                fontSize: 20,
                color: "var(--muted)",
                letterSpacing: "0.01em",
              }}
            >
              {step.sub}
            </span>
          </div>
        </div>
      ))}

      {/* ── SKILL: package / playbook box ── */}
      <div
        className="sk-pkg"
        style={{
          position: "absolute",
          left: PKG_X,
          top: PKG_Y,
          width: PKG_W,
          height: PKG_H,
          background:
            "linear-gradient(160deg,rgba(0,113,227,.13) 0%,rgba(0,88,176,.05) 100%)",
          border: "2px solid rgba(0,113,227,.40)",
          borderRadius: 24,
          boxShadow: "0 8px 50px -14px rgba(0,113,227,.35)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <svg width={50} height={50} viewBox="0 0 50 50" aria-hidden>
          <rect x={7} y={19} width={36} height={26} rx={7} fill="rgba(0,113,227,.18)" stroke="var(--accent)" strokeWidth={2} />
          <rect x={7} y={19} width={36} height={10} rx={4} fill="rgba(0,113,227,.30)" />
          <line x1={25} y1={19} x2={25} y2={45} stroke="var(--accent)" strokeWidth={2} />
          <path d="M11 8 L25 15 L39 8" stroke="var(--accent)" strokeWidth={2} fill="none" strokeLinejoin="round" />
        </svg>
        <span
          className="sk-pkg-label"
          style={{
            fontFamily: "var(--font-display,'Inter'),sans-serif",
            fontWeight: 800,
            fontSize: 28,
            color: "var(--accent)",
            letterSpacing: "-0.015em",
          }}
        >
          playbook ✦
        </span>
      </div>

      {/* ==================================================================
          RIGHT PANEL — HOOK section header (static)
      ================================================================== */}
      <div
        style={{
          position: "absolute",
          left: W / 2 + 56,
          top: 36,
          width: HK_PANEL_W - 60,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            fontFamily: "var(--font-display,'Inter'),sans-serif",
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: "0.14em",
            textTransform: "uppercase" as const,
            color: "var(--danger)",
            background: "rgba(255,59,48,.09)",
            padding: "7px 18px",
            borderRadius: 10,
            marginBottom: 14,
          }}
        >
          <span style={{ fontSize: 18 }}>⛔</span>
          Hook
        </span>
        <p
          style={{
            fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
            fontSize: 24,
            lineHeight: 1.45,
            color: "var(--ink-soft)",
            margin: "12px 0 0",
            maxWidth: 540,
          }}
        >
          Trigger tự động khi agent gọi tool,{" "}
          chặn{" "}
          <code
            style={{
              fontFamily: "ui-monospace,'SF Mono',Menlo,monospace",
              background: "rgba(255,59,48,.10)",
              color: "var(--danger)",
              padding: "3px 9px",
              borderRadius: 7,
              fontSize: 22,
            }}
          >
            git push
          </code>{" "}
          khi chưa verify.
        </p>

        {/* gitnexus note */}
        <div
          style={{
            marginTop: 24,
            padding: "14px 18px",
            background: "var(--surface)",
            borderRadius: 12,
            borderLeft: "3px solid var(--accent)",
            maxWidth: 490,
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1.2 }}>🔗</span>
          <span
            style={{
              fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
              fontSize: 20,
              color: "var(--ink-soft)",
              lineHeight: 1.4,
            }}
          >
            gitnexus inject vào hook → smart-search code trước khi push
          </span>
        </div>
      </div>

      {/* ── HOOK: git push token (GSAP animates x transform) ── */}
      <div
        className="hk-token"
        style={{
          position: "absolute",
          left: HK_PANEL_L + TOKEN_START_X,
          top: TOKEN_Y_LOCAL,
          width: TOKEN_W,
          height: TOKEN_H,
          background: "linear-gradient(135deg,#192840 0%,#1c3256 100%)",
          borderRadius: 16,
          border: "1.5px solid rgba(255,255,255,.14)",
          boxShadow: "var(--shadow-md)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <svg width={28} height={28} viewBox="0 0 28 28" aria-hidden>
          <circle cx={14} cy={14} r={12} fill="none" stroke="#5aabff" strokeWidth={1.7} />
          <path d="M14 7 L14 18 M10 14 L14 18 L18 14" stroke="#5aabff" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span
          style={{
            fontFamily: "ui-monospace,'SF Mono',Menlo,monospace",
            fontWeight: 700,
            fontSize: 22,
            color: "#a8d0f8",
            letterSpacing: "0.02em",
          }}
        >
          git push
        </span>
      </div>

      {/* ── HOOK: "chưa verify →" badge (fades in before token moves) ── */}
      <div
        className="hk-badge"
        style={{
          position: "absolute",
          left: HK_PANEL_L + TOKEN_START_X,
          top: TOKEN_Y_LOCAL - 56,
          background: "rgba(255,59,48,.10)",
          border: "1px solid rgba(255,59,48,.30)",
          borderRadius: 9,
          padding: "6px 16px",
          opacity: 0,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display,'Inter'),sans-serif",
            fontWeight: 700,
            fontSize: 20,
            color: "var(--danger)",
            letterSpacing: "0.04em",
          }}
        >
          chưa verify →
        </span>
      </div>

      {/* ── HOOK: block X badge ── */}
      <div
        className="hk-block-x"
        style={{
          position: "absolute",
          left: HK_PANEL_L + BX_LOCAL_X,
          top: BX_LOCAL_Y,
          width: BX_SIZE,
          height: BX_SIZE,
          background: "var(--danger)",
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 28px rgba(255,59,48,.70)",
          opacity: 0,
        }}
      >
        <svg width={28} height={28} viewBox="0 0 28 28" aria-hidden>
          <line x1={7} y1={7} x2={21} y2={21} stroke="#fff" strokeWidth={3} strokeLinecap="round" />
          <line x1={21} y1={7} x2={7} y2={21} stroke="#fff" strokeWidth={3} strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
