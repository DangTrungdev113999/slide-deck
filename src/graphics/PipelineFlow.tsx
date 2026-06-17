import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * PipelineFlow — an animated motion-graphic of the design-to-UI pipeline.
 *
 * It is NOT a static diagram: a gradient rail draws on, then a glowing comet
 * runs left→right along it forever, each node lights up as the comet passes
 * (a cascading hand-off), the output node pulses, and the cards breathe.
 * Built as a hybrid: an SVG rail/comet layer behind crisp HTML cards.
 */

const W = 1600;
const H = 460;
const RAIL_Y = 250;

type Node = { id: string; n: string; icon: string; title: string; sub: string; cx: number };

const IN_X = 96;
const OUT_X = 1504;
const NODES: Node[] = [
  { id: "select", n: "1", icon: "⌖", title: "select-component", sub: "Quét design → chọn com base", cx: 350 },
  { id: "map", n: "2", icon: "▦", title: "mapping-combase", sub: "Mọi component + ghi chú", cx: 640 },
  { id: "build", n: "3", icon: "⚒", title: "build-com", sub: "Thiếu thì build, đúng convention", cx: 930 },
  { id: "gate", n: "4", icon: "✓", title: "gate review", sub: "Xác nhận trước khi build UI", cx: 1220 },
];

const CARD_W = 244;
const CARD_H = 196;
const LOOP = 3.4; // seconds for one comet pass

