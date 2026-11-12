import Link from "next/link";

export function PhilosophySection() {
  const articles = [
    {
      eyebrow: "Your voice",
      title: "Sounds like you. Not like AI.",
      p1: "Most AI writers produce identical prose for every company: the same generic introductions, the same interchangeable claims, and a tone nobody recognizes.",
      p2: "Stak generates drafts strictly from your TONE.md. It avoids robotic filler phrases and adopts your actual sentence rhythm, technical cadence, and brand vocabulary.",
    },
    {
      eyebrow: "Company context",
      title: "It reads the company first.",
      p1: "Before drafting, Stak indexes your site into COMPANY.md and project knowledge. It captures your true value proposition, product architecture, and customer proof.",
      p2: "Project knowledge holds what is not on the public site: internal benchmarks, customer case studies, and engineering constraints that only you know.",
    },
    {
      eyebrow: "Human in the loop",
      title: "It asks before it guesses.",
      p1: "The workflow stops for you. It requests approval on the editorial angle, fact anchors, and key arguments before producing the draft, plus one round of refinement if needed.",
      p2: "There is no 'Generate 100 Articles at once' button. That button is how the web filled up with spam. Stak focuses on intentional, defensible articles.",
    },
    {
      eyebrow: "Quality, not volume",
      title: "Start with a thought. Never raw volume.",
      p1: "Search engines and AI answer engines do not reward undifferentiated volume. They reward authoritative answers that contain original insight.",
      p2: "By combining multi-agent research with strict brand context, every article earned in Stak has a deliberate thesis and a clear reason to exist.",
    },
  ];

  return (
    <div className="flex flex-col">
      <div className="-mx-6 h-px bg-stone-200/80" />
      <section
        aria-labelledby="landing-philosophy-heading"
        className="py-14 sm:py-18"
      >
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between sm:gap-12">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-stone-500 font-medium">
              Philosophy
            </p>
            <h2
              id="landing-philosophy-heading"
              className="mt-3 font-serif text-3xl sm:text-4xl font-normal leading-[1.15] tracking-[-0.015em] text-[#14181f]"
            >
              Why we built it.
            </h2>
            <p className="mt-4 max-w-[520px] text-[14px] sm:text-[15px] leading-[1.7] text-stone-600 font-light">
              Search visibility is what specific writing earns. It is not an algorithmic trick.
            </p>
          </div>

          <figure className="w-[140px] origin-center -rotate-2 sm:w-[168px] shrink-0 self-start sm:self-end">
            <div className="overflow-hidden rounded-xl border border-stone-200/90 bg-[#faf9f6] p-2 shadow-sm">
              <img
                src="/images/philosophy-dog.jpg"
                alt="Editorial dog illustration representing The Stak Philosophy"
                width={360}
                height={360}
                className="aspect-square w-full rounded-lg object-cover"
              />
            </div>
            <figcaption className="mt-2 text-center font-mono text-[11px] text-stone-500">
              The Stak Philosophy
            </figcaption>
          </figure>
        </div>

        {/* 4 Editorial articles */}
        <div className="mt-12 flex flex-col">
          {articles.map((item) => (
            <div key={item.title} className="-mx-6 flex flex-col">
              <div className="h-px bg-stone-200/70" />
              <article className="px-6 py-8 sm:py-10">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-stone-500 font-medium">
                  {item.eyebrow}
                </p>
                <h3 className="mt-3 font-serif text-2xl sm:text-[26px] font-normal leading-[1.18] tracking-[-0.015em] text-[#14181f]">
                  {item.title}
                </h3>
                <div className="mt-4 flex flex-col gap-3 text-[14px] leading-[1.7] text-stone-600 font-light">
                  <p>{item.p1}</p>
                  <p>{item.p2}</p>
                </div>
              </article>
            </div>
          ))}
          <div className="-mx-6 h-px bg-stone-200/70" />
        </div>

        <p className="mt-8 mb-0">
          <Link
            href="/about"
            className="text-xs font-mono text-stone-600 underline underline-offset-4 hover:text-[#14181f] transition-colors"
          >
            Read our company story →
          </Link>
        </p>
      </section>
    </div>
  );
}

