import { useEffect, useRef } from "react";
import gsap from "gsap";

const W = 1560;
const BAR_H = 72;
const BAR_Y = 230;
const HEALTHY_FRAC = 0.2; // 200K / 1M
const DOT_COUNT = 12;
// last 5 dots are in the rot zone (≥ ~7/12 × W ≈ beyond the 200K marker at 20%)
// Marker is at 20% of W. Dots span full width, so dot i is at position i/(DOT_COUNT-1).
// Dots at position > 0.2 are in rot zone. That's dots 3–11 (indices 3 onward).
// We want ~5 of them to fail visibly — pick the rightmost 5.
const FAIL_INDICES = [7, 8, 9, 10, 11];

const DOTS = Array.from({ length: DOT_COUNT }, (_, i) => ({
  x: 48 + i * ((W - 96) / (DOT_COUNT - 1)),
  y: BAR_Y - 88,
  fail: FAIL_INDICES.includes(i),
}));

const healthyW = W * HEALTHY_FRAC;

export function Slide11ContextBar({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const annotRef = useRef<HTMLDivElement>(null);
  const markerLineRef = useRef<HTMLDivElement>(null);
  const healthyCardRef = useRef<HTMLDivElement>(null);
  const rotCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !root.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context((self) => {
      const q = (s: string) => self.selector!(s);
      const dots = q(".cb-dot");
      const fill = fillRef.current!;
      const counter = counterRef.current!;
      const annot = annotRef.current!;
      const markerLine = markerLineRef.current!;
      const healthyCard = healthyCardRef.current!;
      const rotCard = rotCardRef.current!;

      if (reduced) {
        gsap.set(fill, { scaleX: 0.88 });
        gsap.set(dots, { opacity: 1 });
        FAIL_INDICES.forEach((i) => {
          gsap.set(dots[i], { backgroundColor: "var(--danger)" });
        });
        counter.textContent = "900.000";
        gsap.set(annot, { opacity: 1, y: 0 });
        gsap.set([healthyCard, rotCard, markerLine], { opacity: 1, scale: 1, y: 0 });
        return;
      }

      // ---- initial state ----
      gsap.set(fill, { scaleX: 0 });
      gsap.set(dots, {
        opacity: 0,
        scale: 0.4,
        backgroundColor: "var(--accent)",
        boxShadow: "0 0 0 4px rgba(0,113,227,.18)",
      });
      gsap.set(annot, { opacity: 0, y: 10 });
      gsap.set([markerLine, healthyCard, rotCard], { opacity: 0, y: 12 });
      counter.textContent = "0";

      const obj = { val: 0, fillFrac: 0 };

      function runLoop() {
        // Reset state
        gsap.set(fill, { scaleX: 0 });
        gsap.set(dots, {
          opacity: 1,
          scale: 1,
          backgroundColor: "var(--accent)",
          boxShadow: "0 0 0 4px rgba(0,113,227,.18)",
        });
        gsap.set(annot, { opacity: 0, y: 10 });
        obj.val = 0;
        obj.fillFrac = 0;
        counter.textContent = "0";

        const tl = gsap.timeline({ onComplete: () => { gsap.delayedCall(1.2, runLoop); } });

        // fill bar 0 → 90%
        tl.to(obj, {
          fillFrac: 0.9,
          duration: 4.5,
          ease: "power1.inOut",
          onUpdate() {
            gsap.set(fill, { scaleX: obj.fillFrac });
          },
        }, 0);

        // count-up 0 → 900,000
        tl.to(obj, {
          val: 900000,
          duration: 4.5,
          ease: "power1.inOut",
          onUpdate() {
            counter.textContent = Math.round(obj.val).toLocaleString("vi-VN");
          },
        }, 0);

        // annotation fades in when fill crosses ~200K zone (around 1s)
        tl.to(annot, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 1.1);

        // fail dots start flickering as fill enters rot zone (~1.5s in)
        FAIL_INDICES.forEach((i, idx) => {
          const delay = 1.5 + idx * 0.25;
          tl.to(dots[i], {
            backgroundColor: "var(--danger)",
            boxShadow: "0 0 0 5px rgba(255,59,48,.25)",
            duration: 0.25,
            ease: "power2.out",
          }, delay);
          // flicker: scale down to simulate "fail"
          tl.to(dots[i], {
            scale: 0.85,
            opacity: 0.65,
            duration: 0.35,
            ease: "power2.inOut",
          }, delay + 0.3);
          // settle to a dim state
          tl.to(dots[i], {
            backgroundColor: "var(--line)",
            boxShadow: "none",
            scale: 0.75,
            opacity: 0.45,
            duration: 0.4,
          }, delay + 0.7);
        });

        // hold at end
        tl.to({}, { duration: 1.0 });

        // sustain: healthy dots breathe gently
        const healthyDots = [...dots].filter((_, i) => !FAIL_INDICES.includes(i));
        gsap.to(healthyDots, {
          scale: 1.12,
          boxShadow: "0 0 0 6px rgba(0,113,227,.28)",
          duration: 1.8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: { each: 0.18, from: "start" },
        });
      }

      // ---- entrance ----
      const intro = gsap.timeline();
      intro
        .to(dots, { opacity: 1, scale: 1, duration: 0.4, stagger: 0.06, ease: "back.out(1.6)" }, 0)
        .to(markerLine, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, 0.3)
        .to(healthyCard, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, 0.4)
        .to(rotCard, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, 0.55);

      intro.add(() => { gsap.delayedCall(0.2, runLoop); });
    }, root);

    return () => ctx.revert();
  }, [active]);

  return (
    <div
      ref={root}
      style={{ position: "relative", width: W, height: 460, margin: "0 auto" }}
    >
      {/* ---- top axis labels ---- */}
      <div style={{ position: "absolute", top: BAR_Y - 134, left: 0, width: W, pointerEvents: "none" }}>
        <span style={{
          position: "absolute", left: 0,
          fontFamily: "var(--font-display,'Inter'),sans-serif",
          fontWeight: 700, fontSize: 22, color: "var(--muted)",
        }}>0</span>
        <span style={{
          position: "absolute", left: healthyW - 30,
          fontFamily: "var(--font-display,'Inter'),sans-serif",
          fontWeight: 800, fontSize: 28, color: "var(--accent)",
        }}>200K</span>
        <span style={{
          position: "absolute", right: 0,
          fontFamily: "var(--font-display,'Inter'),sans-serif",
          fontWeight: 800, fontSize: 28, color: "var(--danger)",
        }}>1M</span>
      </div>

      {/* ---- retrieval dots (above bar) ---- */}
      {DOTS.map((d, i) => (
        <div
          key={i}
          className="cb-dot"
          style={{
            position: "absolute",
            left: d.x - 15,
            top: d.y - 15,
            width: 30,
            height: 30,
            borderRadius: "50%",
            backgroundColor: "var(--accent)",
            boxShadow: "0 0 0 4px rgba(0,113,227,.18)",
          }}
        />
      ))}

      {/* ---- dot row label (above dots) ---- */}
      <div style={{
        position: "absolute",
        top: BAR_Y - 140,
        left: 0,
        width: W,
        display: "flex",
        alignItems: "center",
        pointerEvents: "none",
      }}>
        <span style={{
          fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
          fontWeight: 700, fontSize: 20, color: "var(--muted)",
          letterSpacing: "0.01em",
          marginLeft: "auto",
          marginRight: "auto",
        }}>Khả năng truy hồi thông tin chính xác</span>
      </div>

      {/* ---- the bar track ---- */}
      <div style={{
        position: "absolute",
        left: 0, top: BAR_Y,
        width: W, height: BAR_H,
        borderRadius: BAR_H / 2,
        background: "var(--surface)",
        border: "1.5px solid var(--line)",
        overflow: "hidden",
      }}>
        {/* fill */}
        <div
          ref={fillRef}
          style={{
            position: "absolute", inset: 0,
            transformOrigin: "left center",
            background: `linear-gradient(90deg,
              #34c759 0%,
              var(--accent) ${(HEALTHY_FRAC * 100).toFixed(1)}%,
              #ff9500 ${(HEALTHY_FRAC * 100 + 8).toFixed(1)}%,
              var(--danger) 100%)`,
            borderRadius: BAR_H / 2,
          } as React.CSSProperties}
        />
        {/* healthy-zone marker inside bar */}
        <div style={{
          position: "absolute",
          left: healthyW,
          top: 0, bottom: 0,
          width: 3,
          background: "rgba(255,255,255,0.72)",
        }} />
      </div>

      {/* ---- 200K marker line (vertical, from bar top to dot row) ---- */}
      <div
        ref={markerLineRef}
        style={{
          position: "absolute",
          left: healthyW,
          top: BAR_Y - 80,
          width: 2,
          height: 80,
          background: "var(--accent)",
          opacity: 0,
        }}
      />

      {/* ---- zone labels below bar ---- */}
      <div style={{
        position: "absolute",
        top: BAR_Y + BAR_H + 16,
        left: 0, width: W,
      }}>
        <span style={{
          position: "absolute", left: 0,
          fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
          fontSize: 24, fontWeight: 700, color: "var(--accent)",
        }}>✓ Vùng ngon — 0 đến 200K</span>
        <span style={{
          position: "absolute", left: healthyW + 20,
          fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
          fontSize: 24, fontWeight: 700, color: "var(--danger)",
        }}>⚠ Context rot zone</span>
      </div>

      {/* ---- danger annotation (appears during fill) ---- */}
      <div
        ref={annotRef}
        style={{
          position: "absolute",
          left: healthyW + 48,
          top: BAR_Y - 86,
          opacity: 0,
          background: "rgba(255,59,48,.09)",
          border: "1.5px solid rgba(255,59,48,.38)",
          borderRadius: 14,
          padding: "8px 18px",
          fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
          fontSize: 22,
          fontWeight: 700,
          color: "var(--danger)",
          whiteSpace: "nowrap",
          backdropFilter: "blur(4px)",
        }}
      >
        ~1/4 lần truy hồi thất bại
      </div>

      {/* ---- healthy zone callout card ---- */}
      <div
        ref={healthyCardRef}
        style={{
          position: "absolute",
          left: 0,
          top: BAR_Y + BAR_H + 68,
          width: healthyW - 16,
          background: "linear-gradient(160deg, #f0fff4 0%, #e6f9ee 100%)",
          border: "1.5px solid rgba(52,199,89,.35)",
          borderRadius: 20,
          padding: "22px 24px",
          opacity: 0,
        }}
      >
        <div style={{
          fontFamily: "var(--font-display,'Inter'),sans-serif",
          fontWeight: 800, fontSize: 26, color: "var(--accent-700)",
          marginBottom: 10,
        }}>200K — điểm ngọt</div>
        <div style={{
          fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
          fontSize: 22, lineHeight: 1.5, color: "var(--ink-soft)",
        }}>
          Retrieval chính xác<br />
          Model suy luận tốt<br />
          Tốc độ phản hồi cao
        </div>
      </div>

      {/* ---- rot zone card ---- */}
      <div
        ref={rotCardRef}
        style={{
          position: "absolute",
          left: healthyW + 20,
          top: BAR_Y + BAR_H + 68,
          width: W - healthyW - 20,
          background: "linear-gradient(160deg, #fff5f5 0%, #fff0f0 100%)",
          border: "1.5px solid rgba(255,59,48,.28)",
          borderRadius: 20,
          padding: "22px 24px",
          opacity: 0,
        }}
      >
        <div style={{
          fontFamily: "var(--font-display,'Inter'),sans-serif",
          fontWeight: 800, fontSize: 26, color: "var(--danger)",
          marginBottom: 10,
        }}>Context rot — khi nhét quá nhiều</div>
        <div style={{
          fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
          fontSize: 22, lineHeight: 1.55, color: "var(--ink-soft)",
        }}>
          Model bỏ sót thông tin ở giữa ("Lost in Middle")<br />
          Lẫn lộn context cũ và mới<br />
          Chất lượng output giảm rõ rệt — dùng <code style={{
            background: "rgba(255,59,48,.1)",
            borderRadius: 6,
            padding: "1px 7px",
            fontSize: 21,
            fontFamily: "ui-monospace,'SF Mono',Menlo,monospace",
          }}>/compact</code> để ép về 200K
        </div>
      </div>

      {/* ---- token counter (bottom right) ---- */}
      <div style={{
        position: "absolute",
        right: 0,
        top: BAR_Y + BAR_H + 68,
        textAlign: "right",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 2,
      }}>
        <span style={{
          fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
          fontSize: 22, color: "var(--muted)", fontWeight: 600,
          marginBottom: 4,
        }}>tokens đã dùng</span>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span
            ref={counterRef}
            style={{
              fontFamily: "var(--font-display,'Inter'),sans-serif",
              fontWeight: 800,
              fontSize: 72,
              letterSpacing: "-0.03em",
              fontVariantNumeric: "tabular-nums",
              color: "var(--ink)",
              lineHeight: 1,
            }}
          >0</span>
          <span style={{
            fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
            fontSize: 28,
            color: "var(--muted)",
            fontWeight: 600,
          }}>/ 1M</span>
        </div>
      </div>
    </div>
  );
}
