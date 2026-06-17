import { SlideFrame, TYPE } from "../components/SlideFrame";
import { Slide17Closing } from "../graphics/Slide17Closing";

export function Slide17({ active }: { active: boolean }) {
  return (
    <SlideFrame index={17} kicker="Kết" active={active}>
      {/* Headline — big closing statement */}
      <div style={{ marginTop: 36 }}>
        <h1
          data-reveal
          style={{
            ...TYPE.h1,
            fontSize: 116,
            lineHeight: 0.95,
            letterSpacing: "-0.045em",
          }}
        >
          <span style={{ color: "var(--accent)" }}>Workflow</span>
          {" "}
          <span style={{ color: "var(--ink)" }}>&gt; Model</span>
        </h1>
        <p data-reveal style={{ ...TYPE.lead, maxWidth: 1050, marginTop: 26 }}>
          Chọn agent theo <b style={{ color: "var(--ink)" }}>SHAPE của task</b>, không theo leaderboard.{" "}
          <b style={{ color: "var(--ink)" }}>Codex</b>: tự chủ, cần guidance.{" "}
          <b style={{ color: "var(--ink)" }}>Claude Code</b>: tương tác, theo intent.
          {" "}Rồi test + tinh chỉnh.
        </p>
      </div>

      {/* Graphic */}
      <div data-reveal style={{ marginTop: "auto", marginBottom: 0 }}>
        <Slide17Closing active={active} />
      </div>

      {/* Closing line */}
      <div
        data-reveal
        style={{
          display: "flex",
          justifyContent: "center",
          paddingBottom: 0,
          paddingTop: 12,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
            fontSize: 22,
            fontWeight: 500,
            color: "var(--muted)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Cảm ơn · Q&amp;A
        </span>
      </div>
    </SlideFrame>
  );
}

export default Slide17;
