import { useEffect, useRef } from "react";
import gsap from "gsap";

interface PipelineFlowProps {
  active: boolean;
}

const NODES = [
  {
    id: "select",
    num: "①",
    title: "select-component",
    sub: "Quét design, chọn com base",
    icon: "🔍",
  },
  {
    id: "mapping",
    num: "②",
    title: "mapping-combase",
    sub: "Mọi component + ghi chú",
    icon: "🗺",
  },
  {
    id: "build",
    num: "③",
    title: "build-com",
    sub: "Thiếu thì build, convention sẵn",
    icon: "🔨",
  },
  {
    id: "gate",
    num: "④",
    title: "gate review",
    sub: "Xác nhận trước khi build UI",
    icon: "✅",
  },
];

// Layout constants (viewBox 0 0 1500 380)
const VB_W = 1500;
const VB_H = 380;
const NODE_W = 240;
const NODE_H = 160;
const NODE_Y = (VB_H - NODE_H) / 2; // ~110
const CHIP_H = 40;
const CHIP_Y = VB_H / 2 - CHIP_H / 2;

// Positions: left chip | node0 | conn | node1 | conn | node2 | conn | node3 | right chip
// Total inner = 4*240 + 3*connW + 2*chipW + gaps
// Let's place: chipL x=30, nodes start at 170, spacing 310
const CHIP_L_X = 24;
const CHIP_L_W = 110;
const NODE_STARTS = [170, 490, 810, 1130];
const CHIP_R_X = NODE_STARTS[3] + NODE_W + 16;
const CHIP_R_W = 148;

