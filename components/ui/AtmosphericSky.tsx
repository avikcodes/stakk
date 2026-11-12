export function AtmosphericSky() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Soft sky base tint */}
      <div className="absolute inset-0 bg-[#f4f7fb]" />

      {/* Atmospheric radial sky-glow and cloud mist */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,rgba(186,215,242,0.65),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_15%_25%,rgba(224,242,254,0.6),transparent_65%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_45%_at_85%_20%,rgba(219,234,254,0.55),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_80%,rgba(245,243,238,0.7),transparent_70%)]" />

      {/* Subtle organic cloud-horizon SVG contours for depth */}
      <svg
        viewBox="0 0 1440 800"
        fill="none"
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-0 h-[650px] w-full text-white/40"
      >
        <path
          d="M-100 220C120 160 280 260 520 200C760 140 980 230 1200 180C1380 140 1500 200 1600 170V0H-100V220Z"
          fill="currentColor"
        />
        <path
          d="M-50 320C180 260 360 360 620 290C880 220 1100 310 1320 250C1480 210 1560 270 1650 240V0H-50V320Z"
          fill="currentColor"
          fillOpacity="0.5"
        />
      </svg>
    </div>
  );
}

