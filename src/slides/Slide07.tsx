import { SlideFrame, TYPE } from "../components/SlideFrame";
import { Slide07Chart } from "../graphics/Slide07Chart";

export function Slide07({ active }: { active: boolean }) {
  return (
    <SlideFrame index={7} kicker="Ngành AI" active={active}>
      {/* ---- Headline block ---- */}
      <div style={{ marginTop: 36 }}>
        <span data-reveal style={TYPE.eyebrow}>
          Tốc độ tiến hoá
        </span>
        <h2 data-reveal style={{ ...TYPE.h2, marginTop: 6 }}>
          Không tiến hoá{" "}
          <span style={{ color: "var(--accent)" }}>tuyến tính</span>
        </h2>
        <p
          data-reveal
          style={{
            ...TYPE.lead,
            marginTop: 14,
            maxWidth: 900,
            color: "var(--ink-soft)",
          }}
        >
          Khoảng cách giữa người dùng AI giỏi và người dùng bình thường{" "}
          <strong style={{ color: "var(--ink)" }}>ngày càng lớn</strong>.
          Đừng bám chết một tool.
        </p>
      </div>

      {/* ---- Motion graphic (fills lower zone) ---- */}
      <div
        data-reveal
        style={{
          marginTop: "auto",
          marginBottom: 0,
          // Scale the 1560×500 chart to fit the lower ~52% of the slide
          transform: "scale(0.94)",
          transformOrigin: "center bottom",
        }}
      >
        <Slide07Chart active={active} />
      </div>
    </SlideFrame>
  );
}

export default Slide07;