export function PipelineFlow({ active }: PipelineFlowProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // Collect elements
    const nodeCards = svg.querySelectorAll<SVGElement>(".node-card");
    const connLines = svg.querySelectorAll<SVGLineElement>(".conn-line");
    const arrows = svg.querySelectorAll<SVGElement>(".conn-arrow");
    const chipL = svg.querySelector<SVGElement>(".chip-left");
    const chipR = svg.querySelector<SVGElement>(".chip-right");

    tlRef.current?.kill();

    if (!active) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      // Everything instantly visible
      gsap.set([...nodeCards, ...connLines, ...arrows, chipL, chipR].filter(Boolean), {
        opacity: 1,
      });
      // Reset dash offsets to 0
      connLines.forEach((line) => {
        const len = (line as SVGGeometryElement).getTotalLength?.() ?? 300;
        gsap.set(line, { strokeDashoffset: 0, strokeDasharray: len });
      });
      return;
    }

    // Set initial states
    gsap.set([...nodeCards, chipL, chipR].filter(Boolean), { opacity: 0, y: 18, scale: 0.95, transformOrigin: "center center" });
    gsap.set([...arrows].filter(Boolean), { opacity: 0 });

    // Prepare connector lines
    const connLengths: number[] = [];
    connLines.forEach((line) => {
      const len = (line as SVGGeometryElement).getTotalLength?.() ?? 300;
      connLengths.push(len);
      gsap.set(line, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 });
    });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // 1. Left chip enters
    tl.to(chipL, { opacity: 1, y: 0, scale: 1, duration: 0.4 }, 0);

    // 2. Stagger node cards
    tl.to(nodeCards, { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.12 }, 0.1);

    // 3. Draw each connector line sequentially, then pop arrowhead
    connLines.forEach((line, i) => {
      const offset = 0.55 + i * 0.38;
      tl.to(line, { strokeDashoffset: 0, duration: 0.55, ease: "power2.inOut" }, offset);
      tl.to(arrows[i], { opacity: 1, duration: 0.18, ease: "power2.out" }, offset + 0.52);
    });

    // 4. Right chip enters after last connector
    tl.to(chipR, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.7)" }, 1.7);

    tlRef.current = tl;

    return () => {
      tl.kill();
    };
  }, [active]);

  // Connector line positions
  const connectors = NODE_STARTS.slice(0, 3).map((x, i) => ({
    x1: x + NODE_W + 8,
    y1: VB_H / 2,
    x2: NODE_STARTS[i + 1] - 8,
    y2: VB_H / 2,
  }));

  const arrowSize = 10;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width="100%"
      style={{ overflow: "visible", display: "block" }}
      aria-label="Design-to-UI pipeline flow"
    >
      <defs>
        {/* Glass card filter */}
        <filter id="card-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#1d1d1f" floodOpacity="0.08" />
        </filter>
      </defs>

      {/* Left chip: Figma URL → */}
      <g className="chip-left" style={{ opacity: 0 }}>
        <rect
          x={CHIP_L_X}
          y={CHIP_Y}
          width={CHIP_L_W}
          height={CHIP_H}
          rx={CHIP_H / 2}
          fill="var(--surface)"
          stroke="var(--line)"
          strokeWidth={1.5}
        />
        <text
          x={CHIP_L_X + CHIP_L_W / 2}
          y={CHIP_Y + CHIP_H / 2 + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={14}
          fontFamily="var(--font-body, 'Be Vietnam Pro'), sans-serif"
          fontWeight={600}
          fill="var(--ink)"
        >
          Figma URL →
        </text>
      </g>

      {/* Connector lines + arrowheads */}
      {connectors.map((c, i) => (
        <g key={i}>
          <line
            className="conn-line"
            x1={c.x1}
            y1={c.y1}
            x2={c.x2}
            y2={c.y2}
            stroke="var(--accent)"
            strokeWidth={2.5}
            strokeLinecap="round"
            style={{ opacity: 1 }}
          />
          {/* Arrow pointing right */}
          <path
            className="conn-arrow"
            d={`M ${c.x2 - arrowSize} ${c.y2 - arrowSize * 0.6} L ${c.x2 + 2} ${c.y2} L ${c.x2 - arrowSize} ${c.y2 + arrowSize * 0.6}`}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: 0 }}
          />
        </g>
      ))}

      {/* Node cards */}
      {NODES.map((node, i) => {
        const x = NODE_STARTS[i];
        const y = NODE_Y;
        const cx = x + NODE_W / 2;

        return (
          <g key={node.id} className="node-card" style={{ opacity: 0 }}>
            {/* Card background */}
            <rect
              x={x}
              y={y}
              width={NODE_W}
              height={NODE_H}
              rx={16}
              fill="var(--surface)"
              stroke="var(--line)"
              strokeWidth={1.5}
              filter="url(#card-shadow)"
            />

            {/* Number badge */}
            <rect
              x={x + NODE_W / 2 - 20}
              y={y - 14}
              width={40}
              height={28}
              rx={14}
              fill="var(--accent)"
            />
            <text
              x={cx}
              y={y + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={13}
              fontFamily="var(--font-display, 'Inter'), sans-serif"
              fontWeight={700}
              fill="#fff"
            >
              {node.num}
            </text>

            {/* Icon */}
            <text
              x={cx}
              y={y + 48}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={26}
            >
              {node.icon}
            </text>

            {/* Title */}
            <text
              x={cx}
              y={y + 88}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={15}
              fontFamily="var(--font-display, 'Inter'), sans-serif"
              fontWeight={700}
              fill="var(--ink)"
            >
              {node.title}
            </text>

            {/* Sub */}
            <foreignObject x={x + 12} y={y + 108} width={NODE_W - 24} height={44}>
              <div
                style={{
                  fontSize: 12,
                  lineHeight: 1.4,
                  color: "var(--muted)",
                  textAlign: "center",
                  fontFamily: "var(--font-body, 'Be Vietnam Pro'), sans-serif",
                }}
              >
                {node.sub}
              </div>
            </foreignObject>
          </g>
        );
      })}

      {/* Right chip: → UI đúng convention */}
      <g className="chip-right" style={{ opacity: 0 }}>
        <rect
          x={CHIP_R_X}
          y={CHIP_Y}
          width={CHIP_R_W}
          height={CHIP_H}
          rx={CHIP_H / 2}
          fill="var(--accent)"
        />
        <text
          x={CHIP_R_X + CHIP_R_W / 2}
          y={CHIP_Y + CHIP_H / 2 + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={13}
          fontFamily="var(--font-body, 'Be Vietnam Pro'), sans-serif"
          fontWeight={700}
          fill="#fff"
        >
          → UI đúng convention
        </text>
      </g>
    </svg>
  );
}
