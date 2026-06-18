import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/**
 * DesignToUIFlow — flagship motion-graphic for the `design → UI` pipeline.
 *
 * DISCIPLINED 3-ROW COMPOSITION (canvas 1680×620, all positions computed):
 *
 *   MIDDLE = the main SPINE, strictly left→right, with explicit chevron arrows
 *     between every step so the run order is unmistakable:
 *       [Figma frame] → [select-component] → ◆review → [build-UI] → ◆so-Figma → [Checkout UI]
 *     A comet flows along the spine in the run direction (reinforces flow).
 *
 *   TOP = the `mapping-combase` registry panel, sitting ABOVE select-component,
 *     joined by a short vertical "dùng skill" arrow. Holds known component chips
 *     tidily INSIDE the panel; grows 3→4 when build-com mints one.
 *
 *   BOTTOM = the `build-com` branch, BELOW the first gate. The gate's "thiếu
 *     component" path drops to the build-com FORGE, which mints a "Chart" token;
 *     a clearly-drawn curved arrow files it back UP into the registry
 *     ("nạp ngược → registry") through the clear corridor between the frame and
 *     select-component (x≈396) — the self-growing loop, the focal idea.
 *
 * Node identity matches the deck legend (agent / skill / gate / output) EXACTLY.
 * StrictMode-safe (gsap.context + ctx.revert). Reduced-motion → all final/visible.
 * Present-mode auto-cycle walks the 6 stages with a big caption.
 */

const W = 1680;
const H = 620;
const SPINE_Y = 306; // vertical centre of the main spine

// ---- legend colors (must match WorkflowDiagram TYPE_META exactly) ----
const AGENT = { fill: "var(--accent)", border: "var(--accent-700)", text: "#fff", glyph: "◳", label: "Subagent" };
const SKILL = { fill: "#fff", border: "var(--accent)", text: "var(--accent-700)", glyph: "/", label: "Skill" };
const GATE = { fill: "#fffaf0", border: "#b8860b", text: "#8a6400", glyph: "✓", label: "Gate" };
const OUTPUT = { fill: "var(--ink)", border: "var(--ink)", text: "#fff", glyph: "★", label: "Kết quả" };

const FONT_D = "var(--font-display,'Inter'),sans-serif";
const FONT_B = "var(--font-body,'Be Vietnam Pro'),sans-serif";
const MONO = "ui-monospace,'SF Mono',Menlo,monospace";

// ---- present-mode stages (auto-cycle) ----
type Stage = {
  id: string;
  glyph: string;
  border: string;
  textColor: string;
  bg: string;
  name: string;
  caption: string;
};
const STAGES: Stage[] = [
  { id: "select", glyph: AGENT.glyph, border: AGENT.border, textColor: AGENT.text, bg: AGENT.fill, name: "select-component", caption: "Subagent quét design Figma, quyết định dùng những component base nào." },
  { id: "gate1", glyph: GATE.glyph, border: GATE.border, textColor: GATE.text, bg: GATE.fill, name: "gate · review", caption: "Gate: người dùng xác nhận danh sách component sẽ dùng trước khi dựng." },
  { id: "map", glyph: SKILL.glyph, border: SKILL.border, textColor: SKILL.text, bg: SKILL.fill, name: "mapping-combase", caption: "Skill registry sống: định nghĩa mọi component base + ghi chú khi nào dùng." },
  { id: "build", glyph: SKILL.glyph, border: SKILL.border, textColor: SKILL.text, bg: SKILL.fill, name: "build-com", caption: "Thiếu component? Skill build mới theo convention rồi nạp NGƯỢC vào registry." },
  { id: "buildui", glyph: AGENT.glyph, border: AGENT.border, textColor: AGENT.text, bg: AGENT.fill, name: "build-UI", caption: "Subagent ráp UI từ component base + design token, đúng convention." },
  { id: "out", glyph: OUTPUT.glyph, border: OUTPUT.border, textColor: OUTPUT.text, bg: OUTPUT.fill, name: "UI chuẩn", caption: "Gate so khớp với Figma → Figma và UI render giống hệt nhau (same same)." },
];

// registry chips that get matched. the 4th (Chart) is minted by build-com.
const REG_CHIPS = ["Button", "Card", "Input"];

