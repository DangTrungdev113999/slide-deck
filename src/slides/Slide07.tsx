import { SlideFrame, TYPE } from "../components/SlideFrame";
import { Slide07Chart } from "../graphics/Slide07Chart";

export function Slide07({ active }: { active: boolean }) {
  return (
    <SlideFrame index={7} kicker="Ngành AI" active={active}>
      {/* headline block */}
      <div style={{ marginTop: 40 }}>
        <span data-reveal style={TYPE.eyebrow}>
          Tốc độ tiến hoá
        </span>
        <h2 data-reveal style={{ ...TYPE.h2 }}>
          Không tiến hoá{" "}
          <span style={{ color: "var(--accent)" }}>tuyến tính</span>
        </h2>
        <p data-reveal style={{ ...TYPE.lead, marginTop: 16, maxWidth: 1000 }}>
          Mũ chồng mũ. Cần tư duy và kỹ năng để "bào" AI,
          đừng bám chết 1 tool.
        </p>
      </div>

      {/* motion graphic */}
      <div data-reveal style={{ marginTop: "auto", marginBottom: 4 }}>
        <Slide07Chart active={active} />
      </div>
    </SlideFrame>
  );
}

export default Slide07;
