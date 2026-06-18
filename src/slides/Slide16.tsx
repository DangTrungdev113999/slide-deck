import { SlideFrame, TYPE } from "../components/SlideFrame";
import { WorkflowDiagram, FlowStep } from "../graphics/WorkflowDiagram";

const STEPS: FlowStep[] = [
  {
    nodes: [
      {
        id: "scaffold",
        type: "manual",
        label: "Thu ảnh TV",
        task: "Scaffold thư mục + dán screenshot công cụ vẽ trên TradingView (mình cung cấp ảnh).",
      },
    ],
  },
  {
    nodes: [
      {
        id: "qg1",
        type: "gate",
        label: "QG1",
        task: "Gate: exploration đạt chuẩn (≥70% mục P0, đủ control point, đủ tab settings) mới đi tiếp.",
      },
    ],
  },
  {
    parallel: true,
    tag: "ai-chart:brd · ×3 tv-analyst",
    nodes: [
      { id: "brd-i", type: "agent", label: "interactions", task: "tv-analyst phân tích cách vẽ, chọn, kéo control point → analysis-interactions.md." },
      { id: "brd-s", type: "agent", label: "settings", task: "tv-analyst phân tích dialog settings: từng option, type, default, range → analysis-settings.md." },
      { id: "brd-v", type: "agent", label: "visuals", task: "tv-analyst phân tích trạng thái hiển thị, zoom, label, control point → analysis-visuals.md." },
    ],
  },
  {
    nodes: [
      { id: "qg2", type: "gate", label: "QG2", task: "Gate (≤2 vòng): BRD đủ pixel spec + schema settings + ≥3 acceptance criteria P0." },
    ],
  },
  {
    parallel: true,
    tag: "ai-chart:tad · ×3 architect",
    nodes: [
      { id: "tad-a", type: "agent", label: "API mapping", task: "ai-chart-architect map yêu cầu sang overlay/indicator API, totalStep, event handler." },
      { id: "tad-r", type: "agent", label: "rendering", task: "ai-chart-architect map figure primitive, hit-test, toạ độ, render control point." },
      { id: "tad-p", type: "agent", label: "patterns", task: "ai-chart-architect tìm implementation tương tự sẵn có → tái dùng vs viết mới." },
    ],
  },
  {
    nodes: [
      { id: "qg3", type: "gate", label: "QG3", task: "Gate (≤2 vòng): TAD có file plan đường dẫn chính xác + đủ §toolbar/§settings kèm ảnh." },
    ],
  },
  {
    parallel: true,
    tag: "ai-chart:implement (lib → surface)",
    nodes: [
      { id: "impl-lib", type: "agent", label: "ai-chart-coder", task: "Bước 1 (nếu cần): tạo overlay template + figure trong finpath-ai-chart, build sạch." },
      { id: "impl-ui", type: "agent", label: "integrator", task: "Bước 2: drawing-tool-integrator dựng overlay + panel + icon trong finpath-web (label tiếng Việt)." },
    ],
  },
  {
    nodes: [
      {
        id: "verify",
        type: "agent",
        label: "tv-verifier",
        task: "Mở localhost:8888, thao tác công cụ, chấm PASS/PARTIAL/FAIL từng tiêu chí so với TradingView. Đạt <90% thì tự sửa + verify lại.",
        badge: "retry ≤3",
      },
    ],
  },
  {
    nodes: [
      { id: "usertest", type: "manual", label: "User test", task: "Mình tự thao tác: vẽ, control point, settings, zoom, undo/xoá → duyệt." },
    ],
  },
];

export function Slide16({ active }: { active: boolean }) {
  return (
    <SlideFrame kicker="Demo · Pipeline 1" active={active}>
      <div style={{ marginTop: 24 }}>
        <span data-reveal style={TYPE.eyebrow}>Demo trực tiếp</span>
        <h2 data-reveal style={{ ...TYPE.h2, fontSize: 60, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
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
        <p data-reveal style={{ ...TYPE.lead, fontSize: 24, maxWidth: 1180 }}>
          Clone 1 công cụ vẽ từ <b style={{ color: "var(--ink)" }}>TradingView</b> vào AI Chart — 2 chỗ <b style={{ color: "var(--accent)" }}>3 agent chạy song song</b> (BRD &amp; TAD), nhiều gate, verify đối chiếu pixel.
        </p>
      </div>

      <div data-reveal style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", marginTop: 8 }}>
        <WorkflowDiagram active={active} steps={STEPS} />
      </div>
    </SlideFrame>
  );
}

export default Slide16;
