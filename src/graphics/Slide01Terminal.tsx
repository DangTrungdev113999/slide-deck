import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Slide01Terminal — richer "terminal types → bursts → wireframe app assembles" motion graphic.
 *
 * Layout: left third = dark terminal window (types prompt + thinking state)
 *         middle = burst ray / comet that fires right after typing
 *         right two-thirds = full wireframe "app" that assembles block-by-block
 *
 * Beats:
 *  1. Terminal slides in, types prompt character-by-character
 *  2. BURST: flash + comet ray fires from terminal → UI zone
 *  3. Wireframe blocks assemble with staggered pop-in + cascading accent glow
 *  4. HOLD at finished state — all blocks visible, glow pulse + breathe sustain
 *  5. Fade out, reset, loop
 *
 * StrictMode-safe: gsap.context + ctx.revert. Reduced-motion: all visible, no loop.
 */

const PROMPT_LINES = [
  "> /frontend-design",
  "  build một dashboard UI đẹp...",
];
const TOTAL_CHARS_0 = PROMPT_LINES[0].length;
const TOTAL_CHARS_1 = PROMPT_LINES[1].length;

// Wireframe block definitions — each block pops in sequentially
type WFBlock = {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  border?: string;
  textColor?: string;
  fontSize?: number;
  weight?: number;
  radius?: number;
};

const WF_BLOCKS: WFBlock[] = [
  // Navbar
  { id: "nav",     label: "Navigation",     x: 0,   y: 0,   w: 980, h: 52,  color: "var(--accent)",      textColor: "#fff", fontSize: 20, weight: 700, radius: 12 },
  // Sidebar
  { id: "side",    label: "Sidebar",         x: 0,   y: 68,  w: 200, h: 380, color: "var(--surface)",     border: "var(--line)",  textColor: "var(--muted)", fontSize: 20, radius: 14 },
  // Hero banner
  { id: "hero",    label: "Hero Section",    x: 216, y: 68,  w: 764, h: 156, color: "var(--accent-soft)", border: "rgba(0,113,227,0.25)", textColor: "var(--accent)", fontSize: 22, weight: 700, radius: 14 },
  // Card row — 3 cards
  { id: "card1",   label: "Card",            x: 216, y: 240, w: 234, h: 110, color: "#fff",               border: "var(--line)",  textColor: "var(--ink)",  fontSize: 20, radius: 14 },
  { id: "card2",   label: "Card",            x: 466, y: 240, w: 234, h: 110, color: "#fff",               border: "var(--line)",  textColor: "var(--ink)",  fontSize: 20, radius: 14 },
  { id: "card3",   label: "Card",            x: 716, y: 240, w: 264, h: 110, color: "#fff",               border: "var(--line)",  textColor: "var(--ink)",  fontSize: 20, radius: 14 },
  // Content area
  { id: "content", label: "Content",         x: 216, y: 366, w: 764, h: 82,  color: "var(--surface)",     border: "var(--line-soft)", textColor: "var(--muted)", fontSize: 20, radius: 14 },
];

const GRAPHIC_W = 1600;
const GRAPHIC_H = 480;
const TERM_W = 540;
const TERM_H = 320;
const TERM_X = 0;
const TERM_Y = (GRAPHIC_H - TERM_H) / 2; // vertically centered

const WF_OFFSET_X = 620; // where the wireframe zone starts

