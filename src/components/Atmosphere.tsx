/**
 * Atmosphere — the shared background for every slide.
 * Keynote-light but with real depth: a fine dot grid, two soft accent
 * gradient-mesh blooms, and a faint grain overlay. All purely decorative
 * (aria-hidden), absolutely filling the 1920x1080 canvas behind content.
 */
export function Atmosphere() {
  return (
    <div
      aria-hidden
      style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}
    >
      {/* base wash — barely-there cool top, warm bottom */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, #ffffff 0%, #fbfcfe 55%, #f7f8fb 100%)",
        }}
      />
      {/* accent bloom top-right */}
      <div
        style={{
          position: "absolute",
          top: "-18%",
          right: "-10%",
          width: 1100,
          height: 1100,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at center, rgba(0,113,227,.14), rgba(0,113,227,0) 62%)",
          filter: "blur(8px)",
        }}
      />
      {/* secondary cool bloom bottom-left */}
      <div
        style={{
          position: "absolute",
          bottom: "-22%",
          left: "-12%",
          width: 980,
          height: 980,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at center, rgba(10,132,255,.08), rgba(10,132,255,0) 64%)",
          filter: "blur(8px)",
        }}
      />
      {/* fine dot grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(rgba(20,30,60,.06) 1.4px, transparent 1.4px)",
          backgroundSize: "44px 44px",
          backgroundPosition: "center",
          maskImage:
            "radial-gradient(ellipse 90% 80% at 50% 45%, #000 55%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 80% at 50% 45%, #000 55%, transparent 100%)",
        }}
      />
      {/* grain */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.035, mixBlendMode: "multiply" }}
      >
        <filter id="atmo-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#atmo-grain)" />
      </svg>
    </div>
  );
}
