import { SlideFrame, TYPE } from "../components/SlideFrame";
import { Slide13Split } from "../graphics/Slide13Split";

export function Slide13({ active }: { active: boolean }) {
  return (
    <SlideFrame index={12} kicker="Frontend" active={active}>
      {/* Headline block */}
      <div style={{ marginTop: 36 }}>
        <span data-reveal style={TYPE.eyebrow}>AI for Frontend</span>
        <h2 data-reveal style={TYPE.h2}>
          Chia{" "}
          <span style={{ color: "var(--accent)" }}>2 mặt trận</span>
        </h2>
        <p data-reveal style={{ ...TYPE.lead, maxWidth: 900 }}>
          Code frontend ={" "}
          <b style={{ color: "var(--ink)" }}>UI/UX</b>
          {" "}+{" "}
          <b style={{ color: "var(--ink)" }}>Logic business</b>.
        </p>
      </div>

      {/* Split column headers — big, readable */}
      <div
        data-reveal
        style={{
          display: "flex",
          gap: 0,
          marginTop: 24,
          width: 1600,
          marginLeft: -16,
        }}
      >
        {/* LEFT: UI/UX column header */}
        <div style={{ flex: 1, paddingLeft: 48 }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
          }}>
            <span style={{
              width: 44, height: 44, borderRadius: 12,
              background: "var(--accent)",
              color: "#fff",
              fontFamily: "var(--font-display,'Inter'),sans-serif",
              fontWeight: 800,
              fontSize: 22,
              display: "grid",
              placeItems: "center",
              boxShadow: "0 8px 20px -6px rgba(0,113,227,0.55)",
              flexShrink: 0,
            }}>A</span>
            <span style={{
              fontFamily: "var(--font-display,'Inter'),sans-serif",
              fontWeight: 800,
              fontSize: 34,
              color: "var(--ink)",
              letterSpacing: "-0.02em",
            }}>
              UI / UX
            </span>
          </div>
          <div style={{
            fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
            fontSize: 22,
            color: "var(--muted)",
            marginTop: 6,
            paddingLeft: 56,
            lineHeight: 1.4,
          }}>
            Composition · layout · visual polish
          </div>
        </div>

        {/* Right: Logic Business column header */}
        <div style={{ flex: 1, paddingLeft: 60 }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
          }}>
            <span style={{
              width: 44, height: 44, borderRadius: 12,
              background: "var(--ink)",
              color: "#fff",
              fontFamily: "var(--font-display,'Inter'),sans-serif",
              fontWeight: 800,
              fontSize: 22,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}>B</span>
            <span style={{
              fontFamily: "var(--font-display,'Inter'),sans-serif",
              fontWeight: 800,
              fontSize: 34,
              color: "var(--ink)",
              letterSpacing: "-0.02em",
            }}>
              Logic business
            </span>
          </div>
          <div style={{
            fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
            fontSize: 22,
            color: "var(--muted)",
            marginTop: 6,
            paddingLeft: 56,
            lineHeight: 1.4,
          }}>
            State · data flow · API · computation
          </div>
        </div>
      </div>

      {/* Motion graphic */}
      <div data-reveal style={{ marginTop: 16, marginBottom: 0 }}>
        <Slide13Split active={active} />
      </div>
    </SlideFrame>
  );
}

export default Slide13;
