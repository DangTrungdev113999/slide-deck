import { useEffect, useLayoutEffect, useRef, useState, CSSProperties } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";

/**
 * WorkflowDiagram — shared engine for the three workflow slides (pipeline,
 * ai-chart demo, gen-video demo). Renders a left→right flow of typed nodes with
 * parallel fan-out groups, gate retry-loops, a legend, hover tooltips, and an
 * auto-cycle spotlight (so the audience sees each node light up + its task
 * without touching anything). Hover pauses the auto-cycle and wins.
 *
 * Node identity is encoded IDENTICALLY across all three diagrams via NODE_STYLE,
 * so "agent vs skill vs gate" always reads the same. StrictMode-safe.
 */

export type NodeType = "agent" | "skill" | "gate" | "manual" | "output";

export interface FlowNode {
  id: string;
  type: NodeType;
  label: string; // short name shown on the node
  task: string; // tooltip + caption text
  badge?: string; // command chip / "×N · song song"
  video?: string; // optional: a small "play" chip above the node → opens a popup
}

export interface FlowStep {
  parallel?: boolean; // render nodes stacked, sharing in/out edges
  tag?: string; // label for the parallel group e.g. "×3 · song song"
  nodes: FlowNode[];
}

const TYPE_META: Record<
  NodeType,
  { label: string; fill: string; border: string; text: string; glyph: string; dashed?: boolean; pill?: boolean; diamond?: boolean }
> = {
  agent: { label: "Subagent", fill: "var(--accent)", border: "var(--accent-700)", text: "#fff", glyph: "◳" },
  skill: { label: "Skill", fill: "#fff", border: "var(--accent)", text: "var(--accent-700)", glyph: "/" },
  gate: { label: "Gate", fill: "#fffaf0", border: "#b8860b", text: "#8a6400", glyph: "✓", diamond: true },
  manual: { label: "Thủ công", fill: "var(--surface)", border: "var(--line)", text: "var(--ink)", glyph: "✋", dashed: true },
  output: { label: "Kết quả", fill: "var(--ink)", border: "var(--ink)", text: "#fff", glyph: "★", pill: true },
};

function nodeStyle(type: NodeType, lit: boolean): CSSProperties {
  const m = TYPE_META[type];
  return {
    position: "relative",
    minWidth: 196,
    maxWidth: 240,
    padding: "20px 22px",
    background: m.fill,
    color: m.text,
    border: `${m.diamond ? 3 : 2}px ${m.dashed ? "dashed" : "solid"} ${m.border}`,
    borderRadius: m.pill ? 999 : m.diamond ? 16 : 18,
    boxShadow: lit
      ? "0 0 0 4px rgba(0,113,227,.18), 0 26px 60px -24px rgba(0,113,227,.5)"
      : "var(--shadow-md)",
    transform: lit ? "translateY(-4px) scale(1.045)" : "translateY(0) scale(1)",
    opacity: lit ? 1 : 0.9,
    transition: "transform .32s cubic-bezier(.2,.7,.2,1), box-shadow .32s, opacity .32s",
    cursor: "default",
  };
}

