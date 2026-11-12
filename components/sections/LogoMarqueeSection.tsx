export function LogoMarqueeSection() {
  const logos = [
    { name: "Apex Editorial", mark: "APEX" },
    { name: "Vanguard Studio", mark: "VANGUARD" },
    { name: "Nordic Wave", mark: "NORDIC" },
    { name: "Crest Media", mark: "CREST" },
    { name: "Kinetix Growth", mark: "KINETIX" },
    { name: "Sovereign Digital", mark: "SOVEREIGN" },
  ];

  return (
    <section
      aria-labelledby="landing-logo-marquee-heading"
      className="-mx-6 border-y border-stone-200/70 bg-stone-50/40 py-8 select-none"
    >
      <h2
        id="landing-logo-marquee-heading"
        className="px-6 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-stone-500"
      >
        Trusted by Marketing Teams around the world
      </h2>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 px-6 opacity-60 grayscale transition-opacity hover:opacity-80">
        {logos.map((logo) => (
          <div
            key={logo.name}
            className="flex items-center gap-1.5 font-serif text-sm tracking-wider font-semibold text-stone-700"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-stone-400" />
            <span>{logo.mark}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

