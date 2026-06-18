import { SlideFrame, TYPE } from "../components/SlideFrame";
import { Slide15Toggle } from "../graphics/Slide15Toggle";

export function Slide15({ active }: { active: boolean }) {
  return (
    <SlideFrame index={13} kicker="UI" active={active}>
      {/* Headline */}
      <div style={{ marginTop: 32, flex: "0 0 auto" }}>
        <span data-reveal style={TYPE.eyebrow}>Design approach</span>
        <h2 data-reveal style={{ ...TYPE.h2, marginTop: 8 }}>
          Free-style vs{" "}
          <span style={{ color: "var(--accent)" }}>Design System</span>
        </h2>
      </div>

      {/* Two columns description — larger, clearer */}
      <div
        data-reveal
        style={{
          display: "flex",
          gap: 0,
          marginTop: 28,
          flex: "0 0 auto",
        }}
      >
        {/* LEFT */}
        <div
          style={{
            flex: 1,
            paddingRight: 48,
            borderRight: "1.5px solid var(--line)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 42,
                height: 42,
                borderRadius: 14,
                background: "rgba(0,113,227,0.10)",
                border: "1.5px solid rgba(0,113,227,0.22)",
                fontSize: 22,
                flexShrink: 0,
              }}
            >
              ✦
            </span>
            <span
              style={{
                fontFamily: "var(--font-display,'Inter'),sans-serif",
                fontWeight: 800,
                fontSize: 34,
                color: "var(--ink)",
                letterSpacing: "-0.02em",
              }}
            >
              Free-style
            </span>
          </div>
          <p
            style={{
              fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
              fontSize: 26,
              lineHeight: 1.5,
              color: "var(--ink-soft)",
              margin: 0,
            }}
          >
            Không có design sẵn?{" "}
            <strong style={{ color: "var(--ink)", fontWeight: 700 }}>Dùng skill frontend-design / Taste</strong>{" "}
            để ra UI đẹp, tránh look AI-slop.
          </p>
        </div>

        {/* RIGHT */}
        <div style={{ flex: 1, paddingLeft: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 42,
                height: 42,
                borderRadius: 14,
                background: "var(--accent)",
                fontSize: 22,
                flexShrink: 0,
                color: "#fff",
                fontWeight: 800,
              }}
            >
              ▦
            </span>
            <span
              style={{
                fontFamily: "var(--font-display,'Inter'),sans-serif",
                fontWeight: 800,
                fontSize: 34,
                color: "var(--ink)",
                letterSpacing: "-0.02em",
              }}
            >
              Design System
            </span>
          </div>
          <p
            style={{
              fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
              fontSize: 26,
              lineHeight: 1.5,
              color: "var(--ink-soft)",
              margin: 0,
            }}
          >
            Có DS?{" "}
            <strong style={{ color: "var(--ink)", fontWeight: 700 }}>Ép AI dùng component base + token</strong>:
            {" "}Tailwind, không inline style, màu/spacing theo hệ.
          </p>
        </div>
      </div>

      {/* Graphic — fills remaining space */}
      <div data-reveal style={{ flex: 1, display: "flex", alignItems: "flex-end", paddingBottom: 0, minHeight: 0 }}>
        <Slide15Toggle active={active} />
      </div>
    </SlideFrame>
  );
}

export default Slide15;
