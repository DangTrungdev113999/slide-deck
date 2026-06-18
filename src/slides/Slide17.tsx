import { SlideFrame, TYPE } from "../components/SlideFrame";
import { PhaseFlow } from "../graphics/PhaseFlow";

const PHASES = [
  { label: "Kịch bản", sub: "tách scene" },
  { label: "Config", sub: "voice · BGM · brand" },
  { label: "Scene agents", sub: "song song / scene" },
  { label: "Ráp + TTS", sub: "giọng đọc + nhạc" },
  { label: "Tự review", sub: "soi & auto-fix" },
  { label: "Render", sub: "MP4 + thumbnail" },
];

export function Slide17({ active }: { active: boolean }) {
  return (
    <SlideFrame index={16} kicker="Demo · Pipeline 2" active={active}>
      <div style={{ marginTop: 30 }}>
        <span data-reveal style={TYPE.eyebrow}>Demo trực tiếp</span>
        <h2 data-reveal style={{ ...TYPE.h2, fontSize: 58, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          Gen video tài chính
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
            /gen-video-tai-chinh
          </code>
        </h2>
        <p data-reveal style={{ ...TYPE.lead, maxWidth: 1100 }}>
          Từ <b style={{ color: "var(--ink)" }}>kịch bản</b> → video tài chính hoàn chỉnh (giọng đọc + nhạc + thumbnail). Mỗi scene là <b style={{ color: "var(--accent)" }}>1 component Remotion riêng</b>, animation khớp lời đọc — chạy end-to-end, tự fix bug.
        </p>
      </div>

      <div data-reveal style={{ marginTop: "auto", marginBottom: 24 }}>
        <PhaseFlow active={active} phases={PHASES} />
      </div>

      <div data-reveal style={{ textAlign: "center", marginBottom: 8, fontFamily: "var(--font-display,'Inter'),sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>
        Cảm ơn · Q&amp;A
      </div>
    </SlideFrame>
  );
}

export default Slide17;