export function DesignToUIFlow({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const [stageIdx, setStageIdx] = useState(0);
  const stageRef = useRef(0);

  useEffect(() => {
    if (!active || !root.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context((self) => {
      const q = (s: string) => self.selector!(s);
      const all = (s: string) => q(s) as Element[];

      const frame = q(".du-frame")[0] as HTMLElement;
      const regionEls = all(".du-region");
      const regPanel = q(".du-registry")[0] as HTMLElement;
      const regSlots = all(".du-regslot");
      const newSlot = q(".du-newslot")[0] as HTMLElement; // the grown 4th slot
      const forge = q(".du-forge")[0] as HTMLElement;
      const flyToken = q(".du-flytoken")[0] as HTMLElement; // small token flying back
      const uiPanel = q(".du-ui")[0] as HTMLElement;
      const uiBlocks = all(".du-uiblock");
      const matchBadge = q(".du-match")[0] as HTMLElement;
      const nodeCards = all(".du-node");
      const gateMarks = all(".du-gate");

      // SVG path/line selectors (each must appear in BOTH reduced + init sets)
      const spine = q(".du-spine")[0] as SVGPathElement;
      const comet = q(".du-comet")[0] as SVGGElement;
      const arrows = all(".du-arrow"); // spine chevrons
      const skillArrow = q(".du-skillarrow")[0] as SVGPathElement; // registry → select
      const dropArrow = q(".du-droparrow")[0] as SVGPathElement; // gate1 → forge
      const backArrow = q(".du-backarrow")[0] as SVGPathElement; // forge → registry
      const scanBeam = q(".du-scan")[0] as SVGRectElement;

      // ---------- REDUCED MOTION: everything visible & final ----------
      if (reduced) {
        gsap.set(
          [frame, regPanel, uiPanel, forge, matchBadge, newSlot, ...nodeCards, ...gateMarks],
          { opacity: 1, y: 0, scale: 1 }
        );
        gsap.set([...regionEls, ...regSlots, ...uiBlocks], { opacity: 1, scale: 1, y: 0, x: 0 });
        gsap.set([spine, skillArrow, dropArrow, backArrow], { strokeDashoffset: 0, opacity: 1 });
        gsap.set([...arrows], { opacity: 1 });
        gsap.set([comet, scanBeam, flyToken], { opacity: 0 });
        return;
      }

      // ---------- INIT (hidden) ----------
      const spineLen = spine.getTotalLength();
      const skillLen = skillArrow.getTotalLength();
      const dropLen = dropArrow.getTotalLength();
      const backLen = backArrow.getTotalLength();
      gsap.set(spine, { strokeDasharray: spineLen, strokeDashoffset: spineLen });
      gsap.set(skillArrow, { strokeDasharray: skillLen, strokeDashoffset: skillLen, opacity: 1 });
      gsap.set(dropArrow, { strokeDasharray: dropLen, strokeDashoffset: dropLen, opacity: 1 });
      gsap.set(backArrow, { strokeDasharray: backLen, strokeDashoffset: backLen, opacity: 0 });
      gsap.set([frame, regPanel, uiPanel], { opacity: 0, y: 24, scale: 0.97, transformOrigin: "50% 50%" });
      gsap.set(forge, { opacity: 0, scale: 0.82, transformOrigin: "50% 0%" });
      gsap.set(matchBadge, { opacity: 0, scale: 0.6, transformOrigin: "50% 50%" });
      gsap.set(nodeCards, { opacity: 0, y: 22, scale: 0.92, transformOrigin: "50% 50%" });
      gsap.set(gateMarks, { opacity: 0, scale: 0.5, transformOrigin: "50% 50%" });
      gsap.set(regionEls, { opacity: 0, scale: 0.85, transformOrigin: "50% 50%" });
      gsap.set(regSlots, { opacity: 0, scale: 0.7, transformOrigin: "50% 50%" });
      gsap.set(newSlot, { opacity: 0, scale: 0.7, transformOrigin: "50% 50%" });
      gsap.set(uiBlocks, { opacity: 0, y: 14, scale: 0.9, transformOrigin: "50% 50%" });
      gsap.set(arrows, { opacity: 0, scale: 0.5, transformOrigin: "50% 50%" });
      gsap.set([comet, scanBeam, flyToken], { opacity: 0 });

      // ---------- INTRO timeline ----------
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      // 1. Figma frame draws on + its highlighted regions
      tl.to(frame, { opacity: 1, y: 0, scale: 1, duration: 0.5 }, 0)
        .to(regionEls, { opacity: 1, scale: 1, duration: 0.4, stagger: 0.07 }, 0.25)
        // 2. spine draws left→right + chevron arrows pop in order
        .to(spine, { strokeDashoffset: 0, duration: 1.0, ease: "power2.inOut" }, 0.4)
        .to(arrows, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)", stagger: 0.12 }, 0.7)
        // 3. spine nodes pop in sequence, gates after
        .to(nodeCards, { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.16 }, 0.7)
        .to(gateMarks, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)", stagger: 0.18 }, 1.0)
        // 4. registry panel fills (top row) + its vertical link draws
        .to(regPanel, { opacity: 1, y: 0, scale: 1, duration: 0.5 }, 1.2)
        .to(regSlots, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.6)", stagger: 0.1 }, 1.4)
        .to(skillArrow, { strokeDashoffset: 0, duration: 0.5, ease: "power2.inOut" }, 1.5)
        // 5. build-com forge appears (bottom row) + its drop link draws
        .to(dropArrow, { strokeDashoffset: 0, duration: 0.5, ease: "power2.inOut" }, 1.8)
        .to(forge, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.6)" }, 1.95)
        // 6. build-UI assembles the right UI panel
        .to(uiPanel, { opacity: 1, y: 0, scale: 1, duration: 0.5 }, 2.2)
        .to(uiBlocks, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.5)", stagger: 0.09 }, 2.4)
        // 7. same-same match locks in
        .to(matchBadge, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" }, 2.9);

      // ---------- SUSTAIN loops ----------
      tl.add(() => {
        // a) comet flows along the spine in the run direction (left→right)
        gsap.set(comet, { opacity: 1 });
        gsap.fromTo(
          comet,
          { x: 360, y: SPINE_Y },
          { x: 1320, duration: 3.4, ease: "none", repeat: -1 }
        );

        // b) scan beam sweeps the Figma frame
        gsap.fromTo(
          scanBeam,
          { opacity: 0, attr: { y: 16 } },
          { opacity: 0.5, attr: { y: 300 }, duration: 2.4, ease: "sine.inOut", repeat: -1, yoyo: true }
        );

        // c) registry panel pulse (it's alive / growing)
        gsap.to(regPanel, {
          boxShadow: "0 0 0 1px rgba(0,113,227,.28), 0 30px 70px -26px rgba(0,113,227,.5)",
          duration: 1.6,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });

        // d) gentle breathing on the two anchor panels
        gsap.to([frame, uiPanel], { y: "-=4", duration: 2.8, ease: "sine.inOut", repeat: -1, yoyo: true });

        // e) same-same match badge pulse
        gsap.to(matchBadge, {
          scale: 1.06,
          boxShadow: "0 0 0 4px rgba(0,113,227,.16), 0 24px 60px -22px rgba(0,113,227,.55)",
          duration: 1.2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });

        // f) gate checks breathe
        gsap.to(gateMarks, { scale: 1.07, duration: 1.4, ease: "sine.inOut", repeat: -1, yoyo: true, stagger: 0.3 });

        // g) THE BACK-LOOP — periodically: forge flares & mints a token, a small
        //    token flies UP the back-arrow into the registry (corridor x≈396),
        //    the registry grows to a real 4th slot ("nạp ngược → registry").
        const loop = gsap.timeline({ repeat: -1, repeatDelay: 1.6 });
        loop
          // forge flares
          .to(forge, { boxShadow: "0 0 0 2px rgba(0,113,227,.4), 0 22px 50px -18px rgba(0,113,227,.7)", scale: 1.05, duration: 0.4, ease: "power2.out" })
          // draw the back-arrow forge → registry
          .to(backArrow, { opacity: 1, strokeDashoffset: 0, duration: 0.6, ease: "power2.inOut" }, "<")
          // mint a small token at the forge top-left and fly it along the corridor.
          // 2-segment route (no MotionPathPlugin): (1) slide LEFT into the x≈396
          // corridor while staying BELOW select (y~450), (2) go straight UP the
          // corridor into the registry — never crossing any node box.
          .set(flyToken, { opacity: 0, scale: 0.4, x: 0, y: 0 })
          .to(flyToken, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, "-=0.2")
          .to(flyToken, { x: -246, y: 0, duration: 0.4, ease: "power2.inOut" }) // → corridor (x≈396), still low
          .to(flyToken, { y: -300, duration: 0.55, ease: "power2.inOut" }) // straight up the corridor
          .to(flyToken, { opacity: 0, scale: 0.6, duration: 0.2 }, "-=0.14")
          // the new 4th slot lights up (registry GREW 3→4)
          .fromTo(newSlot, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2)" }, "-=0.05")
          .to(newSlot, { boxShadow: "0 0 0 3px rgba(0,113,227,.35)", duration: 0.3, yoyo: true, repeat: 1 })
          // reset for the next cycle
          .to(forge, { scale: 1, boxShadow: "var(--shadow-md)", duration: 0.4 }, "-=0.3")
          .to(backArrow, { opacity: 0, duration: 0.4 }, "+=0.5")
          .to(newSlot, { opacity: 0, duration: 0.3 }, "-=0.1")
          .set(backArrow, { strokeDashoffset: backLen });
      });

      // ---------- present-mode auto-cycle (walks the 6 stages) ----------
      let killed = false;
      const adv = () => {
        if (killed) return;
        const next = (stageRef.current + 1) % STAGES.length;
        stageRef.current = next;
        setStageIdx(next);
      };
      const cyc = gsap.timeline({ repeat: -1, delay: 1.4 });
      STAGES.forEach(() => cyc.call(adv, undefined, "+=1.5"));

      return () => {
        killed = true;
        cyc.kill();
      };
    }, root);

    return () => ctx.revert();
  }, [active]);

  const stage = STAGES[stageIdx];
  const sid = stage.id;
  const RING = "0 0 0 4px rgba(0,113,227,.20), 0 26px 60px -22px rgba(0,113,227,.5)";

  return (
    <div ref={root} style={{ position: "relative", width: W, height: H, margin: "0 auto" }}>
      {/* ===================== SVG layer: spine + arrows + comet + links ===================== */}
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }} aria-hidden>
        <defs>
          <linearGradient id="du-spine-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#9cc6f5" />
            <stop offset="0.5" stopColor="#0071e3" />
            <stop offset="1" stopColor="#0058b0" />
          </linearGradient>
          <linearGradient id="du-scan-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(0,113,227,0)" />
            <stop offset="0.5" stopColor="rgba(0,113,227,.55)" />
            <stop offset="1" stopColor="rgba(0,113,227,0)" />
          </linearGradient>
          <radialGradient id="du-comet-grad">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.35" stopColor="#3a9bff" />
            <stop offset="1" stopColor="rgba(0,113,227,0)" />
          </radialGradient>
          <filter id="du-comet-blur" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <marker id="du-ah" markerWidth="10" markerHeight="10" refX="6.5" refY="5" orient="auto">
            <path d="M0 0 L10 5 L0 10 z" fill="var(--accent)" />
          </marker>
          <marker id="du-ah-skill" markerWidth="10" markerHeight="10" refX="6.5" refY="5" orient="auto">
            <path d="M0 0 L10 5 L0 10 z" fill="var(--accent-700)" />
          </marker>
        </defs>

        {/* faint base spine (full reach) */}
        <line x1={360} y1={SPINE_Y} x2={1320} y2={SPINE_Y} stroke="var(--line)" strokeWidth={3} strokeLinecap="round" />
        {/* spine foreground (draws on, gradient) — frame → UI */}
        <path
          className="du-spine"
          d={`M 360 ${SPINE_Y} H 1320`}
          fill="none"
          stroke="url(#du-spine-grad)"
          strokeWidth={4}
          strokeLinecap="round"
        />

        {/* BIG directional chevrons along the spine — one in each gap, all pointing right */}
        <Chevron x={398} y={SPINE_Y} />
        <Chevron x={659} y={SPINE_Y} />
        <Chevron x={785} y={SPINE_Y} />
        <Chevron x={1025} y={SPINE_Y} />
        <Chevron x={1216} y={SPINE_Y} />

        {/* registry → select-component : "dùng skill" vertical link */}
        <path
          className="du-skillarrow"
          d="M 530 160 V 256"
          fill="none"
          stroke="var(--accent-700)"
          strokeWidth={3}
          strokeLinecap="round"
          markerEnd="url(#du-ah-skill)"
        />

        {/* gate1 → forge : "thiếu component" drop link */}
        <path
          className="du-droparrow"
          d={`M 722 ${SPINE_Y + 60} V 424`}
          fill="none"
          stroke="#b8860b"
          strokeWidth={3}
          strokeLinecap="round"
          markerEnd="url(#du-ah)"
        />

        {/* back-loop arrow: forge top-left → up the x≈396 corridor → registry bottom */}
        <path
          className="du-backarrow"
          d="M 626 462 C 470 470, 396 430, 396 280 C 396 222, 430 168, 472 160"
          fill="none"
          stroke="var(--accent)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray="1 0"
          markerEnd="url(#du-ah)"
        />

        {/* the comet (group translated by GSAP x/y) */}
        <g className="du-comet">
          <circle r={24} fill="url(#du-comet-grad)" filter="url(#du-comet-blur)" />
          <circle r={6.5} fill="#fff" />
          <circle r={6.5} fill="none" stroke="#0071e3" strokeWidth={2} opacity={0.6} />
        </g>
      </svg>

      {/* ===================== LEFT anchor: Figma design frame ===================== */}
      <div
        className="du-frame"
        style={{
          position: "absolute",
          left: 0,
          top: 76,
          width: 360,
          height: 460,
          background: "linear-gradient(180deg,#ffffff 0%,#f7f8fb 100%)",
          border: "1px solid var(--line)",
          borderRadius: 22,
          boxShadow: "var(--shadow-md)",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 20px", borderBottom: "1px solid var(--line-soft)" }}>
          <span style={{ display: "inline-flex", gap: 6 }}>
            <i style={{ width: 12, height: 12, borderRadius: "50%", background: "var(--danger)", display: "inline-block" }} />
            <i style={{ width: 12, height: 12, borderRadius: "50%", background: "#f5b50a", display: "inline-block" }} />
            <i style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840", display: "inline-block" }} />
          </span>
          <span style={{ fontFamily: MONO, fontSize: 20, fontWeight: 700, color: "var(--ink)" }}>checkout.fig</span>
          <span style={{ marginLeft: "auto", fontFamily: FONT_D, fontSize: 20, fontWeight: 800, color: "var(--accent)" }}>Figma</span>
        </div>
        <div style={{ position: "relative", padding: 22, height: 388 }}>
          <Region cls="du-region" top={6} h={60} label="Card" />
          <Region cls="du-region" top={82} h={50} label="Input" />
          <Region cls="du-region" top={148} h={50} label="Input" />
          <Region cls="du-region" top={214} h={66} label="Chart" dashed />
          <Region cls="du-region" top={296} h={54} label="Button" filled />
          <svg style={{ position: "absolute", inset: 0 }} width={316} height={388} aria-hidden>
            <rect className="du-scan" x={0} y={16} width={316} height={26} fill="url(#du-scan-grad)" rx={6} />
          </svg>
        </div>
      </div>

      {/* ===================== TOP ROW: mapping-combase registry ===================== */}
      <div
        className="du-registry"
        style={{
          position: "absolute",
          left: 404,
          top: 8,
          width: 360,
          padding: "16px 18px 18px",
          background: "#fff",
          border: `2px solid ${SKILL.border}`,
          borderRadius: 20,
          boxShadow: sid === "map" ? RING : "var(--shadow-md)",
          transform: sid === "map" ? "scale(1.02)" : "scale(1)",
          transition: "box-shadow .35s, transform .35s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <Glyph cfg={SKILL} />
          <span style={{ fontFamily: FONT_D, fontWeight: 800, fontSize: 23, color: SKILL.text, letterSpacing: "-0.01em" }}>mapping-combase</span>
          <span style={{ marginLeft: "auto", fontFamily: FONT_B, fontSize: 20, color: "var(--muted)" }}>registry</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {REG_CHIPS.map((c) => (
            <RegSlot key={c} cls="du-regslot" label={c} />
          ))}
          {/* the GROWN 4th slot, minted by build-com (hidden until back-loop fires) */}
          <RegSlot cls="du-newslot" label="Chart" isNew />
        </div>
      </div>

      {/* ===================== MIDDLE SPINE: nodes + gates ===================== */}
      <PipeNode cls="du-node" left={432} width={196} cfg={AGENT} label="select-component" sub="quét → chọn component" lit={sid === "select"} />
      <GateMark cls="du-gate" left={690} label="review" lit={sid === "gate1"} />
      <PipeNode cls="du-node" left={816} width={178} cfg={AGENT} label="build-UI" sub="ráp từ base + token" lit={sid === "buildui"} />
      <GateMark cls="du-gate" left={1056} label="so Figma" lit={sid === "out"} />

      {/* ===================== BOTTOM ROW: build-com forge ===================== */}
      <div
        className="du-forge"
        style={{
          position: "absolute",
          left: 620,
          top: 432,
          width: 220,
          padding: "14px 18px",
          background: "linear-gradient(180deg,#ffffff,#f4f7fc)",
          border: `2px solid ${SKILL.border}`,
          borderRadius: 16,
          boxShadow: sid === "build" ? RING : "var(--shadow-md)",
          transition: "box-shadow .35s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22 }}>⚒</span>
          <span style={{ fontFamily: FONT_D, fontWeight: 800, fontSize: 22, color: SKILL.text }}>build-com</span>
          <span style={{ marginLeft: "auto", fontFamily: FONT_D, fontWeight: 800, fontSize: 19, color: "var(--accent)", border: "1.5px dashed var(--accent)", borderRadius: 8, padding: "2px 8px" }}>Chart?</span>
        </div>
        <div style={{ fontFamily: FONT_B, fontSize: 20, color: "var(--muted)", marginTop: 6 }}>mint com mới → nạp ngược</div>
      </div>

      {/* small token that flies back into the registry (animated; fits the corridor) */}
      <div
        className="du-flytoken"
        style={{
          position: "absolute",
          left: 642,
          top: 448,
          width: 36,
          height: 36,
          background: AGENT.fill,
          border: `1px solid ${AGENT.border}`,
          borderRadius: 9,
          display: "grid",
          placeItems: "center",
          boxShadow: "0 10px 22px -8px rgba(0,113,227,.6)",
          zIndex: 8,
        }}
      >
        <span style={{ fontFamily: FONT_D, fontSize: 20, fontWeight: 800, color: "#fff" }}>◳</span>
      </div>

      {/* back-loop label, on the clear left stretch of the back-arrow */}
      <span
        style={{
          position: "absolute",
          left: 404,
          top: 392,
          fontFamily: FONT_B,
          fontSize: 20,
          fontWeight: 700,
          color: "var(--accent-700)",
          whiteSpace: "nowrap",
        }}
      >
        nạp ngược → registry
      </span>

      {/* ===================== RIGHT anchor: assembled UI ("same same") ===================== */}
      <div
        className="du-ui"
        style={{
          position: "absolute",
          left: 1320,
          top: 76,
          width: 360,
          height: 460,
          background: "linear-gradient(180deg,#ffffff 0%,#f7f8fb 100%)",
          border: "1px solid var(--line)",
          borderRadius: 22,
          boxShadow: sid === "out" ? RING : "var(--glow-accent)",
          transform: sid === "out" ? "scale(1.012)" : "scale(1)",
          transition: "box-shadow .35s, transform .35s",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 20px", borderBottom: "1px solid var(--line-soft)", background: "var(--accent)" }}>
          <span style={{ fontFamily: MONO, fontSize: 20, fontWeight: 700, color: "#fff" }}>Checkout.tsx</span>
          <span style={{ marginLeft: "auto", fontFamily: FONT_D, fontSize: 20, fontWeight: 800, color: "#fff" }}>UI</span>
        </div>
        <div style={{ position: "relative", padding: 22, height: 388 }}>
          <div className="du-uiblock" style={uiCard(6, 60)}>
            <span style={{ fontFamily: FONT_D, fontWeight: 800, fontSize: 20, color: "var(--ink)" }}>Đơn hàng</span>
          </div>
          <div className="du-uiblock" style={uiInput(82)}>email@domain.com</div>
          <div className="du-uiblock" style={uiInput(148)}>**** **** **** 4242</div>
          <div className="du-uiblock" style={{ ...uiCard(214, 66), display: "block", padding: 0, overflow: "hidden" }}>
            <MiniChart />
          </div>
          <div className="du-uiblock" style={uiButton(296)}>Thanh toán</div>
        </div>
      </div>

      {/* "same same" match badge — in the clear gap between gate2 and the UI panel */}
      <div
        className="du-match"
        style={{
          position: "absolute",
          left: 1162,
          top: SPINE_Y - 56,
          width: 116,
          height: 116,
          borderRadius: "50%",
          background: "#fff",
          border: `3px solid ${AGENT.border}`,
          display: "grid",
          placeItems: "center",
          boxShadow: "var(--glow-accent)",
          zIndex: 5,
        }}
      >
        <span style={{ fontFamily: FONT_D, fontWeight: 800, fontSize: 22, color: "var(--accent)", lineHeight: 1.05, textAlign: "center" }}>
          same<br />same
          <span style={{ display: "block", color: "#28c840", fontSize: 24, marginTop: 2 }}>✓</span>
        </span>
      </div>

      {/* ===================== present-mode caption (auto-cycle) ===================== */}
      <div
        style={{
          position: "absolute",
          left: 870,
          top: 552,
          width: 800,
          minHeight: 60,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <span
          style={{
            flex: "0 0 auto",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontFamily: FONT_D,
            fontWeight: 800,
            fontSize: 22,
            color: stage.textColor === "#fff" ? "var(--accent-700)" : stage.border,
            padding: "8px 14px",
            borderRadius: 12,
            background: "var(--surface)",
            border: "1px solid var(--line-soft)",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ fontSize: 18, opacity: 0.85 }}>{stage.glyph}</span>
          {stage.name}
        </span>
        <span style={{ fontFamily: FONT_B, fontSize: 22, lineHeight: 1.3, color: "var(--ink-soft)" }}>{stage.caption}</span>
      </div>
    </div>
  );
}

// ---------- sub-components ----------

function Chevron({ x, y }: { x: number; y: number }) {
  // a bold rightward chevron centred at (x,y), drawn in two strokes
  return (
    <path
      className="du-arrow"
      d={`M ${x - 7} ${y - 11} L ${x + 7} ${y} L ${x - 7} ${y + 11}`}
      fill="none"
      stroke="var(--accent)"
      strokeWidth={5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function Glyph({ cfg }: { cfg: typeof AGENT }) {
  return (
    <span
      style={{
        width: 30,
        height: 30,
        display: "inline-grid",
        placeItems: "center",
        fontFamily: FONT_D,
        fontWeight: 800,
        fontSize: 17,
        color: cfg.text,
        background: cfg.fill,
        border: `2px solid ${cfg.border}`,
        borderRadius: 8,
        flex: "0 0 auto",
      }}
    >
      {cfg.glyph}
    </span>
  );
}

function PipeNode({ cls, left, width, cfg, label, sub, lit }: { cls: string; left: number; width: number; cfg: typeof AGENT; label: string; sub: string; lit?: boolean }) {
  return (
    <div
      className={cls}
      style={{
        position: "absolute",
        left,
        top: 262,
        width,
        padding: "14px 16px",
        background: cfg.fill,
        color: cfg.text,
        border: `2px solid ${cfg.border}`,
        borderRadius: 16,
        boxShadow: lit ? "0 0 0 4px rgba(0,113,227,.22), 0 26px 60px -22px rgba(0,113,227,.55)" : "var(--shadow-md)",
        transform: lit ? "translateY(-4px) scale(1.04)" : "none",
        transition: "box-shadow .35s, transform .35s",
        zIndex: lit ? 6 : 2,
      }}
    >
      <span style={{ display: "flex", alignItems: "flex-start", gap: 8, fontFamily: FONT_D, fontWeight: 800, fontSize: 22, lineHeight: 1.12, letterSpacing: "-0.01em" }}>
        <span style={{ opacity: 0.85, fontSize: 17, flex: "0 0 auto", marginTop: 1 }}>{cfg.glyph}</span>
        <span style={{ whiteSpace: "normal" }}>{label}</span>
      </span>
      <div style={{ fontFamily: FONT_B, fontSize: 20, lineHeight: 1.2, marginTop: 5, color: cfg.text === "#fff" ? "rgba(255,255,255,.88)" : "var(--muted)" }}>{sub}</div>
    </div>
  );
}

function GateMark({ cls, left, label, lit }: { cls: string; left: number; label: string; lit?: boolean }) {
  return (
    <div className={cls} style={{ position: "absolute", left, top: SPINE_Y - 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, zIndex: lit ? 7 : 4 }}>
      <span
        style={{
          width: 56,
          height: 56,
          background: GATE.fill,
          border: `3px solid ${GATE.border}`,
          borderRadius: 12,
          transform: lit ? "rotate(45deg) scale(1.12)" : "rotate(45deg)",
          display: "grid",
          placeItems: "center",
          boxShadow: lit ? "0 0 0 4px rgba(184,134,11,.25), 0 18px 40px -16px rgba(184,134,11,.6)" : "var(--shadow-sm)",
          transition: "box-shadow .35s, transform .35s",
        }}
      >
        <span style={{ transform: "rotate(-45deg)", fontFamily: FONT_D, fontWeight: 800, fontSize: 24, color: GATE.text }}>{GATE.glyph}</span>
      </span>
      <span style={{ fontFamily: FONT_D, fontWeight: 800, fontSize: 20, color: GATE.text, whiteSpace: "nowrap" }}>{label}</span>
    </div>
  );
}

function Region({ cls, top, h, label, dashed, filled }: { cls: string; top: number; h: number; label: string; dashed?: boolean; filled?: boolean }) {
  return (
    <div
      className={cls}
      style={{
        position: "absolute",
        left: 22,
        right: 22,
        top: top + 22,
        height: h,
        borderRadius: 12,
        border: `2px ${dashed ? "dashed" : "solid"} ${filled ? "var(--accent-700)" : "var(--accent)"}`,
        background: filled ? "var(--accent)" : "rgba(0,113,227,.07)",
        display: "flex",
        alignItems: "center",
        paddingLeft: 14,
      }}
    >
      <span style={{ fontFamily: FONT_D, fontWeight: 800, fontSize: 20, color: filled ? "#fff" : "var(--accent-700)" }}>{label}</span>
    </div>
  );
}

function RegSlot({ cls, label, isNew }: { cls: string; label: string; isNew?: boolean }) {
  return (
    <div
      className={cls}
      style={{
        height: 42,
        borderRadius: 10,
        display: "grid",
        placeItems: "center",
        background: isNew ? "var(--accent)" : "var(--surface)",
        border: `1.5px solid ${isNew ? "var(--accent-700)" : "var(--line)"}`,
        fontFamily: FONT_D,
        fontWeight: 800,
        fontSize: 20,
        color: isNew ? "#fff" : "var(--ink)",
      }}
    >
      {label}
    </div>
  );
}

const uiCard = (top: number, h: number): React.CSSProperties => ({
  position: "absolute",
  left: 22,
  right: 22,
  top: top + 22,
  height: h,
  borderRadius: 12,
  background: "#fff",
  border: "1px solid var(--line)",
  boxShadow: "var(--shadow-sm)",
  display: "flex",
  alignItems: "center",
  paddingLeft: 16,
});

const uiInput = (top: number): React.CSSProperties => ({
  position: "absolute",
  left: 22,
  right: 22,
  top: top + 22,
  height: 50,
  borderRadius: 12,
  background: "var(--surface)",
  border: "1px solid var(--line)",
  display: "flex",
  alignItems: "center",
  paddingLeft: 16,
  fontFamily: MONO,
  fontSize: 20,
  color: "var(--muted)",
});

const uiButton = (top: number): React.CSSProperties => ({
  position: "absolute",
  left: 22,
  right: 22,
  top: top + 22,
  height: 54,
  borderRadius: 12,
  background: "var(--accent)",
  border: "1px solid var(--accent-700)",
  display: "grid",
  placeItems: "center",
  fontFamily: FONT_D,
  fontWeight: 800,
  fontSize: 22,
  color: "#fff",
  boxShadow: "0 14px 30px -12px rgba(0,113,227,.6)",
});

function MiniChart() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 320 66" preserveAspectRatio="none" aria-hidden style={{ display: "block" }}>
      <polyline points="0,52 50,40 100,46 150,24 200,32 260,12 320,18" fill="none" stroke="var(--accent)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <polygon points="0,52 50,40 100,46 150,24 200,32 260,12 320,18 320,66 0,66" fill="rgba(0,113,227,.10)" />
    </svg>
  );
}

export default DesignToUIFlow;
