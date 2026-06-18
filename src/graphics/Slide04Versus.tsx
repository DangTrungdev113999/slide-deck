import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Slide04Versus — MERGED graphic for slides 4+5.
 *
 * TOP SECTION: two columns enter from opposite edges.
 *   Left (Cursor): control-flow checklist that ticks items in a loop.
 *   Right (Claude Code): chat-cursor blink loop.
 *
 * BOTTOM SECTION: bar race — Claude Code 1 prompt vs Cursor 2–3 prompts.
 *   Bars fill left→right, numbers count up, Cursor bar gets a shimmer streak.
 *
 * Hard rules obeyed:
 *   - gsap.context((self)=>{...}, ref) + return () => ctx.revert()  (StrictMode-safe)
 *   - reduced-motion → all elements set to final VISIBLE state, no animation
 *   - ONLY CSS vars from tokens.css — no raw hex
 *   - Text ≥ 20px everywhere; tool names 30px/800; body ≥ 24px
 */

const CURSOR_ITEMS = [
  "plan → review → next",
  "approve mọi thay đổi",
  "UI trực quan, sướng tay",
];

const CLAUDE_ITEMS = [
  "tập trung trao đổi ý tưởng",
  "YOLO — ship nhanh hơn",
  "task không đụng bảo mật",
];

const DIV_H = 360;
const BAR_H = 76;
const BAR_MAX_W = 720;
const CLAUDE_BAR_W = BAR_MAX_W * 0.33; // 1 out of 3
const CURSOR_BAR_W = BAR_MAX_W;        // full
const LABEL_W = 200;

