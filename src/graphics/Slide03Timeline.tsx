import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Slide03Timeline — horizontal timeline with 3 milestones.
 * Rail draws left→right, dots light up in sequence, "$1.000" counts up
 * from 0, then a comet pulse travels the rail forever on loop.
 *
 * StrictMode-safe: gsap.context + ctx.revert. No setInterval.
 */

const RAIL_Y = 60;
const START_X = 60;
const END_X = 1540;

type Milestone = {
  id: string;
  x: number;
  label: string;
  sub: string;
  hasMoney?: boolean;
  accent?: boolean;
};

const MILESTONES: Milestone[] = [
  {
    id: "cursor",
    x: 340,
    label: "Cursor",
    sub: "Có tháng đốt",
    hasMoney: true,
  },
  {
    id: "switch",
    x: 800,
    label: "Chuyển sang Claude Code",
    sub: "Bắt đầu tự build workflow",
    accent: true,
  },
  {
    id: "now",
    x: 1260,
    label: "Giờ",
    sub: "Dựng pipeline / workflow",
    accent: true,
  },
];

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
      const cards = q(".s03-card");
      const comet = q(".s03-comet")[0];
      const pulseRings = q(".s03-pulse");

      if (reduced) {
        gsap.set(railFg, { strokeDashoffset: 0 });
        gsap.set(dots, { opacity: 1, scale: 1 });
        gsap.set(cards, { opacity: 1, y: 0 });
        if (moneyRef.current) moneyRef.current.textContent = "1.000";
        gsap.set(comet, { opacity: 0.8 });
        return;
      }

      const railLen = railFg.getTotalLength();
      gsap.set(railFg, { strokeDasharray: railLen, strokeDashoffset: railLen });
      gsap.set(dots, { opacity: 0, scale: 0, transformOrigin: "50% 50%" });
      gsap.set(cards, { opacity: 0, y: 24 });
      gsap.set(comet, { opacity: 0 });

      const moneyObj = { val: 0 };

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

      // rail draws on
      intro.to(railFg, { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut" }, 0);

      // dots + cards pop per milestone
      MILESTONES.forEach((m, i) => {
        const pct = (m.x - START_X) / (END_X - START_X);
        const t = pct * 1.4 + 0.1;
        intro.to(dots[i], { opacity: 1, scale: 1, duration: 0.38, ease: "back.out(2)" }, t);
        intro.to(cards[i], { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, t + 0.1);
      });

      // money count-up (starts when first dot pops)
      const t0 = (MILESTONES[0].x - START_X) / (END_X - START_X) * 1.4 + 0.1;
      intro.to(
        moneyObj,
        {
          val: 1000,
          duration: 1.2,
          ease: "power2.out",
          snap: { val: 1 },
          onUpdate() {
            if (moneyRef.current) {
              const n = Math.round(moneyObj.val);
              // Vietnamese thousands: dot separator
              moneyRef.current.textContent = n >= 1000 ? "1.000" : String(n);
            }
          },
        },
        t0 + 0.1
      );

      // comet rail pulse loop after intro
      intro.add(() => {
        gsap.set(comet, { opacity: 1 });
        gsap.fromTo(
          comet,
          { x: START_X, y: RAIL_Y },
          { x: END_X, duration: 3.0, ease: "none", repeat: -1 }
        );

        // pulse rings on each milestone on comet pass
        MILESTONES.forEach((m, i) => {
          const frac = (m.x - START_X) / (END_X - START_X);
          gsap.to(pulseRings[i], {
            keyframes: [
              { opacity: 0, scale: 0.7, duration: 0 },
              { opacity: 0.85, scale: 1, duration: 0.3, ease: "power2.out" },
              { opacity: 0, scale: 1.25, duration: 0.7, ease: "power2.in" },
            ],
            repeat: -1,
            repeatDelay: 3.0 - 1.0,
            delay: frac * 3.0,
          });
        });

        // cards breathe
        gsap.to(cards, {
          y: "-=4",
          duration: 2.6,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: { each: 0.22 },
        });
      });
    }, root);

    return () => ctx.revert();
  }, [active]);

  const W = 1600;
  const H = 320;

  return (
    <div
      ref={root}
      style={{ position: "relative", width: W, height: H, margin: "0 auto" }}
    >
      {/* SVG rail + comet */}
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
            <stop offset="0.4" stopColor="var(--accent)" />
            <stop offset="1" stopColor="var(--accent-700)" />
          </linearGradient>
          <radialGradient id="s03-comet-grad">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.4" stopColor="#3a9bff" />
            <stop offset="1" stopColor="rgba(0,113,227,0)" />
          </radialGradient>
          <filter id="s03-comet-blur" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        {/* faint bg rail */}
        <line x1={START_X} y1={RAIL_Y} x2={END_X} y2={RAIL_Y} stroke="var(--line)" strokeWidth={3} strokeLinecap="round" />
        {/* colored rail (draws on) */}
        <path
          className="s03-rail-fg"
          d={`M ${START_X} ${RAIL_Y} L ${END_X} ${RAIL_Y}`}
          fill="none"
          stroke="url(#s03-rail-grad)"
          strokeWidth={4}
          strokeLinecap="round"
        />

        {/* pulse rings per milestone */}
        {MILESTONES.map((m) => (
          <circle
            key={m.id}
            className="s03-pulse"
            cx={m.x}
            cy={RAIL_Y}
            r={56}
            fill="rgba(0,113,227,0.12)"
            stroke="rgba(0,113,227,0.35)"
            strokeWidth={1.5}
          />
        ))}

        {/* milestone dots */}
        {MILESTONES.map((m) => (
          <g key={m.id} className="s03-dot">
            <circle cx={m.x} cy={RAIL_Y} r={12} fill="white" stroke="var(--accent)" strokeWidth={3} />
            <circle cx={m.x} cy={RAIL_Y} r={5} fill="var(--accent)" />
          </g>
        ))}

        {/* comet */}
        <g className="s03-comet">
          <circle r={22} fill="url(#s03-comet-grad)" filter="url(#s03-comet-blur)" />
          <circle r={6} fill="#fff" />
        </g>
      </svg>

      {/* Milestone cards above/below rail alternating */}
      {MILESTONES.map((m, i) => {
        const above = i % 2 === 0;
        return (
          <div
            key={m.id}
            className="s03-card"
            style={{
              position: "absolute",
              left: m.x - 150,
              top: above ? RAIL_Y - 200 : RAIL_Y + 30,
              width: 300,
              background: "linear-gradient(180deg,#ffffff,#f7f8fb)",
              border: m.accent ? "1.5px solid var(--accent)" : "1px solid var(--line)",
              borderRadius: 20,
              boxShadow: m.accent ? "var(--glow-accent),var(--shadow-md)" : "var(--shadow-md)",
              padding: "22px 24px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display,'Inter'),sans-serif",
                fontWeight: 800,
                fontSize: 22,
                color: m.accent ? "var(--accent)" : "var(--ink)",
                letterSpacing: "-0.01em",
                marginBottom: 6,
              }}
            >
              {m.label}
            </div>
            <div
              style={{
                fontFamily: "var(--font-body,'Be Vietnam Pro'),sans-serif",
                fontSize: 16,
                color: "var(--muted)",
                lineHeight: 1.4,
              }}
            >
              {m.hasMoney ? (
                <>
                  {m.sub}{" "}
                  <span
                    style={{
                      fontFamily: "var(--font-display,'Inter'),sans-serif",
                      fontWeight: 800,
                      fontSize: 22,
                      color: "var(--danger)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    ~$<span ref={moneyRef}>0</span>
                  </span>
                </>
              ) : (
                m.sub
              )}
            </div>

            {/* connector line to dot */}
            <svg
              style={{
                position: "absolute",
                left: "50%",
                [above ? "bottom" : "top"]: -40,
                transform: "translateX(-50%)",
                overflow: "visible",
              }}
              width={2}
              height={40}
              aria-hidden
            >
              <line x1={1} y1={above ? 40 : 0} x2={1} y2={above ? 0 : 40} stroke="var(--line)" strokeWidth={2} strokeDasharray="4 3" />
            </svg>
          </div>
        );
      })}
    </div>
  );
}
