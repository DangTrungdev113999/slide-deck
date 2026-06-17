import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Slide08Radial — hero radial diagram: "Agent" center node, 9 spokes to labels.
 * Intro: center pops, connectors draw center-out, nodes pop stagger (back.out).
 * Loop: pulse ring expands from center (repeat:-1), glow travels around the ring.
 */

const CX = 700;
const CY = 340;
const RADIUS = 280;
const CENTER_R = 72;

const NODES = [
  { id: "context", label: "context" },
  { id: "token", label: "token" },
  { id: "memory", label: "memory" },
  { id: "skill", label: "skill" },
  { id: "hook", label: "hook" },
  { id: "subagent", label: "subagent" },
  { id: "command", label: "command" },
  { id: "plugin", label: "plugin" },
  { id: "mcp", label: "MCP" },
];

const N = NODES.length;

function getAngle(i: number) {
  // distribute evenly, start from top (−90°)
  return (-Math.PI / 2) + (i * 2 * Math.PI) / N;
}

function nodePos(i: number) {
  const a = getAngle(i);
  return { x: CX + RADIUS * Math.cos(a), y: CY + RADIUS * Math.sin(a) };
}

export function Slide08Radial({ active }: { active: boolean }) {
  const root = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!active || !root.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context((self) => {
      const q = (s: string) => self.selector!(s);

      const centerEl = q(".s08-center")[0] as SVGElement;
      const centerLabel = q(".s08-center-label")[0] as SVGElement;
      const spokes = q(".s08-spoke") as SVGElement[];
      const nodeCircles = q(".s08-node-circle") as SVGElement[];
      const nodeLabels = q(".s08-node-label") as SVGElement[];
      const pulseRing = q(".s08-pulse")[0] as SVGCircleElement;
      const travelGlow = q(".s08-travel-glow")[0] as SVGCircleElement;
      const outerRing = q(".s08-outer-ring")[0] as SVGCircleElement;

      if (reduced) {
        gsap.set([centerEl, centerLabel], { opacity: 1, scale: 1 });
        gsap.set(spokes, { opacity: 1 });
        gsap.set([...nodeCircles, ...nodeLabels], { opacity: 1, scale: 1 });
        gsap.set(pulseRing, { opacity: 0 });
        gsap.set(outerRing, { opacity: 0.2 });
        return;
      }

      // init
      gsap.set([centerEl, centerLabel], { opacity: 0, scale: 0, transformOrigin: `${CX}px ${CY}px` });
      gsap.set(spokes, { opacity: 0 });
      gsap.set([...nodeCircles, ...nodeLabels], { opacity: 0, scale: 0.4 });
      gsap.set(pulseRing, { opacity: 0, r: CENTER_R });
      gsap.set(outerRing, { opacity: 0 });
      gsap.set(travelGlow, { opacity: 0 });

      // set spoke lengths to 0
      spokes.forEach((sp) => {
        const line = sp as unknown as SVGLineElement;
        const len = Math.sqrt(
          Math.pow(parseFloat(line.getAttribute("x2")!) - parseFloat(line.getAttribute("x1")!), 2) +
          Math.pow(parseFloat(line.getAttribute("y2")!) - parseFloat(line.getAttribute("y1")!), 2)
        );
        gsap.set(sp, { strokeDasharray: len, strokeDashoffset: len });
      });

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
        // center pops in
        .to(centerEl, { opacity: 1, scale: 1, duration: 0.55, ease: "back.out(2)" }, 0)
        .to(centerLabel, { opacity: 1, scale: 1, duration: 0.4 }, 0.3)
        // spokes draw from center outward
        .to(spokes, { opacity: 1, strokeDashoffset: 0, duration: 0.55, stagger: 0.06, ease: "power2.inOut" }, 0.5)
        // outer ring fades in
        .to(outerRing, { opacity: 0.18, duration: 0.4 }, 0.8)
        // node circles pop (back.out stagger)
        .to(nodeCircles, { opacity: 1, scale: 1, duration: 0.4, stagger: 0.07, ease: "back.out(2.2)", transformOrigin: "50% 50%" }, 0.9)
        .to(nodeLabels, { opacity: 1, scale: 1, duration: 0.35, stagger: 0.07, ease: "power3.out", transformOrigin: "50% 50%" }, 1.1);

      // sustain loops
      intro.add(() => {
        // pulse ring expands from center, repeating
        gsap.to(pulseRing, {
          r: RADIUS + 40,
          opacity: 0,
          duration: 2.2,
          ease: "power2.out",
          repeat: -1,
          repeatDelay: 0.6,
          onRepeat() {
            gsap.set(pulseRing, { r: CENTER_R, opacity: 0.5 });
          },
          onStart() {
            gsap.set(pulseRing, { r: CENTER_R, opacity: 0.5 });
          },
        });

        // glow travels around the ring of nodes (visits each in turn)
        gsap.set(travelGlow, { opacity: 1 });
        const TRAVEL_DUR = 6; // seconds for one full orbit
        gsap.to(travelGlow, {
          duration: TRAVEL_DUR,
          repeat: -1,
          ease: "none",
          motionPath: undefined, // fallback: use manual keyframing
        });

        // Manual orbit: tween angle 0 → 2π, update x/y every frame
        const orbitObj = { angle: -Math.PI / 2 };
        gsap.to(orbitObj, {
          angle: -Math.PI / 2 + 2 * Math.PI,
          duration: TRAVEL_DUR,
          ease: "none",
          repeat: -1,
          onUpdate() {
            const x = CX + RADIUS * Math.cos(orbitObj.angle);
            const y = CY + RADIUS * Math.sin(orbitObj.angle);
            gsap.set(travelGlow, { x: x - CX, y: y - CY });
          },
        });

        // center breathe
        gsap.to(centerEl, {
          scale: 1.05,
          duration: 2.2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          transformOrigin: `${CX}px ${CY}px`,
        });

        // node circles subtle pulse
        gsap.to(nodeCircles, {
          scale: 1.06,
          duration: 2.6,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: { each: 0.3, from: "start" },
          transformOrigin: "50% 50%",
        });
      });
    }, root);

    return () => ctx.revert();
  }, [active]);

  const SVG_W = 1400;
  const SVG_H = 680;

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
        <radialGradient id="s08-center-grad" cx="40%" cy="35%">
          <stop offset="0" stopColor="#2a90ff" />
          <stop offset="1" stopColor="#0058b0" />
        </radialGradient>
        <radialGradient id="s08-node-grad" cx="40%" cy="35%">
          <stop offset="0" stopColor="#f0f6ff" />
          <stop offset="1" stopColor="#deeaff" />
        </radialGradient>
        <radialGradient id="s08-travel-grad">
          <stop offset="0" stopColor="#0071e3" stopOpacity={0.9} />
          <stop offset="0.5" stopColor="#0071e3" stopOpacity={0.3} />
          <stop offset="1" stopColor="#0071e3" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="s08-pulse-grad">
          <stop offset="0.7" stopColor="#0071e3" stopOpacity={0} />
          <stop offset="1" stopColor="#0071e3" stopOpacity={0.4} />
        </radialGradient>
        <filter id="s08-center-glow">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="s08-node-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* outer guide ring (faint) */}
      <circle
        className="s08-outer-ring"
        cx={CX}
        cy={CY}
        r={RADIUS}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={1}
        strokeDasharray="4 8"
        opacity={0}
      />

      {/* spokes */}
      {NODES.map((nd, i) => {
        const pos = nodePos(i);
        const startX = CX + (CENTER_R + 4) * Math.cos(getAngle(i));
        const startY = CY + (CENTER_R + 4) * Math.sin(getAngle(i));
        const endX = pos.x - 32 * Math.cos(getAngle(i));
        const endY = pos.y - 32 * Math.sin(getAngle(i));
        return (
          <line
            key={nd.id}
            className="s08-spoke"
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            stroke="var(--line)"
            strokeWidth={1.5}
          />
        );
      })}

      {/* pulse ring */}
      <circle
        className="s08-pulse"
        cx={CX}
        cy={CY}
        r={CENTER_R}
        fill="none"
        stroke="url(#s08-pulse-grad)"
        strokeWidth={2}
        opacity={0}
      />

      {/* traveling glow (orbits nodes) */}
      <circle
        className="s08-travel-glow"
        cx={CX}
        cy={CY}
        r={28}
        fill="url(#s08-travel-grad)"
        opacity={0}
      />

      {/* node circles + labels */}
      {NODES.map((nd, i) => {
        const pos = nodePos(i);
        return (
          <g key={nd.id}>
            <circle
              className="s08-node-circle"
              cx={pos.x}
              cy={pos.y}
              r={36}
              fill="url(#s08-node-grad)"
              stroke="rgba(0,113,227,.3)"
              strokeWidth={1.5}
              filter="url(#s08-node-glow)"
            />
            <text
              className="s08-node-label"
              x={pos.x}
              y={pos.y + 6}
              textAnchor="middle"
              fontFamily="var(--font-display,'Inter'),sans-serif"
              fontWeight={700}
              fontSize={18}
              fill="var(--accent)"
            >
              {nd.label}
            </text>
          </g>
        );
      })}

      {/* center node */}
      <circle
        className="s08-center"
        cx={CX}
        cy={CY}
        r={CENTER_R}
        fill="url(#s08-center-grad)"
        filter="url(#s08-center-glow)"
        style={{ boxShadow: "var(--glow-accent)" }}
      />
      <text
        className="s08-center-label"
        x={CX}
        y={CY - 10}
        textAnchor="middle"
        fontFamily="var(--font-display,'Inter'),sans-serif"
        fontWeight={900}
        fontSize={24}
        fill="white"
      >
        Agent
      </text>
      <text
        className="s08-center-label"
        x={CX}
        y={CY + 16}
        textAnchor="middle"
        fontFamily="var(--font-body,'Be Vietnam Pro'),sans-serif"
        fontWeight={600}
        fontSize={15}
        fill="rgba(255,255,255,.75)"
      >
        harness
      </text>
    </svg>
  );
}
