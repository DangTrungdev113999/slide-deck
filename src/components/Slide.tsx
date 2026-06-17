import { useEffect, useRef, ReactNode } from "react";
import gsap from "gsap";

interface SlideProps {
  kicker?: string;
  active: boolean;
  children: ReactNode;
}

export function Slide({ kicker, active, children }: SlideProps) {
  const ref = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!active || !ref.current) return;

    const els = ref.current.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!els.length) return;

    // Kill previous timeline
    tlRef.current?.kill();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(els, { opacity: 1, y: 0 });
      return;
    }

    const tl = gsap.timeline();
    tl.from(els, {
      opacity: 0,
      y: 24,
      duration: 0.5,
      stagger: 0.08,
      ease: "power2.out",
    });
    tlRef.current = tl;

    return () => {
      tl.kill();
    };
  }, [active]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        inset: 0,
        padding: "7% 8%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background: "var(--bg)",
      }}
    >
      {kicker && (
        <span
          style={{
            display: "block",
            fontSize: "0.75rem",
            fontFamily: "var(--font-display, 'Inter'), sans-serif",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--accent)",
            marginBottom: "1.25rem",
          }}
          data-reveal
        >
          {kicker}
        </span>
      )}
      {children}
    </div>
  );
}
