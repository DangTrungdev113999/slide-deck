interface NavProps {
  onPrev: () => void;
  onNext: () => void;
}

const btnStyle: React.CSSProperties = {
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
  transition: "border-color 0.2s, color 0.2s, transform 0.2s, background 0.2s",
  outline: "none",
};

export function Nav({ onPrev, onNext }: NavProps) {
  return (
    <>
      <button
        aria-label="Slide trước"
        onClick={onPrev}
        style={{ ...btnStyle, left: "2.5rem" }}
        onMouseEnter={e => {
          const b = e.currentTarget;
          b.style.borderColor = "var(--accent)";
          b.style.color = "var(--accent)";
          b.style.transform = "scale(1.08)";
        }}
        onMouseLeave={e => {
          const b = e.currentTarget;
          b.style.borderColor = "var(--line)";
          b.style.color = "var(--ink)";
          b.style.transform = "scale(1)";
        }}
      >
        ‹
      </button>
      <button
        aria-label="Slide sau"
        onClick={onNext}
        style={{ ...btnStyle, right: "2.5rem" }}
        onMouseEnter={e => {
          const b = e.currentTarget;
          b.style.borderColor = "var(--accent)";
          b.style.color = "var(--accent)";
          b.style.transform = "scale(1.08)";
        }}
        onMouseLeave={e => {
          const b = e.currentTarget;
          b.style.borderColor = "var(--line)";
          b.style.color = "var(--ink)";
          b.style.transform = "scale(1)";
        }}
      >
        ›
      </button>
    </>
  );
}
