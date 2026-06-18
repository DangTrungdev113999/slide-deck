import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Slide08Radial — redesigned hero radial diagram.
 *
 * Agent at center. 9 capabilities radiate out as clean spokes.
 * Labels are placed OUTSIDE the node circles (not inside), anchored by quadrant,
 * horizontal, ≥24px, never overlapping.
 *
 * Animations (StrictMode-safe):
 *  Intro: center pops → spokes draw → node circles pop stagger → labels fade up
 *  Loop: center breathes · pulse ring expands · glow orbits the node ring
 */

// Canvas
const SVG_W = 1560;
const SVG_H = 780;

// Center of radial
const CX = 780;
const CY = 400;

// Geometry
const RADIUS = 285;       // orbit radius — 9 nodes at 40° apart, arc spacing ≈199px
const CENTER_R = 82;      // center circle radius
const NODE_R = 46;        // capability node circle radius
const LABEL_OFFSET = 58;  // extra distance beyond node center for label

const NODES = [
  { id: "context",  label: "context",  icon: "◈" },
  { id: "token",    label: "token",    icon: "⟨⟩" },
  { id: "memory",   label: "memory",   icon: "◉" },
  { id: "skill",    label: "skill",    icon: "/" },
  { id: "hook",     label: "hook",     icon: "⌁" },
  { id: "subagent", label: "subagent", icon: "◳" },
  { id: "command",  label: "command",  icon: ">" },
  { id: "plugin",   label: "plugin",   icon: "⊞" },
  { id: "mcp",      label: "MCP",      icon: "⟡" },
];

const N = NODES.length;

function getAngle(i: number) {
  // Start from top (-90°), distribute evenly
  return -Math.PI / 2 + (i * 2 * Math.PI) / N;
}

function nodePos(i: number) {
  const a = getAngle(i);
  return { x: CX + RADIUS * Math.cos(a), y: CY + RADIUS * Math.sin(a), a };
}

/** Compute label position and text-anchor based on which quadrant the node is in */
function labelPos(i: number) {
  const { x, y, a } = nodePos(i);
  const cos = Math.cos(a);
  const sin = Math.sin(a);

  // Place label further along the same radial direction
  const lx = x + cos * LABEL_OFFSET;
  const ly = y + sin * LABEL_OFFSET;

  // Text anchor: left side → "end", right side → "start", top/bottom → "middle"
  let anchor: string;
  if (cos > 0.35) anchor = "start";
  else if (cos < -0.35) anchor = "end";
  else anchor = "middle";

  // Vertical offset: if label is below node center, shift down a bit more
  const dy = sin > 0.35 ? 28 : sin < -0.35 ? -8 : 5;

  return { lx, ly: ly + dy, anchor };
}

