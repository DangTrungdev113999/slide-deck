import { SlideFrame, TYPE } from "../components/SlideFrame";
import { Slide13Split } from "../graphics/Slide13Split";

export function Slide13({ active }: { active: boolean }) {
  return (
    <SlideFrame index={12} kicker="Frontend" active={active}>
      {/* Headline */}
      <div style={{ marginTop: 40 }}>
        <span data-reveal style={TYPE.eyebrow}>AI for Frontend</span>
        <h2 data-reveal style={TYPE.h2}>
          Chia{" "}
          <span style={{ color: "var(--accent)" }}>2 mặt trận</span>
        </h2>
        <p data-reveal style={{ ...TYPE.lead, maxWidth: 860 }}>
          Code frontend = <b style={{ color: "var(--ink)" }}>UI/UX</b> + <b style={{ color: "var(--ink)" }}>logic business</b>.
          {" "}Mỗi mặt trận cần cách dùng AI khác nhau.
        </p>
      </div>

      {/* Split labels */}
      <div
        data-reveal
        style={{
          display: "flex",
          gap: 0,
          marginTop: 28,
          width: 1540,
          marginLeft: -16,
        }}
      >
        {/* LEFT label */}
        <div style={{ flex: 1, paddingLeft: 60 }}>
          <span
            style={{
              display: "inline-block",
              fontFamily: "var(--font-display,'Inter'),sans-serif",
              fontWeight: 800,
              fontSize: 28,
              color: "var(--ink)",
              letterSpacing: "-0.02em",
            }}
          >
            UI / UX
          </span>
          <span
            style={{
              display: "block",
              fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
              fontSize: 19,
              color: "var(--muted)",
              marginTop: 4,
            }}
          >
            Composition · layout · visual polish
          </span>
        </div>

        {/* Center spacer for divider */}
        <div style={{ width: 40 }} />

        {/* RIGHT label */}
        <div style={{ flex: 1, paddingLeft: 40 }}>
          <span
            style={{
              display: "inline-block",
              fontFamily: "var(--font-display,'Inter'),sans-serif",
              fontWeight: 800,
              fontSize: 28,
              color: "var(--ink)",
              letterSpacing: "-0.02em",
            }}
          >
            Logic business
          </span>
          <span
            style={{
              display: "block",
              fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
              fontSize: 19,
              color: "var(--muted)",
              marginTop: 4,
            }}
          >
            State · data flow · API · computation
          </span>
        </div>
      </div>

      {/* Graphic */}
      <div data-reveal style={{ marginTop: "auto", marginBottom: 4 }}>
        <Slide13Split active={active} />
      </div>
    </SlideFrame>
  );
}

export default Slide13;
