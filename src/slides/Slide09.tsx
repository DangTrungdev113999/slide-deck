import { SlideFrame, TYPE } from "../components/SlideFrame";
import { Slide09SkillHook } from "../graphics/Slide09SkillHook";

export function Slide09({ active }: { active: boolean }) {
  return (
    <SlideFrame index={9} kicker="Skill · Hook" active={active}>
      {/* Headline */}
      <div style={{ marginTop: 32 }}>
        <h2 data-reveal style={{ ...TYPE.h2, margin: 0 }}>
          Skill đóng gói{" "}
          <span style={{ color: "var(--muted)", fontWeight: 400 }}>·</span>{" "}
          <span style={{ color: "var(--danger)" }}>Hook</span> canh cổng
        </h2>
      </div>

      {/* Two-zone layout */}
      <div data-reveal style={{
        display: "grid",
        gridTemplateColumns: "1fr 1px 1fr",
        gap: 0,
        marginTop: 36,
        flex: 1,
      }}>
        {/* ---- LEFT: SKILL ---- */}
        <div style={{ paddingRight: 48 }}>
          <span style={{
            display: "inline-block",
            fontFamily: "var(--font-display,'Inter'),sans-serif",
            fontWeight: 800,
            fontSize: 13,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--accent)",
            background: "rgba(0,113,227,.08)",
            padding: "4px 12px",
            borderRadius: 8,
            marginBottom: 16,
          }}>Skill</span>
          <p style={{
            fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
            fontSize: 24,
            lineHeight: 1.5,
            color: "var(--ink-soft)",
            margin: "0 0 28px",
            maxWidth: 580,
          }}>
            Đóng gói quy trình mình hay lặp lại thành một{" "}
            <b style={{ color: "var(--ink)" }}>playbook</b> sẵn — Claude cứ thế làm theo, khỏi dặn lại mỗi lần.{" "}
            <span style={{ color: "var(--muted)" }}>Skill dạy Claude dùng tool nào, theo thứ tự nào.</span>
          </p>
        </div>

        {/* Divider */}
        <div style={{ background: "var(--line)", margin: "0 0 40px" }} />

        {/* ---- RIGHT: HOOK ---- */}
        <div style={{ paddingLeft: 48 }}>
          <span style={{
            display: "inline-block",
            fontFamily: "var(--font-display,'Inter'),sans-serif",
            fontWeight: 800,
            fontSize: 13,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--danger)",
            background: "rgba(255,59,48,.08)",
            padding: "4px 12px",
            borderRadius: 8,
            marginBottom: 16,
          }}>Hook</span>
          <p style={{
            fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
            fontSize: 24,
            lineHeight: 1.5,
            color: "var(--ink-soft)",
            margin: "0 0 28px",
            maxWidth: 580,
          }}>
            Trigger tự động khi agent gọi tool — vd: chặn{" "}
            <code style={{
              fontFamily: "ui-monospace,'SF Mono',Menlo,monospace",
              background: "rgba(255,59,48,.1)",
              color: "var(--danger)",
              padding: "2px 7px",
              borderRadius: 6,
              fontSize: 22,
            }}>git push</code>{" "}
            khi mình chưa kịp verify.
          </p>
          <p style={{
            fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
            fontSize: 17,
            color: "var(--muted)",
            margin: 0,
            padding: "10px 14px",
            background: "var(--surface)",
            borderRadius: 10,
            borderLeft: "3px solid var(--line)",
            maxWidth: 520,
          }}>
            gitnexus inject vào hook để smart-search code
          </p>
        </div>
      </div>

      {/* Motion graphic */}
      <div data-reveal style={{ marginTop: "auto", paddingBottom: 8 }}>
        <Slide09SkillHook active={active} />
      </div>
    </SlideFrame>
  );
}

export default Slide09;
