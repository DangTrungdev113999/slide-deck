import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Slide07Chart — "Không tiến hoá tuyến tính"
 *
 * A deliberately legible chart: one bold exponential curve (accent blue) shoots
 * upward, one dashed grey linear reference stays flat. Axis labels in big type.
 * Named milestones pop along the curve. A glowing comet rides the exp path on
 * a sustain loop. The linear label sits near its endpoint so the contrast is obvious.
 *
 * StrictMode-safe: gsap.context() + ctx.revert().
 * Reduced-motion: everything rendered at final state, no animation.
 */

const W = 1560;
const H = 500;
// Chart plot area
const PAD = { left: 120, bottom: 90, right: 200, top: 40 };
const CW = W - PAD.left - PAD.right;
const CH = H - PAD.top - PAD.bottom;

// Exponential curve: y = (e^(3.4·t) − 1) / (e^3.4 − 1), mapped to plot area
function expPoint(t: number): { x: number; y: number } {
  const rawY = (Math.exp(3.4 * t) - 1) / (Math.exp(3.4) - 1);
  return {
    x: PAD.left + t * CW,
    y: PAD.top + CH - rawY * CH,
  };
}

function buildExpPath(): string {
  const pts: string[] = [];
  const N = 160;
  for (let i = 0; i <= N; i++) {
    const { x, y } = expPoint(i / N);
    pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return pts.join(" ");
}

// Linear reference: from bottom-left to upper-right at 30% of chart height rise
function buildLinPath(): string {
  const x0 = PAD.left;
  const x1 = PAD.left + CW;
  const y0 = PAD.top + CH;
  const y1 = PAD.top + CH * 0.30; // modest slope
  return `M ${x0} ${y0} L ${x1} ${y1}`;
}

// Milestone labels along the exp curve
const MILESTONES = [
  { t: 0.18, label: "GPT-3", sub: "2020" },
  { t: 0.38, label: "ChatGPT", sub: "2022" },
  { t: 0.58, label: "GPT-4", sub: "2023" },
  { t: 0.76, label: "Claude / Cursor", sub: "2024" },
  { t: 0.93, label: "Agent era", sub: "2025 →" },
];

const EP = buildExpPath();
const LP = buildLinPath();

export function Slide07Chart({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !root.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context((self) => {
      const q = (s: string) => self.selector!(s);

      const expEl = q(".s07-exp")[0] as SVGPathElement;
      const linEl = q(".s07-lin")[0] as SVGPathElement;
      const axisEls = q(".s07-axis") as SVGElement[];
      const axisLabelEls = q(".s07-axis-label") as SVGElement[];
      const milestoneEls = q(".s07-milestone") as HTMLElement[];
      const cometEl = q(".s07-comet")[0] as SVGElement;
      const legendEls = q(".s07-legend") as SVGElement[];
      const linLabelEl = q(".s07-lin-label")[0] as SVGElement;
      const expLabelEl = q(".s07-exp-label")[0] as SVGElement;

      if (reduced) {
        gsap.set([expEl, linEl], { strokeDashoffset: 0 });
        gsap.set([...axisEls, ...axisLabelEls, ...legendEls], { opacity: 1 });
        gsap.set(milestoneEls, { opacity: 1, y: 0, scale: 1 });
        gsap.set(cometEl, { opacity: 1 });
        gsap.set([linLabelEl, expLabelEl], { opacity: 1 });
        return;
      }

      const expLen = expEl.getTotalLength();
      const linLen = linEl.getTotalLength();

      // Initial hidden states
      gsap.set(expEl, { strokeDasharray: expLen, strokeDashoffset: expLen });
      gsap.set(linEl, { strokeDasharray: linLen, strokeDashoffset: linLen });
      gsap.set([...axisEls, ...axisLabelEls, ...legendEls, linLabelEl, expLabelEl], { opacity: 0 });
      gsap.set(milestoneEls, { opacity: 0, y: 16, scale: 0.88, transformOrigin: "50% 100%" });
      gsap.set(cometEl, { opacity: 0 });

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
        // axes fade in
        .to(axisEls, { opacity: 1, duration: 0.5, stagger: 0.06 }, 0)
        .to(axisLabelEls, { opacity: 1, duration: 0.4, stagger: 0.04 }, 0.2)
        // linear draws first — audiences see the "expected" path
        .to(linEl, { strokeDashoffset: 0, duration: 1.0, ease: "power2.inOut" }, 0.45)
        .to(linLabelEl, { opacity: 1, duration: 0.4 }, 1.35)
        // then the exp curve shoots up — the dramatic contrast
        .to(expEl, { strokeDashoffset: 0, duration: 1.6, ease: "power3.inOut" }, 1.55)
        .to(expLabelEl, { opacity: 1, duration: 0.5 }, 2.8)
        // legend
        .to(legendEls, { opacity: 1, duration: 0.4, stagger: 0.1 }, 2.0)
        // milestones pop in along the curve
        .to(milestoneEls, { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.14, ease: "back.out(2)" }, 2.2);

      // ---- SUSTAIN LOOP ----
      intro.add(() => {
        gsap.set(cometEl, { opacity: 1 });

        // Comet runs the exp path using getPointAtLength — smooth, repeat:-1
        const total = expEl.getTotalLength();
        const STEPS = 80;
        const DURATION = 3.0; // seconds per pass

        const cometLoop = () => {
          const tl = gsap.timeline({
            onComplete: () => gsap.delayedCall(0.3, cometLoop),
          });
          // Fade in at start
          tl.set(cometEl, { opacity: 0 });
          tl.to(cometEl, { opacity: 1, duration: 0.25 });

          for (let i = 0; i <= STEPS; i++) {
            const frac = i / STEPS;
            const pt = expEl.getPointAtLength(frac * total);
            tl.to(
              cometEl,
              { x: pt.x, y: pt.y, duration: DURATION / STEPS, ease: "none" },
              0.25 + frac * DURATION
            );
          }
          // Fade out at end
          tl.to(cometEl, { opacity: 0, duration: 0.3 });
        };
        cometLoop();

        // Milestone cards breathe gently
        gsap.to(milestoneEls, {
          y: -5,
          duration: 2.2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: { each: 0.2, from: "start" },
        });

        // Exp curve glows / pulses in opacity (subtle)
        gsap.to(".s07-exp-glow", {
          opacity: 0.35,
          duration: 1.8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      });
    }, root);

    return () => ctx.revert();
  }, [active]);

  // Precompute milestone positions
  const milestonePositions = MILESTONES.map((m) => ({ ...m, pt: expPoint(m.t) }));
  // Linear endpoint for its label
  const linEnd = { x: PAD.left + CW, y: PAD.top + CH * 0.70 };
  // Exp endpoint label
  const expEnd = expPoint(1.0);

  return (
    <div
      ref={root}
      style={{ position: "relative", width: W, height: H, margin: "0 auto" }}
    >
      {/* ===== SVG layer ===== */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        aria-hidden
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        <defs>
          {/* Exp curve gradient: low opacity at start → vivid accent at peak */}
          <linearGradient id="s07-exp-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#0071e3" stopOpacity={0.5} />
            <stop offset="0.55" stopColor="#0071e3" />
            <stop offset="1" stopColor="#0a84ff" />
          </linearGradient>
          {/* Comet radial glow */}
          <radialGradient id="s07-comet-grad">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.3" stopColor="#3a9bff" />
            <stop offset="1" stopColor="rgba(0,113,227,0)" />
          </radialGradient>
          {/* Comet blur filter */}
          <filter id="s07-comet-blur" x="-300%" y="-300%" width="700%" height="700%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
          {/* Exp path glow */}
          <filter id="s07-exp-glow-filter" x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ---- Axes ---- */}
        {/* Y axis */}
        <line
          className="s07-axis"
          x1={PAD.left}
          y1={PAD.top - 10}
          x2={PAD.left}
          y2={PAD.top + CH}
          stroke="var(--line)"
          strokeWidth={2}
          strokeLinecap="round"
        />
        {/* X axis */}
        <line
          className="s07-axis"
          x1={PAD.left}
          y1={PAD.top + CH}
          x2={PAD.left + CW + 30}
          y2={PAD.top + CH}
          stroke="var(--line)"
          strokeWidth={2}
          strokeLinecap="round"
        />

        {/* Axis arrow heads */}
        <polygon
          className="s07-axis"
          points={`${PAD.left},${PAD.top - 20} ${PAD.left - 7},${PAD.top - 4} ${PAD.left + 7},${PAD.top - 4}`}
          fill="var(--muted)"
        />
        <polygon
          className="s07-axis"
          points={`${PAD.left + CW + 40},${PAD.top + CH} ${PAD.left + CW + 22},${PAD.top + CH - 7} ${PAD.left + CW + 22},${PAD.top + CH + 7}`}
          fill="var(--muted)"
        />

        {/* Axis labels */}
        <text
          className="s07-axis-label"
          x={PAD.left - 18}
          y={PAD.top - 28}
          textAnchor="middle"
          fontFamily="var(--font-body,'Be Vietnam Pro'),sans-serif"
          fontSize={22}
          fontWeight={700}
          fill="var(--muted)"
        >
          Năng lực ↑
        </text>
        <text
          className="s07-axis-label"
          x={PAD.left + CW + 60}
          y={PAD.top + CH + 6}
          textAnchor="middle"
          fontFamily="var(--font-body,'Be Vietnam Pro'),sans-serif"
          fontSize={22}
          fontWeight={700}
          fill="var(--muted)"
        >
          Thời gian →
        </text>

        {/* Y-axis ticks / guides */}
        {[0.25, 0.5, 0.75, 1.0].map((frac) => (
          <g key={frac}>
            <line
              className="s07-axis"
              x1={PAD.left - 8}
              y1={PAD.top + CH * (1 - frac)}
              x2={PAD.left + CW}
              y2={PAD.top + CH * (1 - frac)}
              stroke="var(--line-soft)"
              strokeWidth={1}
              strokeDasharray="5 8"
              opacity={0.7}
            />
          </g>
        ))}

        {/* ---- LINEAR reference path (dashed grey) ---- */}
        <path
          className="s07-lin"
          d={LP}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray="10 8"
          opacity={0.65}
        />

        {/* Linear endpoint label */}
        <g className="s07-lin-label">
          <text
            x={linEnd.x + 12}
            y={linEnd.y - 28}
            fontFamily="var(--font-body,'Be Vietnam Pro'),sans-serif"
            fontSize={24}
            fontWeight={700}
            fill="var(--muted)"
          >
            Tuyến tính
          </text>
          <text
            x={linEnd.x + 12}
            y={linEnd.y - 2}
            fontFamily="var(--font-body,'Be Vietnam Pro'),sans-serif"
            fontSize={20}
            fill="var(--muted)"
            opacity={0.8}
          >
            (kỳ vọng thông thường)
          </text>
        </g>

        {/* ---- EXPONENTIAL curve ---- */}
        {/* Glow halo behind */}
        <path
          className="s07-exp-glow"
          d={EP}
          fill="none"
          stroke="rgba(0,113,227,0.22)"
          strokeWidth={18}
          strokeLinecap="round"
          opacity={0.22}
        />
        {/* Main exp curve */}
        <path
          className="s07-exp"
          d={EP}
          fill="none"
          stroke="url(#s07-exp-grad)"
          strokeWidth={5}
          strokeLinecap="round"
          filter="url(#s07-exp-glow-filter)"
        />

        {/* Exp end label — big, accent */}
        <g className="s07-exp-label">
          <text
            x={expEnd.x - 240}
            y={expEnd.y - 26}
            fontFamily="var(--font-display,'Inter'),sans-serif"
            fontSize={26}
            fontWeight={800}
            fill="var(--accent)"
            letterSpacing="-0.01em"
          >
            Hàm mũ (exponential)
          </text>
          <text
            x={expEnd.x - 240}
            y={expEnd.y + 2}
            fontFamily="var(--font-body,'Be Vietnam Pro'),sans-serif"
            fontSize={21}
            fill="var(--accent)"
            opacity={0.8}
          >
            "Mũ chồng mũ" — khoảng cách ngày càng lớn
          </text>
        </g>

        {/* ---- COMET ---- */}
        <g className="s07-comet" opacity={0}>
          {/* blur halo */}
          <circle r={22} fill="url(#s07-comet-grad)" filter="url(#s07-comet-blur)" />
          {/* bright core */}
          <circle r={8} fill="#ffffff" />
          <circle r={8} fill="none" stroke="var(--accent)" strokeWidth={2.5} opacity={0.7} />
        </g>

        {/* ---- LEGEND (top-left) ---- */}
        <g className="s07-legend" transform={`translate(${PAD.left + 20}, ${PAD.top + 16})`}>
          {/* Exp legend */}
          <line x1={0} y1={0} x2={44} y2={0} stroke="var(--accent)" strokeWidth={4} strokeLinecap="round" />
          <text
            x={54}
            y={5}
            fontFamily="var(--font-body,'Be Vietnam Pro'),sans-serif"
            fontSize={22}
            fontWeight={700}
            fill="var(--accent)"
          >
            AI Coding Capability
          </text>
          {/* Lin legend */}
          <line x1={0} y1={36} x2={44} y2={36} stroke="var(--muted)" strokeWidth={3} strokeDasharray="8 6" strokeLinecap="round" opacity={0.7} />
          <text
            x={54}
            y={41}
            fontFamily="var(--font-body,'Be Vietnam Pro'),sans-serif"
            fontSize={22}
            fontWeight={600}
            fill="var(--muted)"
          >
            Kỳ vọng tuyến tính
          </text>
        </g>
      </svg>

      {/* ===== Milestone callout bubbles (HTML for crisp text) ===== */}
      {milestonePositions.map((m, i) => {
        // Alternate above/below to avoid overlap
        const above = i % 2 === 0;
        const bubbleH = 72;
        const bubbleW = 200;
        const offsetY = above ? -(bubbleH + 24) : 24;
        const left = m.pt.x - bubbleW / 2;
        const top = m.pt.y + offsetY;

        return (
          <div
            key={m.label}
            className="s07-milestone"
            style={{
              position: "absolute",
              left,
              top,
              width: bubbleW,
              background: "linear-gradient(180deg,#ffffff 0%,#f7f8fb 100%)",
              border: "1.5px solid var(--line)",
              borderRadius: 16,
              boxShadow: "var(--shadow-md)",
              padding: "10px 16px 10px",
              textAlign: "center",
            }}
          >
            {/* Connector line (pseudo-element via inline style is tricky — use a tiny SVG inside) */}
            <div
              style={{
                fontFamily: "var(--font-display,'Inter'),sans-serif",
                fontWeight: 800,
                fontSize: 22,
                color: "var(--ink)",
                letterSpacing: "-0.01em",
                lineHeight: 1.1,
              }}
            >
              {m.label}
            </div>
            <div
              style={{
                fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
                fontSize: 20,
                color: "var(--muted)",
                marginTop: 3,
              }}
            >
              {m.sub}
            </div>
            {/* Dot anchor on curve */}
            <svg
              aria-hidden
              style={{
                position: "absolute",
                left: bubbleW / 2 - 7,
                top: above ? bubbleH - 2 : -14,
                overflow: "visible",
              }}
              width={14}
              height={14}
            >
              <circle cx={7} cy={7} r={6} fill="var(--accent)" />
              <circle cx={7} cy={7} r={3} fill="#fff" />
            </svg>
          </div>
        );
      })}
    </div>
  );
}
