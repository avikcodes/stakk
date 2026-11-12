import { Globe, Layers, Lightbulb, Search, Users } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

const RESEARCH_MODULES = [
  {
    icon: Search,
    title: "Keyword research",
    description:
      "Map buyer search queries, comparison terms, and informational topic clusters directly to content projects.",
  },
  {
    icon: Layers,
    title: "Multi-agent research",
    description:
      "Run specialized research passes in parallel—separating keyword, competitor, and web synthesis before analysis.",
  },
  {
    icon: Lightbulb,
    title: "Brainstorming",
    description:
      "Generate structured topic angles and editorial outlines shaped by your company positioning and market demand.",
  },
  {
    icon: Users,
    title: "Competitor research",
    description:
      "Examine how competing pages structure topics and identify gaps where clearer documentation can win visibility.",
  },
  {
    icon: Globe,
    title: "Web research",
    description:
      "Gather live public web context and current category references so briefs reflect up-to-date facts.",
  },
] as const;

const RESEARCH_OUTPUT_ROWS = [
  {
    agent: "Keyword Research",
    finding: "Commercial comparison & workflow queries grouped into topic brief",
    contextUsed: "COMPANY.md product scope",
  },
  {
    agent: "Competitor Research",
    finding: "Identified missing implementation detail across competing pages",
    contextUsed: "Brand positioning rules",
  },
  {
    agent: "Web Research",
    finding: "Verified current terminology and public documentation references",
    contextUsed: "Sitemap & existing pages",
  },
  {
    agent: "Brainstorming",
    finding: "Proposed 3 structured outlines aligned with search intent",
    contextUsed: "TONE.md editorial voice",
  },
] as const;

export function ResearchCapabilitySection() {
  return (
    <Section id="research" labelledBy="features-research-heading">
      <SectionHeader
        headingId="features-research-heading"
        eyebrow="02 · Research"
        title="Keyword, competitor, web, and multi-agent research"
        description="Every stage of research runs against your company context so multi-agent analysis and brainstorming surface opportunities that actually fit your business."
      />

      <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:items-start">
        {/* Product UI Mockup: Multi-Agent Research Console */}
        <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xs lg:col-span-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 bg-[#f8f8f6] px-5 py-3.5">
            <div>
              <h3 className="text-sm font-semibold text-[#14181f]">
                Multi-Agent Research &amp; Brainstorm Run
              </h3>
              <p className="font-mono text-[11px] text-slate-500">
                Illustrative research synthesis workspace
              </p>
            </div>
            <span className="rounded-full border border-stone-200 bg-white px-2.5 py-0.5 font-mono text-[11px] text-slate-600">
              Web + Context
            </span>
          </div>

          <div className="divide-y divide-stone-200/80">
            {RESEARCH_OUTPUT_ROWS.map((row) => (
              <div key={row.agent} className="px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-mono text-xs font-semibold text-[#14181f]">
                    {row.agent}
                  </p>
                  <span className="rounded border border-stone-200 bg-[#fbfbfa] px-2 py-0.5 font-mono text-[11px] text-slate-600">
                    {row.contextUsed}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-6 text-slate-600">
                  {row.finding}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Five research capabilities */}
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-6">
          {RESEARCH_MODULES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className={`rounded-xl border border-stone-200/90 bg-white p-5 ${
                  idx === RESEARCH_MODULES.length - 1 ? "sm:col-span-2" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-[#fbfbfa] text-[#14181f]">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <h3 className="text-sm font-semibold text-[#14181f]">
                    {item.title}
                  </h3>
                </div>
                <p className="mt-2.5 text-sm leading-6 text-slate-600">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