function Chevron() {
  return (
    <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center", padding: "0 8px", color: "var(--muted)" }}>
      <svg width="40" height="20" viewBox="0 0 40 20" fill="none" aria-hidden>
        <path d="M2 10h32" stroke="var(--line)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M28 4l8 6-8 6" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function WorkflowDiagram({ active, steps }: { active: boolean; steps: FlowStep[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [cycleId, setCycleId] = useState<string | null>(null);
  const [fit, setFit] = useState({ scale: 1, h: 0 });

  // auto-fit: scale the flow row down if it exceeds the 1680px content width
  useLayoutEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const w = el.scrollWidth;
    const h = el.offsetHeight;
    // fill the 1680px content band — scale UP (sparse flows) or DOWN (dense),
    // capped so a 5-node flow doesn't become absurdly large
    const scale = Math.min(1.5, 1680 / w);
    setFit({ scale, h: h * scale });
  }, [steps]);

  const flat = steps.flatMap((s) => s.nodes);
  const flatIds = flat.map((n) => n.id);
  const spotId = hoverId ?? cycleId;
  const spot = flat.find((n) => n.id === spotId) ?? null;

  // intro pop + auto-cycle spotlight
  useEffect(() => {
    if (!active || !ref.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context((self) => {
      const els = self.selector!("[data-node]");
      if (reduced) {
        gsap.set(els, { opacity: 1, y: 0 });
        return;
      }
      gsap.from(els, { opacity: 0, y: 26, scale: 0.92, duration: 0.5, stagger: 0.07, ease: "back.out(1.5)" });
    }, ref);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCycleId(null);
      return () => ctx.revert();
    }

    let killed = false;
    let i = 0;
    let call: gsap.core.Tween | null = null;
    const tick = () => {
      if (killed) return;
      if (hoverRef.current) {
        call = gsap.delayedCall(0.3, tick) as unknown as gsap.core.Tween;
        return;
      }
      setCycleId(flatIds[i % flatIds.length]);
      i += 1;
      call = gsap.delayedCall(1.15, tick) as unknown as gsap.core.Tween;
    };
    call = gsap.delayedCall(0.7, tick) as unknown as gsap.core.Tween;

    return () => {
      killed = true;
      call?.kill();
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const [playing, setPlaying] = useState<string | null>(null);

  const enter = (id: string) => {
    hoverRef.current = id;
    setHoverId(id);
  };
  const leave = () => {
    hoverRef.current = null;
    setHoverId(null);
  };

  const presentTypes = Array.from(new Set(flat.map((n) => n.type)));

  return (
    <div ref={ref} style={{ width: 1680, marginLeft: -0 }}>
      {/* legend */}
      <div style={{ display: "flex", gap: 26, marginBottom: 22, flexWrap: "wrap" }}>
        {presentTypes.map((t) => {
          const m = TYPE_META[t];
          return (
            <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 9, fontFamily: "var(--font-body),sans-serif", fontSize: 19, color: "var(--muted)" }}>
              <span
                style={{
                  width: 22,
                  height: 22,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 800,
                  color: m.text,
                  background: m.fill,
                  border: `2px ${m.dashed ? "dashed" : "solid"} ${m.border}`,
                  borderRadius: m.pill ? 999 : 6,
                }}
              >
                {m.glyph}
              </span>
              {m.label}
            </span>
          );
        })}
      </div>

      {/* flow row (auto-fit scaled) */}
      <div style={{ height: fit.h || undefined, overflow: "visible" }}>
      <div
        ref={rowRef}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 2,
          flexWrap: "nowrap",
          transform: `scale(${fit.scale})`,
          transformOrigin: "left top",
        }}
      >
        {steps.map((step, si) => (
          <div key={si} style={{ display: "flex", alignItems: "center", flex: "0 1 auto", minWidth: 0 }}>
            {step.parallel ? (
              <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 12, padding: "0 4px", transform: "translateY(-26px)" }}>
                {step.tag && (
                  <span
                    style={{
                      position: "absolute",
                      top: -48,
                      left: "50%",
                      transform: "translateX(-50%)",
                      whiteSpace: "nowrap",
                      fontFamily: "var(--font-display),sans-serif",
                      fontWeight: 800,
                      fontSize: 21,
                      letterSpacing: "0.01em",
                      color: "var(--accent-700)",
                      background: "var(--accent-soft)",
                      border: "1.5px solid rgba(0,113,227,.25)",
                      borderRadius: 999,
                      padding: "6px 16px",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    {step.tag}
                  </span>
                )}
                {step.nodes.map((n) => (
                  <NodeCard key={n.id} node={n} lit={spotId === n.id} onEnter={enter} onLeave={leave} onPlay={setPlaying} invScale={1 / fit.scale} compact />
                ))}
              </div>
            ) : (
              <NodeCard node={step.nodes[0]} lit={spotId === step.nodes[0].id} onEnter={enter} onLeave={leave} onPlay={setPlaying} invScale={1 / fit.scale} />
            )}
            {si < steps.length - 1 && <Chevron />}
          </div>
        ))}
      </div>
      </div>

      {/* present-mode caption (always visible, big) */}
      <div style={{ marginTop: 30, minHeight: 84, display: "flex", alignItems: "center", gap: 16 }}>
        {spot ? (
          <>
            <span
              style={{
                flex: "0 0 auto",
                fontFamily: "var(--font-display),sans-serif",
                fontWeight: 800,
                fontSize: 24,
                color: TYPE_META[spot.type].text === "#fff" ? "var(--accent-700)" : TYPE_META[spot.type].border,
                padding: "8px 16px",
                borderRadius: 12,
                background: "var(--surface)",
                border: "1px solid var(--line-soft)",
                whiteSpace: "nowrap",
              }}
            >
              {TYPE_META[spot.type].glyph} {spot.label}
            </span>
            <span style={{ fontFamily: "var(--font-body),sans-serif", fontSize: 22, lineHeight: 1.4, color: "var(--ink-soft)", maxWidth: 1320 }}>
              {spot.task}
            </span>
          </>
        ) : (
          <span style={{ fontFamily: "var(--font-body),sans-serif", fontSize: 22, color: "var(--muted)" }}>
            Hover vào từng bước để xem nhiệm vụ.
          </span>
        )}
      </div>

      {playing && <VideoPopup src={playing} onClose={() => setPlaying(null)} />}
    </div>
  );
}

/** Full-screen video popup, portalled to <body> so it escapes the Stage's scale transform. */
function VideoPopup({ src, onClose }: { src: string; onClose: () => void }) {
  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(12,16,28,.72)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "wfFade .22s ease",
      }}
    >
      <style>{`@keyframes wfFade{from{opacity:0}to{opacity:1}}@keyframes wfRise{from{opacity:0;transform:translateY(16px) scale(.96)}to{opacity:1;transform:none}}`}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          height: "88vh",
          maxWidth: "94vw",
          borderRadius: 22,
          overflow: "hidden",
          boxShadow: "0 40px 120px -30px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.08)",
          background: "#000",
          animation: "wfRise .28s cubic-bezier(.2,.8,.2,1)",
        }}
      >
        <video src={src} controls autoPlay playsInline style={{ display: "block", height: "100%", width: "auto", maxWidth: "94vw" }} />
      </div>
      <button
        onClick={onClose}
        aria-label="Đóng"
        style={{
          position: "fixed",
          top: 28,
          right: 32,
          width: 52,
          height: 52,
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,.25)",
          background: "rgba(255,255,255,.12)",
          color: "#fff",
          fontSize: 26,
          fontWeight: 700,
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
          backdropFilter: "blur(6px)",
        }}
      >
        ✕
      </button>
    </div>,
    document.body
  );
}

