import { Search, TrendingUp, Users, Sparkles } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

const RESEARCH_DIMENSIONS = [
  {
    icon: Search,
    label: "Keywords & Intent",
    detail: "Map buyer questions, comparison queries, and informational topics.",
  },
  {
    icon: Users,
    label: "Competitor Coverage",
    detail: "Identify where competitors publish and which topics remain underserved.",
  },
  {
    icon: TrendingUp,
    label: "Market Trends",
    detail: "Surface emerging themes and shifting terminology in your category.",
  },
  {
    icon: Sparkles,
    label: "Search Opportunities",
    detail: "Prioritize pages with clear potential across search and AI answers.",
  },
] as const;

const MOCK_RESEARCH_ROWS = [
  {
    topic: "AI search visibility workflows",
    intent: "Commercial investigation",
    gap: "Missing structured comparison & implementation guide",
    priority: "High priority",
  },
  {
    topic: "Brand context in content operations",
    intent: "Educational / Buyer research",
    gap: "Competitors lack concrete workflow breakdown",
    priority: "Recommended",
  },
  {
    topic: "GEO vs AEO content structure",
    intent: "Definition & framework query",
    gap: "Opportunity for clear direct-answer formatting",
    priority: "Queued",
  },
] as const;

export function ResearchSection() {
  return (
    <Section id="research" labelledBy="research-heading">
      <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <SectionHeader
            headingId="research-heading"
            eyebrow="01 · Research"
            title="Research markets, competitors, and search opportunities"
            description="Before any page is drafted, Stak gathers structured context on what buyers search for, how competitors position topics, and where clear opportunities exist."
          />

          <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {RESEARCH_DIMENSIONS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-start gap-3.5">
                  <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-white text-[#14181f]">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <dt className="text-sm font-semibold text-[#14181f]">
                      {item.label}
                    </dt>
                    <dd className="mt-0.5 text-sm leading-6 text-slate-600">
                      {item.detail}
                    </dd>
                  </div>
                </div>
              );
            })}
          </dl>
        </div>

        <div className="lg:col-span-7">
          <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-2xs">
            <div className="flex items-center justify-between border-b border-stone-200/80 bg-[#f8f8f6] px-5 py-3.5">
              <div>
                <h3 className="text-sm font-semibold text-[#14181f]">
                  Market &amp; Opportunity Brief
                </h3>
                <p className="font-mono text-xs text-slate-500">
                  Illustrative research workspace preview
                </p>
              </div>
              <span className="rounded-full border border-stone-200 bg-white px-2.5 py-1 font-mono text-[11px] text-slate-600">
                Research Stage
              </span>
            </div>

            <div className="divide-y divide-stone-200/80">
              {MOCK_RESEARCH_ROWS.map((row) => (
                <div
                  key={row.topic}
                  className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-[#14181f]">
                      {row.topic}
                    </p>
                    <p className="text-xs text-slate-600">{row.gap}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <span className="rounded-md border border-stone-200 bg-[#fbfbfa] px-2.5 py-1 font-mono text-[11px] text-slate-600">
                      {row.intent}
                    </span>
                    <span className="rounded-md bg-[#14181f] px-2.5 py-1 font-mono text-[11px] text-white">
                      {row.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

