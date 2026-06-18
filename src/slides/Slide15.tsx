import { SlideFrame, TYPE } from "../components/SlideFrame";
import { Slide15Toggle } from "../graphics/Slide15Toggle";

export function Slide15({ active }: { active: boolean }) {
  return (
    <SlideFrame index={13} kicker="UI" active={active}>
      {/* Headline */}
      <div style={{ marginTop: 40 }}>
        <span data-reveal style={TYPE.eyebrow}>Design approach</span>
        <h2 data-reveal style={TYPE.h2}>
          Free-style vs{" "}
          <span style={{ color: "var(--accent)" }}>Design System</span>
        </h2>
      </div>

      {/* Two columns description */}
      <div
        data-reveal
        style={{
          display: "flex",
          gap: 0,
          marginTop: 24,
          width: 1540,
          marginLeft: -16,
        }}
      >
        {/* LEFT */}
        <div
          style={{
            flex: 1,
            paddingLeft: 60,
            paddingRight: 40,
            borderRight: "1px solid var(--line-soft)",
          }}
        >
          <span
            style={{
              display: "inline-block",
              fontFamily: "var(--font-display,'Inter'),sans-serif",
              fontWeight: 800,
              fontSize: 26,
              color: "var(--ink)",
              letterSpacing: "-0.02em",
              marginBottom: 8,
            }}
          >
            Free-style
          </span>
          <p
            style={{
              fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
              fontSize: 22,
              lineHeight: 1.5,
              color: "var(--ink-soft)",
              margin: 0,
              maxWidth: 560,
            }}
          >
            Không có design? Dùng skill{" "}
            <b style={{ color: "var(--ink)" }}>frontend-design / Taste</b> để ra UI đẹp,
            tránh look AI-slop.
          </p>
        </div>

        {/* RIGHT */}
        <div style={{ flex: 1, paddingLeft: 40 }}>
          <span
            style={{
              display: "inline-block",
              fontFamily: "var(--font-display,'Inter'),sans-serif",
              fontWeight: 800,
              fontSize: 26,
              color: "var(--ink)",
              letterSpacing: "-0.02em",
              marginBottom: 8,
            }}
          >
            Design System
          </span>
          <p
            style={{
              fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
              fontSize: 22,
              lineHeight: 1.5,
              color: "var(--ink-soft)",
              margin: 0,
              maxWidth: 560,
            }}
          >
            Có DS? Ép AI dùng <b style={{ color: "var(--ink)" }}>component base + token</b>:{" "}
            tailwind không inline style, color/spacing theo hệ.
          </p>
        </div>
      </div>

      {/* Graphic */}
      <div data-reveal style={{ marginTop: "auto", marginBottom: 4 }}>
        <Slide15Toggle active={active} />
      </div>
    </SlideFrame>
  );
}

export default Slide15;
