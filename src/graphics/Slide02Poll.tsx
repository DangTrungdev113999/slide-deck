import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Slide02Poll — 5 tool pill cards land in, then a spotlight ring
 * travels card→card in a loop forever. Claude Code card is accent-ringed
 * with a "được dùng nhiều nhất" note.
 *
 * StrictMode-safe: gsap.context + ctx.revert. No setInterval.
 */

type Tool = { id: string; label: string; mark: React.ReactNode; accent?: boolean };

const TOOLS: Tool[] = [
  {
    id: "claude",
    label: "Claude Code",
    accent: true,
    mark: (
      // Anthropic-inspired: a simple angular diamond / prism mark
      <svg viewBox="0 0 48 48" width={40} height={40} fill="none" aria-hidden>
        <polygon points="24,4 44,36 4,36" stroke="var(--accent)" strokeWidth="2.5" fill="rgba(0,113,227,0.1)" strokeLinejoin="round" />
        <line x1="24" y1="4" x2="24" y2="36" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="3 3" />
        <circle cx="24" cy="36" r="3.5" fill="var(--accent)" />
      </svg>
    ),
  },
  {
    id: "cursor",
    label: "Cursor",
    mark: (
      // An I-beam text cursor shape
      <svg viewBox="0 0 48 48" width={40} height={40} fill="none" aria-hidden>
        <line x1="16" y1="10" x2="32" y2="10" stroke="var(--ink-soft)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="16" y1="38" x2="32" y2="38" stroke="var(--ink-soft)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="24" y1="10" x2="24" y2="38" stroke="var(--ink-soft)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "codex",
    label: "Codex",
    mark: (
      // Code brackets: </ >
      <svg viewBox="0 0 48 48" width={40} height={40} fill="none" aria-hidden>
        <polyline points="18,14 8,24 18,34" stroke="var(--ink-soft)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="30,14 40,24 30,34" stroke="var(--ink-soft)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="27" y1="12" x2="21" y2="36" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "gemini",
    label: "Gemini",
    mark: (
      // Star-like gemini shape: two overlapping triangles
      <svg viewBox="0 0 48 48" width={40} height={40} fill="none" aria-hidden>
        <polygon points="24,6 38,38 10,38" stroke="var(--ink-soft)" strokeWidth="2" fill="none" strokeLinejoin="round" />
        <polygon points="24,42 10,10 38,10" stroke="var(--ink-soft)" strokeWidth="2" fill="none" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "antigravity",
    label: "Antigravity",
    mark: (
      // A rocket/arrow pointing up-right with a small orbit ring
      <svg viewBox="0 0 48 48" width={40} height={40} fill="none" aria-hidden>
        <ellipse cx="24" cy="24" rx="16" ry="8" stroke="var(--ink-soft)" strokeWidth="1.8" />
        <line x1="24" y1="8" x2="24" y2="40" stroke="var(--ink-soft)" strokeWidth="1.8" />
        <circle cx="24" cy="24" r="4.5" fill="var(--ink-soft)" />
        <polyline points="16,16 24,8 32,16" stroke="var(--ink-soft)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    ),
  },
];

const CARD_W = 220;
const CARD_H = 200;
const GAP = 32;

export function Slide02Poll({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !root.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context((self) => {
      const q = (s: string) => self.selector!(s);
      const cards = q(".s02-card");
      const spotlight = q(".s02-spotlight")[0];
      const note = q(".s02-note")[0];

      if (reduced) {
        gsap.set(cards, { opacity: 1, y: 0, scale: 1 });
        gsap.set([spotlight, note], { opacity: 1 });
        return;
      }

      gsap.set(cards, { opacity: 0, y: 40, scale: 0.9 });
      gsap.set(spotlight, { opacity: 0 });
      gsap.set(note, { opacity: 0, y: 8 });

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

      // land in stagger
      intro.to(cards, { opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.1 }, 0);
      // Claude accent ring + note
      intro.to(note, { opacity: 1, y: 0, duration: 0.4 }, 0.9);

      // spotlight loop after intro
      intro.add(() => {
        gsap.set(spotlight, { opacity: 1 });

        const totalW = TOOLS.length * (CARD_W + GAP) - GAP;
        const startX = -totalW / 2 + CARD_W / 2;

        // travel across all 5 cards
        const spotTl = gsap.timeline({ repeat: -1 });
        TOOLS.forEach((_, i) => {
          const targetX = startX + i * (CARD_W + GAP);
          spotTl.to(spotlight, {
            x: targetX,
            duration: 0.5,
            ease: "power2.inOut",
          });
          spotTl.to({}, { duration: 0.7 }); // dwell
        });
      });

      // subtle breathe on cards
      gsap.to(cards, {
        y: "-=5",
        duration: 2.8,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: { each: 0.2, from: "start" },
        delay: 1.2,
      });
    }, root);

    return () => ctx.revert();
  }, [active]);

  const totalW = TOOLS.length * (CARD_W + GAP) - GAP;

  return (
    <div
      ref={root}
      style={{
        position: "relative",
        width: "100%",
        height: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Spotlight ring (absolutely positioned, moves via GSAP x) */}
      <div
        className="s02-spotlight"
        style={{
          position: "absolute",
          width: CARD_W + 20,
          height: CARD_H + 20,
          borderRadius: 30,
          background: "rgba(0,113,227,0.07)",
          border: "2px solid rgba(0,113,227,0.35)",
          boxShadow: "0 0 40px 10px rgba(0,113,227,0.12)",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%)`,
          pointerEvents: "none",
          zIndex: 1,
          // Initial x set by GSAP
        }}
      />

      {/* Cards row */}
      <div
        style={{
          display: "flex",
          gap: GAP,
          alignItems: "center",
          width: totalW,
          position: "relative",
          zIndex: 2,
        }}
      >
        {TOOLS.map((tool) => (
          <div
            key={tool.id}
            className="s02-card"
            style={{
              width: CARD_W,
              height: CARD_H,
              background: "linear-gradient(180deg,#ffffff,#f7f8fb)",
              border: tool.accent
                ? "2px solid var(--accent)"
                : "1px solid var(--line)",
              borderRadius: 24,
              boxShadow: tool.accent
                ? "var(--glow-accent), var(--shadow-md)"
                : "var(--shadow-md)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              position: "relative",
              flexShrink: 0,
            }}
          >
            {/* accent badge for Claude Code */}
            {tool.accent && (
              <span
                style={{
                  position: "absolute",
                  top: -12,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "var(--accent)",
                  color: "#fff",
                  fontFamily: "var(--font-display,'Inter'),sans-serif",
                  fontWeight: 700,
                  fontSize: 12,
                  padding: "3px 10px",
                  borderRadius: 20,
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 14px -4px rgba(0,113,227,.5)",
                }}
              >
                #1
              </span>
            )}

            {tool.mark}

            <span
              style={{
                fontFamily: "var(--font-display,'Inter'),sans-serif",
                fontWeight: 800,
                fontSize: 18,
                color: tool.accent ? "var(--accent)" : "var(--ink)",
                letterSpacing: "-0.01em",
                textAlign: "center",
              }}
            >
              {tool.label}
            </span>
          </div>
        ))}
      </div>

      {/* "được dùng nhiều nhất" note under Claude Code (1st card) */}
      <div
        className="s02-note"
        style={{
          position: "absolute",
          bottom: -6,
          left: "50%",
          // Offset to align under Claude Code card (first in list)
          transform: `translateX(calc(-50% - ${totalW / 2 - CARD_W / 2}px + 0px))`,
          fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
          fontSize: 16,
          color: "var(--accent)",
          fontWeight: 600,
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "var(--accent)" }} />
        được dùng nhiều nhất
      </div>
    </div>
  );
}
