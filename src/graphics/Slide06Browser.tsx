import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Slide06Browser — Antigravity demo: stylized browser SVG, cursor moves and
 * clicks, a ring fills to 6/10, then the screen FREEZES (danger flash + glitch),
 * resets, loops again.
 */

export function Slide06Browser({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !root.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context((self) => {
      const q = (s: string) => self.selector!(s) as (SVGElement & HTMLElement)[];

      const browserEl = q(".s06-browser")[0];
      const cursorEl = q(".s06-cursor")[0];
      const clickRing = q(".s06-click-ring")[0];
      const freezeOverlay = q(".s06-freeze")[0];
      const glitchEl = q(".s06-glitch")[0];
      const ringPath = q(".s06-ring")[0] as unknown as SVGCircleElement;
      const scoreNum = q(".s06-score")[0];
      const versionChip = q(".s06-version")[0];

      const RING_R = 56;
      const CIRC = 2 * Math.PI * RING_R;

      if (reduced) {
        gsap.set([browserEl, versionChip], { opacity: 1, y: 0, scale: 1 });
        gsap.set(ringPath, { strokeDashoffset: CIRC * (1 - 0.6) });
        if (scoreNum) scoreNum.textContent = "6";
        gsap.set(freezeOverlay, { opacity: 0 });
        return;
      }

      gsap.set(ringPath, { strokeDasharray: CIRC, strokeDashoffset: CIRC });
      gsap.set([browserEl, versionChip], { opacity: 0, y: 30, scale: 0.94, transformOrigin: "50% 50%" });
      gsap.set(freezeOverlay, { opacity: 0 });
      gsap.set(glitchEl, { opacity: 0 });
      gsap.set(clickRing, { opacity: 0, scale: 0 });
      gsap.set(cursorEl, { x: 80, y: 60 });
      const scoreObj = { v: 0 };

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
        .to(browserEl, { opacity: 1, y: 0, scale: 1, duration: 0.6 }, 0)
        .to(versionChip, { opacity: 1, y: 0, scale: 1, duration: 0.5 }, 0.4)
        // cursor moves to first button
        .to(cursorEl, { x: 200, y: 130, duration: 0.7, ease: "power2.inOut" }, 0.7)
        .to(
          clickRing,
          {
            opacity: 1,
            scale: 1,
            duration: 0.2,
            transformOrigin: "50% 50%",
            onComplete() {
              gsap.to(clickRing, { opacity: 0, scale: 2, duration: 0.35 });
            },
          },
          1.45
        )
        // cursor moves to second area
        .to(cursorEl, { x: 340, y: 190, duration: 0.6, ease: "power2.inOut" }, 1.9)
        // ring fills to 6/10 (=60%)
        .to(ringPath, { strokeDashoffset: CIRC * 0.4, duration: 1.2, ease: "power2.inOut" }, 1.6)
        .to(
          scoreObj,
          {
            v: 6,
            duration: 1.0,
            snap: { v: 1 },
            onUpdate() {
              if (scoreNum) scoreNum.textContent = String(Math.round(scoreObj.v));
            },
          },
          1.7
        );

      // sustain: loop (act → freeze → glitch → reset)
      intro.add(() => {
        const cycle = gsap.timeline({ repeat: -1 });
        cycle
          // cursor wanders a bit
          .to(cursorEl, { x: 260, y: 160, duration: 0.8, ease: "sine.inOut" }, 0)
          .to(cursorEl, { x: 310, y: 210, duration: 0.6, ease: "sine.inOut" }, 0.9)
          // FREEZE — danger flash
          .to(freezeOverlay, { opacity: 0.18, duration: 0.08 }, 1.6)
          .to(freezeOverlay, { opacity: 0.06, duration: 0.06 }, 1.7)
          .to(freezeOverlay, { opacity: 0.22, duration: 0.05 }, 1.77)
          // glitch lines flicker
          .to(glitchEl, { opacity: 1, x: -4, duration: 0.05 }, 1.6)
          .to(glitchEl, { x: 6, duration: 0.05 }, 1.66)
          .to(glitchEl, { x: -2, duration: 0.04 }, 1.72)
          .to(glitchEl, { opacity: 0, x: 0, duration: 0.1 }, 1.8)
          // freeze overlay lingers
          .to(freezeOverlay, { opacity: 0.12, duration: 0.4 }, 1.82)
          // reset
          .to(freezeOverlay, { opacity: 0, duration: 0.3 }, 2.5)
          .to(cursorEl, { x: 80, y: 60, duration: 0.5, ease: "power2.inOut" }, 2.6)
          .set({}, {}, 3.2); // padding
      });
    }, root);

    return () => ctx.revert();
  }, [active]);

  const BW = 700;
  const BH = 420;

  return (
    <div ref={root} style={{ position: "relative", width: 900, height: 480, margin: "0 auto" }}>
      {/* Browser SVG */}
      <svg
        className="s06-browser"
        viewBox={`0 0 ${BW} ${BH}`}
        width={BW}
        height={BH}
        style={{ position: "absolute", left: 0, top: 0 }}
        aria-hidden
      >
        <defs>
          <clipPath id="s06-clip">
            <rect x={0} y={48} width={BW} height={BH - 48} rx={0} />
          </clipPath>
          <filter id="s06-freeze-blur">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
        </defs>

        {/* browser chrome */}
        <rect x={0} y={0} width={BW} height={BH} rx={18} fill="var(--surface)" stroke="var(--line)" strokeWidth={1.5} />
        {/* title bar */}
        <rect x={0} y={0} width={BW} height={48} rx={18} fill="#eaeaed" />
        <rect x={0} y={30} width={BW} height={18} fill="#eaeaed" />
        {/* traffic lights */}
        <circle cx={24} cy={24} r={7} fill="#ff5f57" />
        <circle cx={44} cy={24} r={7} fill="#febc2e" />
        <circle cx={64} cy={24} r={7} fill="#28c840" />
        {/* address bar */}
        <rect x={110} y={12} width={460} height={24} rx={7} fill="white" stroke="var(--line)" strokeWidth={1} />
        <text x={340} y={28} textAnchor="middle" fontFamily="var(--font-body,'Be Vietnam Pro'),sans-serif" fontSize={11} fill="var(--muted)">
          app.antigravity.ai
        </text>

        {/* page content area */}
        <rect x={0} y={48} width={BW} height={BH - 48} rx={0} fill="white" />
        <rect x={0} y={BH - 18} width={BW} height={18} rx={18} fill="white" />

        {/* page mock — nav bar */}
        <rect x={0} y={48} width={BW} height={44} fill="#f8f8f8" />
        <rect x={20} y={60} width={80} height={20} rx={6} fill="#0071e3" opacity={0.85} />
        <rect x={120} y={64} width={60} height={12} rx={4} fill="var(--line)" />
        <rect x={200} y={64} width={60} height={12} rx={4} fill="var(--line)" />
        <rect x={280} y={64} width={60} height={12} rx={4} fill="var(--line)" />

        {/* page content rows */}
        <rect x={20} y={116} width={420} height={18} rx={5} fill="var(--line)" />
        <rect x={20} y={142} width={340} height={14} rx={4} fill="var(--line-soft)" />
        <rect x={20} y={164} width={380} height={14} rx={4} fill="var(--line-soft)" />
        <rect x={20} y={200} width={180} height={36} rx={10} fill="#0071e3" opacity={0.9} />
        <text x={110} y={223} textAnchor="middle" fontFamily="var(--font-display,'Inter'),sans-serif" fontSize={13} fill="white" fontWeight={700}>
          Launch Task
        </text>

        {/* second button */}
        <rect x={220} y={200} width={160} height={36} rx={10} fill="none" stroke="var(--line)" strokeWidth={1.5} />
        <text x={300} y={223} textAnchor="middle" fontFamily="var(--font-display,'Inter'),sans-serif" fontSize={13} fill="var(--ink-soft)" fontWeight={600}>
          Settings
        </text>

        {/* "click highlight" on element */}
        <circle className="s06-click-ring" cx={200} cy={130} r={22} fill="none" stroke="#0071e3" strokeWidth={2} opacity={0} />

        {/* glitch lines */}
        <g className="s06-glitch" opacity={0} clipPath="url(#s06-clip)">
          <rect x={0} y={150} width={BW} height={3} fill="var(--danger)" opacity={0.6} />
          <rect x={0} y={220} width={BW} height={2} fill="var(--danger)" opacity={0.4} />
          <rect x={0} y={290} width={BW} height={4} fill="var(--danger)" opacity={0.35} />
        </g>

        {/* freeze overlay */}
        <rect
          className="s06-freeze"
          x={0}
          y={48}
          width={BW}
          height={BH - 48}
          fill="var(--danger)"
          opacity={0}
          rx={0}
          style={{ mixBlendMode: "multiply" }}
        />

        {/* SVG cursor */}
        <g className="s06-cursor">
          <polygon
            points="0,0 0,22 5,17 9,26 12,25 8,16 15,16"
            fill="white"
            stroke="#1d1d1f"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        </g>
      </svg>

      {/* Score ring (DOM, positioned right) */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 60,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        <svg width={160} height={160} viewBox="0 0 160 160" aria-hidden>
          <defs>
            <linearGradient id="s06-ring-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#0071e3" />
              <stop offset="1" stopColor="#0a84ff" />
            </linearGradient>
          </defs>
          {/* track */}
          <circle cx={80} cy={80} r={56} fill="none" stroke="var(--line)" strokeWidth={10} />
          {/* fill */}
          <circle
            className="s06-ring"
            cx={80}
            cy={80}
            r={56}
            fill="none"
            stroke="url(#s06-ring-grad)"
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 56}`}
            strokeDashoffset={`${2 * Math.PI * 56}`}
            transform="rotate(-90 80 80)"
          />
          <text
            x={80}
            y={72}
            textAnchor="middle"
            fontFamily="var(--font-display,'Inter'),sans-serif"
            fontWeight={900}
            fontSize={38}
            fill="var(--ink)"
            className="s06-score"
          >
            0
          </text>
          <text x={80} y={96} textAnchor="middle" fontFamily="var(--font-body,'Be Vietnam Pro'),sans-serif" fontSize={15} fill="var(--muted)">
            / 10
          </text>
        </svg>
        <span
          style={{
            fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
            fontSize: 18,
            color: "var(--ink-soft)",
            fontWeight: 600,
          }}
        >
          Điểm ổn định
        </span>
      </div>

      {/* Version chip */}
      <div
        className="s06-version"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          background: "rgba(255,255,255,.9)",
          border: "1px solid var(--line)",
          borderRadius: 999,
          padding: "8px 20px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--accent)",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
            fontSize: 17,
            color: "var(--ink-soft)",
          }}
        >
          AG 2.0 (~19/05): thêm Plugins + Sidecars
        </span>
      </div>
    </div>
  );
}
