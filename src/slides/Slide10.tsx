import { SlideFrame, TYPE } from "../components/SlideFrame";
import { Slide10SubPlugin } from "../graphics/Slide10SubPlugin";

export function Slide10({ active }: { active: boolean }) {
  return (
    <SlideFrame index={10} kicker="Subagent · Plugin" active={active}>
      {/* Headline */}
      <div style={{ marginTop: 32 }}>
        <h2 data-reveal style={{ ...TYPE.h2, margin: 0 }}>
          <span style={{ color: "var(--accent)" }}>Chạy song song</span>{" "}
          <span style={{ color: "var(--muted)", fontWeight: 400 }}>·</span>{" "}
          <span style={{ color: "#9b59b6" }}>Đóng gói</span>
        </h2>
      </div>

      {/* Two-zone layout */}
      <div data-reveal style={{
        display: "grid",
        gridTemplateColumns: "1fr 1px 1fr",
        gap: 0,
        marginTop: 36,
        flex: 1,
      }}>
        {/* ---- LEFT: SUBAGENT ---- */}
        <div style={{ paddingRight: 48 }}>
          <span style={{
            display: "inline-block",
            fontFamily: "var(--font-display,'Inter'),sans-serif",
            fontWeight: 800,
            fontSize: 13,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--accent)",
            background: "rgba(0,113,227,.08)",
            padding: "4px 12px",
            borderRadius: 8,
            marginBottom: 16,
          }}>Subagent</span>
          <p style={{
            fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
            fontSize: 24,
            lineHeight: 1.5,
            color: "var(--ink-soft)",
            margin: 0,
            maxWidth: 580,
          }}>
            Spawn nhiều subagent chạy{" "}
            <b style={{ color: "var(--accent)" }}>SONG SONG</b>,
            tránh loãng context ở hội thoại chính.
          </p>
        </div>

        {/* Divider */}
        <div style={{ background: "var(--line)", margin: "0 0 40px" }} />

        {/* ---- RIGHT: PLUGIN ---- */}
        <div style={{ paddingLeft: 48 }}>
          <span style={{
            display: "inline-block",
            fontFamily: "var(--font-display,'Inter'),sans-serif",
            fontWeight: 800,
            fontSize: 13,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#9b59b6",
            background: "rgba(155,89,182,.09)",
            padding: "4px 12px",
            borderRadius: 8,
            marginBottom: 16,
          }}>Plugin</span>
          <p style={{
            fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
            fontSize: 24,
            lineHeight: 1.5,
            color: "var(--ink-soft)",
            margin: 0,
            maxWidth: 580,
          }}>
            Bundle ={" "}
            <span style={{ color: "var(--accent)" }}>skills</span> +{" "}
            <span style={{ color: "var(--danger)" }}>hooks</span> +{" "}
            <span style={{ color: "#34a853" }}>MCP</span> +{" "}
            <span style={{ color: "#9b59b6" }}>subagents</span>,
            chạy chéo Claude / Codex / Antigravity.
          </p>
        </div>
      </div>

      {/* Motion graphic */}
      <div data-reveal style={{ marginTop: "auto", paddingBottom: 8 }}>
        <Slide10SubPlugin active={active} />
      </div>
    </SlideFrame>
  );
}

export default Slide10;
