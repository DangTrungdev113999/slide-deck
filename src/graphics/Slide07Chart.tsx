import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Slide07Chart — exponential vs linear draw-on chart.
 * Intro: linear path draws first (flat, dashed), then the exp curve shoots up.
 * Loop: exp curve redraws (dashoffset reset), a comet dot runs the curve.
 * Stacked "hat" layers pile on the exp side to illustrate "mũ chồng mũ".
 */

const W = 1400;
const H = 360;
const PAD = { left: 80, bottom: 60, right: 80, top: 30 };
const CW = W - PAD.left - PAD.right;
const CH = H - PAD.top - PAD.bottom;

// Generate path data for exponential curve: y = (e^(3x) - 1) / (e^3 - 1)
function expPath(): string {
  const pts: string[] = [];
  const N = 120;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const x = PAD.left + t * CW;
    const rawY = (Math.exp(3.2 * t) - 1) / (Math.exp(3.2) - 1);
    const y = PAD.top + CH - rawY * CH;
    pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

// Linear reference line
function linearPath(): string {
  const x0 = PAD.left;
  const x1 = PAD.left + CW;
  const y0 = PAD.top + CH;
  const y1 = PAD.top + CH * 0.25;
  return `M ${x0} ${y0} L ${x1} ${y1}`;
}

// Points along the exp curve for the "hat" markers
function expPoint(t: number): { x: number; y: number } {
  const rawY = (Math.exp(3.2 * t) - 1) / (Math.exp(3.2) - 1);
  return {
    x: PAD.left + t * CW,
    y: PAD.top + CH - rawY * CH,
  };
}

const HAT_TS = [0.55, 0.68, 0.80, 0.90, 1.0];

export function Slide07Chart({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !root.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context((self) => {
      const q = (s: string) => self.selector!(s);

      const expPathEl = q(".s07-exp")[0] as SVGPathElement;
      const linPathEl = q(".s07-lin")[0] as SVGPathElement;
      const cometEl = q(".s07-comet")[0] as SVGElement;
      const hats = q(".s07-hat") as SVGElement[];
      const labels = q(".s07-label") as HTMLElement[];
      const axisLines = q(".s07-axis") as SVGElement[];

      if (reduced) {
        gsap.set([expPathEl, linPathEl], { strokeDashoffset: 0 });
        gsap.set(hats, { opacity: 1, scale: 1 });
        gsap.set(labels, { opacity: 1, y: 0 });
        gsap.set(axisLines, { opacity: 1 });
        gsap.set(cometEl, { opacity: 1 });
        return;
      }

      const expLen = expPathEl.getTotalLength();
      const linLen = linPathEl.getTotalLength();

      gsap.set(expPathEl, { strokeDasharray: expLen, strokeDashoffset: expLen });
      gsap.set(linPathEl, { strokeDasharray: linLen, strokeDashoffset: linLen });
      gsap.set(hats, { opacity: 0, scale: 0.4, transformOrigin: "50% 100%" });
      gsap.set(labels, { opacity: 0, y: 10 });
      gsap.set(axisLines, { opacity: 0 });
      gsap.set(cometEl, { opacity: 0 });

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
        .to(axisLines, { opacity: 1, duration: 0.4, stagger: 0.08 }, 0)
        .to(labels, { opacity: 1, y: 0, duration: 0.4, stagger: 0.07 }, 0.2)
        .to(linPathEl, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" }, 0.5)
        .to(expPathEl, { strokeDashoffset: 0, duration: 1.4, ease: "power3.inOut" }, 0.9)
        .to(hats, { opacity: 1, scale: 1, duration: 0.35, stagger: 0.1, ease: "back.out(2)" }, 1.6);

      // sustain: exp curve redraws + comet runs it
      intro.add(() => {
        // comet runs the exp path forever
        gsap.set(cometEl, { opacity: 1 });
        const cometLoop = () => {
          const expEl2 = expPathEl;
          const total = expEl2.getTotalLength();
          const N = 60;
          const pts = Array.from({ length: N + 1 }, (_, i) => {
            const p = expEl2.getPointAtLength((i / N) * total);
            return { x: p.x, y: p.y };
          });
          const tl = gsap.timeline({
            onComplete: () => {
              gsap.delayedCall(0.4, cometLoop);
            },
          });
          tl.set(cometEl, { x: pts[0].x, y: pts[0].y, opacity: 0 });
          tl.to(cometEl, { opacity: 1, duration: 0.2 }, 0);
          pts.forEach((pt, i) => {
            if (i === 0) return;
            tl.to(cometEl, { x: pt.x, y: pt.y, duration: 2.2 / N, ease: "none" }, (i - 1) * (2.2 / N));
          });
          tl.to(cometEl, { opacity: 0, duration: 0.3 });
        };
        cometLoop();

        // hats subtly breathe
        gsap.to(hats, {
          y: -4,
          duration: 1.8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: 0.12,
        });
      });
    }, root);

    return () => ctx.revert();
  }, [active]);

  const EP = expPath();
  const LP = linearPath();

  return (
    <div ref={root} style={{ position: "relative", width: W, height: H, margin: "0 auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <linearGradient id="s07-exp-grad" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#0071e3" stopOpacity={0.3} />
            <stop offset="0.6" stopColor="#0071e3" />
            <stop offset="1" stopColor="#0a84ff" />
          </linearGradient>
          <linearGradient id="s07-lin-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#b0b8c8" />
            <stop offset="1" stopColor="#8090a8" />
          </linearGradient>
          <radialGradient id="s07-comet-grad">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.4" stopColor="#0a84ff" />
            <stop offset="1" stopColor="rgba(0,113,227,0)" />
          </radialGradient>
          <filter id="s07-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* axis lines */}
        <line className="s07-axis" x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + CH} stroke="var(--line)" strokeWidth={1.5} />
        <line className="s07-axis" x1={PAD.left} y1={PAD.top + CH} x2={PAD.left + CW} y2={PAD.top + CH} stroke="var(--line)" strokeWidth={1.5} />

        {/* grid lines (horizontal) */}
        {[0.25, 0.5, 0.75].map((frac) => (
          <line
            key={frac}
            className="s07-axis"
            x1={PAD.left}
            y1={PAD.top + CH * (1 - frac)}
            x2={PAD.left + CW}
            y2={PAD.top + CH * (1 - frac)}
            stroke="var(--line-soft)"
            strokeWidth={1}
            strokeDasharray="4 6"
          />
        ))}

        {/* linear path */}
        <path className="s07-lin" d={LP} fill="none" stroke="url(#s07-lin-grad)" strokeWidth={3} strokeLinecap="round" strokeDasharray="8 6" />

        {/* exp path (glow version behind) */}
        <path d={EP} fill="none" stroke="rgba(0,113,227,.15)" strokeWidth={12} strokeLinecap="round" />
        {/* exp path main */}
        <path className="s07-exp" d={EP} fill="none" stroke="url(#s07-exp-grad)" strokeWidth={4} strokeLinecap="round" filter="url(#s07-glow)" />

        {/* hat markers along exp curve */}
        {HAT_TS.map((t, i) => {
          const pt = expPoint(t);
          return (
            <g key={i} className="s07-hat" transform={`translate(${pt.x}, ${pt.y})`}>
              {/* stacked triangle "hat" */}
              <polygon points="-14,0 14,0 0,-20" fill="var(--accent)" opacity={0.85 - i * 0.1} />
              <polygon points="-10,2 10,2 0,-14" fill="#0a84ff" opacity={0.6} />
            </g>
          );
        })}

        {/* comet dot */}
        <g className="s07-comet" opacity={0}>
          <circle r={14} fill="url(#s07-comet-grad)" />
          <circle r={5} fill="white" />
        </g>

        {/* axis labels */}
        <text className="s07-label" x={PAD.left - 12} y={PAD.top + CH + 30} textAnchor="middle" fontFamily="var(--font-body,'Be Vietnam Pro'),sans-serif" fontSize={16} fill="var(--muted)">
          T0
        </text>
        <text className="s07-label" x={PAD.left + CW} y={PAD.top + CH + 30} textAnchor="middle" fontFamily="var(--font-body,'Be Vietnam Pro'),sans-serif" fontSize={16} fill="var(--muted)">
          T+
        </text>

        {/* legend */}
        <line className="s07-label" x1={PAD.left + CW - 260} y1={PAD.top + 14} x2={PAD.left + CW - 220} y2={PAD.top + 14} stroke="url(#s07-exp-grad)" strokeWidth={3} />
        <text className="s07-label" x={PAD.left + CW - 210} y={PAD.top + 19} fontFamily="var(--font-body,'Be Vietnam Pro'),sans-serif" fontSize={16} fill="var(--accent)" fontWeight={700}>
          Mũ chồng mũ
        </text>
        <line className="s07-label" x1={PAD.left + CW - 260} y1={PAD.top + 38} x2={PAD.left + CW - 220} y2={PAD.top + 38} stroke="url(#s07-lin-grad)" strokeWidth={2} strokeDasharray="6 4" />
        <text className="s07-label" x={PAD.left + CW - 210} y={PAD.top + 43} fontFamily="var(--font-body,'Be Vietnam Pro'),sans-serif" fontSize={16} fill="var(--muted)">
          Tuyến tính
        </text>
      </svg>
    </div>
  );
}
