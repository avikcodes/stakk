export function ToolIntroSection() {
  const cards = [
    {
      title: "Your voice",
      description:
        "The writer and humanizer work strictly from your TONE.md. The draft sounds like your website, not like an LLM filling a generic prompt template.",
    },
    {
      title: "Company context",
      description:
        "Your website is analyzed into COMPANY.md, TONE.md, and project context. Project knowledge stores the customer facts, metrics, and domain proof only you possess.",
    },
    {
      title: "Follow-up questions",
      description:
        "The workflow pauses for you: the angle, the links, the article parameters, then the draft itself. A human review cycle ensures accuracy before publication.",
    },
    {
      title: "Multi-Agent Research",
      description:
        "Specialized agents investigate your 100 tracked keywords, live search results, and competitor coverage in parallel to establish real substance before drafting.",
    },
  ];

  return (
    <section
      aria-labelledby="landing-tool-modules-heading"
      className="py-14 sm:py-18"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-stone-500 font-medium">
        The tool
      </p>
      <h2
        id="landing-tool-modules-heading"
        className="mt-3 font-serif text-3xl sm:text-4xl font-normal leading-[1.15] tracking-[-0.015em] text-[#14181f]"
      >
        It writes like you, because it asked.
      </h2>
      <p className="mt-4 max-w-[560px] text-[14px] sm:text-[15px] leading-[1.7] text-stone-600 font-light">
        Read the company. Ask what the site does not say. Write in that voice. Search visibility is what that specific writing earns, not an algorithm trick.
      </p>

      <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        {cards.map((card) => (
          <li
            key={card.title}
            className="flex flex-col gap-2 rounded-2xl border border-stone-200/80 bg-white/90 p-5 shadow-2xs hover:border-stone-300 transition-colors"
          >
            <h3 className="text-[14px] font-semibold text-[#14181f]">
              {card.title}
            </h3>
            <p className="text-[13px] leading-relaxed text-stone-600 font-light">
              {card.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

