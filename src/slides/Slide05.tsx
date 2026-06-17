import { SlideFrame, TYPE } from "../components/SlideFrame";
import { Slide05Bars } from "../graphics/Slide05Bars";

export function Slide05({ active }: { active: boolean }) {
  return (
    <SlideFrame index={5} kicker="Hiệu suất" active={active}>
      {/* headline block */}
      <div style={{ marginTop: 40 }}>
        <span data-reveal style={TYPE.eyebrow}>
          Số lần prompt
        </span>
        <h2 data-reveal style={TYPE.h2}>
          1 prompt vs{" "}
          <span style={{ color: "var(--accent)" }}>2–3 prompt</span>
        </h2>
        <p data-reveal style={{ ...TYPE.lead, marginTop: 16 }}>
          Claude Code giải quyết task trong{" "}
          <b style={{ color: "var(--ink)" }}>1 lần hội thoại</b>. Cursor
          cần nhiều vòng hơn để hoàn chỉnh.
        </p>
      </div>

      {/* motion graphic */}
      <div data-reveal style={{ marginTop: "auto", marginBottom: 12 }}>
        <Slide05Bars active={active} />
      </div>
    </SlideFrame>
  );
}

export default Slide05;
