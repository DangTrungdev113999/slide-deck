import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Slide04Versus — two columns enter from opposite edges, divider draws down.
 * Left (Cursor): a checklist ticks items on loop.
 * Right (Claude Code): a chat cursor pulses on loop.
 *
 * StrictMode-safe: gsap.context + ctx.revert. No setInterval.
 */

const CURSOR_ITEMS = [
  "plan → review → next",
  "approve changes",
  "UI trực quan, sướng tay",
];

const CLAUDE_ITEMS = [
  "tập trung trao đổi ý tưởng",
  "YOLO – ship nhanh hơn",
  "task không đụng bảo mật",
];

export function Slide04Versus({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !root.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context((self) => {
      const q = (s: string) => self.selector!(s);
      const leftCol = q(".s04-left")[0];
      const rightCol = q(".s04-right")[0];
      const divider = q(".s04-divider")[0] as SVGLineElement | SVGPathElement;
      const checkBoxes = q(".s04-check-box");
      const checkTicks = q(".s04-check-tick");
      const chatCursor = q(".s04-chat-cursor")[0];
      const chatDot = q(".s04-chat-dot");

      if (reduced) {
        gsap.set([leftCol, rightCol], { opacity: 1, x: 0 });
        gsap.set(divider, { strokeDashoffset: 0 });
        gsap.set(checkBoxes, { opacity: 1 });
        gsap.set(checkTicks, { opacity: 1, scale: 1 });
        gsap.set(chatCursor, { opacity: 1 });
        gsap.set(chatDot, { opacity: 1 });
        return;
      }

      gsap.set(leftCol, { opacity: 0, x: -80 });
      gsap.set(rightCol, { opacity: 0, x: 80 });
      gsap.set(divider, { strokeDashoffset: 700 });
      gsap.set(checkBoxes, { opacity: 0 });
      gsap.set(checkTicks, { opacity: 0, scale: 0, transformOrigin: "50% 50%" });
      gsap.set(chatCursor, { opacity: 0 });
      gsap.set(chatDot, { opacity: 0 });

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

      intro.to([leftCol, rightCol], { opacity: 1, x: 0, duration: 0.7 }, 0);
      intro.to(divider, { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut" }, 0.2);
      intro.to(checkBoxes, { opacity: 1, duration: 0.35, stagger: 0.12 }, 0.6);
      intro.to(chatDot, { opacity: 1, duration: 0.3, stagger: 0.1 }, 0.6);

      // checklist ticking loop (cursor side)
      intro.add(() => {
        const tickLoop = gsap.timeline({ repeat: -1 });
        checkTicks.forEach((tick, i) => {
          tickLoop.to(tick, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, i * 0.8);
        });
        // hold all ticked
        tickLoop.to({}, { duration: 0.8 });
        // reset
        tickLoop.add(() => {
          gsap.set(checkTicks, { opacity: 0, scale: 0 });
        });
        tickLoop.to({}, { duration: 0.3 });

        // chat cursor blink (claude side)
        gsap.set(chatCursor, { opacity: 1 });
        gsap.to(chatCursor, {
          opacity: 0,
          duration: 0.55,
          ease: "steps(1)",
          repeat: -1,
          yoyo: true,
        });

        // chat dots pulse in sequence
        gsap.to(chatDot, {
          scale: 1.35,
          opacity: 0.5,
          duration: 0.5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: { each: 0.18, from: "start" },
        });
      });
    }, root);

    return () => ctx.revert();
  }, [active]);

  const DIV_H = 360;

  return (
    <div
      ref={root}
      style={{
        position: "relative",
        width: "100%",
        display: "flex",
        alignItems: "flex-start",
        gap: 0,
        height: DIV_H,
      }}
    >
      {/* LEFT — Cursor */}
      <div
        className="s04-left"
        style={{
          flex: 1,
          padding: "32px 52px 32px 28px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {/* Label */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 14,
          padding: "8px 18px",
          alignSelf: "flex-start",
        }}>
          <svg viewBox="0 0 24 24" width={20} height={20} fill="none" aria-hidden>
            <line x1="8" y1="5" x2="16" y2="5" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="5" x2="12" y2="19" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
            <line x1="8" y1="19" x2="16" y2="19" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span style={{ fontFamily: "var(--font-display,'Inter'),sans-serif", fontWeight: 800, fontSize: 22, color: "var(--ink)" }}>Cursor</span>
        </div>

        {/* Body text */}
        <p style={{
          fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
          fontSize: 20,
          color: "var(--ink-soft)",
          lineHeight: 1.55,
          margin: 0,
        }}>
          <strong style={{ color: "var(--ink)" }}>Control mạnh</strong> — plan → review → next/approve, UI trực quan, sướng tay.
        </p>

        {/* Checklist micro-motion */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {CURSOR_ITEMS.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                className="s04-check-box"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  border: "2px solid var(--line)",
                  background: "#fff",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <svg
                  className="s04-check-tick"
                  viewBox="0 0 14 14"
                  width={14}
                  height={14}
                  fill="none"
                  aria-hidden
                >
                  <polyline points="2,7 6,11 12,3" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span style={{
                fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
                fontSize: 18,
                color: "var(--ink-soft)",
              }}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* DIVIDER SVG */}
      <div style={{ position: "relative", flexShrink: 0, width: 2 }}>
        <svg width={2} height={DIV_H} aria-hidden style={{ display: "block" }}>
          <defs>
            <linearGradient id="s04-div-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="rgba(0,113,227,0)" />
              <stop offset="0.5" stopColor="var(--accent)" />
              <stop offset="1" stopColor="rgba(0,113,227,0)" />
            </linearGradient>
          </defs>
          <line
            className="s04-divider"
            x1={1}
            y1={0}
            x2={1}
            y2={DIV_H}
            stroke="url(#s04-div-grad)"
            strokeWidth={2}
            strokeDasharray={DIV_H}
            strokeDashoffset={DIV_H}
          />
        </svg>
        {/* VS badge */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "linear-gradient(135deg,#0071e3,#0058b0)",
          color: "#fff",
          fontFamily: "var(--font-display,'Inter'),sans-serif",
          fontWeight: 800,
          fontSize: 14,
          display: "grid",
          placeItems: "center",
          boxShadow: "var(--glow-accent)",
          zIndex: 2,
        }}>
          vs
        </div>
      </div>

      {/* RIGHT — Claude Code */}
      <div
        className="s04-right"
        style={{
          flex: 1,
          padding: "32px 28px 32px 52px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {/* Label */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          background: "linear-gradient(135deg, rgba(0,113,227,0.08), rgba(0,88,176,0.05))",
          border: "1.5px solid var(--accent)",
          borderRadius: 14,
          padding: "8px 18px",
          alignSelf: "flex-start",
        }}>
          <svg viewBox="0 0 24 24" width={20} height={20} fill="none" aria-hidden>
            <polygon points="12,3 21,19 3,19" stroke="var(--accent)" strokeWidth="2" fill="rgba(0,113,227,0.15)" strokeLinejoin="round" />
          </svg>
          <span style={{ fontFamily: "var(--font-display,'Inter'),sans-serif", fontWeight: 800, fontSize: 22, color: "var(--accent)" }}>Claude Code</span>
          <span style={{ fontFamily: "ui-monospace,'SF Mono',Menlo,monospace", fontSize: 13, color: "var(--muted)", marginLeft: 4 }}>CLI</span>
        </div>

        {/* Body text */}
        <p style={{
          fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
          fontSize: 20,
          color: "var(--ink-soft)",
          lineHeight: 1.55,
          margin: 0,
        }}>
          <strong style={{ color: "var(--accent)" }}>YOLO hơn</strong> — tập trung trao đổi; task không đụng bảo mật/tiền thì không soi code.
        </p>

        {/* Chat pulse micro-motion */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {CLAUDE_ITEMS.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "rgba(0,113,227,0.1)",
                border: "1.5px solid rgba(0,113,227,0.25)",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}>
                <span className="s04-chat-dot" style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--accent)",
                  display: "block",
                }} />
              </div>
              <span style={{
                fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
                fontSize: 18,
                color: "var(--ink-soft)",
              }}>
                {item}
              </span>
            </div>
          ))}

          {/* Chat cursor (blinks) */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
            <div style={{
              background: "linear-gradient(180deg,#0071e3,#0058b0)",
              borderRadius: 12,
              padding: "6px 14px",
              color: "#fff",
              fontFamily: "ui-monospace,'SF Mono',Menlo,monospace",
              fontSize: 16,
            }}>
              ❯ _
              <span
                className="s04-chat-cursor"
                style={{
                  display: "inline-block",
                  width: 2,
                  height: 18,
                  background: "#fff",
                  marginLeft: 2,
                  borderRadius: 1,
                  verticalAlign: "middle",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
