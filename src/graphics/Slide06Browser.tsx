import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Slide06Browser — Antigravity "terminal điều khiển browser"
 *
 * Layout: Terminal panel (left) ← sends commands → Browser panel (right)
 *
 * Animation sequence (loops):
 *   1. INTRO  — both panels slide in, connection arrow draws
 *   2. RUN    — terminal types a command, browser shows spinner/progress bar running
 *   3. CRASH  — mid-run: browser screen freezes, red glitch lines flash, freeze overlay
 *               pulses, "CRASHED" badge pops in
 *   4. RESET  — overlay fades, terminal clears, loop back to RUN
 *
 * GSAP pattern: gsap.context(fn, ref) + ctx.revert() — StrictMode-safe.
 * Reduced-motion: all elements visible, no animation.
 */

const W = 1400;
const H = 520;

// Terminal commands that get "typed" in sequence
const CMDS = [
  'ag.navigate("app.example.com")',
  'ag.click("#login-button")',
  'ag.fill("#email", "user@test.com")',
  'ag.waitFor(".dashboard")',
];

export function Slide06Browser({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !root.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context((self) => {
      const q = (s: string) => self.selector!(s) as (SVGElement & HTMLElement)[];

      const termPanel = q(".s06-term-panel")[0];
      const browserPanel = q(".s06-browser-panel")[0];
      const arrow = q(".s06-arrow")[0] as unknown as SVGPathElement;
      const arrowHead = q(".s06-arrow-head")[0];
      const cmdLines = q(".s06-cmd-line");
      const cursor = q(".s06-cursor")[0];
      const progressBar = q(".s06-progress-bar")[0];
      const progressTrack = q(".s06-progress-track")[0];
      const spinnerEl = q(".s06-spinner")[0];
      const browserContent = q(".s06-browser-content")[0];
      const freezeOverlay = q(".s06-freeze")[0];
      const glitchGroup = q(".s06-glitch")[0];
      const crashBadge = q(".s06-crash-badge")[0];
      const statusDot = q(".s06-status-dot")[0];
      const ringPath = q(".s06-ring")[0] as unknown as SVGCircleElement;
      const scoreNum = q(".s06-score")[0];
      const ringPanel = q(".s06-ring-panel")[0];
      const arrowPulse = q(".s06-arrow-pulse")[0];

      const RING_R = 60;
      const CIRC = 2 * Math.PI * RING_R;

      // ── REDUCED MOTION: show everything in final "after crash" state ──
      if (reduced) {
        gsap.set([termPanel, browserPanel, ringPanel], { opacity: 1, y: 0, scale: 1 });
        gsap.set(arrow, { opacity: 1 });
        gsap.set(arrowHead, { opacity: 1 });
        // show all commands
        cmdLines.forEach((el: Element) => gsap.set(el, { opacity: 1 }));
        gsap.set(ringPath, { strokeDashoffset: CIRC * (1 - 0.6) });
        if (scoreNum) scoreNum.textContent = "6";
        gsap.set(freezeOverlay, { opacity: 0.08 });
        gsap.set(crashBadge, { opacity: 1, scale: 1 });
        gsap.set(progressBar, { width: "60%" });
        return;
      }

      // ── INITIAL STATES ──
      gsap.set([termPanel, browserPanel, ringPanel], { opacity: 0, y: 40, scale: 0.96, transformOrigin: "50% 100%" });
      gsap.set(arrow, { opacity: 0 });
      gsap.set(arrowHead, { opacity: 0 });
      gsap.set(cmdLines, { opacity: 0 });
      gsap.set(cursor, { opacity: 1 });
      gsap.set(progressTrack, { opacity: 0 });
      gsap.set(progressBar, { width: "0%" });
      gsap.set(spinnerEl, { opacity: 0, rotation: 0, transformOrigin: "50% 50%" });
      gsap.set(browserContent, { opacity: 1 });
      gsap.set(freezeOverlay, { opacity: 0 });
      gsap.set(glitchGroup, { opacity: 0 });
      gsap.set(crashBadge, { opacity: 0, scale: 0.5, transformOrigin: "50% 50%" });
      gsap.set(ringPath, { strokeDasharray: CIRC, strokeDashoffset: CIRC });
      const scoreObj = { v: 0 };

      // ── INTRO (one-shot) ──
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
        // panels slide in
        .to(termPanel, { opacity: 1, y: 0, scale: 1, duration: 0.55 }, 0)
        .to(browserPanel, { opacity: 1, y: 0, scale: 1, duration: 0.55 }, 0.12)
        .to(ringPanel, { opacity: 1, y: 0, scale: 1, duration: 0.5 }, 0.22)
        // connection arrow draws in
        .to(arrow, { opacity: 1, duration: 0.15 }, 0.5)
        .to(arrowHead, { opacity: 1, duration: 0.15 }, 0.5)
        // first command appears
        .to(cmdLines[0], { opacity: 1, duration: 0.3 }, 0.7)
        .to(cmdLines[1], { opacity: 1, duration: 0.3 }, 1.1)
        // progress starts (first run-up)
        .to(progressTrack, { opacity: 1, duration: 0.2 }, 1.0)
        .to(spinnerEl, { opacity: 1, duration: 0.2 }, 1.0)
        .to(progressBar, { width: "45%", duration: 1.2, ease: "power1.inOut" }, 1.1)
        // ring count-up (6/10)
        .to(ringPath, { strokeDashoffset: CIRC * 0.4, duration: 1.4, ease: "power2.inOut" }, 0.9)
        .to(
          scoreObj,
          {
            v: 6,
            duration: 1.2,
            snap: { v: 1 },
            onUpdate() {
              if (scoreNum) scoreNum.textContent = String(Math.round(scoreObj.v));
            },
          },
          1.0
        );

      // ── SUSTAIN: run → crash → reset cycle ──
      intro.add(() => {
        // Start spinner spinning forever
        gsap.to(spinnerEl, { rotation: 360, duration: 0.9, ease: "none", repeat: -1 });

        // Arrow pulse loop
        gsap.to(arrowPulse, {
          x: 90,
          opacity: 0,
          duration: 0.8,
          ease: "power1.in",
          repeat: -1,
          repeatDelay: 0.4,
        });

        const cycle = gsap.timeline({ repeat: -1 });
        cycle
          // === RUN PHASE: terminal sending commands, browser running ===
          // cmd 2 appears
          .to(cmdLines[2], { opacity: 1, duration: 0.3 }, 0.2)
          // progress bar advances further
          .to(progressBar, { width: "72%", duration: 1.1, ease: "power1.inOut" }, 0.3)
          // cmd 3 appears
          .to(cmdLines[3], { opacity: 1, duration: 0.3 }, 1.1)
          // progress advances more — still running...
          .to(progressBar, { width: "88%", duration: 0.9, ease: "power1.out" }, 1.5)
          // status dot turns accent (running)
          .to(statusDot, { backgroundColor: "var(--accent)", duration: 0.1 }, 0)

          // === CRASH PHASE at ~2.6s ===
          // Red freeze overlay flickers ON hard
          .to(freezeOverlay, { opacity: 0.22, duration: 0.04 }, 2.5)
          .to(freezeOverlay, { opacity: 0.08, duration: 0.06 }, 2.55)
          .to(freezeOverlay, { opacity: 0.28, duration: 0.04 }, 2.62)
          .to(freezeOverlay, { opacity: 0.14, duration: 0.07 }, 2.67)
          // Glitch lines snap in
          .to(glitchGroup, { opacity: 1, duration: 0.04 }, 2.5)
          .to(glitchGroup, { x: -6, duration: 0.04 }, 2.5)
          .to(glitchGroup, { x: 5, duration: 0.04 }, 2.55)
          .to(glitchGroup, { x: -3, duration: 0.03 }, 2.6)
          .to(glitchGroup, { x: 0, duration: 0.04 }, 2.64)
          .to(glitchGroup, { opacity: 0, duration: 0.12 }, 2.7)
          // Crash badge pops in
          .to(crashBadge, { opacity: 1, scale: 1, duration: 0.2, ease: "back.out(2)" }, 2.6)
          // Progress bar turns red
          .to(progressBar, { backgroundColor: "var(--danger)", duration: 0.08 }, 2.52)
          // Spinner stops (it keeps rotating but we dim it)
          .to(spinnerEl, { opacity: 0.2, duration: 0.1 }, 2.52)
          // Status dot → red
          .to(statusDot, { backgroundColor: "var(--danger)", duration: 0.08 }, 2.52)
          // Freeze overlay lingers
          .to(freezeOverlay, { opacity: 0.1, duration: 0.5 }, 2.8)

          // === HOLD CRASH for audience to read ===
          .set({}, {}, 4.0)

          // === RESET PHASE ===
          .to(freezeOverlay, { opacity: 0, duration: 0.4 }, 4.0)
          .to(crashBadge, { opacity: 0, scale: 0.5, duration: 0.25, ease: "power2.in" }, 4.0)
          .to(glitchGroup, { opacity: 0, x: 0, duration: 0.1 }, 4.0)
          // progress bar resets
          .to(progressBar, { width: "0%", duration: 0.3, ease: "power2.in" }, 4.15)
          .to(progressBar, { backgroundColor: "var(--accent)", duration: 0.2 }, 4.15)
          .to(spinnerEl, { opacity: 1, duration: 0.2 }, 4.3)
          // cmd lines clear
          .to([cmdLines[2], cmdLines[3]], { opacity: 0, duration: 0.25 }, 4.1)
          // status resets
          .to(statusDot, { backgroundColor: "#28c840", duration: 0.15 }, 4.3)
          // brief pause, then restart
          .set({}, {}, 5.0);
      });
    }, root);

    return () => ctx.revert();
  }, [active]);

  // Layout dimensions — total fits inside W=1400
  const TERM_W = 460;
  const TERM_H = 420;
  const BR_W = 520;
  const BR_H = 420;
  const RING_PANEL_W = 200;
  const RING_R = 60;
  const CIRC = 2 * Math.PI * RING_R;

  // Arrow path from terminal right-edge to browser left-edge
  const TERM_X = 0;
  const GAP1 = 80;
  const BR_X = TERM_W + GAP1;
  const GAP2 = 60;
  const RING_X = BR_X + BR_W + GAP2;
  const PANEL_Y_CENTER = TERM_H / 2;
  const ARROW_X1 = TERM_X + TERM_W + 6;
  const ARROW_X2 = BR_X - 6;
  const ARROW_MID = (ARROW_X1 + ARROW_X2) / 2;

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
      {/* ── SVG layer: connection arrow ── */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}
        aria-hidden
      >
        <defs>
          <linearGradient id="s06-arr-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#0071e3" stopOpacity="0.6" />
            <stop offset="1" stopColor="#0071e3" />
          </linearGradient>
          <marker id="s06-arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#0071e3" />
          </marker>
        </defs>

        {/* Main connection line */}
        <line
          className="s06-arrow"
          x1={ARROW_X1}
          y1={PANEL_Y_CENTER}
          x2={ARROW_X2}
          y2={PANEL_Y_CENTER}
          stroke="url(#s06-arr-grad)"
          strokeWidth={2.5}
          strokeDasharray="6 4"
          markerEnd="url(#s06-arrowhead)"
          opacity={0}
        />

        {/* Pulse dot traveling along the arrow */}
        <circle
          className="s06-arrow-pulse"
          cx={ARROW_X1}
          cy={PANEL_Y_CENTER}
          r={5}
          fill="#0071e3"
          opacity={0.9}
        />

        {/* Arrow label */}
        <text
          className="s06-arrow-head"
          x={ARROW_MID}
          y={PANEL_Y_CENTER - 14}
          textAnchor="middle"
          fontFamily="var(--font-display,'Inter'),sans-serif"
          fontWeight={700}
          fontSize={18}
          fill="var(--accent)"
          opacity={0}
        >
          điều khiển
        </text>
      </svg>

      {/* ── TERMINAL PANEL (left) ── */}
      <div
        className="s06-term-panel"
        style={{
          position: "absolute",
          left: TERM_X,
          top: 0,
          width: TERM_W,
          height: TERM_H,
          background: "#1a1a1e",
          borderRadius: 18,
          boxShadow: "var(--shadow-lg)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Terminal title bar */}
        <div
          style={{
            height: 44,
            background: "#28282d",
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            gap: 8,
            borderBottom: "1px solid rgba(255,255,255,.07)",
            flexShrink: 0,
          }}
        >
          <span style={{ width: 13, height: 13, borderRadius: "50%", background: "#ff5f57", display: "block" }} />
          <span style={{ width: 13, height: 13, borderRadius: "50%", background: "#febc2e", display: "block" }} />
          <span style={{ width: 13, height: 13, borderRadius: "50%", background: "#28c840", display: "block" }} />
          <span
            style={{
              marginLeft: 12,
              fontFamily: "var(--font-display,'Inter'),monospace",
              fontSize: 20,
              fontWeight: 700,
              color: "rgba(255,255,255,.55)",
              letterSpacing: "0.01em",
            }}
          >
            antigravity — agent.ts
          </span>
        </div>

        {/* Terminal body */}
        <div style={{ padding: "22px 24px", flex: 1, fontFamily: "'SF Mono','Fira Code',monospace", fontSize: 19, lineHeight: 1.65 }}>
          {/* Prompt line */}
          <div style={{ color: "#28c840", marginBottom: 6, fontSize: 18, fontWeight: 600 }}>
            $ ag run task.ts
          </div>

          {/* Command lines typed out */}
          {CMDS.map((cmd, i) => (
            <div
              key={i}
              className="s06-cmd-line"
              style={{
                opacity: 0,
                color: i < 2 ? "#a8c6f0" : "#e0e0e0",
                paddingLeft: 16,
                marginBottom: 2,
                fontSize: 18,
              }}
            >
              <span style={{ color: "rgba(255,255,255,.3)", marginRight: 8 }}>›</span>
              <span style={{ color: "#9ecbff" }}>{cmd.split("(")[0]}</span>
              <span style={{ color: "#e8d5a3" }}>({cmd.split("(")[1]}</span>
            </div>
          ))}

          {/* Blinking cursor */}
          <div style={{ display: "flex", alignItems: "center", marginTop: 4, paddingLeft: 16 }}>
            <span
              className="s06-cursor"
              style={{
                display: "inline-block",
                width: 10,
                height: 20,
                background: "#0071e3",
                borderRadius: 2,
                animation: "blink 1.1s step-end infinite",
              }}
            />
          </div>
        </div>
      </div>

      {/* ── BROWSER PANEL (right) ── */}
      <div
        className="s06-browser-panel"
        style={{
          position: "absolute",
          left: BR_X,
          top: 0,
          width: BR_W,
          height: BR_H,
          background: "var(--surface)",
          borderRadius: 18,
          boxShadow: "var(--shadow-lg)",
          border: "1.5px solid var(--line)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Browser chrome bar */}
        <div
          style={{
            height: 48,
            background: "#eaeaed",
            display: "flex",
            alignItems: "center",
            padding: "0 14px",
            gap: 8,
            borderBottom: "1px solid var(--line)",
            flexShrink: 0,
          }}
        >
          <span style={{ width: 13, height: 13, borderRadius: "50%", background: "#ff5f57", display: "block" }} />
          <span style={{ width: 13, height: 13, borderRadius: "50%", background: "#febc2e", display: "block" }} />
          <span style={{ width: 13, height: 13, borderRadius: "50%", background: "#28c840", display: "block" }} />
          {/* Address bar */}
          <div
            style={{
              flex: 1,
              marginLeft: 8,
              height: 28,
              background: "white",
              borderRadius: 8,
              border: "1px solid var(--line)",
              display: "flex",
              alignItems: "center",
              padding: "0 12px",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 13, color: "var(--muted)", fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif" }}>
              🔒 app.example.com/dashboard
            </span>
          </div>
          {/* Status dot */}
          <span
            className="s06-status-dot"
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#28c840",
              display: "block",
              flexShrink: 0,
            }}
          />
        </div>

        {/* Browser content area */}
        <div className="s06-browser-content" style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {/* Page nav */}
          <div style={{ height: 48, background: "#f8f8f8", borderBottom: "1px solid var(--line-soft)", display: "flex", alignItems: "center", padding: "0 20px", gap: 10 }}>
            <div style={{ height: 22, width: 90, borderRadius: 6, background: "var(--accent)", opacity: 0.85 }} />
            <div style={{ height: 14, width: 70, borderRadius: 4, background: "var(--line)" }} />
            <div style={{ height: 14, width: 70, borderRadius: 4, background: "var(--line)" }} />
            <div style={{ height: 14, width: 70, borderRadius: 4, background: "var(--line)" }} />
          </div>

          {/* Page content rows */}
          <div style={{ padding: "18px 20px 0" }}>
            <div style={{ height: 18, width: "78%", borderRadius: 5, background: "var(--line)", marginBottom: 10 }} />
            <div style={{ height: 13, width: "60%", borderRadius: 4, background: "var(--line-soft)", marginBottom: 8 }} />
            <div style={{ height: 13, width: "70%", borderRadius: 4, background: "var(--line-soft)", marginBottom: 18 }} />
            {/* Buttons row */}
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ height: 38, width: 140, borderRadius: 10, background: "var(--accent)", opacity: 0.88, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "white", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display,'Inter'),sans-serif" }}>Submit</span>
              </div>
              <div style={{ height: 38, width: 110, borderRadius: 10, border: "1.5px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "var(--ink-soft)", fontSize: 15, fontWeight: 600, fontFamily: "var(--font-display,'Inter'),sans-serif" }}>Cancel</span>
              </div>
            </div>
          </div>

          {/* Progress track */}
          <div
            className="s06-progress-track"
            style={{
              position: "absolute",
              bottom: 28,
              left: 20,
              right: 20,
              height: 8,
              borderRadius: 4,
              background: "var(--line-soft)",
              overflow: "hidden",
            }}
          >
            <div
              className="s06-progress-bar"
              style={{
                height: "100%",
                width: "0%",
                borderRadius: 4,
                background: "var(--accent)",
                transition: "none",
              }}
            />
          </div>

          {/* Spinner */}
          <div
            className="s06-spinner"
            style={{
              position: "absolute",
              bottom: 20,
              right: 20,
              width: 26,
              height: 26,
              opacity: 0,
            }}
          >
            <svg viewBox="0 0 26 26" width="26" height="26" aria-hidden>
              <circle cx="13" cy="13" r="10" fill="none" stroke="var(--line)" strokeWidth="3" />
              <path d="M 13 3 A 10 10 0 0 1 23 13" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>

          {/* Status text bottom-left */}
          <div
            className="s06-status-text"
            style={{
              position: "absolute",
              bottom: 8,
              left: 20,
              fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
              fontSize: 15,
              color: "var(--muted)",
            }}
          >
            Đang chạy task...
          </div>

          {/* FREEZE OVERLAY */}
          <div
            className="s06-freeze"
            style={{
              position: "absolute",
              inset: 0,
              background: "var(--danger)",
              opacity: 0,
              mixBlendMode: "multiply",
              pointerEvents: "none",
            }}
          />

          {/* GLITCH LINES */}
          <div
            className="s06-glitch"
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0,
              pointerEvents: "none",
            }}
          >
            <div style={{ position: "absolute", top: "28%", left: 0, right: 0, height: 3, background: "var(--danger)", opacity: 0.7 }} />
            <div style={{ position: "absolute", top: "52%", left: 0, right: 0, height: 2, background: "var(--danger)", opacity: 0.5 }} />
            <div style={{ position: "absolute", top: "71%", left: 0, right: 0, height: 4, background: "var(--danger)", opacity: 0.45 }} />
            {/* offset block glitch */}
            <div style={{ position: "absolute", top: "35%", left: "20%", width: "40%", height: 14, background: "rgba(255,59,48,.3)" }} />
          </div>

          {/* CRASH BADGE */}
          <div
            className="s06-crash-badge"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              opacity: 0,
              background: "var(--danger)",
              color: "white",
              borderRadius: 14,
              padding: "10px 24px",
              fontFamily: "var(--font-display,'Inter'),sans-serif",
              fontWeight: 900,
              fontSize: 26,
              letterSpacing: "0.02em",
              boxShadow: "0 8px 32px -8px rgba(255,59,48,.7)",
              whiteSpace: "nowrap",
              zIndex: 10,
            }}
          >
            💥 CRASHED
          </div>
        </div>
      </div>

      {/* ── STABILITY RING PANEL (far right) ── */}
      <div
        className="s06-ring-panel"
        style={{
          position: "absolute",
          left: RING_X,
          top: 0,
          width: RING_PANEL_W,
          height: TERM_H,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          background: "linear-gradient(180deg, #fff 0%, #f7f8fb 100%)",
          border: "1px solid var(--line)",
          borderRadius: 22,
          boxShadow: "var(--shadow-md)",
        }}
      >
        <svg width={170} height={170} viewBox="0 0 170 170" aria-hidden>
          <defs>
            <linearGradient id="s06-ring-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#0071e3" />
              <stop offset="1" stopColor="#0a84ff" />
            </linearGradient>
          </defs>
          {/* track */}
          <circle cx={85} cy={85} r={RING_R} fill="none" stroke="var(--line)" strokeWidth={11} />
          {/* fill arc */}
          <circle
            className="s06-ring"
            cx={85}
            cy={85}
            r={RING_R}
            fill="none"
            stroke="url(#s06-ring-grad)"
            strokeWidth={11}
            strokeLinecap="round"
            strokeDasharray={`${CIRC}`}
            strokeDashoffset={`${CIRC}`}
            transform="rotate(-90 85 85)"
          />
          {/* score number */}
          <text
            x={85}
            y={78}
            textAnchor="middle"
            fontFamily="var(--font-display,'Inter'),sans-serif"
            fontWeight={900}
            fontSize={42}
            fill="var(--ink)"
            className="s06-score"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            0
          </text>
          <text
            x={85}
            y={104}
            textAnchor="middle"
            fontFamily="var(--font-body,'Be Vietnam Pro'),sans-serif"
            fontSize={17}
            fill="var(--muted)"
          >
            / 10
          </text>
        </svg>
        <div
          style={{
            fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
            fontSize: 20,
            fontWeight: 700,
            color: "var(--ink-soft)",
            textAlign: "center",
            lineHeight: 1.3,
            padding: "0 12px",
          }}
        >
          Độ ổn định
        </div>
        <div
          style={{
            fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
            fontSize: 16,
            color: "var(--muted)",
            textAlign: "center",
          }}
        >
          các task phức tạp
        </div>
      </div>

      {/* ── VERSION CHIP (bottom, spans below panels) ── */}
      <div
        className="s06-version"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          background: "rgba(255,255,255,.94)",
          border: "1px solid var(--line)",
          borderRadius: 999,
          padding: "10px 24px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--accent)", display: "block", flexShrink: 0 }} />
        <span
          style={{
            fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
            fontSize: 20,
            color: "var(--ink-soft)",
            fontWeight: 600,
          }}
        >
          AG 2.0 (~19/05): thêm Plugins + Sidecars
        </span>
      </div>

      {/* Blink keyframe */}
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );
}
