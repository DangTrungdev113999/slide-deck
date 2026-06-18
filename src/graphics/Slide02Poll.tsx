import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  ClaudeLogo,
  CursorLogo,
  CodexLogo,
  GeminiLogo,
  AntigravityLogo,
} from "./BrandLogos";

/**
 * Slide02Poll — 5 tool cards with brand-accurate SVG logos, a live-tally
 * vote bar feel, and a spotlight sweep.
 *
 * Motion:
 *   Intro  → cards land-in staggered, bars count-up from 0.
 *   Sustain → spotlight ring sweeps card-to-card (repeat:-1),
 *             vote bars "live-tick" periodically (one random tool gets +1),
 *             cards breathe gently.
 *
 * StrictMode-safe: every tween inside gsap.context + ctx.revert().
 * Reduced-motion: all final values set immediately, nothing animates.
 */

type Tool = {
  id: string;
  label: string;
  Logo: React.FC<{ size?: number }>;
  accent?: boolean;
  votes: number; // simulated vote count (higher = more popular)
};

const TOOLS: Tool[] = [
  { id: "claude",      label: "Claude Code",  Logo: ClaudeLogo,      accent: true, votes: 87 },
  { id: "cursor",      label: "Cursor",        Logo: CursorLogo,                    votes: 64 },
  { id: "codex",       label: "Codex",         Logo: CodexLogo,                     votes: 41 },
  { id: "gemini",      label: "Gemini",        Logo: GeminiLogo,                    votes: 38 },
  { id: "antigravity", label: "Antigravity",   Logo: AntigravityLogo,               votes: 29 },
];

const MAX_VOTES = 100; // denominator for bar width %

const CARD_W = 256;
const CARD_H = 260;
const GAP = 36;
const TOTAL_W = TOOLS.length * (CARD_W + GAP) - GAP;

// x-center of each card relative to the row's left edge
const cardCX = (i: number) => i * (CARD_W + GAP) + CARD_W / 2;

// Spotlight x relative to the container centre (row is centred)
// spotlight left edge = container.left + (TOTAL_W - rowW)/2 ... but since
// the row IS TOTAL_W and the container is 100% width, we position the row
// absolutely and the spotlight parent is the same root div.
// The spotlight is absolute with left:50%, GSAP sets x relative to that.
const spotlightTargetX = (i: number) =>
  -TOTAL_W / 2 + cardCX(i) - CARD_W / 2 - 10; // offset so left edge of spotlight aligns with card left

