import { SlideFrame, TYPE } from "../components/SlideFrame";
import { Slide11ContextBar } from "../graphics/Slide11ContextBar";

export function Slide11({ active }: { active: boolean }) {
  return (
    <SlideFrame index={11} kicker="Context" active={active}>
      {/* headline block */}
      <div style={{ marginTop: 24 }}>
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
        <p data-reveal style={{ ...TYPE.lead, maxWidth: 860 }}>
          Nhét đầy 1M context không có nghĩa là model sẽ thông minh hơn.{" "}
          <b style={{ color: "var(--accent)" }}>200K</b> là vùng ngọt — quá tay thì{" "}
          <span style={{ color: "var(--danger)", fontWeight: 700 }}>context rot</span>:{" "}
          mô hình bắt đầu quên, lẫn, và suy luận kém đi.{" "}
          Dùng{" "}
          <code style={{
            fontFamily: "ui-monospace,'SF Mono',Menlo,monospace",
            fontSize: 24,
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 8,
            padding: "2px 9px",
            color: "var(--ink)",
          }}>/compact</code>{" "}
          để ép ngược về 200K.
        </p>
      </div>

      {/* animated graphic — fills bottom zone */}
      <div data-reveal style={{ marginTop: 28 }}>
        <Slide11ContextBar active={active} />
      </div>
    </SlideFrame>
  );
}

export default Slide11;
