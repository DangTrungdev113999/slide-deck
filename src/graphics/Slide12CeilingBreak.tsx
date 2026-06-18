import { useEffect, useRef } from "react";
import gsap from "gsap";

const W = 700;
const H = 400;
const BAR_W = 120;
const BAR_X1 = 140; // "No context mgmt" bar center
const BAR_X2 = 420; // "Context engineering" bar center
const CEIL_Y = 80;  // ceiling y position (top of chart area)
const FLOOR_Y = 360; // floor y
const MAX_H = FLOOR_Y - CEIL_Y; // 280px max bar height

export function Slide12CeilingBreak({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const bar1Ref = useRef<HTMLDivElement>(null);
  const bar2Ref = useRef<HTMLDivElement>(null);
  const ceilRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const bar2TopRef = useRef<HTMLDivElement>(null); // the part above ceiling

  useEffect(() => {
    if (!active || !root.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const bar1 = bar1Ref.current!;
      const bar2 = bar2Ref.current!;
      const ceil = ceilRef.current!;
      const flash = flashRef.current!;
      const bar2Top = bar2TopRef.current!;

      if (reduced) {
        gsap.set(bar1, { height: MAX_H * 0.72, bottom: 0 });
        gsap.set(bar2, { height: MAX_H, bottom: 0 });
        gsap.set(bar2Top, { height: 50, opacity: 1 });
        gsap.set(ceil, { opacity: 1 });
        return;
      }

      function runLoop() {
        // reset
        gsap.set(bar1, { height: 0 });
        gsap.set(bar2, { height: 0 });
        gsap.set(bar2Top, { height: 0, opacity: 0 });
        gsap.set(flash, { opacity: 0, scaleY: 0 });
        gsap.set(ceil, { opacity: 1, scaleX: 1, backgroundColor: "var(--line)" });

        const tl = gsap.timeline({ onComplete: () => gsap.delayedCall(0.8, runLoop) });

        // both bars rise together toward ceiling
        tl.to([bar1, bar2], {
          height: MAX_H * 0.72,
          duration: 1.4,
          ease: "power2.inOut",
        }, 0);

        // bar1 hits ceiling, bounces slightly, then stays stuck
        tl.to(bar1, {
          height: MAX_H * 0.72,
          duration: 0.1,
          ease: "none",
        }, 1.4);
        // small bounce down = ceiling rejection
        tl.to(bar1, {
          height: MAX_H * 0.68,
          duration: 0.18,
          ease: "power2.out",
        }, 1.5);
        tl.to(bar1, {
          height: MAX_H * 0.72,
          duration: 0.22,
          ease: "power2.inOut",
          yoyo: true,
          repeat: 1,
        }, 1.68);

        // brief pause
        tl.to({}, { duration: 0.4 }, 2.1);

        // bar2 breaks through ceiling — flash + ceiling shatters
        tl.to(bar2, {
          height: MAX_H,
          duration: 0.55,
          ease: "power3.in",
        }, 2.5);

        // flash burst when ceiling breaks
        tl.to(flash, {
          opacity: 1,
          scaleY: 1,
          duration: 0.12,
          ease: "power3.out",
        }, 2.88);
        tl.to(flash, {
          opacity: 0,
          duration: 0.35,
          ease: "power2.out",
        }, 3.0);

        // ceiling shatters (fade + stretch)
        tl.to(ceil, {
          opacity: 0.2,
          scaleX: 1.08,
          backgroundColor: "var(--danger)",
          duration: 0.2,
          ease: "power3.out",
        }, 2.88);

        // bar2 shoots above ceiling
        tl.to(bar2Top, {
          height: 60,
          opacity: 1,
          duration: 0.4,
          ease: "back.out(1.5)",
        }, 2.95);

        // settle + breathe
        tl.to([bar1, bar2], {
          y: "-=4",
          duration: 1.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: 1,
        }, 3.4);

        // hold
        tl.to({}, { duration: 0.6 });
      }

      gsap.delayedCall(0.3, runLoop);
    }, root);

    return () => ctx.revert();
  }, [active]);

  const barStyle = (color: string): React.CSSProperties => ({
    position: "absolute",
    bottom: 0,
    width: BAR_W,
    height: 0,
    borderRadius: "10px 10px 6px 6px",
    background: color,
  });

  return (
    <div ref={root} style={{ position: "relative", width: W, height: H, margin: "0 auto" }}>
      {/* floor line */}
      <div style={{
        position: "absolute",
        left: 40,
        right: 40,
        top: FLOOR_Y,
        height: 2,
        background: "var(--line)",
        borderRadius: 2,
      }} />

      {/* ceiling line */}
      <div
        ref={ceilRef}
        style={{
          position: "absolute",
          left: 40,
          right: 40,
          top: CEIL_Y + MAX_H * 0.28, // ceiling is at 72% of max height from floor
          height: 2.5,
          background: "var(--line)",
          borderRadius: 2,
          transformOrigin: "center center",
        }}
      />

      {/* ceiling label */}
      <div style={{
        position: "absolute",
        right: 44,
        top: CEIL_Y + MAX_H * 0.28 - 22,
        fontFamily: "var(--font-display,'Inter'),sans-serif",
        fontSize: 15,
        fontWeight: 700,
        color: "var(--muted)",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}>trần kỹ năng</div>

      {/* bar 1 container */}
      <div style={{ position: "absolute", left: BAR_X1 - BAR_W / 2, top: CEIL_Y, height: MAX_H, overflow: "visible" }}>
        {/* the main bar */}
        <div
          ref={bar1Ref}
          style={{
            ...barStyle("linear-gradient(180deg, #b0b0c0 0%, #8a8a9a 100%)"),
            boxShadow: "0 8px 28px -8px rgba(100,100,130,.4)",
          }}
        />
      </div>

      {/* bar 2 container */}
      <div style={{ position: "absolute", left: BAR_X2 - BAR_W / 2, top: CEIL_Y, height: MAX_H, overflow: "visible" }}>
        {/* above-ceiling extension (outside overflow:hidden) */}
        <div
          ref={bar2TopRef}
          style={{
            position: "absolute",
            bottom: MAX_H,
            left: 0,
            width: BAR_W,
            height: 0,
            opacity: 0,
            borderRadius: "10px 10px 0 0",
            background: "linear-gradient(180deg, rgba(0,113,227,0.9) 0%, var(--accent) 100%)",
            boxShadow: "var(--glow-accent)",
          }}
        />
        {/* the main bar */}
        <div
          ref={bar2Ref}
          style={{
            ...barStyle("linear-gradient(180deg, var(--accent) 0%, var(--accent-700) 100%)"),
            boxShadow: "0 12px 40px -10px rgba(0,113,227,.55)",
          }}
        />
      </div>

      {/* flash overlay at ceiling position */}
      <div
        ref={flashRef}
        style={{
          position: "absolute",
          left: BAR_X2 - BAR_W / 2 - 20,
          top: CEIL_Y + MAX_H * 0.28 - 30,
          width: BAR_W + 40,
          height: 60,
          opacity: 0,
          scaleY: 0,
          transformOrigin: "center center",
          background: "radial-gradient(ellipse at center, rgba(0,113,227,.7) 0%, rgba(0,113,227,0) 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        } as React.CSSProperties}
      />

      {/* labels */}
      <div style={{
        position: "absolute",
        left: BAR_X1 - 90,
        top: FLOOR_Y + 14,
        width: 180,
        textAlign: "center",
        fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
        fontSize: 17,
        fontWeight: 700,
        color: "var(--muted)",
        lineHeight: 1.3,
      }}>Chỉ viết prompt</div>
      <div style={{
        position: "absolute",
        left: BAR_X2 - 90,
        top: FLOOR_Y + 14,
        width: 180,
        textAlign: "center",
        fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
        fontSize: 17,
        fontWeight: 700,
        color: "var(--accent)",
        lineHeight: 1.3,
      }}>Nạp đúng context</div>
    </div>
  );
}
