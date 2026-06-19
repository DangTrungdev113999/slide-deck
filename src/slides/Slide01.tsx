import { SlideFrame, TYPE } from "../components/SlideFrame";
import { Slide01Terminal } from "../graphics/Slide01Terminal";

export function Slide01({ active }: { active: boolean }) {
  return (
    <SlideFrame index={1} kicker="" active={active}>
      {/* Headline block — kicker "MỞ MÀN" removed per redesign spec */}
      <div style={{ marginTop: 32 }}>
        {/* h1 headline — "AI" in accent, ≥104px per spec */}
        <h1 data-reveal style={{ ...TYPE.h1, marginTop: 0 }}>
          Dùng{" "}
          <span style={{ color: "var(--accent)" }}>AI</span>{" "}
          để code Frontend
        </h1>

        {/* lead */}
        <p data-reveal style={{ ...TYPE.lead, marginTop: 18, maxWidth: 920 }}>
          Bào AI sao cho hiệu quả —{" "}
          <span style={{ color: "var(--accent)", fontWeight: 700 }}>ATX × Finpath</span>
        </p>
      </div>

      {/* motion-graphic — fills the lower zone, marginTop:auto pushes it down */}
      <div
        data-reveal
        style={{
          marginTop: "auto",
          marginBottom: 0,
          // shift left to use the full 1680px canvas (accounting for 120px padding each side)
          marginLeft: -40,
          marginRight: -40,
        }}
      >
        <Slide01Terminal active={active} />
      </div>
    </SlideFrame>
  );
}

export default Slide01;
