// PLACEHOLDER — Task 7+ will replace these with real slide content.
import { Slide } from "../components/Slide";

export function PlaceholderSlide({ n, active }: { n: number; active: boolean }) {
  return (
    <Slide kicker={`placeholder ${n} / 3`} active={active}>
      <h1
        data-reveal
        style={{
          fontSize: "6rem",
          fontFamily: "var(--font-display, 'Inter'), sans-serif",
          fontWeight: 700,
          color: "var(--ink)",
          margin: 0,
          lineHeight: 1,
        }}
      >
        Slide {n}
      </h1>
      <p
        data-reveal
        style={{
          fontSize: "2rem",
          fontFamily: "var(--font-body, 'Be Vietnam Pro'), sans-serif",
          color: "var(--muted)",
          marginTop: "1.5rem",
        }}
      >
        Navigate with ← → or click the arrows.
      </p>
      <p
        data-reveal
        style={{
          fontSize: "1.25rem",
          fontFamily: "var(--font-body, 'Be Vietnam Pro'), sans-serif",
          color: "var(--accent)",
          marginTop: "1rem",
        }}
      >
        Task 7 will replace this with the real hero slide.
      </p>
    </Slide>
  );
}
