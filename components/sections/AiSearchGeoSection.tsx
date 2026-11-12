import { Bot, Search, MessageSquareText } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

const VISIBILITY_LAYERS = [
  {
    code: "SEO",
    icon: Search,
    title: "Traditional Search Engines",
    description:
      "Clear HTML structure, intentional keyword alignment, internal linking cues, and clean metadata so search crawlers index pages accurately.",
    checks: [
      "Semantic heading hierarchy",
      "Crawlable HTML content",
      "Topic-level search intent match",
    ],
  },
  {
    code: "AEO",
    icon: MessageSquareText,
    title: "Answer Engine Optimization",
    description:
      "Concise definitions, question-and-answer blocks, and direct factual summaries structured for featured snippets and answer boxes.",
    checks: [
      "Direct-answer lead paragraphs",
      "Structured Q&A sections",
      "Unambiguous product definitions",
    ],
  },
  {
    code: "GEO",
    icon: Bot,
    title: "Generative Engine Optimization",
    description:
      "Factual, well-sourced positioning and clear entity context so modern AI search systems understand and represent your product accurately.",
    checks: [
      "Consistent brand and entity facts",
      "Plain-language comparison clarity",
      "Verifiable pricing and capability copy",
    ],
  },
] as const;

export function AiSearchGeoSection() {
  return (
    <Section id="ai-search" labelledBy="ai-search-heading" muted>
      <SectionHeader
        headingId="ai-search-heading"
        eyebrow="04 · AI Search & GEO"
        title="Built for modern AI search systems alongside SEO and AEO"
        description="Discovery now spans classic search results, answer engines, and AI assistants. Stak helps teams structure and refine content so every page remains clear across all three."
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {VISIBILITY_LAYERS.map((layer) => {
          const Icon = layer.icon;
          return (
            <article
              key={layer.code}
              className="flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-6"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 bg-[#fbfbfa] text-[#14181f]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="rounded-md border border-stone-200 bg-[#fbfbfa] px-2.5 py-1 font-mono text-xs font-medium text-[#14181f]">
                    {layer.code}
                  </span>
                </div>

                <h3 className="mt-5 text-base font-semibold text-[#14181f]">
                  {layer.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {layer.description}
                </p>
              </div>

              <ul className="mt-6 space-y-2 border-t border-stone-200/80 pt-4">
                {layer.checks.map((check) => (
                  <li
                    key={check}
                    className="flex items-center gap-2 font-mono text-xs text-slate-600"
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#14181f]"
                      aria-hidden="true"
                    />
                    <span>{check}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </Section>
  );
}

