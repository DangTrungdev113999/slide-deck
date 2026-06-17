import React from "react";
import { Slide } from "../components/Slide";
import { PipelineFlow } from "../graphics/PipelineFlow";

interface Slide14Props {
  active: boolean;
}

export const Slide14: React.FC<Slide14Props> = ({ active }) => {
  return (
    <Slide kicker="AI for Frontend · pipeline" active={active}>
      {/* Title */}
      <h1
        data-reveal
        style={{
          margin: "0 0 2.5rem",
          fontSize: "clamp(2rem, 4.5vw, 3.5rem)",
          fontFamily: "var(--font-display, 'Inter'), sans-serif",
          fontWeight: 800,
          color: "var(--ink)",
          letterSpacing: "-0.02em",
          lineHeight: 1.15,
        }}
      >
        Pipeline{" "}
        <code
          style={{
            display: "inline-block",
            background: "var(--surface)",
            border: "1.5px solid var(--line)",
            borderRadius: 10,
            padding: "0.06em 0.45em",
            fontSize: "0.88em",
            fontFamily: "ui-monospace, 'Fira Code', 'Cascadia Code', monospace",
            fontWeight: 700,
            color: "var(--accent)",
            letterSpacing: "-0.01em",
            verticalAlign: "middle",
            lineHeight: 1.5,
          }}
        >
          design-to-UI
        </code>
      </h1>

      {/* Pipeline SVG — drives its own animation from active prop */}
      <div
        data-reveal
        style={{ width: "100%", flex: 1, minHeight: 0, display: "flex", alignItems: "center" }}
      >
        <PipelineFlow active={active} />
      </div>

      {/* Caption */}
      <p
        data-reveal
        style={{
          margin: "2rem 0 0",
          fontSize: "clamp(0.85rem, 1.4vw, 1.05rem)",
          fontFamily: "var(--font-body, 'Be Vietnam Pro'), sans-serif",
          color: "var(--muted)",
          lineHeight: 1.6,
        }}
      >
        Paste URL Figma → ra UI chuẩn convention. Mỗi step có gate để review.
      </p>
    </Slide>
  );
};