export function Slide01Terminal({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !root.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context((self) => {
      const q = (s: string) => self.selector!(s) as Element[];

      const terminal   = q(".s01-terminal")[0] as HTMLElement;
      const text0      = q(".s01-text0")[0]    as HTMLElement;
      const text1      = q(".s01-text1")[0]    as HTMLElement;
      const caret      = q(".s01-caret")[0]    as HTMLElement;
      const thinkRow   = q(".s01-think")[0]    as HTMLElement;
      const burstRay   = q(".s01-burst-ray")[0] as SVGElement;
      const burstFlash = q(".s01-burst-flash")[0] as SVGElement;
      const wfBlocks   = q(".s01-wf-block")    as HTMLElement[];
      const wfGlows    = q(".s01-wf-glow")     as SVGCircleElement[];
      const doneBadge  = q(".s01-done")[0]     as HTMLElement;

      // ---- REDUCED MOTION: show everything, no loop ----
      if (reduced) {
        gsap.set([terminal, ...wfBlocks, doneBadge, thinkRow, caret], { opacity: 1, y: 0, x: 0, scale: 1, scaleX: 1, scaleY: 1 });
        if (text0) text0.textContent = PROMPT_LINES[0];
        if (text1) text1.textContent = PROMPT_LINES[1];
        gsap.set([burstRay, burstFlash, ...wfGlows], { opacity: 0 });
        return;
      }

      // ---- INITIAL STATE ----
      gsap.set(terminal,  { opacity: 0, y: 32, scale: 0.96, transformOrigin: "50% 50%" });
      gsap.set([...wfBlocks, doneBadge], { opacity: 0, scale: 0.88, y: 18, transformOrigin: "center center" });
      gsap.set(thinkRow,  { opacity: 0 });
      gsap.set(caret,     { opacity: 1 });
      gsap.set(burstRay,  { opacity: 0, scaleX: 0, transformOrigin: "left center" });
      gsap.set(burstFlash, { opacity: 0 });
      gsap.set(wfGlows,   { opacity: 0, scale: 0.5, transformOrigin: "50% 50%" });

      if (text0) text0.textContent = "";
      if (text1) text1.textContent = "";

      const type0 = { n: 0 };
      const type1 = { n: 0 };

      // MASTER timeline (loops forever)
      const master = gsap.timeline({ repeat: -1, repeatDelay: 0.4 });

      // Beat 1: terminal slides in
      master.to(terminal, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.5)" }, 0);

      // Beat 2a: type line 0
      master.to(type0, {
        n: TOTAL_CHARS_0,
        duration: TOTAL_CHARS_0 * 0.05,
        ease: "none",
        snap: { n: 1 },
        onUpdate() { if (text0) text0.textContent = PROMPT_LINES[0].slice(0, Math.round(type0.n)); },
      }, 0.55);

      // Beat 2b: type line 1 (after short pause)
      master.to(type1, {
        n: TOTAL_CHARS_1,
        duration: TOTAL_CHARS_1 * 0.05,
        ease: "none",
        snap: { n: 1 },
        onUpdate() { if (text1) text1.textContent = PROMPT_LINES[1].slice(0, Math.round(type1.n)); },
      }, `>+0.15`);

      // Beat 2c: thinking row fades in
      master.to(thinkRow, { opacity: 1, duration: 0.3 }, `>+0.2`);

      // Beat 3: BURST — flash + ray extends right
      master.to(burstFlash, { opacity: 0.9, duration: 0.08, ease: "power4.out" }, `>+0.5`);
      master.to(burstFlash, { opacity: 0, duration: 0.22, ease: "power2.in" }, `>`);
      master.to(burstRay, { opacity: 1, scaleX: 1, duration: 0.38, ease: "power3.out" }, `<-0.1`);

      // Beat 4: wireframe blocks assemble block-by-block with cascading glow
      const BLOCK_START = ">+0.0";
      master.to(wfBlocks, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.3,
        stagger: { each: 0.1, from: "start" },
        ease: "back.out(1.4)",
      }, BLOCK_START);

      // Glow pulses per-block as it appears
      wfGlows.forEach((g, i) => {
        const delay = i * 0.1;
        master.to(g, {
          keyframes: [
            { opacity: 0.9, scale: 1,    duration: 0.2, ease: "power2.out" },
            { opacity: 0,   scale: 1.25, duration: 0.5, ease: "power2.in" },
          ],
        }, BLOCK_START + `+=${delay}`);
      });

      // Beat 5: done badge pops in
      master.to(doneBadge, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(2)" }, `>-0.1`);

      // HOLD at finished state
      master.to({}, { duration: 2.8 });

      // Beat 6: fade-out + reset
      master.to([terminal, ...wfBlocks, doneBadge, burstRay], { opacity: 0, duration: 0.4, ease: "power2.in" });
      master.add(() => {
        type0.n = 0; type1.n = 0;
        if (text0) text0.textContent = "";
        if (text1) text1.textContent = "";
        gsap.set([...wfBlocks, doneBadge], { scale: 0.88, y: 18 });
        gsap.set(burstRay, { scaleX: 0 });
        gsap.set(thinkRow, { opacity: 0 });
      });
      master.to({}, { duration: 0.35 });

      // SUSTAIN: blinking caret (independent, forever)
      gsap.to(caret, {
        opacity: 0,
        duration: 0.48,
        ease: "steps(1)",
        repeat: -1,
        yoyo: true,
      });

      // SUSTAIN: terminal gentle breathe
      gsap.to(terminal, {
        y: "-=5",
        duration: 3.4,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 0.8,
      });

      // SUSTAIN: wf blocks gentle breathe (starts after intro)
      gsap.to(wfBlocks, {
        y: "-=4",
        duration: 2.8,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: { each: 0.15, from: "start" },
        delay: 3.2,
      });

      // SUSTAIN: done badge pulse glow
      gsap.to(doneBadge, {
        boxShadow: "0 0 0 1px rgba(0,113,227,.5), 0 20px 55px -16px rgba(0,113,227,.8)",
        scale: 1.04,
        duration: 1.4,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 3.5,
        transformOrigin: "center center",
      });
    }, root);

    return () => ctx.revert();
  }, [active]);

  // Center the block grid vertically in the right zone
  const wfTop = (GRAPHIC_H - 448) / 2;

  return (
    <div
      ref={root}
      style={{
        position: "relative",
        width: GRAPHIC_W,
        height: GRAPHIC_H,
        margin: "0 auto",
      }}
    >
      {/* ---- SVG layer: burst ray + glow rings ---- */}
      <svg
        viewBox={`0 0 ${GRAPHIC_W} ${GRAPHIC_H}`}
        width={GRAPHIC_W}
        height={GRAPHIC_H}
        style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}
        aria-hidden
      >
        <defs>
          <linearGradient id="s01-ray-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#0071e3" stopOpacity="0.9" />
            <stop offset="0.6" stopColor="#3a9bff" stopOpacity="0.5" />
            <stop offset="1" stopColor="#0071e3" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="s01-flash-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="0.4" stopColor="#0071e3" stopOpacity="0.5" />
            <stop offset="1" stopColor="#0071e3" stopOpacity="0" />
          </radialGradient>
          {/* Glow ring per wf block */}
          {WF_BLOCKS.map((b) => (
            <radialGradient key={`rg-${b.id}`} id={`s01-glow-${b.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor="#0071e3" stopOpacity="0.28" />
              <stop offset="1" stopColor="#0071e3" stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>

        {/* Burst flash (centered on terminal right edge) */}
        <ellipse
          className="s01-burst-flash"
          cx={TERM_X + TERM_W}
          cy={GRAPHIC_H / 2}
          rx={90}
          ry={90}
          fill="url(#s01-flash-grad)"
        />

        {/* Burst ray from terminal to wireframe zone */}
        <rect
          className="s01-burst-ray"
          x={TERM_X + TERM_W}
          y={GRAPHIC_H / 2 - 6}
          width={WF_OFFSET_X - TERM_W - 20}
          height={12}
          rx={6}
          fill="url(#s01-ray-grad)"
        />

        {/* Glow rings for each wf block (sit behind the blocks) */}
        {WF_BLOCKS.map((b) => (
          <ellipse
            key={b.id}
            className="s01-wf-glow"
            cx={WF_OFFSET_X + b.x + b.w / 2}
            cy={wfTop + b.y + b.h / 2}
            rx={b.w * 0.55}
            ry={b.h * 0.75}
            fill={`url(#s01-glow-${b.id})`}
          />
        ))}
      </svg>

      {/* ---- Terminal window (left) ---- */}
      <div
        className="s01-terminal"
        style={{
          position: "absolute",
          left: TERM_X,
          top: TERM_Y,
          width: TERM_W,
          height: TERM_H,
          background: "linear-gradient(160deg, #13161f 0%, #0d0f14 100%)",
          borderRadius: 20,
          boxShadow: "0 40px 80px -30px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.07)",
          overflow: "hidden",
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: "flex", gap: 8, padding: "18px 22px 0" }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
            <span key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: c, display: "block", opacity: 0.9 }} />
          ))}
        </div>
        {/* Title bar */}
        <div style={{
          textAlign: "center",
          marginTop: -18,
          fontFamily: "ui-monospace,'SF Mono',Menlo,monospace",
          fontSize: 20,
          color: "rgba(255,255,255,0.30)",
          letterSpacing: "0.05em",
        }}>
          claude — bash
        </div>

        {/* Terminal body */}
        <div style={{ padding: "18px 28px" }}>
          {/* prompt line 0 */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontFamily: "ui-monospace,'SF Mono',Menlo,monospace", fontSize: 24, color: "#0a84ff", fontWeight: 700, marginRight: 8, lineHeight: 1.4 }}>
              ❯
            </span>
            <span
              className="s01-text0"
              style={{ fontFamily: "ui-monospace,'SF Mono',Menlo,monospace", fontSize: 24, color: "#e8e8ed", lineHeight: 1.4, letterSpacing: "0.01em" }}
            />
            <span
              className="s01-caret"
              style={{ display: "inline-block", width: 2, height: 28, background: "#0a84ff", marginLeft: 2, borderRadius: 1, verticalAlign: "middle" }}
            />
          </div>
          {/* prompt line 1 (indented) */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontFamily: "ui-monospace,'SF Mono',Menlo,monospace", fontSize: 22, color: "rgba(255,255,255,0.45)", lineHeight: 1.4 }}>
              <span className="s01-text1" />
            </span>
          </div>
          {/* Thinking state */}
          <div className="s01-think" style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
            <span style={{ fontFamily: "ui-monospace,'SF Mono',Menlo,monospace", fontSize: 21, color: "rgba(255,255,255,0.32)" }}>
              ⠿ building UI
            </span>
            <span style={{ display: "flex", gap: 5 }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(0,113,227,0.65)", display: "block" }} />
              ))}
            </span>
          </div>
        </div>
      </div>

      {/* ---- Wireframe UI blocks (right two-thirds) ---- */}
      <div style={{ position: "absolute", left: WF_OFFSET_X, top: wfTop, width: 980, height: 448 }}>
        {WF_BLOCKS.map((b) => (
          <div
            key={b.id}
            className="s01-wf-block"
            style={{
              position: "absolute",
              left: b.x,
              top: b.y,
              width: b.w,
              height: b.h,
              background: b.color,
              border: b.border ? `1.5px solid ${b.border}` : undefined,
              borderRadius: b.radius ?? 14,
              display: "flex",
              alignItems: "center",
              justifyContent: b.id === "nav" ? "flex-start" : "center",
              paddingLeft: b.id === "nav" ? 20 : 0,
              boxShadow: b.id === "nav" ? "var(--shadow-sm)" : "var(--shadow-md)",
            }}
          >
            <span style={{
              fontFamily: "var(--font-display,'Inter'),sans-serif",
              fontWeight: b.weight ?? 600,
              fontSize: b.fontSize ?? 20,
              color: b.textColor ?? "var(--ink)",
              opacity: 0.72,
              letterSpacing: "-0.01em",
              userSelect: "none",
            }}>
              {b.label}
            </span>
          </div>
        ))}

        {/* Done badge — top-right of the wireframe zone */}
        <div
          className="s01-done"
          style={{
            position: "absolute",
            top: -14,
            right: 0,
            background: "linear-gradient(135deg, #0071e3, #0058b0)",
            color: "#fff",
            fontFamily: "var(--font-display,'Inter'),sans-serif",
            fontWeight: 800,
            fontSize: 22,
            padding: "8px 22px",
            borderRadius: 40,
            boxShadow: "0 0 0 1px rgba(0,113,227,.3), 0 18px 50px -14px rgba(0,113,227,.65)",
            letterSpacing: "-0.01em",
          }}
        >
          ✦ UI built
        </div>
      </div>
    </div>
  );
}
