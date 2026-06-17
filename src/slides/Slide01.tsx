import { SlideFrame, TYPE } from "../components/SlideFrame";
import { Slide01Terminal } from "../graphics/Slide01Terminal";

export function Slide01({ active }: { active: boolean }) {
  return (
    <SlideFrame index={1} kicker="Mở màn" active={active}>
      {/* eyebrow */}
      <div style={{ marginTop: 40 }}>
        <span data-reveal style={TYPE.eyebrow}>
          Chia sẻ nội bộ
        </span>

        {/* h1 headline — "AI" in accent */}
        <h1 data-reveal style={{ ...TYPE.h1, marginTop: 16 }}>
          Dùng{" "}
          <span style={{ color: "var(--accent)" }}>AI</span>{" "}
          để code Frontend
        </h1>

        {/* lead */}
        <p data-reveal style={{ ...TYPE.lead, marginTop: 20, maxWidth: 860 }}>
          Bào AI sao cho hiệu quả —{" "}
          <strong style={{ color: "var(--ink)" }}>Trung 99</strong>
          {" · "}
          <span style={{ color: "var(--accent)", fontWeight: 700 }}>ATX × Finpath</span>
        </p>
      </div>

      {/* motion-graphic */}
      <div data-reveal style={{ marginTop: "auto", marginBottom: 12 }}>
        <Slide01Terminal active={active} />
      </div>
    </SlideFrame>
  );
}

export default Slide01;
