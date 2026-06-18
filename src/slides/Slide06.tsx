import { SlideFrame, TYPE } from "../components/SlideFrame";
import { Slide06Browser } from "../graphics/Slide06Browser";

export function Slide06({ active }: { active: boolean }) {
  return (
    <SlideFrame index={6} kicker="Antigravity" active={active}>
      {/* headline block */}
      <div style={{ marginTop: 32 }}>
        <span data-reveal style={TYPE.eyebrow}>
          Browser Automation
        </span>
        <h2 data-reveal style={{ ...TYPE.h2, maxWidth: 1100 }}>
          Điều khiển Chrome xịn,{" "}
          <span style={{ color: "var(--danger)" }}>nhưng hay tèo</span>
        </h2>
        <p data-reveal style={{ ...TYPE.lead, marginTop: 14, maxWidth: 860 }}>
          Antigravity tự động hoá trình duyệt tốt nhất hiện tại —
          đang chạy task thì nhả response rồi{" "}
          <b style={{ color: "var(--danger)" }}>tèo</b> giữa chừng.
        </p>
      </div>

      {/* motion graphic — terminal controls browser */}
      <div
        data-reveal
        style={{
          marginTop: "auto",
          marginBottom: 0,
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Slide06Browser active={active} />
      </div>
    </SlideFrame>
  );
}

export default Slide06;
