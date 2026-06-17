import { SlideFrame, TYPE } from "../components/SlideFrame";
import { Slide08Radial } from "../graphics/Slide08Radial";

export function Slide08({ active }: { active: boolean }) {
  return (
    <SlideFrame index={8} kicker="Harness" active={active}>
      {/* headline block */}
      <div style={{ marginTop: 40 }}>
        <span data-reveal style={TYPE.eyebrow}>
          Kiến trúc Agent
        </span>
        <h2 data-reveal style={{ ...TYPE.h2 }}>
          Tay chân của{" "}
          <span style={{ color: "var(--accent)" }}>Agent</span>
        </h2>
        <p data-reveal style={{ ...TYPE.lead, marginTop: 16, maxWidth: 900 }}>
          Harness kết nối 9 lớp năng lực: từ memory đến MCP,
          mọi thứ phối hợp qua một Agent duy nhất.
        </p>
      </div>

      {/* hero radial diagram */}
      <div data-reveal style={{ marginTop: "auto", marginBottom: 0 }}>
        <Slide08Radial active={active} />
      </div>
    </SlideFrame>
  );
}

export default Slide08;
