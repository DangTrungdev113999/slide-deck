import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Slide03Timeline — rich "evolution timeline" for Slide 03.
 *
 * Three eras: Cursor (past / pain) → Claude Code (pivot) → Giờ (now/future).
 * The rail slopes upward left→right to encode progression.
 * A comet travels the rail forever; each node glows as the comet passes.
 * The $1.000 count-up lives in the Cursor card.
 *
 * StrictMode-safe: gsap.context + ctx.revert. No setInterval.
 * Reduced-motion: everything set to final visible state, comet parked at end.
 */

const W = 1600;
const H = 580;

// Rail end-points — slopes upward so Giờ sits higher than Cursor (= evolution)
const START_X = 80;
const START_Y = 430;
const END_X = 1520;
const END_Y = 200;

// Milestone positions along the slope (lerped)
function lerpPt(t: number) {
  return {
    x: START_X + t * (END_X - START_X),
    y: START_Y + t * (END_Y - START_Y),
  };
}

type Milestone = {
  id: string;
  t: number; // 0→1 along the rail
  label: string;
  sub: string;
  hasMoney?: boolean;
  accent?: boolean;
  era: "past" | "pivot" | "now";
};

const MILESTONES: Milestone[] = [
  {
    id: "cursor",
    t: 0.18,
    label: "Cursor",
    sub: "Có tháng đốt",
    hasMoney: true,
    era: "past",
  },
  {
    id: "switch",
    t: 0.55,
    label: "Claude Code",
    sub: "Bắt đầu tự build workflow",
    accent: true,
    era: "pivot",
  },
  {
    id: "now",
    t: 0.88,
    label: "Giờ",
    sub: "Pipeline tự động · đỡ tốn não",
    accent: true,
    era: "now",
  },
];

// For each milestone, compute SVG coords
const MIL_PTS = MILESTONES.map((m) => ({ ...m, ...lerpPt(m.t) }));

// Loop duration (comet traversal time)
const LOOP = 3.2;

// Era colors (all in-system tokens)
const ERA_COLOR: Record<string, string> = {
  past: "var(--muted)",
  pivot: "var(--accent)",
  now: "var(--accent-700)",
};

const ERA_DOT_FILL: Record<string, string> = {
  past: "#6e6e73",
  pivot: "#0071e3",
  now: "#0058b0",
};

