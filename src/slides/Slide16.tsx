import { SlideFrame, TYPE } from "../components/SlideFrame";
import { PhaseFlow } from "../graphics/PhaseFlow";

const PHASES = [
  { label: "Explore", sub: "chụp / soi TradingView" },
  { label: "BRD", sub: "chốt yêu cầu" },
  { label: "TAD", sub: "thiết kế kỹ thuật" },
  { label: "Implement", sub: "code library + UI" },
  { label: "Verify", sub: "đối chiếu TV" },
  { label: "User test", sub: "mình duyệt" },
];

export function Slide16({ active }: { active: boolean }) {
  return (
    <SlideFrame index={15} kicker="Demo · Pipeline 1" active={active}>
      <div style={{ marginTop: 30 }}>
        <span data-reveal style={TYPE.eyebrow}>Demo trực tiếp</span>
        <h2 data-reveal style={{ ...TYPE.h2, fontSize: 58, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          Clone drawing tool
          <code
            style={{
              fontFamily: "ui-monospace,'SF Mono',Menlo,monospace",
              fontSize: 30,
              fontWeight: 700,
              color: "var(--accent)",
              background: "rgba(0,113,227,.08)",
              border: "1px solid rgba(0,113,227,.2)",
              borderRadius: 12,
              padding: "6px 16px",
            }}
          >
            /ai-chart:clone-drawing-tool
          </code>
        </h2>
        <p data-reveal style={{ ...TYPE.lead, maxWidth: 1080 }}>
          Clone 1 công cụ vẽ từ <b style={{ color: "var(--ink)" }}>TradingView</b> vào AI Chart — gõ 1 lệnh, pipeline tự chạy hết 6 pha (mỗi pha có gate để mình duyệt).
        </p>
      </div>

      <div data-reveal style={{ marginTop: "auto", marginBottom: 24 }}>
        <PhaseFlow active={active} phases={PHASES} />
      </div>
    </SlideFrame>
  );
}

export default Slide16;
