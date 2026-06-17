import { SlideFrame, TYPE } from "../components/SlideFrame";
import { Slide02Poll } from "../graphics/Slide02Poll";

export function Slide02({ active }: { active: boolean }) {
  return (
    <SlideFrame index={2} kicker="Poll" active={active}>
      <div style={{ marginTop: 40 }}>
        <h2 data-reveal style={TYPE.h2}>
          Anh em đang xài tool gì?
        </h2>

        <p data-reveal style={{ ...TYPE.lead, marginTop: 18, maxWidth: 700 }}>
          Vote nhanh — ai dùng cái gì để code hằng ngày?
        </p>
      </div>

      {/* motion-graphic */}
      <div
        data-reveal
        style={{
          marginTop: "auto",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Slide02Poll active={active} />
      </div>
    </SlideFrame>
  );
}

export default Slide02;