export function Slide02Poll({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !root.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context((self) => {
      const q = (s: string) => self.selector!(s);
      const cards = q(".s02-card");
      const barInners = q(".s02-bar-inner");
      const countEls = q(".s02-count");
      const spotlight = q(".s02-spotlight")[0] as HTMLElement;
      const note = q(".s02-note")[0] as HTMLElement;
      const badge = q(".s02-badge")[0] as HTMLElement;

      // Spotlight: left:50% means origin is centre of container.
      // We translate via GSAP x so the spotlight box centres on each card.
      // spotlightTargetX(i) gives the x such that spotlight centre = card centre.
      gsap.set(spotlight, { xPercent: 0, yPercent: -50, x: 0 });

      // ── REDUCED MOTION: set everything to final state ──────────────────────
      if (reduced) {
        gsap.set(cards, { opacity: 1, y: 0, scale: 1 });
        gsap.set(spotlight, { opacity: 0.9, x: spotlightTargetX(0) });
        gsap.set(note, { opacity: 1, y: 0 });
        gsap.set(badge, { opacity: 1 });
        barInners.forEach((el: Element, i: number) => {
          gsap.set(el, { scaleX: TOOLS[i].votes / MAX_VOTES });
        });
        countEls.forEach((el: Element, i: number) => {
          (el as HTMLElement).textContent = String(TOOLS[i].votes);
        });
        return;
      }

      // ── INITIAL HIDDEN STATE ───────────────────────────────────────────────
      gsap.set(cards, { opacity: 0, y: 50, scale: 0.88 });
      gsap.set(spotlight, { opacity: 0, x: spotlightTargetX(0) });
      gsap.set(note, { opacity: 0, y: 10 });
      gsap.set(badge, { opacity: 0, scale: 0.8 });
      barInners.forEach((el: Element) => gsap.set(el, { scaleX: 0 }));
      countEls.forEach((el: Element) => { (el as HTMLElement).textContent = "0"; });

      // ── INTRO ──────────────────────────────────────────────────────────────
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

      // cards land in staggered
      intro.to(cards, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1 }, 0);

      // bars count-up (staggered start to match cards)
      barInners.forEach((el: Element, i: number) => {
        const proxy = { v: 0 };
        const countEl = countEls[i] as HTMLElement;
        intro.to(
          proxy,
          {
            v: TOOLS[i].votes,
            duration: 0.9,
            ease: "power2.out",
            snap: { v: 1 },
            onUpdate() {
              countEl.textContent = String(Math.round(proxy.v));
            },
          },
          0.15 + i * 0.1
        );
        intro.to(
          el,
          {
            scaleX: TOOLS[i].votes / MAX_VOTES,
            duration: 0.9,
            ease: "power2.out",
            transformOrigin: "0% 50%",
          },
          0.15 + i * 0.1
        );
      });

      // note + badge appear
      intro.to(note, { opacity: 1, y: 0, duration: 0.4 }, 0.8);
      intro.to(badge, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.8)" }, 0.9);

      // ── SUSTAIN LOOPS ──────────────────────────────────────────────────────
      intro.add(() => {
        // spotlight sweep across all cards, repeat forever
        gsap.set(spotlight, { opacity: 0.92 });
        const spotTl = gsap.timeline({ repeat: -1 });
        TOOLS.forEach((_, i) => {
          spotTl.to(spotlight, {
            x: spotlightTargetX(i),
            duration: 0.55,
            ease: "power2.inOut",
          });
          spotTl.to({}, { duration: 0.75 }); // dwell
        });

        // cards breathe
        gsap.to(cards, {
          y: "-=6",
          duration: 2.8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: { each: 0.22, from: "start" },
        });

        // Claude accent card pulse
        const claudeCard = cards[0] as HTMLElement;
        gsap.to(claudeCard, {
          boxShadow:
            "0 0 0 2px rgba(0,113,227,.45), 0 30px 80px -26px rgba(0,113,227,.65)",
          scale: 1.03,
          duration: 1.5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });

        // live-tick: every ~2.2 s, bump a random non-claude tool by 1
        // (gives the "votes coming in" feel without state mutation)
        const tickProxies = TOOLS.map((t) => ({ v: t.votes }));
        const liveTick = () => {
          const candidates = [1, 2, 3, 4]; // skip claude (index 0)
          const pick = candidates[Math.floor(Math.random() * candidates.length)];
          const proxy = tickProxies[pick];
          const countEl = countEls[pick] as HTMLElement;
          const barEl = barInners[pick] as HTMLElement;
          proxy.v = Math.min(proxy.v + 1, MAX_VOTES - 1);
          gsap.to(proxy, {
            v: proxy.v,
            duration: 0.35,
            ease: "back.out(2)",
            snap: { v: 1 },
            onUpdate() { countEl.textContent = String(Math.round(proxy.v)); },
          });
          gsap.to(barEl, {
            scaleX: proxy.v / MAX_VOTES,
            duration: 0.4,
            ease: "back.out(1.5)",
            transformOrigin: "0% 50%",
          });
          // flash the count
          gsap.fromTo(
            countEl,
            { color: "var(--accent)", fontWeight: "900" },
            { color: "var(--muted)", fontWeight: "700", duration: 0.7, ease: "power2.out", delay: 0.05 }
          );
        };

        // schedule ticks via a repeating gsap timeline
        const tickTl = gsap.timeline({ repeat: -1 });
        tickTl.to({}, { duration: 2.2, onComplete: liveTick });

        // Claude bar also occasionally surges (it's #1)
        const claudeProxy = tickProxies[0];
        const claudeCount = countEls[0] as HTMLElement;
        const claudeBar = barInners[0] as HTMLElement;
        const claudeSurgeTl = gsap.timeline({ repeat: -1 });
        claudeSurgeTl.to({}, {
          duration: 4.5,
          onComplete() {
            claudeProxy.v = Math.min(claudeProxy.v + 2, MAX_VOTES);
            gsap.to(claudeProxy, {
              v: claudeProxy.v,
              duration: 0.5,
              ease: "back.out(2)",
              snap: { v: 1 },
              onUpdate() { claudeCount.textContent = String(Math.round(claudeProxy.v)); },
            });
            gsap.to(claudeBar, {
              scaleX: claudeProxy.v / MAX_VOTES,
              duration: 0.55,
              ease: "back.out(1.4)",
              transformOrigin: "0% 50%",
            });
          },
        });
      });
    }, root);

    return () => ctx.revert();
  }, [active]);

  return (
    <div
      ref={root}
      style={{
        position: "relative",
        width: "100%",
        minHeight: 420,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 16,
        paddingBottom: 8,
      }}
    >
      {/* Spotlight ring — positioned absolute, centre anchored by GSAP x */}
      <div
        className="s02-spotlight"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: CARD_W + 24,
          height: CARD_H + 24,
          borderRadius: 30,
          background: "rgba(0,113,227,0.06)",
          border: "2px solid rgba(0,113,227,0.38)",
          boxShadow:
            "0 0 0 1px rgba(0,113,227,0.12), 0 0 40px 12px rgba(0,113,227,0.10)",
          pointerEvents: "none",
          zIndex: 1,
          opacity: 0,
          // GSAP will set x/y
        }}
      />

      {/* Cards row */}
      <div
        style={{
          display: "flex",
          gap: GAP,
          alignItems: "flex-start",
          width: TOTAL_W,
          position: "relative",
          zIndex: 2,
        }}
      >
        {TOOLS.map((tool) => {
          const barPct = (tool.votes / MAX_VOTES) * 100;
          return (
            <div
              key={tool.id}
              className="s02-card"
              style={{
                width: CARD_W,
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0,
                position: "relative",
              }}
            >
              {/* Card body */}
              <div
                style={{
                  width: "100%",
                  height: CARD_H,
                  background: "linear-gradient(180deg,#ffffff 0%,#f7f8fb 100%)",
                  border: tool.accent
                    ? "2px solid var(--accent)"
                    : "1px solid var(--line)",
                  borderRadius: 26,
                  boxShadow: tool.accent
                    ? "var(--glow-accent), var(--shadow-md)"
                    : "var(--shadow-md)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                  padding: "24px 20px 20px",
                  position: "relative",
                }}
              >
                {/* #1 badge on Claude Code */}
                {tool.accent && (
                  <span
                    className="s02-badge"
                    style={{
                      position: "absolute",
                      top: -16,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "var(--accent)",
                      color: "#fff",
                      fontFamily: "var(--font-display,'Inter'),sans-serif",
                      fontWeight: 800,
                      fontSize: 20,
                      padding: "4px 16px",
                      borderRadius: 20,
                      whiteSpace: "nowrap",
                      boxShadow: "0 6px 18px -4px rgba(0,113,227,.55)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    #1
                  </span>
                )}

                {/* Brand logo */}
                <tool.Logo size={52} />

                {/* Tool name — ≥30px, weight 800 per spec */}
                <span
                  style={{
                    fontFamily: "var(--font-display,'Inter'),sans-serif",
                    fontWeight: 800,
                    fontSize: 30,
                    color: tool.accent ? "var(--accent)" : "var(--ink)",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                    textAlign: "center",
                  }}
                >
                  {tool.label}
                </span>

                {/* Vote count */}
                <span
                  className="s02-count"
                  style={{
                    fontFamily: "var(--font-display,'Inter'),sans-serif",
                    fontWeight: 700,
                    fontSize: 22,
                    color: "var(--muted)",
                    letterSpacing: "-0.01em",
                    fontVariantNumeric: "tabular-nums",
                    lineHeight: 1,
                  }}
                >
                  {tool.votes}
                </span>
              </div>

              {/* Vote bar below card */}
              <div
                style={{
                  marginTop: 14,
                  width: "100%",
                  height: 10,
                  background: "var(--line-soft)",
                  borderRadius: 6,
                  overflow: "hidden",
                }}
              >
                <div
                  className="s02-bar-inner"
                  style={{
                    height: "100%",
                    width: "100%",
                    background: tool.accent
                      ? "linear-gradient(90deg, var(--accent) 0%, var(--accent-700) 100%)"
                      : "linear-gradient(90deg, var(--muted) 0%, var(--ink-soft) 100%)",
                    borderRadius: 6,
                    transformOrigin: "0% 50%",
                    // scaleX set by GSAP
                    transform: `scaleX(${barPct / 100})`,
                  }}
                />
              </div>

              {/* "được dùng nhiều nhất" label under Claude Code */}
              {tool.accent && (
                <div
                  className="s02-note"
                  style={{
                    marginTop: 10,
                    fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
                    fontSize: 20,
                    color: "var(--accent)",
                    fontWeight: 700,
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    letterSpacing: "-0.01em",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      background: "var(--accent)",
                      flexShrink: 0,
                    }}
                  />
                  được dùng nhiều nhất
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
