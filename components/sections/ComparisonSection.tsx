import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SITE_CONFIG } from "@/lib/site";

const COMPARISON_ROWS = [
  {
    dimension: "Pricing",
    stak: {
      headline: `${SITE_CONFIG.priceMonthly}${SITE_CONFIG.priceUnit} single plan`,
      detail: "One transparent monthly price published upfront without tiered guesswork.",
    },
    competitor: {
      headline: "Compare against published plans",
      detail: `Review ${SITE_CONFIG.competitorName}'s current plan options directly on its official site.`,
    },
  },
  {
    dimension: "Product scope",
    stak: {
      headline: "All core workflows in one plan",
      detail:
        "Combines research, content projects, brand context, AI visibility, and publishing workflows.",
    },
    competitor: {
      headline: "AI search & content platform",
      detail: `Compare which modules are included per plan on ${SITE_CONFIG.competitorName}.`,
    },
  },
  {
    dimension: "Research",
    stak: {
      headline: "Multi-agent, keyword & competitor research",
      detail:
        "Includes keyword research, competitor research, social/Reddit workflows, and backlink workflows.",
    },
    competitor: {
      headline: "Market & search research",
      detail: `Evaluate how keyword, competitor, and social research workflows map to your needs.`,
    },
  },
  {
    dimension: "Content",
    stak: {
      headline: "SEO, AEO & GEO content generation",
      detail:
        "Structured content projects designed to move cleanly from research brief to final review.",
    },
    competitor: {
      headline: "Search-oriented content workflows",
      detail: `Compare editorial structure, project organization, and review workflows.`,
    },
  },
  {
    dimension: "AI visibility",
    stak: {
      headline: "LLM/AI visibility tracking + AEO/GEO",
      detail:
        "Built to track AI search visibility alongside AEO and GEO content workflows.",
    },
    competitor: {
      headline: "AI search visibility focus",
      detail: `Check how LLM visibility tracking and answer-engine optimization are packaged.`,
    },
  },
  {
    dimension: "Brand context",
    stak: {
      headline: "Brand voice & brand interpretation",
      detail:
        "Understands your website, products, positioning, and writing style before generating content.",
    },
    competitor: {
      headline: "Brand-aware generation",
      detail: `Compare how brand interpretation and style rules are maintained across drafts.`,
    },
  },
  {
    dimension: "Integrations",
    stak: {
      headline: "CMS integrations & export/publishing",
      detail:
        "Clean export/publishing workflows today alongside planned CMS integration connectors.",
    },
    competitor: {
      headline: "Publishing & CMS workflows",
      detail: `Verify compatibility with your CMS and publishing pipeline before choosing.`,
    },
  },
] as const;

export function ComparisonSection() {
  return (
    <Section id="comparison" labelledBy="comparison-heading">
      <SectionHeader
        headingId="comparison-heading"
        eyebrow="Comparison"
        title={`Stak vs ${SITE_CONFIG.competitorName}`}
        description={`An objective, side-by-side overview showing how ${SITE_CONFIG.name}'s ${SITE_CONFIG.priceMonthly}${SITE_CONFIG.priceUnit} single-plan structure compares across core evaluation areas.`}
      />

      <div className="mt-12 overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-2xs">
        <table className="block w-full border-collapse text-left md:table">
          <thead className="hidden border-b border-stone-200/90 bg-[#f8f8f6] md:table-header-group">
            <tr>
              <th
                scope="col"
                className="w-1/5 px-6 py-4 font-mono text-xs font-medium uppercase tracking-wider text-slate-500"
              >
                Category
              </th>
              <th
                scope="col"
                className="w-2/5 border-l border-stone-200/80 bg-[#14181f] px-6 py-4 text-sm font-semibold text-white"
              >
                <span className="flex items-center justify-between gap-2">
                  <span>{SITE_CONFIG.name}</span>
                  <span className="font-mono text-xs font-normal text-slate-300">
                    {SITE_CONFIG.priceMonthly}
                    {SITE_CONFIG.priceUnit}
                  </span>
                </span>
              </th>
              <th
                scope="col"
                className="w-2/5 border-l border-stone-200/80 px-6 py-4 text-sm font-semibold text-[#14181f]"
              >
                {SITE_CONFIG.competitorName}
              </th>
            </tr>
          </thead>

          <tbody className="block divide-y divide-stone-200/80 md:table-row-group">
            {COMPARISON_ROWS.map((row) => (
              <tr
                key={row.dimension}
                className="block md:table-row"
              >
                <th
                  scope="row"
                  className="block bg-[#f8f8f6] px-5 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-slate-600 md:table-cell md:bg-transparent md:px-6 md:py-5 md:align-top"
                >
                  {row.dimension}
                </th>

                <td className="block border-t border-stone-200/70 bg-[#fbfbfa] px-5 py-4 md:table-cell md:border-t-0 md:border-l md:border-stone-200/80 md:px-6 md:py-5 md:align-top">
                  <p className="mb-1 font-mono text-[11px] uppercase tracking-wider text-slate-500 md:hidden">
                    {SITE_CONFIG.name} ({SITE_CONFIG.priceMonthly}
                    {SITE_CONFIG.priceUnit})
                  </p>
                  <p className="text-sm font-semibold text-[#14181f]">
                    {row.stak.headline}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {row.stak.detail}
                  </p>
                </td>

                <td className="block border-t border-stone-200/70 px-5 py-4 md:table-cell md:border-t-0 md:border-l md:border-stone-200/80 md:px-6 md:py-5 md:align-top">
                  <p className="mb-1 font-mono text-[11px] uppercase tracking-wider text-slate-500 md:hidden">
                    {SITE_CONFIG.competitorName}
                  </p>
                  <p className="text-sm font-semibold text-[#14181f]">
                    {row.competitor.headline}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {row.competitor.detail}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

