import { SlideFrame, TYPE } from "../components/SlideFrame";
import { Slide03Timeline } from "../graphics/Slide03Timeline";

export function Slide03({ active }: { active: boolean }) {
  return (
    <SlideFrame index={3} kicker="Hành trình" active={active}>
      {/* Upper band: headline + lead — tight, not over-tall */}
      <div style={{ marginTop: 28 }}>
        <h2 data-reveal style={TYPE.h2}>
          Từ{" "}
          <span style={{ color: "var(--muted)" }}>Cursor</span>{" "}
          sang{" "}
          <span style={{ color: "var(--accent)" }}>Claude Code</span>
        </h2>

        <p data-reveal style={{ ...TYPE.lead, marginTop: 16, maxWidth: 900 }}>
          Hành trình thực — từ tool mạnh nhưng đốt tiền, đến workflow tự xây.
        </p>
      </div>

      {/* Lower band: timeline fills edge-to-edge, no dead space */}
      <div
        data-reveal
        style={{
          marginTop: 32,
          width: "100%",
          overflow: "visible",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Slide03Timeline active={active} />
      </div>
    </SlideFrame>
  );
}

export default Slide03;
