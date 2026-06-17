import { SlideFrame, TYPE } from "../components/SlideFrame";
import { Slide03Timeline } from "../graphics/Slide03Timeline";

export function Slide03({ active }: { active: boolean }) {
  return (
    <SlideFrame index={3} kicker="Hành trình" active={active}>
      <div style={{ marginTop: 40 }}>
        <h2 data-reveal style={TYPE.h2}>
          Từ{" "}
          <span style={{ color: "var(--muted)" }}>Cursor</span>{" "}
          sang{" "}
          <span style={{ color: "var(--accent)" }}>Claude Code</span>
        </h2>

        <p data-reveal style={{ ...TYPE.lead, marginTop: 18, maxWidth: 860 }}>
          Hành trình thực — từ tool mạnh nhưng đốt tiền, đến workflow tự xây.
        </p>
      </div>

      {/* motion-graphic */}
      <div
        data-reveal
        style={{
          marginTop: "auto",
          marginBottom: 16,
          overflow: "visible",
        }}
      >
        <Slide03Timeline active={active} />
      </div>
    </SlideFrame>
  );
}

export default Slide03;
