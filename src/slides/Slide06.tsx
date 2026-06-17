import { SlideFrame, TYPE } from "../components/SlideFrame";
import { Slide06Browser } from "../graphics/Slide06Browser";

export function Slide06({ active }: { active: boolean }) {
  return (
    <SlideFrame index={6} kicker="Antigravity" active={active}>
      {/* headline block */}
      <div style={{ marginTop: 40 }}>
        <span data-reveal style={TYPE.eyebrow}>
          Browser Automation
        </span>
        <h2 data-reveal style={{ ...TYPE.h2, maxWidth: 1100 }}>
          Điều khiển Chrome xịn,{" "}
          <span style={{ color: "var(--danger)" }}>nhưng hay tèo</span>
        </h2>
        <p data-reveal style={{ ...TYPE.lead, marginTop: 16 }}>
          Antigravity tự động hoá trình duyệt tốt nhất hiện tại.
          Điểm ổn định đạt{" "}
          <b style={{ color: "var(--ink)" }}>6/10</b> trong các task phức tạp.
        </p>
      </div>

      {/* motion graphic */}
      <div data-reveal style={{ marginTop: "auto", marginBottom: 12 }}>
        <Slide06Browser active={active} />
      </div>
    </SlideFrame>
  );
}

export default Slide06;
