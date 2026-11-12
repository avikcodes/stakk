import Link from "next/link";
import { Check } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { BrandMark } from "@/components/ui/BrandMark";
import { SITE_CONFIG } from "@/lib/site";

const PRICING_CATEGORIES = [
  {
    category: "CONTENT",
    subtitle: "Creation, editing & brand voice",
    items: [
      { label: "Articles", note: "AI generation & rewriting" },
      { label: "Projects", note: "Structured topic organization" },
      { label: "Brand voice", note: "COMPANY.md & TONE.md" },
      { label: "Content workflows", note: "Human review built in" },
    ],
  },
  {
    category: "RESEARCH",
    subtitle: "Discovery & competitive analysis",
    items: [
      { label: "Keywords", note: "Intent & topic clustering" },
      { label: "Multi-agent research", note: "Parallel agent synthesis" },
      { label: "Brainstorming", note: "Structured article angles" },
      { label: "Competitor research", note: "Coverage & gap analysis" },
    ],
  },
  {
    category: "ANALYTICS",
    subtitle: "AI search & entity accuracy",
    items: [
      { label: "LLM tracking", note: "Prompt response monitoring" },
      { label: "AI visibility", note: "Search & answer surface presence" },
      { label: "Brand interpretation", note: "How AI models describe you" },
    ],
  },
  {
    category: "SOCIAL",
    subtitle: "Community & citations",
    items: [
      { label: "Reddit workflows", note: "Thread discovery & prep" },
      { label: "Backlinks", note: "Citation & mention tracking" },
      { label: "Community workflows", note: "Reviewable reply queues" },
    ],
  },
  {
    category: "PUBLISHING",
    subtitle: "Handoff & integrations",
    items: [
      { label: "CMS integrations", note: "Planned CMS & GitHub connectors" },
      { label: "Export", note: "Clean Markdown & HTML output" },
      { label: "Publishing", note: "Review-to-publish workflow" },
    ],
  },
] as const;

export function PricingPlanSection() {
  return (
    <Section id="plan" labelledBy="pricing-plan-heading" muted>
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-xs font-medium uppercase tracking-wider text-slate-500">
              Single Plan Architecture
            </p>
            <h2
              id="pricing-plan-heading"
              className="mt-2 font-serif text-3xl font-normal tracking-tight text-[#14181f] sm:text-4xl"
            >
              One flat subscription for the entire platform
            </h2>
          </div>
          <Link
            href="/compare/stak-vs-gehirn"
            className="font-mono text-xs font-medium text-[#14181f] underline decoration-stone-300 underline-offset-4 hover:decoration-[#14181f]"
          >
            Compare Stak vs Gehirn →
          </Link>
        </div>

        {/* Large Visual Single-Plan Pricing Card */}
        <div className="overflow-hidden rounded-3xl border border-stone-200/90 bg-white shadow-xs">
          {/* Card Header */}
          <div className="flex flex-col justify-between gap-6 border-b border-stone-200/80 bg-[#fbfbfa] p-7 sm:flex-row sm:items-end sm:p-10">
            <div>
              <div className="flex items-center gap-3">
                <BrandMark />
                <span className="rounded-full border border-stone-200 bg-white px-3 py-0.5 font-mono text-[11px] uppercase tracking-wider text-slate-600">
                  One Plan
                </span>
              </div>
              <p className="mt-4 max-w-lg text-sm leading-6 text-slate-600">
                All the capabilities. One plan. {SITE_CONFIG.priceMonthly}
                {SITE_CONFIG.priceUnit}. The entire product is included without
                splitting workflows across four separate tiers.
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end">
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif text-5xl font-normal tracking-tight text-[#14181f] sm:text-6xl">
                  {SITE_CONFIG.priceMonthly}
                </span>
                <span className="font-mono text-sm text-slate-500">
                  {SITE_CONFIG.priceUnit}
                </span>
              </div>
              <p className="mt-1 font-mono text-xs text-slate-500">
                Flat monthly rate
              </p>
            </div>
          </div>

          {/* Five Gehirn-Style Feature Categories */}
          <div className="divide-y divide-stone-200/80">
            {PRICING_CATEGORIES.map((group) => (
              <div
                key={group.category}
                className="grid gap-6 p-6 sm:p-8 lg:grid-cols-12"
              >
                <div className="lg:col-span-4">
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#14181f]">
                    {group.category}
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-500">
                    {group.subtitle}
                  </p>
                </div>

                <ul className="grid gap-3 sm:grid-cols-2 lg:col-span-8">
                  {group.items.map((item) => (
                    <li
                      key={item.label}
                      className="flex items-start justify-between gap-3 rounded-xl border border-stone-200/80 bg-[#fbfbfa] px-4 py-3"
                    >
                      <span className="flex items-start gap-2.5">
                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-[#14181f]">
                          <Check className="h-3 w-3" aria-hidden="true" />
                        </span>
                        <span>
                          <span className="block text-sm font-medium text-[#14181f]">
                            {item.label}
                          </span>
                          <span className="block font-mono text-[11px] text-slate-500">
                            {item.note}
                          </span>
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Card Footer CTA */}
          <div className="flex flex-col justify-between gap-4 border-t border-stone-200/80 bg-[#f8f8f6] px-6 py-6 sm:flex-row sm:items-center sm:px-10">
            <div>
              <p className="text-sm font-semibold text-[#14181f]">
                All the capabilities. One plan. {SITE_CONFIG.priceMonthly}
                {SITE_CONFIG.priceUnit}.
              </p>
              <p className="mt-0.5 text-xs text-slate-600">
                Includes Content, Research, Analytics, Social, and Publishing
                workflows.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#14181f] px-6 py-3 text-sm font-medium text-white transition-all duration-150 hover:bg-[#232933] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14181f] focus-visible:ring-offset-2"
              >
                <span>Start with Stak</span>
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/compare/stak-vs-gehirn"
                className="inline-flex items-center justify-center rounded-lg border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-[#14181f] transition-colors hover:bg-stone-50"
              >
                Stak vs Gehirn
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

