import { SlideFrame, TYPE } from "../components/SlideFrame";
import { Slide10SubPlugin } from "../graphics/Slide10SubPlugin";

export function Slide10({ active }: { active: boolean }) {
  return (
    <SlideFrame index={10} kicker="Subagent · Plugin" active={active}>
      {/* Headline */}
      <div style={{ marginTop: 28 }}>
        <h2 data-reveal style={{ ...TYPE.h2, margin: 0 }}>
          <span style={{ color: "var(--accent)" }}>Chạy song song</span>{" "}
          <span style={{ color: "var(--muted)", fontWeight: 400 }}>·</span>{" "}
          <span style={{ color: "var(--ink)" }}>Đóng gói</span>
        </h2>
      </div>

      {/* Two-zone descriptor row */}
      <div
        data-reveal
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1px 1fr",
          gap: 0,
          marginTop: 28,
        }}
      >
        {/* LEFT: SUBAGENT descriptor */}
        <div style={{ paddingRight: 52 }}>
          <span
            style={{
              display: "inline-block",
              fontFamily: "var(--font-display,'Inter'),sans-serif",
              fontWeight: 800,
              fontSize: 20,
              letterSpacing: "0.14em",
              textTransform: "uppercase" as const,
              color: "var(--accent)",
              background: "var(--accent-soft)",
              padding: "5px 14px",
              borderRadius: 9,
              marginBottom: 14,
            }}
          >
            Subagent
          </span>
          <p
            style={{
              fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
              fontSize: 26,
              lineHeight: 1.45,
              color: "var(--ink-soft)",
              margin: 0,
            }}
          >
            Spawn nhiều subagent chạy{" "}
            <b style={{ color: "var(--accent)" }}>SONG SONG</b> — tránh loãng
            context ở hội thoại chính.
          </p>
        </div>

        {/* Divider */}
        <div style={{ background: "var(--line)", margin: "0 0 24px" }} />

        {/* RIGHT: PLUGIN descriptor */}
        <div style={{ paddingLeft: 52 }}>
          <span
            style={{
              display: "inline-block",
              fontFamily: "var(--font-display,'Inter'),sans-serif",
              fontWeight: 800,
              fontSize: 20,
              letterSpacing: "0.14em",
              textTransform: "uppercase" as const,
              color: "var(--accent-700)",
              background: "rgba(0,88,176,.08)",
              padding: "5px 14px",
              borderRadius: 9,
              marginBottom: 14,
            }}
          >
            Plugin
          </span>
          <p
            style={{
              fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
              fontSize: 26,
              lineHeight: 1.45,
              color: "var(--ink-soft)",
              margin: 0,
            }}
          >
            Bundle ={" "}
            <span style={{ color: "var(--accent)" }}>skills</span> +{" "}
            <span style={{ color: "var(--danger)" }}>hooks</span> +{" "}
            <span style={{ color: "var(--ink)" }}>MCP</span> +{" "}
            <span style={{ color: "var(--accent-700)" }}>subagents</span>, chạy
            chéo Claude / Codex / Antigravity.
          </p>
        </div>
      </div>

      {/* Motion graphic — fills lower zone */}
      <div data-reveal style={{ marginTop: "auto", paddingBottom: 0 }}>
        <Slide10SubPlugin active={active} />
      </div>
    </SlideFrame>
  );
}

export default Slide10;
