import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Atmosphere } from "../components/Atmosphere";
import { useSlideNo } from "../components/SlideNoContext";
import { DesignToUIFlow } from "../graphics/DesignToUIFlow";

// node-type legend (matches WorkflowDiagram TYPE_META) — shown once so the
// audience can decode the colors in the bespoke graphic below.
const LEGEND = [
  { glyph: "◳", label: "Subagent", fill: "var(--accent)", border: "var(--accent-700)", text: "#fff", radius: 6 },
  { glyph: "/", label: "Skill", fill: "#fff", border: "var(--accent)", text: "var(--accent-700)", radius: 6 },
  { glyph: "✓", label: "Gate", fill: "#fffaf0", border: "#b8860b", text: "#8a6400", radius: 6 },
  { glyph: "★", label: "Kết quả", fill: "var(--ink)", border: "var(--ink)", text: "#fff", radius: 999 },
];

export function Slide14({ active }: { active: boolean }) {
  const head = useRef<HTMLDivElement>(null);
  const { no, total } = useSlideNo();

  useEffect(() => {
    if (!active || !head.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context((self) => {
      const els = self.selector!("[data-reveal]");
      if (reduced) {
        gsap.set(els, { opacity: 1, y: 0 });
        return;
      }
      gsap.from(els, { opacity: 0, y: 28, duration: 0.6, stagger: 0.09, ease: "power3.out" });
    }, head);
    return () => ctx.revert();
  }, [active]);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <Atmosphere />

      <div ref={head} style={{ position: "absolute", inset: 0, padding: "60px 120px", display: "flex", flexDirection: "column" }}>
        {/* top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span
            data-reveal
            style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: "var(--font-display,'Inter'),sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--accent)" }}
          >
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 0 4px rgba(0,113,227,.15)" }} />
            Pipeline
          </span>
          <span data-reveal style={{ fontFamily: "var(--font-display,'Inter'),sans-serif", fontWeight: 800, fontSize: 17, color: "var(--muted)" }}>
            <span style={{ color: "var(--ink)" }}>{String(no).padStart(2, "0")}</span> / {total}
          </span>
        </div>

        {/* headline + legend (compact, so the big graphic fills the lower band) */}
        <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 40 }}>
          <div>
            <span data-reveal style={{ display: "block", fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif", fontWeight: 700, fontSize: 22, letterSpacing: "0.04em", color: "var(--muted)", textTransform: "uppercase" }}>
              Quy trình ráp UI
            </span>
            <h1 data-reveal style={{ fontFamily: "var(--font-display,'Inter'),sans-serif", fontWeight: 800, fontSize: 104, lineHeight: 0.94, letterSpacing: "-0.045em", margin: "6px 0 0", color: "var(--ink)" }}>
              design
              <span style={{ margin: "0 18px", color: "var(--accent)", fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace", fontWeight: 700 }}>→</span>
              <span style={{ color: "var(--accent)" }}>UI</span>
            </h1>
            <p data-reveal style={{ fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif", fontSize: 24, lineHeight: 1.35, color: "var(--ink-soft)", margin: "12px 0 0", maxWidth: 1040 }}>
              Dán <b style={{ color: "var(--ink)" }}>1 URL Figma</b> → ra UI đúng convention &amp; design system. Mỗi bước có <b style={{ color: "var(--accent)" }}>gate review</b>.
            </p>
          </div>

          {/* node-type legend */}
          <div data-reveal style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 6 }}>
            {LEGEND.map((l) => (
              <span key={l.label} style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif", fontSize: 20, color: "var(--ink-soft)", whiteSpace: "nowrap" }}>
                <span style={{ width: 26, height: 26, display: "inline-grid", placeItems: "center", fontFamily: "var(--font-display,'Inter'),sans-serif", fontWeight: 800, fontSize: 15, color: l.text, background: l.fill, border: `2px solid ${l.border}`, borderRadius: l.radius }}>
                  {l.glyph}
                </span>
                {l.label}
              </span>
            ))}
          </div>
        </div>

        {/* bespoke design→UI assembly-line graphic — fills the lower band */}
        <div data-reveal style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", marginTop: 4 }}>
          <DesignToUIFlow active={active} />
        </div>
      </div>
    </div>
  );
}

export default Slide14;
