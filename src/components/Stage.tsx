import { useEffect, useState, ReactNode } from "react";
const W = 1920, H = 1080;
export function Stage({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / W, window.innerHeight / H));
    fit(); window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  return (
    <div style={{ position:"fixed", inset:0, background:"#000", overflow:"hidden" }}>
      {/* Center via absolute + translate(-50%,-50%): grid place-items:center
          does NOT reliably center a child larger than the viewport (it pins
          to top-left and the scaled canvas drifts to the bottom-right). The
          translate keeps the 1920x1080 box centered at any viewport size,
          then scale() shrinks it to fit, leaving symmetric letterbox bars. */}
      <div style={{ position:"absolute", top:"50%", left:"50%", width:W, height:H, transform:`translate(-50%, -50%) scale(${scale})`, transformOrigin:"center", background:"var(--bg)" }}>
        {children}
      </div>
    </div>
  );
}
