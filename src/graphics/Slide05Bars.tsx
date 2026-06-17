import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Slide05Bars — bar race comparing Claude Code vs Cursor prompt count.
 * Intro: bars fill left→right, numbers count up (1 vs 3), a "streak" zaps
 * the Cursor bar to show its speed.
 * Loop: Cursor bar has a repeating shimmer streak; both bars subtly breathe.
 */

const W = 1540;
const H = 340;

export function Slide05Bars({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !root.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context((self) => {
      const q = (s: string) => self.selector!(s) as HTMLElement[];

      const claudeBar = q(".s05-claude-bar")[0];
      const cursorBar = q(".s05-cursor-bar")[0];
      const claudeNum = q(".s05-claude-num")[0];
      const cursorNum = q(".s05-cursor-num")[0];
      const streakEl = q(".s05-streak")[0];
      const rows = q(".s05-row");
      const caption = q(".s05-caption")[0];
      const speedNote = q(".s05-speed")[0];

      if (reduced) {
        gsap.set(rows, { opacity: 1, x: 0 });
        gsap.set(claudeBar, { scaleX: 1 });
        gsap.set(cursorBar, { scaleX: 1 });
        gsap.set([caption, speedNote], { opacity: 1, y: 0 });
        if (claudeNum) claudeNum.textContent = "1";
        if (cursorNum) cursorNum.textContent = "3";
        return;
      }

      // initial set
      gsap.set(claudeBar, { scaleX: 0, transformOrigin: "left center" });
      gsap.set(cursorBar, { scaleX: 0, transformOrigin: "left center" });
      gsap.set(rows, { opacity: 0, x: -40 });
      gsap.set([caption, speedNote], { opacity: 0, y: 16 });
      gsap.set(streakEl, { opacity: 0, x: 0 });

      const claudeObj = { v: 0 };
      const cursorObj = { v: 0 };

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
        .to(rows, { opacity: 1, x: 0, duration: 0.5, stagger: 0.15 }, 0)
        .to(claudeBar, { scaleX: 1, duration: 0.9, ease: "power2.inOut" }, 0.3)
        .to(
          claudeObj,
          {
            v: 1,
            duration: 0.8,
            snap: { v: 1 },
            onUpdate() {
              if (claudeNum) claudeNum.textContent = String(Math.round(claudeObj.v));
            },
          },
          0.3
        )
        .to(cursorBar, { scaleX: 1, duration: 1.1, ease: "power2.inOut" }, 0.55)
        .to(
          cursorObj,
          {
            v: 3,
            duration: 1.0,
            snap: { v: 1 },
            onUpdate() {
              if (cursorNum) cursorNum.textContent = String(Math.round(cursorObj.v));
            },
          },
          0.55
        )
        .to([caption, speedNote], { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, 1.4);

      // sustain loops
      intro.add(() => {
        // streak on Cursor bar repeats
        gsap.fromTo(
          streakEl,
          { opacity: 0, x: 0 },
          {
            opacity: 1,
            x: 680,
            duration: 0.55,
            ease: "power2.in",
            repeat: -1,
            repeatDelay: 2.2,
            onStart() {
              gsap.set(streakEl, { opacity: 0, x: 0 });
            },
            onRepeat() {
              gsap.set(streakEl, { opacity: 0, x: 0 });
            },
          }
        );
        // gentle breathe on both bars
        gsap.to([claudeBar, cursorBar], {
          scaleX: 1.008,
          duration: 2.4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: 0.3,
          transformOrigin: "left center",
        });
      });
    }, root);

    return () => ctx.revert();
  }, [active]);

  const ROW_LABEL_W = 260;
  const BAR_MAX = 680;
  const BAR_H = 80;
  const CLAUDE_W = BAR_MAX * 0.33; // 1 out of 3
  const CURSOR_W = BAR_MAX;

  return (
    <div ref={root} style={{ position: "relative", width: W, height: H, margin: "0 auto" }}>
      {/* Claude row */}
      <div
        className="s05-row"
        style={{
          position: "absolute",
          top: 20,
          left: 0,
          display: "flex",
          alignItems: "center",
          gap: 28,
          width: W,
        }}
      >
        <span
          style={{
            width: ROW_LABEL_W,
            fontFamily: "var(--font-display,'Inter'),sans-serif",
            fontWeight: 800,
            fontSize: 26,
            color: "var(--ink)",
            flexShrink: 0,
            textAlign: "right",
          }}
        >
          Claude Code
        </span>
        <div style={{ position: "relative", height: BAR_H, flex: 1 }}>
          {/* track */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 16,
              background: "var(--line-soft)",
            }}
          />
          {/* fill */}
          <div
            className="s05-claude-bar"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: CLAUDE_W,
              height: BAR_H,
              borderRadius: 16,
              background: "linear-gradient(90deg, #0a84ff 0%, #0071e3 100%)",
              boxShadow: "0 8px 30px -8px rgba(0,113,227,.6)",
            }}
          />
        </div>
        <span
          className="s05-claude-num"
          style={{
            fontFamily: "var(--font-display,'Inter'),sans-serif",
            fontWeight: 900,
            fontSize: 72,
            color: "var(--accent)",
            fontVariantNumeric: "tabular-nums",
            minWidth: 90,
          }}
        >
          0
        </span>
        <span
          style={{
            fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
            fontSize: 22,
            color: "var(--muted)",
            minWidth: 120,
          }}
        >
          prompt
        </span>
      </div>

      {/* Cursor row */}
      <div
        className="s05-row"
        style={{
          position: "absolute",
          top: 140,
          left: 0,
          display: "flex",
          alignItems: "center",
          gap: 28,
          width: W,
        }}
      >
        <span
          style={{
            width: ROW_LABEL_W,
            fontFamily: "var(--font-display,'Inter'),sans-serif",
            fontWeight: 800,
            fontSize: 26,
            color: "var(--ink)",
            flexShrink: 0,
            textAlign: "right",
          }}
        >
          Cursor
        </span>
        <div style={{ position: "relative", height: BAR_H, flex: 1, overflow: "hidden", borderRadius: 16 }}>
          {/* track */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 16,
              background: "var(--line-soft)",
            }}
          />
          {/* fill */}
          <div
            className="s05-cursor-bar"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: CURSOR_W,
              height: BAR_H,
              borderRadius: 16,
              background: "linear-gradient(90deg, #c2d4ec 0%, #7aabde 60%, #5090cc 100%)",
            }}
          />
          {/* streak */}
          <div
            className="s05-streak"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 120,
              height: BAR_H,
              borderRadius: 16,
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,.7) 50%, transparent 100%)",
              pointerEvents: "none",
            }}
          />
        </div>
        <span
          className="s05-cursor-num"
          style={{
            fontFamily: "var(--font-display,'Inter'),sans-serif",
            fontWeight: 900,
            fontSize: 72,
            color: "var(--ink-soft)",
            fontVariantNumeric: "tabular-nums",
            minWidth: 90,
          }}
        >
          0
        </span>
        <span
          style={{
            fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
            fontSize: 22,
            color: "var(--muted)",
            minWidth: 120,
          }}
        >
          prompts
        </span>
      </div>

      {/* Speed note */}
      <div
        className="s05-speed"
        style={{
          position: "absolute",
          top: 244,
          left: ROW_LABEL_W + 28 + 16,
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          background: "rgba(255,255,255,.85)",
          border: "1px solid var(--line)",
          borderRadius: 999,
          padding: "8px 20px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
          <path d="M3 9h4l2-6 4 12 2-6h3" stroke="var(--accent)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span
          style={{
            fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
            fontSize: 18,
            color: "var(--ink-soft)",
          }}
        >
          Cursor nhả code rất nhanh
        </span>
      </div>

      {/* Caption */}
      <div
        className="s05-caption"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
          fontSize: 20,
          color: "var(--muted)",
          maxWidth: 900,
          lineHeight: 1.5,
        }}
      >
        Nhưng trả phí token model frontier trong Cursor thì rất đắt.
      </div>
    </div>
  );
}