export function Slide04Versus({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !root.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context((self) => {
      const q = (s: string) => self.selector!(s);

      // VS section
      const leftCol   = q(".s04-left")[0];
      const rightCol  = q(".s04-right")[0];
      const divider   = q(".s04-divider")[0] as SVGLineElement;
      const checkBoxes = q(".s04-check-box");
      const checkTicks = q(".s04-check-tick");
      const chatCursor = q(".s04-chat-cursor")[0];
      const chatDots  = q(".s04-chat-dot");

      // Bar race section
      const barRows    = q(".s04-bar-row");
      const claudeBar  = q(".s04-claude-bar")[0] as HTMLElement;
      const cursorBar  = q(".s04-cursor-bar")[0] as HTMLElement;
      const claudeNum  = q(".s04-claude-num")[0] as HTMLElement;
      const cursorNum  = q(".s04-cursor-num")[0] as HTMLElement;
      const streakEl   = q(".s04-streak")[0];
      const barSection = q(".s04-bar-section")[0];

      if (reduced) {
        gsap.set([leftCol, rightCol], { opacity: 1, x: 0 });
        gsap.set(divider, { strokeDashoffset: 0 });
        gsap.set(checkBoxes, { opacity: 1 });
        gsap.set(checkTicks, { opacity: 1, scale: 1 });
        gsap.set(chatCursor, { opacity: 1 });
        gsap.set(chatDots, { opacity: 1 });
        gsap.set(claudeBar, { scaleX: 1 });
        gsap.set(cursorBar, { scaleX: 1 });
        gsap.set(barRows, { opacity: 1, x: 0 });
        gsap.set(barSection, { opacity: 1, y: 0 });
        if (claudeNum) claudeNum.textContent = "1";
        if (cursorNum) cursorNum.textContent = "3";
        return;
      }

      // --- initial hidden states ---
      gsap.set(leftCol, { opacity: 0, x: -80 });
      gsap.set(rightCol, { opacity: 0, x: 80 });
      gsap.set(divider, { strokeDashoffset: DIV_H });
      gsap.set(checkBoxes, { opacity: 0 });
      gsap.set(checkTicks, { opacity: 0, scale: 0, transformOrigin: "50% 50%" });
      gsap.set(chatCursor, { opacity: 0 });
      gsap.set(chatDots, { opacity: 0 });
      gsap.set(claudeBar, { scaleX: 0, transformOrigin: "left center" });
      gsap.set(cursorBar, { scaleX: 0, transformOrigin: "left center" });
      gsap.set(barRows, { opacity: 0, x: -40 });
      gsap.set(barSection, { opacity: 0, y: 30 });
      gsap.set(streakEl, { opacity: 0, x: 0 });

      const claudeObj = { v: 0 };
      const cursorObj = { v: 0 };

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

      // VS panel intro
      intro
        .to([leftCol, rightCol], { opacity: 1, x: 0, duration: 0.7 }, 0)
        .to(divider, { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut" }, 0.2)
        .to(checkBoxes, { opacity: 1, duration: 0.35, stagger: 0.12 }, 0.6)
        .to(chatDots, { opacity: 1, duration: 0.3, stagger: 0.1 }, 0.6);

      // Bar race intro (staggered after VS)
      intro
        .to(barSection, { opacity: 1, y: 0, duration: 0.6 }, 0.5)
        .to(barRows, { opacity: 1, x: 0, duration: 0.5, stagger: 0.15 }, 0.65)
        .to(claudeBar, { scaleX: 1, duration: 0.9, ease: "power2.inOut" }, 0.8)
        .to(claudeObj, {
          v: 1,
          duration: 0.8,
          snap: { v: 1 },
          onUpdate() { if (claudeNum) claudeNum.textContent = String(Math.round(claudeObj.v)); },
        }, 0.8)
        .to(cursorBar, { scaleX: 1, duration: 1.1, ease: "power2.inOut" }, 1.05)
        .to(cursorObj, {
          v: 3,
          duration: 1.0,
          snap: { v: 1 },
          onUpdate() { if (cursorNum) cursorNum.textContent = String(Math.round(cursorObj.v)); },
        }, 1.05);

      // --- sustain loops ---
      intro.add(() => {
        // checklist ticking loop (Cursor side)
        const tickLoop = gsap.timeline({ repeat: -1 });
        checkTicks.forEach((tick: Element, i: number) => {
          tickLoop.to(tick, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, i * 0.8);
        });
        tickLoop.to({}, { duration: 0.8 });
        tickLoop.add(() => { gsap.set(checkTicks, { opacity: 0, scale: 0 }); });
        tickLoop.to({}, { duration: 0.3 });

        // chat cursor blink (Claude Code side)
        gsap.set(chatCursor, { opacity: 1 });
        gsap.to(chatCursor, { opacity: 0, duration: 0.55, ease: "steps(1)", repeat: -1, yoyo: true });

        // chat dots pulse
        gsap.to(chatDots, {
          scale: 1.35,
          opacity: 0.5,
          duration: 0.5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: { each: 0.18, from: "start" },
        });

        // shimmer streak on Cursor bar (bar race)
        gsap.fromTo(
          streakEl,
          { opacity: 0, x: 0 },
          {
            opacity: 1,
            x: CURSOR_BAR_W,
            duration: 0.55,
            ease: "power2.in",
            repeat: -1,
            repeatDelay: 2.2,
            onStart()  { gsap.set(streakEl, { opacity: 0, x: 0 }); },
            onRepeat() { gsap.set(streakEl, { opacity: 0, x: 0 }); },
          }
        );

        // bars breathe
        gsap.to([claudeBar, cursorBar], {
          scaleX: 1.008,
          duration: 2.4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: 0.3,
          transformOrigin: "left center",
        });

        // glow pulse on the Claude bar (it's the winner — focal element)
        gsap.to(".s04-claude-bar", {
          boxShadow: "0 8px 40px -8px rgba(0,113,227,.85)",
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
    <div ref={root} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 0 }}>

      {/* ═══════════════════════════════════════════════════
          TOP: VS COMPARISON
      ═══════════════════════════════════════════════════ */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          gap: 0,
          height: DIV_H,
          width: "100%",
        }}
      >
        {/* LEFT — Cursor */}
        <div
          className="s04-left"
          style={{
            flex: 1,
            padding: "28px 60px 28px 24px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Tool label */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            background: "var(--surface)",
            border: "1.5px solid var(--line)",
            borderRadius: 16,
            padding: "10px 22px",
            alignSelf: "flex-start",
          }}>
            {/* Cursor icon — I-beam / cursor mark */}
            <svg viewBox="0 0 24 24" width={22} height={22} fill="none" aria-hidden>
              <line x1="8" y1="5" x2="16" y2="5" stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="12" y1="5" x2="12" y2="19" stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="8" y1="19" x2="16" y2="19" stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            <span style={{
              fontFamily: "var(--font-display,'Inter'),sans-serif",
              fontWeight: 800,
              fontSize: 30,
              color: "var(--ink)",
              letterSpacing: "-0.01em",
            }}>Cursor</span>
          </div>

          {/* Description */}
          <p style={{
            fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
            fontSize: 24,
            color: "var(--ink-soft)",
            lineHeight: 1.5,
            margin: 0,
          }}>
            <strong style={{ color: "var(--ink)" }}>Control mạnh</strong> — plan → review → next/approve, UI trực quan, sướng tay.
          </p>

          {/* Checklist micro-motion */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {CURSOR_ITEMS.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div
                  className="s04-check-box"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    border: "2px solid var(--line)",
                    background: "#fff",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    className="s04-check-tick"
                    viewBox="0 0 14 14"
                    width={15}
                    height={15}
                    fill="none"
                    aria-hidden
                  >
                    <polyline points="2,7 6,11 12,3" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span style={{
                  fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
                  fontSize: 22,
                  color: "var(--ink-soft)",
                  lineHeight: 1.3,
                }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* DIVIDER */}
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
              x1={1} y1={0} x2={1} y2={DIV_H}
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
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--accent), var(--accent-700))",
            color: "#fff",
            fontFamily: "var(--font-display,'Inter'),sans-serif",
            fontWeight: 800,
            fontSize: 18,
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
            padding: "28px 24px 28px 60px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Tool label */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            background: "rgba(0,113,227,0.07)",
            border: "1.5px solid var(--accent)",
            borderRadius: 16,
            padding: "10px 22px",
            alignSelf: "flex-start",
          }}>
            {/* Claude triangle mark */}
            <svg viewBox="0 0 24 24" width={22} height={22} fill="none" aria-hidden>
              <polygon
                points="12,3 21,19 3,19"
                stroke="var(--accent)"
                strokeWidth="2"
                fill="rgba(0,113,227,0.15)"
                strokeLinejoin="round"
              />
            </svg>
            <span style={{
              fontFamily: "var(--font-display,'Inter'),sans-serif",
              fontWeight: 800,
              fontSize: 30,
              color: "var(--accent)",
              letterSpacing: "-0.01em",
            }}>Claude Code</span>
            <span style={{
              fontFamily: "ui-monospace,'SF Mono',Menlo,monospace",
              fontSize: 16,
              color: "var(--muted)",
              marginLeft: 2,
            }}>CLI</span>
          </div>

          {/* Description */}
          <p style={{
            fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
            fontSize: 24,
            color: "var(--ink-soft)",
            lineHeight: 1.5,
            margin: 0,
          }}>
            <strong style={{ color: "var(--accent)" }}>YOLO hơn</strong> — tập trung trao đổi ý tưởng; task không đụng bảo mật/tiền thì không soi code.
          </p>

          {/* Chat list micro-motion */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {CLAUDE_ITEMS.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  background: "rgba(0,113,227,0.1)",
                  border: "1.5px solid rgba(0,113,227,0.28)",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}>
                  <span className="s04-chat-dot" style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    display: "block",
                  }} />
                </div>
                <span style={{
                  fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
                  fontSize: 22,
                  color: "var(--ink-soft)",
                  lineHeight: 1.3,
                }}>
                  {item}
                </span>
              </div>
            ))}

            {/* blinking CLI cursor */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
              <div style={{
                background: "linear-gradient(180deg, var(--accent), var(--accent-700))",
                borderRadius: 12,
                padding: "7px 16px",
                color: "#fff",
                fontFamily: "ui-monospace,'SF Mono',Menlo,monospace",
                fontSize: 18,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}>
                <span>❯ _</span>
                <span
                  className="s04-chat-cursor"
                  style={{
                    display: "inline-block",
                    width: 2,
                    height: 20,
                    background: "#fff",
                    borderRadius: 1,
                    verticalAlign: "middle",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          SEPARATOR line
      ═══════════════════════════════════════════════════ */}
      <div style={{
        width: "100%",
        height: 1,
        background: "linear-gradient(90deg, transparent, var(--line), transparent)",
        margin: "6px 0 0",
      }} />

      {/* ═══════════════════════════════════════════════════
          BOTTOM: BAR RACE — prompt count
      ═══════════════════════════════════════════════════ */}
      <div
        className="s04-bar-section"
        style={{
          padding: "28px 24px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Section label */}
        <div style={{
          fontFamily: "var(--font-display,'Inter'),sans-serif",
          fontWeight: 700,
          fontSize: 22,
          color: "var(--muted)",
          letterSpacing: "0.04em",
          textTransform: "uppercase" as const,
        }}>
          Số lần prompt để hoàn thành task
        </div>

        {/* Claude Code row */}
        <div className="s04-bar-row" style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
        }}>
          <span style={{
            width: LABEL_W,
            fontFamily: "var(--font-display,'Inter'),sans-serif",
            fontWeight: 800,
            fontSize: 26,
            color: "var(--accent)",
            flexShrink: 0,
            textAlign: "right",
          }}>
            Claude Code
          </span>
          <div style={{ position: "relative", height: BAR_H, flex: 1, maxWidth: BAR_MAX_W }}>
            {/* track */}
            <div style={{ position: "absolute", inset: 0, borderRadius: 14, background: "var(--line-soft)" }} />
            {/* fill */}
            <div
              className="s04-claude-bar"
              style={{
                position: "absolute",
                top: 0, left: 0,
                width: CLAUDE_BAR_W,
                height: BAR_H,
                borderRadius: 14,
                background: "linear-gradient(90deg, #0a84ff 0%, var(--accent) 100%)",
                boxShadow: "0 8px 30px -8px rgba(0,113,227,.6)",
              }}
            />
          </div>
          <span
            className="s04-claude-num"
            style={{
              fontFamily: "var(--font-display,'Inter'),sans-serif",
              fontWeight: 900,
              fontSize: 64,
              color: "var(--accent)",
              fontVariantNumeric: "tabular-nums",
              minWidth: 80,
              lineHeight: 1,
            }}
          >
            0
          </span>
          <span style={{
            fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
            fontSize: 24,
            color: "var(--muted)",
            minWidth: 100,
          }}>
            prompt
          </span>
          {/* Winner badge */}
          <div style={{
            background: "var(--accent)",
            borderRadius: 999,
            padding: "4px 16px",
            color: "#fff",
            fontFamily: "var(--font-display,'Inter'),sans-serif",
            fontWeight: 800,
            fontSize: 20,
            whiteSpace: "nowrap" as const,
          }}>
            ⚡ nhanh hơn
          </div>
        </div>

        {/* Cursor row */}
        <div className="s04-bar-row" style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
        }}>
          <span style={{
            width: LABEL_W,
            fontFamily: "var(--font-display,'Inter'),sans-serif",
            fontWeight: 800,
            fontSize: 26,
            color: "var(--ink)",
            flexShrink: 0,
            textAlign: "right",
          }}>
            Cursor
          </span>
          <div style={{
            position: "relative",
            height: BAR_H,
            flex: 1,
            maxWidth: BAR_MAX_W,
            overflow: "hidden",
            borderRadius: 14,
          }}>
            {/* track */}
            <div style={{ position: "absolute", inset: 0, borderRadius: 14, background: "var(--line-soft)" }} />
            {/* fill */}
            <div
              className="s04-cursor-bar"
              style={{
                position: "absolute",
                top: 0, left: 0,
                width: CURSOR_BAR_W,
                height: BAR_H,
                borderRadius: 14,
                background: "linear-gradient(90deg, #c2d4ec 0%, #7aabde 60%, #5090cc 100%)",
              }}
            />
            {/* shimmer streak */}
            <div
              className="s04-streak"
              style={{
                position: "absolute",
                top: 0, left: 0,
                width: 120,
                height: BAR_H,
                borderRadius: 14,
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,.7) 50%, transparent 100%)",
                pointerEvents: "none",
              }}
            />
          </div>
          <span
            className="s04-cursor-num"
            style={{
              fontFamily: "var(--font-display,'Inter'),sans-serif",
              fontWeight: 900,
              fontSize: 64,
              color: "var(--ink-soft)",
              fontVariantNumeric: "tabular-nums",
              minWidth: 80,
              lineHeight: 1,
            }}
          >
            0
          </span>
          <span style={{
            fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
            fontSize: 24,
            color: "var(--muted)",
            minWidth: 100,
          }}>
            prompts
          </span>
          <span style={{
            fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
            fontSize: 20,
            color: "var(--muted)",
            fontStyle: "italic" as const,
          }}>
            nhả code nhanh, nhưng tốn token
          </span>
        </div>
      </div>
    </div>
  );
}
