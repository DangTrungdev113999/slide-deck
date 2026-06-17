import { Stage } from "./components/Stage";
import { Slide } from "./components/Slide";
import { Nav } from "./components/Nav";
import { Progress } from "./components/Progress";

// Demo harness — Task 6 will replace this with the full deck.
function App() {
  return (
    <Stage>
      <Slide kicker="demo" active>
        <h1
          data-reveal
          style={{
            fontSize: "5rem",
            fontFamily: "var(--font-display, 'Inter'), sans-serif",
            fontWeight: 700,
            color: "var(--ink)",
            margin: 0,
            lineHeight: 1.05,
          }}
        >
          Task 5 Smoke Test
        </h1>
        <p
          data-reveal
          style={{
            fontSize: "1.75rem",
            fontFamily: "var(--font-body, 'Be Vietnam Pro'), sans-serif",
            color: "var(--muted)",
            marginTop: "1.5rem",
            maxWidth: "44ch",
          }}
        >
          Three blocks stagger in on load via GSAP reveal timeline.
        </p>
        <div
          data-reveal
          style={{
            marginTop: "2.5rem",
            display: "flex",
            gap: "1rem",
          }}
        >
          <span
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: "var(--radius)",
              background: "var(--accent)",
              color: "#fff",
              fontFamily: "var(--font-display, 'Inter'), sans-serif",
              fontWeight: 600,
              fontSize: "0.875rem",
            }}
          >
            Slide shell ✓
          </span>
          <span
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: "var(--radius)",
              border: "1.5px solid var(--line)",
              color: "var(--ink)",
              fontFamily: "var(--font-display, 'Inter'), sans-serif",
              fontWeight: 600,
              fontSize: "0.875rem",
            }}
          >
            Nav ✓
          </span>
          <span
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: "var(--radius)",
              border: "1.5px solid var(--line)",
              color: "var(--ink)",
              fontFamily: "var(--font-display, 'Inter'), sans-serif",
              fontWeight: 600,
              fontSize: "0.875rem",
            }}
          >
            Progress ✓
          </span>
        </div>
      </Slide>
      <Nav onPrev={() => {}} onNext={() => {}} />
      <Progress index={2} total={17} />
    </Stage>
  );
}

export default App;
