/**
 * BrandLogos — brand-accurate inline-SVG marks for the poll slide.
 * All paths rendered in token-palette colors only (no raw brand hex).
 * Shapes are recognizable silhouettes of each brand's actual mark.
 */

/** Anthropic / Claude Code — radiating asterisk/spark (8 rays from center) */
export function ClaudeLogo({ size = 52 }: { size?: number }) {
  return (
    <svg viewBox="0 0 52 52" width={size} height={size} fill="none" aria-hidden>
      {/* 8-ray asterisk — the actual Anthropic mark shape */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 26 + 7 * Math.cos(rad);
        const y1 = 26 + 7 * Math.sin(rad);
        const x2 = 26 + 20 * Math.cos(rad);
        const y2 = 26 + 20 * Math.sin(rad);
        return (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="var(--accent)"
            strokeWidth={i % 2 === 0 ? 3.5 : 2}
            strokeLinecap="round"
          />
        );
      })}
      <circle cx="26" cy="26" r="5.5" fill="var(--accent)" />
    </svg>
  );
}

/**
 * Cursor — the Cursor IDE logo is a rounded square with a faceted/gem
 * interior highlight — like a stylized cursor/pointer with angular facets.
 */
export function CursorLogo({ size = 52 }: { size?: number }) {
  return (
    <svg viewBox="0 0 52 52" width={size} height={size} fill="none" aria-hidden>
      {/* Outer rounded-rect (the app icon container shape) */}
      <rect x="6" y="6" width="40" height="40" rx="10" stroke="var(--ink-soft)" strokeWidth="2.5" />
      {/* Inner faceted diamond / gem highlight */}
      <polygon
        points="26,13 39,26 26,39 13,26"
        stroke="var(--ink-soft)"
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
      />
      {/* Center dot */}
      <circle cx="26" cy="26" r="3.5" fill="var(--ink-soft)" />
      {/* Top facet highlight */}
      <line x1="26" y1="13" x2="26" y2="19" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * OpenAI / Codex — the interwoven hexagonal/gear knot (the OpenAI bloom).
 * Simplified as two overlapping hexagons rotated 30° = 12-point star with
 * connected outline, which reads as the OpenAI mark silhouette.
 */
export function CodexLogo({ size = 52 }: { size?: number }) {
  // Build a 12-point interlocked shape by drawing two hex outlines rotated
  const hex = (cx: number, cy: number, r: number, rotation: number) => {
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = ((i * 60 + rotation) * Math.PI) / 180;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    });
    return pts.join(" ");
  };
  return (
    <svg viewBox="0 0 52 52" width={size} height={size} fill="none" aria-hidden>
      <polygon points={hex(26, 26, 20, 0)} stroke="var(--ink-soft)" strokeWidth="2" fill="none" strokeLinejoin="round" />
      <polygon points={hex(26, 26, 20, 30)} stroke="var(--ink-soft)" strokeWidth="2" fill="rgba(110,110,115,0.08)" strokeLinejoin="round" />
      <circle cx="26" cy="26" r="5" fill="none" stroke="var(--ink-soft)" strokeWidth="2" />
    </svg>
  );
}

/**
 * Gemini — four-pointed sparkle/star with concave sides (the actual Gemini mark).
 * Each arm is a narrow diamond; all 4 form a cross-like sparkle.
 */
export function GeminiLogo({ size = 52 }: { size?: number }) {
  // Four-pointed star with concave sides
  // Points: top(26,6) right(46,26) bottom(26,46) left(6,26)
  return (
    <svg viewBox="0 0 52 52" width={size} height={size} fill="none" aria-hidden>
      <path
        d="M26,5 C26,14 32,20 41,26 C32,32 26,38 26,47 C26,38 20,32 11,26 C20,20 26,14 26,5Z"
        stroke="var(--ink-soft)"
        strokeWidth="1.8"
        fill="rgba(110,110,115,0.10)"
        strokeLinejoin="round"
      />
      {/* Cross axis */}
      <line x1="26" y1="9" x2="26" y2="43" stroke="var(--ink-soft)" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
      <line x1="9" y1="26" x2="43" y2="26" stroke="var(--ink-soft)" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Antigravity (Google) — upward rocket/liftoff: an arrow shooting up
 * through an elliptical orbit ring, suggesting "anti-gravity / escape velocity".
 * This reads as the Antigravity brand concept (liftoff, defying gravity).
 */
export function AntigravityLogo({ size = 52 }: { size?: number }) {
  return (
    <svg viewBox="0 0 52 52" width={size} height={size} fill="none" aria-hidden>
      {/* Orbit ellipse */}
      <ellipse cx="26" cy="32" rx="16" ry="7" stroke="var(--ink-soft)" strokeWidth="2" />
      {/* Upward arrow / rocket body */}
      <line x1="26" y1="40" x2="26" y2="10" stroke="var(--ink-soft)" strokeWidth="2.5" strokeLinecap="round" />
      {/* Arrow head */}
      <polyline
        points="19,18 26,8 33,18"
        stroke="var(--ink-soft)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Small booster fins */}
      <line x1="26" y1="36" x2="20" y2="42" stroke="var(--ink-soft)" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="26" y1="36" x2="32" y2="42" stroke="var(--ink-soft)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
