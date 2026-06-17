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
    <div style={{ position:"fixed", inset:0, background:"#000", display:"grid", placeItems:"center", overflow:"hidden" }}>
      <div style={{ width:W, height:H, transform:`scale(${scale})`, transformOrigin:"center", background:"var(--bg)", position:"relative" }}>
        {children}
      </div>
    </div>
  );
}
