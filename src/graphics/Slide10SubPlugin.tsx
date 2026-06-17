import { useEffect, useRef } from "react";
import gsap from "gsap";

const W = 1560;
const H = 380;
const LEFT_W = 720;
const RIGHT_W = 720;
const RIGHT_OFFSET = 840;

// Subagent side
const MAIN_NODE_X = 90;
const MAIN_NODE_Y = 60;
const MERGE_X = 90;
const MERGE_Y = 310;
const LANES = [
  { x: 260, label: "agent A", color: "#0071e3" },
  { x: 390, label: "agent B", color: "#34a853" },
  { x: 520, label: "agent C", color: "#f5a623" },
];

// Plugin side pieces
const PIECES = [
  { id: "skill",    label: "skill",    icon: "▶", fromX: 0,   fromY: 0,   toX: 295, toY: 155, color: "#0071e3" },
  { id: "hook",     label: "hook",     icon: "⚡", fromX: 580, fromY: 0,   toX: 375, toY: 155, color: "#ff3b30" },
  { id: "mcp",      label: "MCP",      icon: "⚙", fromX: 0,   fromY: 310, toX: 295, toY: 235, color: "#34a853" },
  { id: "subagent", label: "subagent", icon: "⬡", fromX: 580, fromY: 310, toX: 375, toY: 235, color: "#9b59b6" },
];