export function PipelineFlow({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !root.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context((self) => {
      const q = (s: string) => self.selector!(s);
      const rail = q(".rail-fg")[0] as SVGPathElement;
      const cards = q(".pf-card");
      const inChip = q(".pf-in");
      const outChip = q(".pf-out");
      const comet = q(".pf-comet");
      const glows = q(".pf-glow"); // per-node glow ring (one per node, in DOM order)

      if (reduced) {
        gsap.set([...cards, ...inChip, ...outChip], { opacity: 1, y: 0, scale: 1 });
        gsap.set(rail, { strokeDashoffset: 0 });
        gsap.set(comet, { opacity: 1 });
        return;
      }

      const railLen = rail.getTotalLength();
      gsap.set(rail, { strokeDasharray: railLen, strokeDashoffset: railLen });
      gsap.set([...cards, ...inChip, ...outChip], { opacity: 0, y: 26, scale: 0.94, transformOrigin: "50% 50%" });
      gsap.set(comet, { opacity: 0 });
      gsap.set(glows, { opacity: 0, scale: 0.6, transformOrigin: "50% 50%" });

      // ---- intro (one-shot) ----
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
        .to(inChip, { opacity: 1, y: 0, scale: 1, duration: 0.45 }, 0)
        .to(cards, { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.12 }, 0.15)
        .to(rail, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" }, 0.3)
        .to(outChip, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.7)" }, 1.0);

      // ---- sustain loops (start after intro) ----
      intro.add(() => {
        // comet runs the rail forever
        gsap.set(comet, { opacity: 1 });
        gsap.fromTo(
          comet,
          { x: IN_X, y: RAIL_Y },
          { x: OUT_X, duration: LOOP, ease: "none", repeat: -1 }
        );

        // node glow cascades — each fires as the comet reaches that node
        glows.forEach((g, i) => {
          const frac = (NODES[i].cx - IN_X) / (OUT_X - IN_X);
          gsap.to(g, {
            keyframes: [
              { opacity: 0, scale: 0.6, duration: 0 },
              { opacity: 0.9, scale: 1, duration: 0.28, ease: "power2.out" },
              { opacity: 0, scale: 1.18, duration: 0.7, ease: "power2.in" },
            ],
            repeat: -1,
            repeatDelay: LOOP - 0.98,
            delay: frac * LOOP,
          });
        });

        // cards breathe
        gsap.to(cards, {
          y: "-=5",
          duration: 2.6,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: { each: 0.18, from: "start" },
        });

        // output node pulse
        gsap.to(outChip, {
          boxShadow: "0 0 0 1px rgba(0,113,227,.35), 0 26px 70px -22px rgba(0,113,227,.75)",
          scale: 1.04,
          duration: 1.3,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      });
    }, root);

    return () => ctx.revert();
  }, [active]);

  return (
    <div ref={root} style={{ position: "relative", width: W, height: H, margin: "0 auto" }}>
      {/* ---- SVG rail + comet ---- */}
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }} aria-hidden>
        <defs>
          <linearGradient id="rail-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#9cc6f5" />
            <stop offset="0.5" stopColor="#0071e3" />
            <stop offset="1" stopColor="#0058b0" />
          </linearGradient>
          <radialGradient id="comet-grad">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.35" stopColor="#3a9bff" />
            <stop offset="1" stopColor="rgba(0,113,227,0)" />
          </radialGradient>
          <filter id="comet-blur" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* rail track (faint) */}
        <line x1={IN_X} y1={RAIL_Y} x2={OUT_X} y2={RAIL_Y} stroke="var(--line)" strokeWidth={3} strokeLinecap="round" />
        {/* rail foreground (draws on, gradient) */}
        <path className="rail-fg" d={`M ${IN_X} ${RAIL_Y} L ${OUT_X} ${RAIL_Y}`} fill="none" stroke="url(#rail-grad)" strokeWidth={4} strokeLinecap="round" />

        {/* node glow rings (one per node) */}
        {NODES.map((nd) => (
          <circle key={nd.id} className="pf-glow" cx={nd.cx} cy={RAIL_Y} r={70} fill="rgba(0,113,227,.16)" stroke="rgba(0,113,227,.4)" strokeWidth={1.5} />
        ))}

        {/* the comet (group translated by GSAP x/y) */}
        <g className="pf-comet">
          <circle r={26} fill="url(#comet-grad)" filter="url(#comet-blur)" />
          <circle r={7} fill="#fff" />
          <circle r={7} fill="none" stroke="#0071e3" strokeWidth={2} opacity={0.6} />
        </g>
      </svg>

      {/* ---- input chip ---- */}
      <Chip className="pf-in" cx={IN_X} y={RAIL_Y} label="URL Figma" sub="dán vào" />

      {/* ---- node cards ---- */}
      {NODES.map((nd) => (
        <div
          key={nd.id}
          className="pf-card"
          style={{
            position: "absolute",
            left: nd.cx - CARD_W / 2,
            top: RAIL_Y - CARD_H / 2,
            width: CARD_W,
            height: CARD_H,
            background: "linear-gradient(180deg, #ffffff 0%, #f7f8fb 100%)",
            border: "1px solid var(--line)",
            borderRadius: 22,
            boxShadow: "var(--shadow-md)",
            padding: "26px 20px 20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: -16,
              left: 22,
              width: 36,
              height: 36,
              borderRadius: 12,
              background: "var(--accent)",
              color: "#fff",
              fontFamily: "var(--font-display,'Inter'),sans-serif",
              fontWeight: 800,
              fontSize: 18,
              display: "grid",
              placeItems: "center",
              boxShadow: "0 8px 18px -6px rgba(0,113,227,.6)",
            }}
          >
            {nd.n}
          </span>
          <span style={{ fontSize: 34, lineHeight: 1, color: "var(--accent)", marginBottom: 14 }}>{nd.icon}</span>
          <span
            style={{
              fontFamily: "var(--font-display,'Inter'),sans-serif",
              fontWeight: 800,
              fontSize: 23,
              color: "var(--ink)",
              letterSpacing: "-0.01em",
              marginBottom: 8,
            }}
          >
            {nd.title}
          </span>
          <span style={{ fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif", fontSize: 16, lineHeight: 1.35, color: "var(--muted)" }}>{nd.sub}</span>
        </div>
      ))}

      {/* ---- output chip (accent, pulses) ---- */}
      <div
        className="pf-out"
        style={{
          position: "absolute",
          left: OUT_X - 116,
          top: RAIL_Y - 50,
          width: 232,
          height: 100,
          background: "linear-gradient(180deg, #0a84ff 0%, #0058b0 100%)",
          borderRadius: 22,
          boxShadow: "var(--glow-accent)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
        }}
      >
        <span style={{ fontFamily: "var(--font-display,'Inter'),sans-serif", fontWeight: 800, fontSize: 24, letterSpacing: "-0.01em" }}>UI chuẩn ✦</span>
        <span style={{ fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif", fontSize: 15, opacity: 0.92 }}>đúng convention + design system</span>
      </div>
    </div>
  );
}

function Chip({ className, cx, y, label, sub }: { className: string; cx: number; y: number; label: string; sub: string }) {
  return (
    <div
      className={className}
      style={{
        position: "absolute",
        left: cx - 78,
        top: y - 44,
        width: 156,
        height: 88,
        background: "#fff",
        border: "1.5px solid var(--line)",
        borderRadius: 20,
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span style={{ fontFamily: "var(--font-display,'Inter'),sans-serif", fontWeight: 800, fontSize: 19, color: "var(--ink)" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif", fontSize: 14, color: "var(--muted)" }}>{sub}</span>
    </div>
  );
}
