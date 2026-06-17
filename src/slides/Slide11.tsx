import { SlideFrame, TYPE } from "../components/SlideFrame";
import { Slide11ContextBar } from "../graphics/Slide11ContextBar";

export function Slide11({ active }: { active: boolean }) {
  return (
    <SlideFrame index={11} kicker="Context" active={active}>
      {/* headline */}
      <div style={{ marginTop: 32 }}>
        <span data-reveal style={TYPE.eyebrow}>Tối ưu context</span>
        <h2 data-reveal style={TYPE.h2}>
          1M{" "}
          <span style={{
            fontFamily: "ui-monospace,'SF Mono',Menlo,monospace",
            fontWeight: 700,
            color: "var(--danger)",
          }}>≠</span>{" "}
          <span style={{ color: "var(--accent)" }}>free lunch</span>
        </h2>
        <p data-reveal style={{ ...TYPE.lead, maxWidth: 900 }}>
          <b style={{ color: "var(--accent)" }}>200K</b> là vùng ngon. Quá tay dễ ngu đi{" "}
          <code style={{
            fontFamily: "ui-monospace,'SF Mono',Menlo,monospace",
            fontSize: 22,
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 8,
            padding: "2px 8px",
            color: "var(--ink)",
          }}>/compact</code>, có khi ép về 200K cho chắc.
        </p>
      </div>

      {/* animated graphic */}
      <div data-reveal style={{ marginTop: "auto", marginBottom: 8 }}>
        <Slide11ContextBar active={active} />
      </div>
    </SlideFrame>
  );
}

export default Slide11;