function NodeCard({
  node,
  lit,
  onEnter,
  onLeave,
  onPlay,
  invScale = 1,
  compact,
}: {
  node: FlowNode;
  lit: boolean;
  onEnter: (id: string) => void;
  onLeave: () => void;
  onPlay?: (src: string) => void;
  invScale?: number;
  compact?: boolean;
}) {
  const m = TYPE_META[node.type];
  const [show, setShow] = useState(false);
  return (
    <div
      data-node
      style={compact ? { ...nodeStyle(node.type, lit), minWidth: 172, padding: "14px 18px" } : nodeStyle(node.type, lit)}
      onMouseEnter={() => {
        onEnter(node.id);
        setShow(true);
      }}
      onMouseLeave={() => {
        onLeave();
        setShow(false);
      }}
    >
      {/* small video chip — sits above the node, click → popup */}
      {node.video && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlay?.(node.video!);
          }}
          aria-label="Xem video demo"
          style={{
            position: "absolute",
            bottom: "calc(100% + 12px)",
            left: "50%",
            transform: `translateX(-50%) scale(${invScale})`,
            transformOrigin: "bottom center",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 14px 8px 10px",
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            background: "linear-gradient(135deg,var(--accent),var(--accent-700))",
            color: "#fff",
            fontFamily: "var(--font-display),sans-serif",
            fontWeight: 800,
            fontSize: 15,
            whiteSpace: "nowrap",
            boxShadow: "0 10px 26px -8px rgba(0,113,227,.7)",
            zIndex: 12,
            animation: "wfPlayPulse 1.8s ease-in-out infinite",
          }}
        >
          <style>{`@keyframes wfPlayPulse{0%,100%{box-shadow:0 10px 26px -8px rgba(0,113,227,.7)}50%{box-shadow:0 10px 30px -6px rgba(0,113,227,.95)}}`}</style>
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: 999,
              background: "rgba(255,255,255,.22)",
              display: "grid",
              placeItems: "center",
              fontSize: 11,
              paddingLeft: 2,
            }}
          >
            ▶
          </span>
          Xem video
        </button>
      )}
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--font-display),sans-serif", fontWeight: 800, fontSize: compact ? 21 : 23, letterSpacing: "-0.01em" }}>
        <span style={{ opacity: 0.85, fontSize: compact ? 16 : 18 }}>{m.glyph}</span>
        {node.label}
      </span>
      {node.badge && (
        <span
          style={{
            display: "inline-block",
            marginTop: 9,
            fontFamily: "ui-monospace,'SF Mono',Menlo,monospace",
            fontSize: 14,
            padding: "3px 9px",
            borderRadius: 8,
            background: m.text === "#fff" ? "rgba(255,255,255,.16)" : "var(--accent-soft)",
            color: m.text === "#fff" ? "#fff" : "var(--accent-700)",
          }}
        >
          {node.badge}
        </span>
      )}
      {/* hover tooltip bubble */}
      {show && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 12px)",
            left: "50%",
            // counter-scale by 1/diagram-scale so the tooltip is ALWAYS readable
            // regardless of how the flow row was auto-fit scaled
            transform: `translateX(-50%) scale(${invScale})`,
            transformOrigin: "bottom center",
            width: 320,
            padding: "16px 18px",
            background: "#fff",
            border: "1px solid var(--line)",
            borderRadius: 14,
            boxShadow: "var(--shadow-lg)",
            zIndex: 30,
            fontFamily: "var(--font-body),sans-serif",
            fontSize: 22,
            lineHeight: 1.4,
            color: "var(--ink-soft)",
            textAlign: "left",
            pointerEvents: "none",
          }}
        >
          <b style={{ color: "var(--ink)", display: "block", marginBottom: 4 }}>{node.label}</b>
          {node.task}
          <span
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%) rotate(45deg)",
              marginTop: -6,
              width: 12,
              height: 12,
              background: "#fff",
              borderRight: "1px solid var(--line)",
              borderBottom: "1px solid var(--line)",
            }}
          />
        </div>
      )}
    </div>
  );
}

export default WorkflowDiagram;
