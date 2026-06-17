import { useEffect, useRef } from "react";
import gsap from "gsap";

const W = 1560;
const H = 380;

// LEFT: Skill zone — rule cards stacking into package
const SKILL_W = 700;
// RIGHT: Hook zone — push token → gate
// starts at x=860

export function Slide09SkillHook({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !root.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context((self) => {
      const q = (s: string) => self.selector!(s);

      // ---- SKILL side ----
      const cards = q(".sk-card");
      const pkg = q(".sk-pkg")[0] as HTMLElement;
      const pkgLabel = q(".sk-pkg-label")[0] as HTMLElement;

      // ---- HOOK side ----
      const pushToken = q(".hk-token")[0] as HTMLElement;
      const gate = q(".hk-gate")[0] as SVGRectElement;
      const gateFlash = q(".hk-gate-flash")[0] as SVGRectElement;
      const blockX = q(".hk-block-x")[0] as HTMLElement;

      if (reduced) {
        gsap.set(cards, { opacity: 1, y: 0, x: 0 });
        gsap.set([pkg, pkgLabel], { opacity: 1, scale: 1 });
        gsap.set(pushToken, { opacity: 1, x: 0 });
        gsap.set(gate, { opacity: 1 });
        gsap.set(blockX, { opacity: 1 });
        return;
      }

      // Initial state
      gsap.set(cards, { opacity: 0, y: -30, x: 0 });
      gsap.set(pkg, { opacity: 0, scale: 0.7, transformOrigin: "50% 50%" });
      gsap.set(pkgLabel, { opacity: 0 });
      gsap.set(pushToken, { x: 0, opacity: 1 });
      gsap.set(gateFlash, { opacity: 0 });
      gsap.set(blockX, { opacity: 0 });

      // ---- SKILL intro + loop ----
      function runSkillLoop() {
        const tl = gsap.timeline({ onComplete: runSkillLoop });
        // Cards drop in one by one
        tl.to(cards[0], { opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.4)" }, 0)
          .to(cards[1], { opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.4)" }, 0.25)
          .to(cards[2], { opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.4)" }, 0.5)
          // Cards fly toward package
          .to(cards, {
            x: 0, y: 20, opacity: 0, scale: 0.4,
            duration: 0.45, ease: "power2.in", stagger: 0.1,
            transformOrigin: "50% 50%",
          }, 1.1)
          // Package appears
          .to(pkg, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.7)" }, 1.55)
          .to(pkgLabel, { opacity: 1, duration: 0.3 }, 1.8)
          // Package pulses
          .to(pkg, { scale: 1.07, duration: 0.35, ease: "sine.inOut", yoyo: true, repeat: 1 }, 2.1)
          // Reset for next loop
          .set(cards, { opacity: 0, y: -30, x: 0, scale: 1 }, 3.2)
          .set([pkg, pkgLabel], { opacity: 0, scale: 0.7 }, 3.2);
      }

      // ---- HOOK intro + loop ----
      // Token starts left of gate, gate is ~170px from token start
      function runHookLoop() {
        const tl = gsap.timeline({ onComplete: runHookLoop });
        tl
          // token moves right toward gate
          .to(pushToken, { x: 150, duration: 0.6, ease: "power2.in" }, 0)
          // gate flashes danger
          .to(gateFlash, { opacity: 1, duration: 0.1 }, 0.55)
          .to(gateFlash, { opacity: 0, duration: 0.2 }, 0.75)
          .to(gateFlash, { opacity: 0.85, duration: 0.08 }, 1.0)
          .to(gateFlash, { opacity: 0, duration: 0.25 }, 1.1)
          // block X appears
          .to(blockX, { opacity: 1, scale: 1, duration: 0.2, ease: "back.out(2)", transformOrigin: "50% 50%" }, 0.55)
          // token bounces back
          .to(pushToken, { x: -20, duration: 0.35, ease: "back.out(2)" }, 0.7)
          .to(pushToken, { x: 0, duration: 0.35, ease: "power2.out" }, 1.05)
          // block X fades
          .to(blockX, { opacity: 0, duration: 0.3 }, 1.0)
          // pause before repeat
          .to({}, { duration: 0.9 });
      }

      // Start both loops with slight offset
      const initTl = gsap.timeline();
      initTl.add(() => runSkillLoop(), 0.2);
      initTl.add(() => runHookLoop(), 0.5);
    }, root);

    return () => ctx.revert();
  }, [active]);

  const CARD_TOPS = [60, 130, 200];
  const CARD_LABELS = ["rule 1", "rule 2", "rule 3"];

  return (
    <div ref={root} style={{ position: "relative", width: W, height: H, margin: "0 auto" }}>

      {/* ===== LEFT: SKILL graphic ===== */}
      <svg viewBox={`0 0 ${SKILL_W} ${H}`} width={SKILL_W} height={H}
        style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} aria-hidden>
        <defs>
          <linearGradient id="pkg-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(0,113,227,.15)" />
            <stop offset="1" stopColor="rgba(0,113,227,.04)" />
          </linearGradient>
        </defs>
        {/* Connector lines card → box */}
        {CARD_TOPS.map((t, i) => (
          <line key={i} x1={200} y1={t + 22} x2={430} y2={195}
            stroke="var(--line)" strokeWidth={1.5} strokeDasharray="5 4" opacity={0.5} />
        ))}
      </svg>

      {/* Rule cards */}
      {CARD_LABELS.map((label, i) => (
        <div key={i} className="sk-card" style={{
          position: "absolute",
          left: 30,
          top: CARD_TOPS[i],
          width: 160,
          height: 44,
          background: "linear-gradient(180deg,#fff,#f5f7fb)",
          border: "1px solid var(--line)",
          borderRadius: 12,
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 14px",
        }}>
          <span style={{
            width: 26, height: 26, borderRadius: 8, background: "var(--accent)",
            color: "#fff", fontFamily: "var(--font-display,'Inter'),sans-serif",
            fontWeight: 800, fontSize: 12, display: "grid", placeItems: "center",
          }}>{i + 1}</span>
          <span style={{
            fontFamily: "var(--font-display,'Inter'),sans-serif",
            fontWeight: 700, fontSize: 16, color: "var(--ink-soft)",
          }}>{label}</span>
        </div>
      ))}

      {/* Package box */}
      <div className="sk-pkg" style={{
        position: "absolute",
        left: 400,
        top: 138,
        width: 210,
        height: 110,
        background: "linear-gradient(160deg,rgba(0,113,227,.12),rgba(0,88,176,.06))",
        border: "2px solid rgba(0,113,227,.35)",
        borderRadius: 22,
        boxShadow: "0 8px 40px -12px rgba(0,113,227,.28)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
      }}>
        {/* Box icon */}
        <svg width={36} height={36} viewBox="0 0 36 36" aria-hidden>
          <rect x={4} y={12} width={28} height={20} rx={5} fill="var(--accent)" opacity={0.18} stroke="var(--accent)" strokeWidth={1.5} />
          <rect x={4} y={12} width={28} height={7} rx={3} fill="var(--accent)" opacity={0.25} />
          <line x1={18} y1={12} x2={18} y2={32} stroke="var(--accent)" strokeWidth={1.5} />
          <path d="M8 6 L18 10 L28 6" stroke="var(--accent)" strokeWidth={1.5} fill="none" />
        </svg>
        <span className="sk-pkg-label" style={{
          fontFamily: "var(--font-display,'Inter'),sans-serif",
          fontWeight: 800, fontSize: 20, color: "var(--accent)", letterSpacing: "-0.01em",
        }}>skill</span>
      </div>

      {/* ===== RIGHT: HOOK graphic ===== */}
      <div style={{ position: "absolute", left: SKILL_W + 60, top: 0, width: W - SKILL_W - 60, height: H }}>
        <svg viewBox="0 0 700 380" width="700" height="380"
          style={{ position: "absolute", inset: 0, overflow: "visible" }} aria-hidden>
          <defs>
            <linearGradient id="gate-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--danger)" stopOpacity={0.9} />
              <stop offset="1" stopColor="#c0001a" stopOpacity={0.7} />
            </linearGradient>
            <filter id="gate-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="8" />
            </filter>
          </defs>

          {/* Rail track */}
          <line x1={60} y1={195} x2={480} y2={195}
            stroke="var(--line)" strokeWidth={3} strokeLinecap="round" />

          {/* Gate glow (flash) */}
          <rect className="hk-gate-flash" x={435} y={100} width={18} height={190} rx={6}
            fill="var(--danger)" filter="url(#gate-glow)" opacity={0} />

          {/* Gate bar (solid) */}
          <rect className="hk-gate" x={440} y={115} width={10} height={160} rx={4}
            fill="url(#gate-grad)" stroke="var(--danger)" strokeWidth={1} opacity={0.9} />

          {/* Gate label */}
          <text x={445} y={95} textAnchor="middle"
            fontFamily="var(--font-display,'Inter'),sans-serif"
            fontWeight={700} fontSize={18} fill="var(--danger)" letterSpacing="0.06em">
            GATE
          </text>

          {/* Danger triangles on gate */}
          <path d="M432 145 L445 122 L458 145 Z" fill="var(--danger)" opacity={0.7} />
          <path d="M432 200 L445 177 L458 200 Z" fill="var(--danger)" opacity={0.7} />
          <path d="M432 255 L445 232 L458 255 Z" fill="var(--danger)" opacity={0.7} />
        </svg>

        {/* Push token */}
        <div className="hk-token" style={{
          position: "absolute",
          left: 60,
          top: 165,
          width: 120,
          height: 60,
          background: "linear-gradient(135deg,#1c2a3a,#223344)",
          borderRadius: 14,
          boxShadow: "var(--shadow-md)",
          border: "1.5px solid rgba(255,255,255,.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}>
          <svg width={20} height={20} viewBox="0 0 20 20" aria-hidden>
            <circle cx={10} cy={10} r={9} fill="none" stroke="#4a9eff" strokeWidth={1.5} />
            <path d="M10 5 L10 13 M7 10 L10 13 L13 10" stroke="#4a9eff" strokeWidth={1.5} fill="none" />
          </svg>
          <span style={{
            fontFamily: "ui-monospace,'SF Mono',Menlo,monospace",
            fontWeight: 700, fontSize: 15, color: "#a8c8f0", letterSpacing: "0.02em",
          }}>git push</span>
        </div>

        {/* Block X */}
        <div className="hk-block-x" style={{
          position: "absolute",
          left: 185,
          top: 140,
          width: 40,
          height: 40,
          background: "var(--danger)",
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 20px rgba(255,59,48,.6)",
          opacity: 0,
        }}>
          <svg width={22} height={22} viewBox="0 0 22 22" aria-hidden>
            <line x1={5} y1={5} x2={17} y2={17} stroke="#fff" strokeWidth={2.5} strokeLinecap="round" />
            <line x1={17} y1={5} x2={5} y2={17} stroke="#fff" strokeWidth={2.5} strokeLinecap="round" />
          </svg>
        </div>
      </div>

    </div>
  );
}
