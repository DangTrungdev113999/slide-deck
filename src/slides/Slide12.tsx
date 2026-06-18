import { SlideFrame, TYPE } from "../components/SlideFrame";
import { Slide12CeilingBreak } from "../graphics/Slide12CeilingBreak";

export function Slide12({ active }: { active: boolean }) {
  return (
    <SlideFrame index={12} kicker="Kỹ năng mới" active={active}>
      {/* headline */}
      <div style={{ marginTop: 28 }}>
        <span data-reveal style={TYPE.eyebrow}>Kỹ năng mới của dev</span>
        <h2 data-reveal style={{ ...TYPE.h2, fontSize: 66 }}>
          Nạp đúng context{" "}
          <span style={{ color: "var(--accent)" }}>&gt; viết prompt hay</span>
        </h2>
        <p data-reveal style={{ ...TYPE.lead, maxWidth: 920 }}>
          Đa số dev chỉ: <b style={{ color: "var(--ink)" }}>tả yêu cầu → AI nhả code → sửa → lặp lại</b>, nên nhanh chạm "trần". Người giỏi hơn biết{" "}
          <b style={{ color: "var(--accent)" }}>nạp đúng bối cảnh cho AI</b> (file liên quan, convention, mục tiêu) — đó mới là kỹ năng, không phải gồng prompt cho kêu.
        </p>
      </div>

      {/* two-column: graphic LEFT, quote RIGHT */}
      <div
        data-reveal
        style={{
          display: "flex",
          gap: 56,
          alignItems: "center",
          marginTop: "auto",
          marginBottom: 16,
        }}
      >
        {/* graphic */}
        <div style={{ flex: "0 0 auto" }}>
          <Slide12CeilingBreak active={active} />
        </div>

        {/* quote */}
        <div
          style={{
            flex: "1 1 0",
            background: "linear-gradient(180deg,#fff 0%,#f7f8fb 100%)",
            border: "1px solid var(--line)",
            borderRadius: 22,
            boxShadow: "var(--shadow-md)",
            padding: "36px 40px 32px",
            position: "relative",
          }}
        >
          {/* big decorative quote mark */}
          <div style={{
            fontFamily: "var(--font-display,'Inter'),sans-serif",
            fontSize: 96,
            lineHeight: 0.7,
            color: "var(--accent)",
            opacity: 0.5,
            marginBottom: 20,
            userSelect: "none",
          }}>"</div>

          <p style={{
            fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
            fontSize: 26,
            lineHeight: 1.55,
            fontStyle: "italic",
            color: "var(--ink-soft)",
            margin: 0,
          }}>
            Cách làm việc kiểu đó có một cái trần, và đa số dev chạm rất nhanh — vì AI chẳng hề biết bạn thực sự muốn gì.
          </p>

          <p style={{
            fontFamily: "var(--font-display,'Inter'),sans-serif",
            fontSize: 19,
            fontWeight: 700,
            color: "var(--muted)",
            margin: "22px 0 0",
            letterSpacing: "0.01em",
          }}>
            — @javascriptmastery
          </p>
        </div>
      </div>
    </SlideFrame>
  );
}

export default Slide12;
