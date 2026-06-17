interface ProgressProps {
  index: number;
  total: number;
}

export function Progress({ index, total }: ProgressProps) {
  const pct = ((index + 1) / total) * 100;
  const label = `${String(index + 1).padStart(2, "0")} / ${total}`;

  return (
    <div
      style={{
        position: "absolute",
        bottom: "2.5rem",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      <div
        style={{
          width: "8rem",
          height: "2px",
          background: "var(--line)",
          borderRadius: "1px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: "var(--accent)",
            borderRadius: "1px",
            transition: "width 0.3s ease",
          }}
        />
      </div>
      <span
        style={{
          fontSize: "0.6875rem",
          fontFamily: "var(--font-body, 'Be Vietnam Pro'), sans-serif",
          fontVariantNumeric: "tabular-nums",
          color: "var(--muted)",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </span>
    </div>
  );
}
