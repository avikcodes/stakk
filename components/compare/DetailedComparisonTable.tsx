import { SITE_CONFIG } from "@/lib/site";

const DETAILED_ROWS = [
  {
    category: "Pricing Structure",
    stak: {
      headline: "One flat $129/month plan",
      detail:
        "All core capabilities—Content, Research, Analytics, Social, Brand Context, and Publishing workflows—are included in a single plan.",
    },
    gehirn: {
      headline: "Multi-tier plan evaluation",
      detail:
        "Review Gehirn.md's official pricing tiers to match monthly limits and plan features against your team's needs.",
    },
  },
  {
    category: "Product Scope",
    stak: {
      headline: "Full Gehirn-style workflow in one subscription",
      detail:
        "Covers Content, Research, Analytics, Social, Brand Context, and Publishing without gating categories by tier.",
    },
    gehirn: {
      headline: "Dedicated AI search & content platform",
      detail:
        "Offers structured workflows across content, research, analytics, social, and publishing across its plan lineup.",
    },
  },
  {
    category: "Research Capabilities",
    stak: {
      headline: "Keyword, competitor, web & multi-agent research",
      detail:
        "Includes keyword research, multi-agent research/brainstorming, competitor research, and live web research.",
    },
    gehirn: {
      headline: "Keyword & multi-agent research",
      detail:
        "Provides keyword discovery and multi-agent research/brainstorm workflows; compare per-plan capacity directly.",
    },
  },
  {
    category: "Content Capabilities",
    stak: {
      headline: "Article generation, rewriting & projects",
      detail:
        "Supports AI article generation, content rewriting, content projects, and pre-writing research briefs.",
    },
    gehirn: {
      headline: "Article generation & project organization",
      detail:
        "Supports article creation and project workflows; check current monthly article allocations per plan.",
    },
  },
  {
    category: "Brand Context",
    stak: {
      headline: "COMPANY.md & TONE.md + site structure",
      detail:
        "Uses COMPANY.md, TONE.md, website structure, sitemap, existing content, brand positioning, and writing style.",
    },
    gehirn: {
      headline: "Website & brand voice context",
      detail:
        "Incorporates company context and brand voice guidelines into content and workflow generation.",
    },
  },
  {
    category: "Analytics & AI Visibility",
    stak: {
      headline: "LLM tracking, AI visibility & brand interpretation",
      detail:
        "Tracks how AI search systems represent your brand, product scope, and pricing alongside SEO/AEO/GEO workflows.",
    },
    gehirn: {
      headline: "LLM tracking & brand interpretation",
      detail:
        "Includes LLM tracking and brand interpretation analytics; review how tracking frequency scales by tier.",
    },
  },
  {
    category: "Social Workflows",
    stak: {
      headline: "Reddit workflows, comments & backlinks",
      detail:
        "Includes Reddit research, draft Reddit comments, community participation queues, and backlink workflows.",
    },
    gehirn: {
      headline: "Backlinks & Reddit comment workflows",
      detail:
        "Supports social/community and backlink workflows; verify monthly Reddit comment allowances by plan.",
    },
  },
  {
    category: "Human Review Workflow",
    stak: {
      headline: "Human-in-the-loop review before publish",
      detail:
        "Drafts, article rewrites, and Reddit replies pass through an explicit editorial review step prior to export or publishing.",
    },
    gehirn: {
      headline: "Editorial review workflow",
      detail:
        "Supports human review of generated content prior to publishing into connected channels.",
    },
  },
  {
    category: "Publishing & Integrations",
    stak: {
      headline: "Markdown/HTML export + planned CMS & GitHub",
      detail:
        "Clean export/publishing workflows with planned connectors for GitHub, WordPress, Webflow, Ghost, Contentful, Sanity, Strapi, and Contao.",
    },
    gehirn: {
      headline: "CMS & GitHub publishing integrations",
      detail:
        "Check Gehirn.md's documentation for currently active CMS and repository connectors required by your stack today.",
    },
  },
] as const;

export function DetailedComparisonTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-2xs">
      <table className="block w-full border-collapse text-left md:table">
        <thead className="hidden border-b border-stone-200/90 bg-[#f8f8f6] md:table-header-group">
          <tr>
            <th
              scope="col"
              className="w-1/5 px-6 py-4 font-mono text-xs font-medium uppercase tracking-wider text-slate-500"
            >
              Dimension
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
          {DETAILED_ROWS.map((row) => (
            <tr key={row.category} className="block md:table-row">
              <th
                scope="row"
                className="block bg-[#f8f8f6] px-5 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-slate-600 md:table-cell md:bg-transparent md:px-6 md:py-5 md:align-top"
              >
                {row.category}
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
                  {row.gehirn.headline}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {row.gehirn.detail}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

