import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Atmosphere } from "../components/Atmosphere";
import { PipelineFlow } from "../graphics/PipelineFlow";

export function Slide14({ active }: { active: boolean }) {
  const head = useRef<HTMLDivElement>(null);

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

      <div
        ref={head}
        style={{
          position: "absolute",
          inset: 0,
          padding: "68px 120px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span
            data-reveal
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              fontFamily: "var(--font-display,'Inter'),sans-serif",
              fontWeight: 700,
              fontSize: 15,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--accent)",
            }}
          >
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 0 4px rgba(0,113,227,.15)" }} />
            AI for Frontend
          </span>
          <span data-reveal style={{ fontFamily: "var(--font-display,'Inter'),sans-serif", fontWeight: 800, fontSize: 17, color: "var(--muted)" }}>
            <span style={{ color: "var(--ink)" }}>14</span> / 17
          </span>
        </div>

        {/* headline */}
        <div style={{ marginTop: 54 }}>
          <span
            data-reveal
            style={{
              display: "block",
              fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: "0.04em",
              color: "var(--muted)",
              textTransform: "uppercase",
            }}
          >
            Quy trình ráp UI
          </span>
          <h1
            data-reveal
            style={{
              fontFamily: "var(--font-display,'Inter'),sans-serif",
              fontWeight: 800,
              fontSize: 116,
              lineHeight: 0.96,
              letterSpacing: "-0.045em",
              margin: "12px 0 0",
              color: "var(--ink)",
            }}
          >
            design
            <span
              style={{
                margin: "0 18px",
                color: "var(--accent)",
                fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
                fontWeight: 700,
              }}
            >
              →
            </span>
            <span style={{ color: "var(--accent)" }}>UI</span>
          </h1>
          <p
            data-reveal
            style={{
              fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
              fontSize: 26,
              lineHeight: 1.45,
              color: "var(--ink-soft)",
              margin: "24px 0 0",
              maxWidth: 920,
            }}
          >
            Dán <b style={{ color: "var(--ink)" }}>1 URL Figma</b> → ra UI đúng convention &amp; design system của project. Mỗi step có <b style={{ color: "var(--accent)" }}>gate để review</b>.
          </p>
        </div>

        {/* animated graphic */}
        <div data-reveal style={{ marginTop: "auto", marginBottom: 8 }}>
          <PipelineFlow active={active} />
        </div>
      </div>
    </div>
  );
}

export default Slide14;