export function Slide03Timeline({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const moneyRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!active || !root.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context((self) => {
      const q = (s: string) => self.selector!(s);
      const railFg = q(".s03-rail-fg")[0] as SVGPathElement;
      const dots = q(".s03-dot");
      const connectors = q(".s03-connector");
      const cards = q(".s03-card");
      const comet = q(".s03-comet")[0];
      const pulseRings = q(".s03-pulse");
      const eraLabels = q(".s03-era-label");

      if (reduced) {
        gsap.set(railFg, { strokeDashoffset: 0 });
        gsap.set([...dots, ...cards, ...eraLabels, ...connectors], { opacity: 1, y: 0, scale: 1 });
        // park comet at the end, visible
        gsap.set(comet, { opacity: 0.85, x: END_X, y: END_Y });
        if (moneyRef.current) moneyRef.current.textContent = "1.000";
        return;
      }

      const railLen = railFg.getTotalLength();
      gsap.set(railFg, { strokeDasharray: railLen, strokeDashoffset: railLen });
      gsap.set(dots, { opacity: 0, scale: 0, transformOrigin: "50% 50%" });
      gsap.set(cards, { opacity: 0, y: 28 });
      gsap.set(connectors, { opacity: 0 });
      gsap.set(eraLabels, { opacity: 0, y: 10 });
      gsap.set(comet, { opacity: 0, x: START_X, y: START_Y });

      const moneyObj = { val: 0 };

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Rail draws on along the slope
      intro.to(railFg, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" }, 0);

      // Dots + cards + connectors pop per milestone as rail reaches them
      MIL_PTS.forEach((m, i) => {
        const t = m.t * 1.6 + 0.1;
        intro.to(dots[i], { opacity: 1, scale: 1, duration: 0.38, ease: "back.out(2)" }, t);
        intro.to(connectors[i], { opacity: 1, duration: 0.3 }, t + 0.05);
        intro.to(cards[i], { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, t + 0.12);
        intro.to(eraLabels[i], { opacity: 1, y: 0, duration: 0.4 }, t + 0.2);
      });

      // $1.000 count-up starts when Cursor dot pops
      const t0 = MIL_PTS[0].t * 1.6 + 0.22;
      intro.to(
        moneyObj,
        {
          val: 1000,
          duration: 1.3,
          ease: "power2.out",
          snap: { val: 1 },
          onUpdate() {
            if (moneyRef.current) {
              const n = Math.round(moneyObj.val);
              moneyRef.current.textContent = n >= 1000 ? "1.000" : String(n);
            }
          },
        },
        t0
      );

      // Sustain: comet + pulses + breathe
      intro.add(() => {
        gsap.set(comet, { opacity: 1 });
        gsap.fromTo(
          comet,
          { x: START_X, y: START_Y },
          {
            x: END_X,
            y: END_Y,
            duration: LOOP,
            ease: "none",
            repeat: -1,
          }
        );

        // Glow rings fire as comet passes each node
        MIL_PTS.forEach((m, i) => {
          gsap.to(pulseRings[i], {
            keyframes: [
              { opacity: 0, scale: 0.7, duration: 0 },
              { opacity: 0.85, scale: 1, duration: 0.32, ease: "power2.out" },
              { opacity: 0, scale: 1.3, duration: 0.75, ease: "power2.in" },
            ],
            repeat: -1,
            repeatDelay: LOOP - 1.07,
            delay: m.t * LOOP,
          });
        });

        // Cards breathe
        gsap.to(cards, {
          y: "-=5",
          duration: 2.8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: { each: 0.25, from: "start" },
        });

        // "Giờ" card subtle accent glow pulse
        const nowCard = q(".s03-card-now")[0];
        if (nowCard) {
          gsap.to(nowCard, {
            boxShadow:
              "0 0 0 1px rgba(0,113,227,.38), 0 30px 70px -22px rgba(0,113,227,.7)",
            scale: 1.03,
            duration: 1.4,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            transformOrigin: "50% 50%",
          });
        }
      });
    }, root);

    return () => ctx.revert();
  }, [active]);

  // Pre-compute card positions: Cursor above dot, Claude Code below, Giờ above dot
  const CARD_W = 310;
  const CARD_H_BASE = 155;

  return (
    <div ref={root} style={{ position: "relative", width: W, height: H, margin: "0 auto" }}>
      {/* SVG layer: rail track + comet + pulse rings + dots */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
        aria-hidden
      >
        <defs>
          <linearGradient id="s03-rail-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#d2d2d7" />
            <stop offset="0.38" stopColor="#9cc6f5" />
            <stop offset="0.65" stopColor="#0071e3" />
            <stop offset="1" stopColor="#0058b0" />
          </linearGradient>
          <radialGradient id="s03-comet-grad">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.35" stopColor="#3a9bff" />
            <stop offset="1" stopColor="rgba(0,113,227,0)" />
          </radialGradient>
          <filter id="s03-comet-blur" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id="s03-dot-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Faint background rail */}
        <line
          x1={START_X}
          y1={START_Y}
          x2={END_X}
          y2={END_Y}
          stroke="var(--line)"
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Gradient rail (draws on) */}
        <path
          className="s03-rail-fg"
          d={`M ${START_X} ${START_Y} L ${END_X} ${END_Y}`}
          fill="none"
          stroke="url(#s03-rail-grad)"
          strokeWidth={5}
          strokeLinecap="round"
        />

        {/* Pulse rings per milestone */}
        {MIL_PTS.map((m) => (
          <circle
            key={m.id}
            className="s03-pulse"
            cx={m.x}
            cy={m.y}
            r={62}
            fill={
              m.era === "past"
                ? "rgba(110,110,115,0.1)"
                : "rgba(0,113,227,0.12)"
            }
            stroke={
              m.era === "past"
                ? "rgba(110,110,115,0.3)"
                : "rgba(0,113,227,0.38)"
            }
            strokeWidth={1.5}
          />
        ))}

        {/* Milestone dots */}
        {MIL_PTS.map((m) => (
          <g key={m.id} className="s03-dot" filter="url(#s03-dot-glow)">
            <circle
              cx={m.x}
              cy={m.y}
              r={16}
              fill="white"
              stroke={ERA_DOT_FILL[m.era]}
              strokeWidth={3.5}
            />
            <circle cx={m.x} cy={m.y} r={7} fill={ERA_DOT_FILL[m.era]} />
          </g>
        ))}

        {/* Comet (positioned by GSAP x/y) */}
        <g className="s03-comet">
          <circle r={28} fill="url(#s03-comet-grad)" filter="url(#s03-comet-blur)" />
          <circle r={7} fill="#fff" />
          <circle r={7} fill="none" stroke="#0071e3" strokeWidth={2} opacity={0.55} />
        </g>
      </svg>

      {/* Era phase label strip along top of rail (above dots) */}
      {MIL_PTS.map((m, i) => {
        // cursor (i=0): above dot (avoids bottom overflow)
        // switch (i=1): below dot
        // now (i=2): above dot (plenty of room, dot at y≈228)
        const above = i !== 1;
        const CARD_H = m.hasMoney ? 195 : CARD_H_BASE;
        const cardLeft = Math.min(Math.max(m.x - CARD_W / 2, 0), W - CARD_W);
        const cardTop = above
          ? m.y - CARD_H - 28 // above the dot
          : m.y + 28; // below the dot

        const isNow = m.era === "now";

        return (
          <div key={m.id}>
            {/* Connector dashed line */}
            <svg
              className="s03-connector"
              style={{
                position: "absolute",
                left: m.x - 1,
                top: above ? cardTop + CARD_H : m.y + 14,
                overflow: "visible",
                pointerEvents: "none",
              }}
              width={2}
              height={28}
              aria-hidden
            >
              <line
                x1={1}
                y1={0}
                x2={1}
                y2={28}
                stroke={ERA_DOT_FILL[m.era]}
                strokeWidth={2}
                strokeDasharray="4 3"
                opacity={0.5}
              />
            </svg>

            {/* Era label chip above the card */}
            <div
              className="s03-era-label"
              style={{
                position: "absolute",
                left: cardLeft,
                top: above
                  ? cardTop - 36
                  : cardTop + CARD_H + 12,
                width: CARD_W,
                textAlign: "center",
                fontFamily: "var(--font-display,'Inter'),sans-serif",
                fontWeight: 700,
                fontSize: 20,
                letterSpacing: "0.06em",
                textTransform: "uppercase" as const,
                color: ERA_COLOR[m.era],
                opacity: 0.7,
              }}
            >
              {m.era === "past" ? "2024 — Trước" : m.era === "pivot" ? "Điểm chuyển" : "Bây giờ"}
            </div>

            {/* Milestone card */}
            <div
              className={`s03-card${isNow ? " s03-card-now" : ""}`}
              style={{
                position: "absolute",
                left: cardLeft,
                top: cardTop,
                width: CARD_W,
                height: CARD_H,
                background: "linear-gradient(160deg,#ffffff 0%,#f7f8fb 100%)",
                border: m.accent
                  ? "2px solid var(--accent)"
                  : "1.5px solid var(--line)",
                borderRadius: 22,
                boxShadow: m.accent
                  ? "var(--glow-accent), var(--shadow-md)"
                  : "var(--shadow-md)",
                padding: "24px 28px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {/* Tool / era name */}
              <div
                style={{
                  fontFamily: "var(--font-display,'Inter'),sans-serif",
                  fontWeight: 800,
                  fontSize: 32,
                  letterSpacing: "-0.02em",
                  color: ERA_COLOR[m.era],
                  lineHeight: 1.1,
                }}
              >
                {m.label}
              </div>

              {/* Sub-text */}
              <div
                style={{
                  fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
                  fontSize: 20,
                  color: "var(--ink-soft)",
                  lineHeight: 1.4,
                }}
              >
                {m.hasMoney ? (
                  <>
                    {m.sub}{" "}
                    <span
                      style={{
                        display: "inline-block",
                        fontFamily: "var(--font-display,'Inter'),sans-serif",
                        fontWeight: 800,
                        fontSize: 42,
                        color: "var(--danger)",
                        fontVariantNumeric: "tabular-nums",
                        letterSpacing: "-0.02em",
                        lineHeight: 1,
                        marginTop: 8,
                      }}
                    >
                      ~$<span ref={moneyRef}>0</span>
                    </span>
                  </>
                ) : (
                  m.sub
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Direction arrow / "evolution" callout at far right */}
      <svg
        style={{ position: "absolute", left: END_X - 40, top: END_Y - 60, overflow: "visible" }}
        width={60}
        height={60}
        aria-hidden
      >
        <circle cx={30} cy={30} r={28} fill="var(--accent)" opacity={0.1} />
        <path
          d="M 14 30 L 30 14 L 46 30 M 30 14 L 30 46"
          fill="none"
          stroke="var(--accent)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.7}
        />
      </svg>
    </div>
  );
}
