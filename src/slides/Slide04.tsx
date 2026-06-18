import { SlideFrame, TYPE } from "../components/SlideFrame";
import { Slide04Versus } from "../graphics/Slide04Versus";

/**
 * Slide04 — MERGED: "Cursor vs Claude Code" (flow comparison) + "1 prompt vs 2–3 prompt" (bar race).
 *
 * Slide 5 content is fully absorbed here. Slide05 is deleted by the controller.
 */
export function Slide04({ active }: { active: boolean }) {
  return (
    <SlideFrame index={4} kicker="So sánh" active={active}>
      {/* ── headline block ── */}
      <div style={{ marginTop: 32 }}>
        <h2
          data-reveal
          style={{
            ...TYPE.h2,
            display: "flex",
            alignItems: "baseline",
            gap: 20,
            flexWrap: "wrap" as const,
          }}
        >
          <span style={{ color: "var(--ink-soft)" }}>Cursor</span>
          <span
            style={{
              fontFamily: "ui-monospace,'SF Mono',Menlo,monospace",
              color: "var(--accent)",
              fontSize: 52,
            }}
          >
            vs
          </span>
          <span style={{ color: "var(--accent)" }}>Claude Code</span>
        </h2>

        <p
          data-reveal
          style={{
            ...TYPE.lead,
            marginTop: 14,
            maxWidth: 900,
          }}
        >
          Không phải tốt/xấu — chỉ khác flow.{" "}
          <strong style={{ color: "var(--ink)" }}>Biết điểm mạnh để dùng đúng lúc.</strong>
        </p>
      </div>

      {/* ── merged motion-graphic ── */}
      <div
        data-reveal
        style={{
          marginTop: 24,
          width: "100%",
        }}
      >
        <Slide04Versus active={active} />
      </div>
    </SlideFrame>
  );
}

export default Slide04;
