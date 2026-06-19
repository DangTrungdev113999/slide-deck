import { SlideFrame, TYPE } from "../components/SlideFrame";
import { Slide08Radial } from "../graphics/Slide08Radial";

export function Slide08({ active }: { active: boolean }) {
  return (
    <SlideFrame index={8} kicker="Harness" active={active}>
      {/* Headline block — compact so diagram fills the lower zone */}
      <div style={{ marginTop: 32 }}>
        <h2 data-reveal style={{ ...TYPE.h2, marginTop: 0 }}>
          Tay chân của{" "}
          <span style={{ color: "var(--accent)" }}>Agent</span>
        </h2>
        <p data-reveal style={{ ...TYPE.lead, marginTop: 14, maxWidth: 860 }}>
          Harness kết nối 9 lớp năng lực — từ memory đến MCP,
          mọi thứ phối hợp qua một Agent duy nhất.
        </p>
      </div>

      {/* Hero radial diagram — fills the lower 56% of the slide */}
      <div
        data-reveal
        style={{
          marginTop: "auto",
          marginBottom: -8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Slide08Radial active={active} />
      </div>
    </SlideFrame>
  );
}

export default Slide08;
