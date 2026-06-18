import { SlideFrame, TYPE } from "../components/SlideFrame";
import { WorkflowDiagram, FlowStep } from "../graphics/WorkflowDiagram";

const STEPS: FlowStep[] = [
  {
    nodes: [
      { id: "scene", type: "manual", label: "Tách scene", task: "Cắt kịch bản thành các scene (id · type · text) — mình xác nhận danh sách." },
    ],
  },
  {
    nodes: [
      { id: "config", type: "manual", label: "Chọn config", task: "Chọn voice · BGM · brand (mặc định hoặc tuỳ chỉnh). Sau bước này pipeline tự chạy hết." },
    ],
  },
  {
    parallel: true,
    tag: "scene-coder · ×N song song",
    nodes: [
      { id: "sc1", type: "agent", label: "Scene 1", task: "1 scene-coder viết 1 component Remotion riêng, animation khớp lời đọc (dùng frontend-design)." },
      { id: "sc2", type: "agent", label: "Scene 2", task: "Mỗi scene 1 agent độc lập, chạy song song cùng lúc — reveal đồng bộ với voice-over." },
      { id: "scN", type: "agent", label: "Scene …N", task: "N agent cùng lúc; mỗi agent trả về revealSlots + data + posterHoldFrames." },
    ],
  },
  {
    nodes: [
      { id: "det", type: "gate", label: "Determinism", task: "Gate: validate render-safety từng scene. Lỗi thì re-dispatch scene-coder kèm lỗi.", badge: "retry ≤3" },
    ],
  },
  {
    nodes: [
      { id: "thumb", type: "agent", label: "thumbnail", task: "thumbnail-designer dựng cover 9:16 poster-grade (Thumb.tsx), house style noir-gold." },
    ],
  },
  {
    nodes: [
      { id: "assemble", type: "skill", label: "Ráp + TTS", task: "Ráp VideoSpec + storyboard (mascot path, SFX), TTS đo duration thật bằng ffprobe." },
    ],
  },
  {
    nodes: [
      { id: "review", type: "gate", label: "Tự review", task: "Render still từng scene, soi visual (diacritics, contrast, mascot, vùng caption). Sai thì sửa scene → render lại.", badge: "auto-fix" },
    ],
  },
  {
    nodes: [
      { id: "render", type: "skill", label: "Render MP4", task: "remotion render ra MP4 (voice + BGM baked in), verify audio không bị câm." },
    ],
  },
  {
    nodes: [
      { id: "tele", type: "agent", label: "telegram", task: "telegram-publisher (Haiku) gửi thumbnail + caption + MP4 lên nhóm Telegram." },
    ],
  },
];

export function Slide17({ active }: { active: boolean }) {
  return (
    <SlideFrame kicker="Demo · Pipeline 2" active={active}>
      <div style={{ marginTop: 24 }}>
        <span data-reveal style={TYPE.eyebrow}>Demo trực tiếp</span>
        <h2 data-reveal style={{ ...TYPE.h2, fontSize: 60, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
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
        <p data-reveal style={{ ...TYPE.lead, fontSize: 24, maxWidth: 1180 }}>
          Từ <b style={{ color: "var(--ink)" }}>kịch bản</b> → video hoàn chỉnh. Mỗi scene <b style={{ color: "var(--accent)" }}>1 agent riêng chạy song song</b>; 2 gate auto-fix; tự đăng Telegram.
        </p>
      </div>

      <div data-reveal style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", marginTop: 8 }}>
        <WorkflowDiagram active={active} steps={STEPS} />
      </div>

      <div data-reveal style={{ textAlign: "center", marginBottom: 6, fontFamily: "var(--font-display,'Inter'),sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>
        Cảm ơn · Q&amp;A
      </div>
    </SlideFrame>
  );
}

export default Slide17;