export function Slide10SubPlugin({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !root.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context((self) => {
      const q = (s: string) => self.selector!(s);

      // Subagent side
      const mainNode = q(".sa-main")[0] as HTMLElement;
      const mergeNode = q(".sa-merge")[0] as HTMLElement;
      const bars = q(".sa-bar");
      const barFills = q(".sa-bar-fill");
      const forkLines = q(".sa-fork-line");
      const mergeLines = q(".sa-merge-line");

      // Plugin side
      const pieces = q(".pl-piece");
      const plugBox = q(".pl-box")[0] as HTMLElement;
      const plugLabel = q(".pl-box-label")[0] as HTMLElement;

      if (reduced) {
        gsap.set([mainNode, mergeNode, ...bars, ...forkLines, ...mergeLines], { opacity: 1 });
        gsap.set(barFills, { scaleX: 1, transformOrigin: "left center" });
        gsap.set(pieces, { opacity: 1, x: 0, y: 0 });
        gsap.set([plugBox, plugLabel], { opacity: 1, scale: 1 });
        return;
      }

      // Init
      gsap.set([mainNode, mergeNode, ...bars, ...forkLines, ...mergeLines], { opacity: 0 });
      gsap.set(barFills, { scaleX: 0, transformOrigin: "left center" });
      gsap.set(pieces, { opacity: 0 });
      gsap.set([plugBox, plugLabel], { opacity: 0, scale: 0.6, transformOrigin: "50% 50%" });

      // --- Subagent loop ---
      function runSubagentLoop() {
        const tl = gsap.timeline({ onComplete: runSubagentLoop });
        tl
          // main node appears
          .to(mainNode, { opacity: 1, duration: 0.35, ease: "back.out(1.7)" }, 0)
          // fork lines draw
          .to(forkLines, { opacity: 1, duration: 0.4, stagger: 0.1 }, 0.35)
          // bars appear
          .to(bars, { opacity: 1, duration: 0.3, stagger: 0.1 }, 0.65)
          // bars fill concurrently
          .to(barFills, { scaleX: 1, duration: 0.8, ease: "power2.inOut", stagger: 0.08 }, 0.9)
          // merge lines appear
          .to(mergeLines, { opacity: 1, duration: 0.4, stagger: 0.1 }, 1.8)
          // merge node appears + pulses
          .to(mergeNode, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" }, 2.1)
          .to(mergeNode, { scale: 1.08, duration: 0.3, ease: "sine.inOut", yoyo: true, repeat: 2 }, 2.5)
          // pause, then reset
          .to({}, { duration: 0.8 })
          .set([mainNode, mergeNode, ...bars, ...forkLines, ...mergeLines], { opacity: 0 })
          .set(barFills, { scaleX: 0 });
      }

      // --- Plugin loop ---
      function runPluginLoop() {
        const tl = gsap.timeline({ onComplete: runPluginLoop });

        // Pieces fly in from corners
        PIECES.forEach((p, i) => {
          const el = pieces[i] as HTMLElement;
          const dx = p.toX - p.fromX;
          const dy = p.toY - p.fromY;
          tl.fromTo(el,
            { opacity: 0, x: -dx * 0.7, y: -dy * 0.7 },
            { opacity: 1, x: 0, y: 0, duration: 0.5, ease: "back.out(1.4)" },
            i * 0.12
          );
        });

        // Plugin box assembles
        tl.to(plugBox, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.7)" }, 0.6)
          .to(plugLabel, { opacity: 1, duration: 0.3 }, 0.9)
          // pieces merge into box
          .to(pieces, { opacity: 0, scale: 0.3, duration: 0.4, ease: "power2.in", stagger: 0.06, transformOrigin: "50% 50%" }, 1.2)
          // box pulses
          .to(plugBox, {
            boxShadow: "0 0 0 6px rgba(155,89,182,.25), 0 16px 60px -10px rgba(155,89,182,.55)",
            scale: 1.06, duration: 0.5, ease: "sine.inOut", yoyo: true, repeat: 2,
          }, 1.65)
          // pause then reset
          .to({}, { duration: 0.6 })
          .set(pieces, { opacity: 0, x: 0, y: 0, scale: 1 })
          .set([plugBox, plugLabel], { opacity: 0, scale: 0.6 });
      }

      const initTl = gsap.timeline();
      initTl.add(() => runSubagentLoop(), 0.1);
      initTl.add(() => runPluginLoop(), 0.3);
    }, root);

    return () => ctx.revert();
  }, [active]);

  return (
    <div ref={root} style={{ position: "relative", width: W, height: H, margin: "0 auto" }}>

      {/* ===== LEFT: SUBAGENT graphic ===== */}
      <svg viewBox={`0 0 ${LEFT_W} ${H}`} width={LEFT_W} height={H}
        style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} aria-hidden>
        <defs>
          <linearGradient id="sa-bar-bg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="rgba(0,113,227,.08)" />
            <stop offset="1" stopColor="rgba(0,113,227,.04)" />
          </linearGradient>
        </defs>

        {/* Fork lines: main → each lane */}
        {LANES.map((lane, i) => (
          <line key={`fork-${i}`} className="sa-fork-line"
            x1={MAIN_NODE_X + 28} y1={MAIN_NODE_Y + 28}
            x2={lane.x} y2={155}
            stroke={lane.color} strokeWidth={2} strokeDasharray="6 4" opacity={0.7} />
        ))}

        {/* Merge lines: each lane → merge node */}
        {LANES.map((lane, i) => (
          <line key={`merge-${i}`} className="sa-merge-line"
            x1={lane.x} y1={225}
            x2={MERGE_X + 28} y2={MERGE_Y}
            stroke={lane.color} strokeWidth={2} strokeDasharray="6 4" opacity={0.7} />
        ))}
      </svg>

      {/* Main node */}
      <div className="sa-main" style={{
        position: "absolute", left: MAIN_NODE_X, top: MAIN_NODE_Y,
        width: 56, height: 56, borderRadius: "50%",
        background: "linear-gradient(135deg,#0071e3,#0058b0)",
        boxShadow: "var(--glow-accent)",
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: 0,
      }}>
        <span style={{ fontFamily: "var(--font-display,'Inter'),sans-serif", fontWeight: 800, fontSize: 14, color: "#fff" }}>main</span>
      </div>

      {/* Lane progress bars */}
      {LANES.map((lane) => (
        <div key={lane.label} className="sa-bar" style={{
          position: "absolute", left: lane.x - 60, top: 155,
          width: 120, height: 70,
          background: "linear-gradient(180deg,#fff,#f5f7fb)",
          border: `1.5px solid ${lane.color}33`,
          borderRadius: 14, padding: "8px 10px",
          boxShadow: "var(--shadow-sm)",
          opacity: 0,
        }}>
          <span style={{
            display: "block",
            fontFamily: "var(--font-display,'Inter'),sans-serif",
            fontWeight: 700, fontSize: 13, color: lane.color,
            marginBottom: 6,
          }}>{lane.label}</span>
          <div style={{ height: 8, background: "var(--line)", borderRadius: 4, overflow: "hidden" }}>
            <div className="sa-bar-fill" style={{
              height: "100%", borderRadius: 4,
              background: `linear-gradient(90deg,${lane.color}99,${lane.color})`,
            }} />
          </div>
        </div>
      ))}

      {/* Merge node */}
      <div className="sa-merge" style={{
        position: "absolute", left: MERGE_X, top: MERGE_Y,
        width: 56, height: 56, borderRadius: "50%",
        background: "linear-gradient(135deg,#34a853,#1e7e34)",
        boxShadow: "0 8px 28px -8px rgba(52,168,83,.6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: 0,
      }}>
        <span style={{ fontFamily: "var(--font-display,'Inter'),sans-serif", fontWeight: 800, fontSize: 12, color: "#fff" }}>done</span>
      </div>

      {/* ===== RIGHT: PLUGIN graphic ===== */}
      <div style={{ position: "absolute", left: RIGHT_OFFSET, top: 0, width: RIGHT_W, height: H }}>
        {/* Piece chips */}
        {PIECES.map((p) => (
          <div key={p.id} className="pl-piece" style={{
            position: "absolute",
            left: p.toX - 44,
            top: p.toY - 22,
            width: 88,
            height: 44,
            background: "#fff",
            border: `1.5px solid ${p.color}44`,
            borderRadius: 12,
            boxShadow: "var(--shadow-sm)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            opacity: 0,
          }}>
            <span style={{ fontSize: 18, color: p.color }}>{p.icon}</span>
            <span style={{
              fontFamily: "var(--font-display,'Inter'),sans-serif",
              fontWeight: 700, fontSize: 14, color: "var(--ink-soft)",
            }}>{p.label}</span>
          </div>
        ))}

        {/* Plugin box */}
        <div className="pl-box" style={{
          position: "absolute",
          left: 255, top: 130,
          width: 210, height: 120,
          background: "linear-gradient(160deg,rgba(155,89,182,.14),rgba(130,60,175,.06))",
          border: "2px solid rgba(155,89,182,.4)",
          borderRadius: 22,
          boxShadow: "0 8px 40px -12px rgba(155,89,182,.35)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 4, opacity: 0,
        }}>
          <svg width={32} height={32} viewBox="0 0 32 32" aria-hidden>
            <rect x={3} y={3} width={26} height={26} rx={7} fill="none" stroke="#9b59b6" strokeWidth={1.5} />
            <rect x={8} y={8} width={7} height={7} rx={2} fill="#9b59b6" opacity={0.7} />
            <rect x={17} y={8} width={7} height={7} rx={2} fill="#0071e3" opacity={0.7} />
            <rect x={8} y={17} width={7} height={7} rx={2} fill="#ff3b30" opacity={0.7} />
            <rect x={17} y={17} width={7} height={7} rx={2} fill="#34a853" opacity={0.7} />
          </svg>
          <span className="pl-box-label" style={{
            fontFamily: "var(--font-display,'Inter'),sans-serif",
            fontWeight: 800, fontSize: 19, color: "#9b59b6", letterSpacing: "-0.01em",
          }}>plugin</span>
        </div>
      </div>

    </div>
  );
}
