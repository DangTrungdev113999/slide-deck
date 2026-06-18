import { SlideFrame, TYPE } from "../components/SlideFrame";
import { Slide09SkillHook } from "../graphics/Slide09SkillHook";

export function Slide09({ active }: { active: boolean }) {
  return (
    <SlideFrame index={9} kicker="Skill · Hook" active={active}>
      {/* Headline */}
      <div style={{ marginTop: 28, flex: "0 0 auto" }}>
        <h2 data-reveal style={{ ...TYPE.h2, margin: 0 }}>
          Skill đóng gói{" "}
          <span style={{ color: "var(--muted)", fontWeight: 400 }}>·</span>{" "}
          <span style={{ color: "var(--danger)" }}>Hook</span> canh cổng
        </h2>
      </div>

      {/* Two-zone graphic — fills the remaining body */}
      <div
        data-reveal
        style={{
          flex: 1,
          marginTop: 36,
          minHeight: 0,
          display: "flex",
          alignItems: "stretch",
        }}
      >
        <Slide09SkillHook active={active} />
      </div>
    </SlideFrame>
  );
}

export default Slide09;
