import { useEffect, useRef } from "react";
import gsap from "gsap";

const W = 1500;
const BAR_H = 52;
const BAR_Y = 200;
const HEALTHY_FRAC = 0.2; // 200K / 1M
const DOT_COUNT = 10;
const FAIL_INDICES = [6, 7, 8, 9]; // ~4 out of 10 = "~1 in 4"

const DOTS = Array.from({ length: DOT_COUNT }, (_, i) => ({
  x: 40 + i * ((W - 80) / (DOT_COUNT - 1)),
  y: BAR_Y - 72,
  fail: FAIL_INDICES.includes(i),
}));

export function Slide11ContextBar({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const annotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !root.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context((self) => {
      const q = (s: string) => self.selector!(s);
      const dots = q(".cb-dot");
      const fill = fillRef.current!;
      const counter = counterRef.current!;
      const annot = annotRef.current!;

      if (reduced) {
        gsap.set(fill, { scaleX: 0.88 });
        gsap.set(dots, { opacity: 1 });
        FAIL_INDICES.forEach((i) => {
          gsap.set(dots[i], { backgroundColor: "var(--danger)" });
        });
        counter.textContent = "900.000";
        gsap.set(annot, { opacity: 1 });
        return;
      }

      const obj = { val: 0, fillFrac: 0 };

      function runLoop() {
        gsap.set(fill, { scaleX: 0 });
        gsap.set(dots, { opacity: 1, backgroundColor: "var(--accent)", scale: 1, boxShadow: "0 0 0 3px rgba(0,113,227,.2)" });
        gsap.set(annot, { opacity: 0 });
        obj.val = 0;
        obj.fillFrac = 0;
        counter.textContent = "0";

        const tl = gsap.timeline({ onComplete: () => { gsap.delayedCall(0.6, runLoop); } });

        // fill bar over 4s
        tl.to(obj, {
          fillFrac: 0.9,
          duration: 4,
          ease: "power1.inOut",
          onUpdate() {
            gsap.set(fill, { scaleX: obj.fillFrac });
          },
        }, 0);

        // count up
        tl.to(obj, {
          val: 900000,
          duration: 4,
          ease: "power1.inOut",
          onUpdate() {
            counter.textContent = Math.round(obj.val).toLocaleString("vi-VN");
          },
        }, 0);

        // annotation fades in when fill crosses 200K zone
        tl.to(annot, { opacity: 1, duration: 0.4, ease: "power2.out" }, 1.0);

        // fail dots flicker in once fill is into danger zone (~1.2s in)
        FAIL_INDICES.forEach((i, idx) => {
          tl.to(dots[i], {
            backgroundColor: "var(--danger)",
            boxShadow: "0 0 0 3px rgba(255,59,48,.25)",
            duration: 0.3,
            ease: "power2.out",
            yoyo: true,
            repeat: 5,
            repeatDelay: 0.18,
          }, 1.2 + idx * 0.2);

          // settle to dim grey
          tl.to(dots[i], {
            backgroundColor: "#b0b0b8",
            boxShadow: "none",
            scale: 0.8,
            opacity: 0.55,
            duration: 0.3,
          }, 2.8 + idx * 0.1);
        });

        // hold at end
        tl.to({}, { duration: 0.8 });
      }

      // entrance: dots pop in
      gsap.from(dots, { opacity: 0, scale: 0.5, duration: 0.4, stagger: 0.05, ease: "back.out(1.7)" });
      gsap.delayedCall(0.6, runLoop);
    }, root);

    return () => ctx.revert();
  }, [active]);

  const healthyW = W * HEALTHY_FRAC;

  return (
    <div ref={root} style={{ position: "relative", width: W, height: 340, margin: "0 auto" }}>
      {/* zone labels */}
      <div style={{ position: "absolute", top: BAR_Y - 108, left: 0, width: W, display: "flex", pointerEvents: "none" }}>
        <span style={{ fontFamily: "var(--font-display,'Inter'),sans-serif", fontWeight: 700, fontSize: 18, color: "var(--muted)", position: "absolute", left: 0 }}>0</span>
        <span style={{ fontFamily: "var(--font-display,'Inter'),sans-serif", fontWeight: 700, fontSize: 18, color: "var(--accent)", position: "absolute", left: healthyW - 24 }}>200K</span>
        <span style={{ fontFamily: "var(--font-display,'Inter'),sans-serif", fontWeight: 700, fontSize: 18, color: "var(--danger)", position: "absolute", left: W - 28 }}>1M</span>
      </div>

      {/* retrieval dots */}
      {DOTS.map((d, i) => (
        <div
          key={i}
          className="cb-dot"
          style={{
            position: "absolute",
            left: d.x - 12,
            top: d.y - 12,
            width: 24,
            height: 24,
            borderRadius: "50%",
            backgroundColor: "var(--accent)",
            boxShadow: "0 0 0 3px rgba(0,113,227,.2)",
          }}
        />
      ))}

      {/* bar track */}
      <div style={{
        position: "absolute",
        left: 0,
        top: BAR_Y,
        width: W,
        height: BAR_H,
        borderRadius: BAR_H / 2,
        background: "var(--surface)",
        border: "1.5px solid var(--line)",
        overflow: "hidden",
      }}>
        {/* fill — uses scaleX, transform-origin left */}
        <div
          ref={fillRef}
          style={{
            position: "absolute",
            inset: 0,
            transformOrigin: "left center",
            scaleX: 0,
            background: `linear-gradient(90deg,
              var(--accent) 0%,
              #0a84ff ${(HEALTHY_FRAC * 100).toFixed(1)}%,
              #ff9500 ${(HEALTHY_FRAC * 100 + 4).toFixed(1)}%,
              var(--danger) 100%)`,
            borderRadius: BAR_H / 2,
          } as React.CSSProperties}
        />
        {/* healthy zone marker line */}
        <div style={{
          position: "absolute",
          left: healthyW,
          top: 0,
          bottom: 0,
          width: 2,
          background: "rgba(255,255,255,0.6)",
        }} />
      </div>

      {/* zone labels below bar */}
      <div style={{ position: "absolute", top: BAR_Y + BAR_H + 12, left: 0, width: W }}>
        <span style={{
          position: "absolute",
          left: 0,
          fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
          fontSize: 18,
          fontWeight: 600,
          color: "var(--accent)",
        }}>Vùng ngon (0 – 200K)</span>
        <span style={{
          position: "absolute",
          left: healthyW + 12,
          fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
          fontSize: 18,
          fontWeight: 600,
          color: "var(--danger)",
        }}>Context rot zone</span>
      </div>

      {/* danger annotation */}
      <div
        ref={annotRef}
        style={{
          position: "absolute",
          left: healthyW + 60,
          top: BAR_Y - 52,
          opacity: 0,
          background: "rgba(255,59,48,.10)",
          border: "1px solid rgba(255,59,48,.35)",
          borderRadius: 12,
          padding: "6px 14px",
          fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
          fontSize: 18,
          fontWeight: 700,
          color: "var(--danger)",
          whiteSpace: "nowrap",
        }}
      >
        ~1 trong 4 lần truy hồi fail
      </div>

      {/* token counter */}
      <div style={{
        position: "absolute",
        right: 0,
        top: BAR_Y + BAR_H + 52,
        textAlign: "right",
      }}>
        <span
          ref={counterRef}
          style={{
            fontFamily: "var(--font-display,'Inter'),sans-serif",
            fontWeight: 800,
            fontSize: 56,
            letterSpacing: "-0.03em",
            fontVariantNumeric: "tabular-nums",
            color: "var(--ink)",
          }}
        >0</span>
        <span style={{
          fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
          fontSize: 24,
          color: "var(--muted)",
          marginLeft: 10,
          fontWeight: 600,
        }}>tokens</span>
      </div>
    </div>
  );
}
