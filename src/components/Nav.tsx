interface NavProps {
  onPrev: () => void;
  onNext: () => void;
}

const baseStyle: React.CSSProperties = {
  position: "absolute",
  bottom: "2.5rem",
  width: "3rem",
  height: "3rem",
  borderRadius: "50%",
  border: "1.5px solid var(--line)",
  background: "transparent",
  color: "var(--ink)",
  fontSize: "1.125rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "border-color 0.2s, color 0.2s, transform 0.2s",
};

function lift(b: HTMLButtonElement) {
  b.style.borderColor = "var(--accent)";
  b.style.color = "var(--accent)";
  b.style.transform = "scale(1.08)";
}

function reset(b: HTMLButtonElement) {
  b.style.borderColor = "var(--line)";
  b.style.color = "var(--ink)";
  b.style.transform = "scale(1)";
}

function NavButton({
  side,
  label,
  glyph,
  onClick,
}: {
  side: "left" | "right";
  label: string;
  glyph: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      style={{ ...baseStyle, [side]: "2.5rem" }}
      onMouseEnter={(e) => lift(e.currentTarget)}
      onMouseLeave={(e) => reset(e.currentTarget)}
      onFocus={(e) => lift(e.currentTarget)}
      onBlur={(e) => reset(e.currentTarget)}
    >
      {glyph}
    </button>
  );
}

export function Nav({ onPrev, onNext }: NavProps) {
  return (
    <>
      <NavButton side="left" label="Slide trước" glyph="‹" onClick={onPrev} />
      <NavButton side="right" label="Slide sau" glyph="›" onClick={onNext} />
    </>
  );
}
