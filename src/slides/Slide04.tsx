import { SlideFrame, TYPE } from "../components/SlideFrame";
import { Slide04Versus } from "../graphics/Slide04Versus";

export function Slide04({ active }: { active: boolean }) {
  return (
    <SlideFrame index={4} kicker="So sánh" active={active}>
      <div style={{ marginTop: 40 }}>
        <h2 data-reveal style={TYPE.h2}>
          <span style={{ color: "var(--ink-soft)" }}>Cursor</span>
          {" "}
          <span style={{
            fontFamily: "ui-monospace,'SF Mono',Menlo,monospace",
            color: "var(--accent)",
            fontSize: 56,
          }}>vs</span>
          {" "}
          <span style={{ color: "var(--accent)" }}>Claude Code</span>
        </h2>

        <p data-reveal style={{ ...TYPE.lead, marginTop: 18, maxWidth: 860 }}>
          Không phải tốt/xấu — chỉ khác flow. Biết điểm mạnh để dùng đúng lúc.
        </p>
      </div>

      {/* motion-graphic */}
      <div
        data-reveal
        style={{
          marginTop: "auto",
          marginBottom: 24,
        }}
      >
        <Slide04Versus active={active} />
      </div>
    </SlideFrame>
  );
}

export default Slide04;