export function Slide08Radial({ active }: { active: boolean }) {
  const root = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!active || !root.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context((self) => {
      const q = (s: string) => self.selector!(s) as Element[];

      const centerCircle  = q(".s08-center")[0] as SVGElement;
      const centerTexts   = q(".s08-center-text") as SVGElement[];
      const spokes        = q(".s08-spoke") as SVGLineElement[];
      const nodeCircles   = q(".s08-node-circle") as SVGElement[];
      const nodeIcons     = q(".s08-node-icon") as SVGElement[];
      const nodeLabels    = q(".s08-node-label") as SVGElement[];
      const pulseRing     = q(".s08-pulse")[0] as SVGCircleElement;
      const travelGlow    = q(".s08-travel-glow")[0] as SVGCircleElement;
      const outerRing     = q(".s08-outer-ring")[0] as SVGCircleElement;
      const centerGlowBg  = q(".s08-center-glow-bg")[0] as SVGElement;

      // ---- Reduced-motion: show everything immediately ----
      if (reduced) {
        gsap.set([centerCircle, centerGlowBg, ...centerTexts], { opacity: 1, scale: 1 });
        gsap.set(outerRing, { opacity: 0.25 });
        spokes.forEach((sp) => gsap.set(sp, { strokeDashoffset: 0, opacity: 1 }));
        gsap.set([...nodeCircles, ...nodeIcons, ...nodeLabels], { opacity: 1, scale: 1 });
        gsap.set(pulseRing, { opacity: 0 });
        gsap.set(travelGlow, { opacity: 0 });
        return;
      }

      // ---- Initial state ----
      gsap.set([centerCircle, centerGlowBg], {
        opacity: 0,
        scale: 0,
        transformOrigin: `${CX}px ${CY}px`,
      });
      gsap.set(centerTexts, { opacity: 0, transformOrigin: `${CX}px ${CY}px` });
      gsap.set(outerRing, { opacity: 0 });
      gsap.set([...nodeCircles, ...nodeIcons], { opacity: 0, scale: 0.3, transformOrigin: "50% 50%" });
      gsap.set(nodeLabels, { opacity: 0, y: 8 });
      gsap.set(travelGlow, { opacity: 0, attr: { cx: CX, cy: CY - RADIUS } });
      gsap.set(pulseRing, { opacity: 0, attr: { r: CENTER_R } });

      // Set up spoke dash arrays for draw-on
      spokes.forEach((sp) => {
        const x1 = parseFloat(sp.getAttribute("x1")!);
        const y1 = parseFloat(sp.getAttribute("y1")!);
        const x2 = parseFloat(sp.getAttribute("x2")!);
        const y2 = parseFloat(sp.getAttribute("y2")!);
        const len = Math.hypot(x2 - x1, y2 - y1);
        gsap.set(sp, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 });
      });

      // ---- Intro timeline ----
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

      // 1. Center glow background bloom
      intro.to(centerGlowBg, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.5)" }, 0);
      // 2. Center circle pops
      intro.to(centerCircle, { opacity: 1, scale: 1, duration: 0.55, ease: "back.out(2.2)" }, 0.08);
      // 3. Center labels fade
      intro.to(centerTexts, { opacity: 1, duration: 0.4, stagger: 0.1 }, 0.4);
      // 4. Outer ring fades
      intro.to(outerRing, { opacity: 0.22, duration: 0.5 }, 0.5);
      // 5. Spokes draw from center outward
      intro.to(spokes, {
        strokeDashoffset: 0,
        duration: 0.5,
        stagger: 0.055,
        ease: "power2.inOut",
      }, 0.55);
      // 6. Node circles pop with back.out
      intro.to(nodeCircles, {
        opacity: 1,
        scale: 1,
        duration: 0.38,
        stagger: 0.07,
        ease: "back.out(2.5)",
      }, 0.85);
      // 7. Icons pop
      intro.to(nodeIcons, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        stagger: 0.065,
        ease: "back.out(2)",
      }, 1.0);
      // 8. Labels slide up + fade
      intro.to(nodeLabels, {
        opacity: 1,
        y: 0,
        duration: 0.38,
        stagger: 0.065,
        ease: "power3.out",
      }, 1.15);

      // ---- Sustain loops ----
      intro.add(() => {
        // Center breathes
        gsap.to(centerCircle, {
          scale: 1.06,
          duration: 2.4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          transformOrigin: `${CX}px ${CY}px`,
        });

        // Center glow bg breathes in sync
        gsap.to(centerGlowBg, {
          scale: 1.12,
          opacity: 0.7,
          duration: 2.4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          transformOrigin: `${CX}px ${CY}px`,
        });

        // Pulse ring expands outward, fading — GSAP repeat:-1, no setTimeout
        gsap.set(pulseRing, { attr: { r: CENTER_R + 10 }, opacity: 0.55, strokeWidth: 2 });
        gsap.to(pulseRing, {
          attr: { r: RADIUS + 50 },
          opacity: 0,
          strokeWidth: 0.5,
          duration: 2.6,
          ease: "power2.out",
          repeat: -1,
          repeatDelay: 0.7,
          onRepeat() {
            gsap.set(pulseRing, { attr: { r: CENTER_R + 10 }, opacity: 0.55, strokeWidth: 2 });
          },
        });

        // Glow orbits the node ring
        const TRAVEL_DUR = 7;
        const orbitObj = { angle: -Math.PI / 2 };
        gsap.to(orbitObj, {
          angle: -Math.PI / 2 + 2 * Math.PI,
          duration: TRAVEL_DUR,
          ease: "none",
          repeat: -1,
          onStart() {
            gsap.set(travelGlow, { opacity: 1 });
          },
          onUpdate() {
            const tx = CX + RADIUS * Math.cos(orbitObj.angle);
            const ty = CY + RADIUS * Math.sin(orbitObj.angle);
            gsap.set(travelGlow, { attr: { cx: tx, cy: ty } });
          },
        });

        // Node circles subtle staggered pulse
        gsap.to(nodeCircles, {
          scale: 1.08,
          duration: 2.8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: { each: 0.32, from: "start" },
          transformOrigin: "50% 50%",
        });
      });
    }, root);

    return () => ctx.revert();
  }, [active]);

  return (
    <svg
      ref={root}
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={SVG_W}
      height={SVG_H}
      aria-hidden
      style={{ display: "block", margin: "0 auto", overflow: "visible" }}
    >
      <defs>
        {/* Center node gradient — deep blue */}
        <radialGradient id="s08-center-grad" cx="38%" cy="32%" r="65%">
          <stop offset="0" stopColor="#3a9bff" />
          <stop offset="0.55" stopColor="#0071e3" />
          <stop offset="1" stopColor="#003d8f" />
        </radialGradient>

        {/* Center glow bloom */}
        <radialGradient id="s08-center-bloom" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#0071e3" stopOpacity={0.22} />
          <stop offset="1" stopColor="#0071e3" stopOpacity={0} />
        </radialGradient>

        {/* Node fill — soft blue-tinted white */}
        <radialGradient id="s08-node-grad" cx="40%" cy="32%" r="65%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#deeaff" />
        </radialGradient>

        {/* Traveling glow */}
        <radialGradient id="s08-travel-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#0071e3" stopOpacity={1} />
          <stop offset="0.45" stopColor="#0071e3" stopOpacity={0.35} />
          <stop offset="1" stopColor="#0071e3" stopOpacity={0} />
        </radialGradient>

        {/* Rail gradient for spoke highlight */}
        <linearGradient id="s08-spoke-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0" stopColor="#0071e3" stopOpacity={0.5} />
          <stop offset="1" stopColor="#0071e3" stopOpacity={0.12} />
        </linearGradient>

        {/* Center glow filter */}
        <filter id="s08-center-filter" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Node glow filter */}
        <filter id="s08-node-filter" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Travel glow filter */}
        <filter id="s08-travel-filter" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>

      {/* ── Outer guide ring ── */}
      <circle
        className="s08-outer-ring"
        cx={CX}
        cy={CY}
        r={RADIUS}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={1}
        strokeDasharray="5 10"
        opacity={0}
      />

      {/* ── Spokes ── */}
      {NODES.map((nd, i) => {
        const { x, y, a } = nodePos(i);
        const startX = CX + (CENTER_R + 6) * Math.cos(a);
        const startY = CY + (CENTER_R + 6) * Math.sin(a);
        const endX = x - (NODE_R + 4) * Math.cos(a);
        const endY = y - (NODE_R + 4) * Math.sin(a);
        return (
          <line
            key={nd.id}
            className="s08-spoke"
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            stroke="var(--line)"
            strokeWidth={2}
            strokeLinecap="round"
          />
        );
      })}

      {/* ── Pulse ring ── */}
      <circle
        className="s08-pulse"
        cx={CX}
        cy={CY}
        r={CENTER_R}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={2}
        opacity={0}
      />

      {/* ── Traveling glow (blurred dot that orbits) ── */}
      <circle
        className="s08-travel-glow"
        cx={CX}
        cy={CY - RADIUS}
        r={38}
        fill="url(#s08-travel-grad)"
        filter="url(#s08-travel-filter)"
        opacity={0}
      />

      {/* ── Node groups: circle + icon + label ── */}
      {NODES.map((nd, i) => {
        const { x, y } = nodePos(i);
        const { lx, ly, anchor } = labelPos(i);

        return (
          <g key={nd.id} className="s08-node-g">
            {/* Node circle */}
            <circle
              className="s08-node-circle"
              cx={x}
              cy={y}
              r={NODE_R}
              fill="url(#s08-node-grad)"
              stroke="rgba(0,113,227,.28)"
              strokeWidth={1.5}
              filter="url(#s08-node-filter)"
            />
            {/* Icon inside circle */}
            <text
              className="s08-node-icon"
              x={x}
              y={y + 5}
              textAnchor="middle"
              fontFamily="var(--font-display,'Inter'),sans-serif"
              fontWeight={600}
              fontSize={20}
              fill="var(--accent)"
              style={{ userSelect: "none" }}
            >
              {nd.icon}
            </text>
            {/* Label OUTSIDE the circle */}
            <text
              className="s08-node-label"
              x={lx}
              y={ly}
              textAnchor={anchor as "start" | "middle" | "end"}
              fontFamily="var(--font-display,'Inter'),sans-serif"
              fontWeight={700}
              fontSize={24}
              fill="var(--ink)"
              letterSpacing="-0.01em"
              style={{ userSelect: "none" }}
            >
              {nd.label}
            </text>
          </g>
        );
      })}

      {/* ── Center glow bloom (behind circle) ── */}
      <circle
        className="s08-center-glow-bg"
        cx={CX}
        cy={CY}
        r={CENTER_R + 48}
        fill="url(#s08-center-bloom)"
        opacity={0}
      />

      {/* ── Center node ── */}
      <circle
        className="s08-center"
        cx={CX}
        cy={CY}
        r={CENTER_R}
        fill="url(#s08-center-grad)"
        filter="url(#s08-center-filter)"
        opacity={0}
      />
      {/* Center label: "Agent" */}
      <text
        className="s08-center-text"
        x={CX}
        y={CY - 8}
        textAnchor="middle"
        fontFamily="var(--font-display,'Inter'),sans-serif"
        fontWeight={900}
        fontSize={30}
        fill="white"
        letterSpacing="-0.02em"
        style={{ userSelect: "none" }}
      >
        Agent
      </text>
      {/* Center sub-label: "harness" */}
      <text
        className="s08-center-text"
        x={CX}
        y={CY + 20}
        textAnchor="middle"
        fontFamily="var(--font-body,'Be Vietnam Pro'),sans-serif"
        fontWeight={500}
        fontSize={18}
        fill="rgba(255,255,255,.72)"
        style={{ userSelect: "none" }}
      >
        harness
      </text>
    </svg>
  );
}
