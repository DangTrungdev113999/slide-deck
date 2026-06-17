import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Slide01Terminal — a looping typewriter terminal + wireframe assembler.
 *
 * A faux terminal window types a prompt string character-by-character,
 * shows a blinking caret, then fades a minimal UI wireframe in to the right
 * as if it "built" the result. After a hold, resets and loops forever.
 *
 * StrictMode-safe: gsap.context + ctx.revert. No setInterval/setTimeout.
 */

const PROMPT = '> build cho tôi một UI đẹp...';
const TOTAL_CHARS = PROMPT.length;

export function Slide01Terminal({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!active || !root.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context((self) => {
      const q = (s: string) => self.selector!(s);
      const terminal = q(".s01-terminal")[0];
      const textEl = q(".s01-text")[0];
      const caret = q(".s01-caret")[0];
      const wireframe = q(".s01-wireframe")[0];
      const wfParts = q(".s01-wf-part");
      const cursor = q(".s01-cursor")[0];

      if (reduced) {
        if (textEl) (textEl as HTMLElement).textContent = PROMPT;
        gsap.set([terminal, wireframe, ...wfParts, caret], { opacity: 1 });
        gsap.set(cursor, { opacity: 0 });
        return;
      }

      // initial hide
      gsap.set(terminal, { opacity: 0, y: 30, scale: 0.96 });
      gsap.set(wireframe, { opacity: 0, x: 40 });
      gsap.set(wfParts, { scaleX: 0, transformOrigin: "left center" });
      gsap.set(caret, { opacity: 1 });

      const typeObj = { n: 0 };

      // master timeline loops forever
      const master = gsap.timeline({ repeat: -1, repeatDelay: 0 });

      // 1. terminal slides in
      master.to(terminal, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "back.out(1.4)" }, 0);

      // 2. typewriter: count n from 0→TOTAL_CHARS
      master.to(
        typeObj,
        {
          n: TOTAL_CHARS,
          duration: TOTAL_CHARS * 0.06,
          ease: "none",
          snap: { n: 1 },
          onUpdate() {
            if (textEl) (textEl as HTMLElement).textContent = PROMPT.slice(0, Math.round(typeObj.n));
          },
        },
        0.6
      );

      // 3. hold after typing (caret blinks separately in sustain)
      master.to({}, { duration: 0.6 });

      // 4. wireframe parts assemble stagger
      master.to(wfParts, { scaleX: 1, duration: 0.32, stagger: 0.1, ease: "power3.out" });
      master.to(wireframe, { opacity: 1, x: 0, duration: 0.45, ease: "power2.out" }, "<");

      // 5. hold at completed state
      master.to({}, { duration: 2.2 });

      // 6. reset (fade out, clear text)
      master.to([terminal, wireframe], { opacity: 0, duration: 0.35, ease: "power2.in" });
      master.add(() => {
        typeObj.n = 0;
        if (textEl) (textEl as HTMLElement).textContent = "";
        gsap.set(wfParts, { scaleX: 0 });
        gsap.set(wireframe, { x: 40 });
      });
      master.to({}, { duration: 0.3 }); // brief gap before looping

      // sustain: blinking caret (independent, runs forever)
      gsap.to(caret, {
        opacity: 0,
        duration: 0.5,
        ease: "steps(1)",
        repeat: -1,
        yoyo: true,
      });

      // subtle terminal breathe
      gsap.to(terminal, {
        y: "-=4",
        duration: 3.2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 1,
      });
    }, root);

    return () => ctx.revert();
  }, [active]);

  return (
    <div
      ref={root}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 64,
        width: "100%",
        height: 340,
      }}
    >
      {/* Terminal window */}
      <div
        className="s01-terminal"
        style={{
          flex: "0 0 720px",
          height: 280,
          background: "linear-gradient(160deg, #13161f 0%, #0d0f14 100%)",
          borderRadius: 20,
          boxShadow: "0 40px 80px -30px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.07)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: "flex", gap: 8, padding: "16px 20px 0" }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
            <span key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: c, display: "block", opacity: 0.9 }} />
          ))}
        </div>
        {/* Title bar */}
        <div style={{
          textAlign: "center",
          marginTop: -18,
          fontFamily: "ui-monospace,'SF Mono',Menlo,monospace",
          fontSize: 13,
          color: "rgba(255,255,255,0.28)",
          letterSpacing: "0.06em",
        }}>
          claude — bash
        </div>

        {/* Terminal body */}
        <div style={{ padding: "20px 28px" }}>
          {/* prompt row */}
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <span style={{
              fontFamily: "ui-monospace,'SF Mono',Menlo,monospace",
              fontSize: 22,
              color: "#0a84ff",
              fontWeight: 700,
              marginRight: 8,
              lineHeight: 1.4,
            }}>
              ❯
            </span>
            <span
              className="s01-text"
              style={{
                fontFamily: "ui-monospace,'SF Mono',Menlo,monospace",
                fontSize: 22,
                color: "#e8e8ed",
                lineHeight: 1.4,
                letterSpacing: "0.01em",
              }}
            />
            <span
              className="s01-caret"
              ref={caretRef}
              style={{
                display: "inline-block",
                width: 2,
                height: 26,
                background: "#0a84ff",
                marginLeft: 2,
                borderRadius: 1,
                verticalAlign: "middle",
              }}
            />
          </div>
          {/* "AI is thinking" dots */}
          <div style={{ marginTop: 18, display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontFamily: "ui-monospace,'SF Mono',Menlo,monospace", fontSize: 14, color: "rgba(255,255,255,0.28)" }}>
              claude is working
            </span>
            <span className="s01-cursor" style={{ display: "flex", gap: 4 }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(0,113,227,0.6)", display: "block" }} />
              ))}
            </span>
          </div>
        </div>
      </div>

      {/* Wireframe output */}
      <div
        className="s01-wireframe"
        style={{
          flex: "0 0 520px",
          height: 280,
          background: "linear-gradient(180deg,#ffffff,#f7f8fb)",
          border: "1px solid var(--line)",
          borderRadius: 20,
          boxShadow: "var(--shadow-lg)",
          padding: "24px 28px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Wireframe header bar */}
        <div className="s01-wf-part" style={{ height: 28, background: "var(--accent)", borderRadius: 8, marginBottom: 16, width: "100%" }} />
        {/* Body rows */}
        <div className="s01-wf-part" style={{ height: 14, background: "var(--line)", borderRadius: 6, marginBottom: 10, width: "70%" }} />
        <div className="s01-wf-part" style={{ height: 14, background: "var(--line)", borderRadius: 6, marginBottom: 10, width: "90%" }} />
        <div className="s01-wf-part" style={{ height: 14, background: "var(--line)", borderRadius: 6, marginBottom: 20, width: "55%" }} />
        {/* Two columns */}
        <div style={{ display: "flex", gap: 14 }}>
          <div className="s01-wf-part" style={{ flex: 1, height: 80, background: "var(--accent-soft)", border: "1px solid rgba(0,113,227,0.2)", borderRadius: 12 }} />
          <div className="s01-wf-part" style={{ flex: 1, height: 80, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12 }} />
        </div>
        {/* "built" badge */}
        <div style={{
          position: "absolute",
          top: 12,
          right: 14,
          background: "linear-gradient(135deg,#0071e3,#0058b0)",
          color: "#fff",
          fontFamily: "var(--font-display,'Inter'),sans-serif",
          fontWeight: 700,
          fontSize: 13,
          padding: "5px 12px",
          borderRadius: 20,
          boxShadow: "0 4px 14px -4px rgba(0,113,227,.5)",
        }}>
          ✦ done
        </div>
      </div>
    </div>
  );
}
