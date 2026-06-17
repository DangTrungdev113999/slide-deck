import { SlideFrame, TYPE } from "../components/SlideFrame";
import { Slide16Triangle } from "../graphics/Slide16Triangle";

export function Slide16({ active }: { active: boolean }) {
  return (
    <SlideFrame index={16} kicker="Figma MCP" active={active}>
      {/* Headline */}
      <div style={{ marginTop: 40 }}>
        <span data-reveal style={TYPE.eyebrow}>Figma MCP</span>
        <h2 data-reveal style={TYPE.h2}>
          Source-of-truth,{" "}
          <span style={{ color: "var(--accent)" }}>không phải máy generate</span>
        </h2>
        <p data-reveal style={{ ...TYPE.lead, maxWidth: 1000 }}>
          Bottleneck là <b style={{ color: "var(--ink)" }}>SYNC</b>, không phải generate.
          {" "}Figma MCP đọc cấu trúc thật (variables/components) làm chuẩn — round-trip{" "}
          <b style={{ color: "var(--accent)" }}>Figma ↔ code</b>.
        </p>
      </div>

      {/* Graphic — centered triangle loop */}
      <div
        data-reveal
        style={{
          marginTop: "auto",
          marginBottom: 8,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Slide16Triangle active={active} />
      </div>
    </SlideFrame>
  );
}

export default Slide16;
