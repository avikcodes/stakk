import Link from "next/link";
import { Check } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { BrandMark } from "@/components/ui/BrandMark";
import { SITE_CONFIG } from "@/lib/site";

const FEATURE_CATEGORIES = [
  {
    category: "CONTENT",
    items: [
      { name: "Articles / month", status: "Included" },
      { name: "Projects", status: "Included" },
    ],
  },
  {
    category: "RESEARCH",
    items: [
      { name: "Keywords", status: "Included" },
      { name: "Multi-Agent Research / Brainstorm", status: "Included" },
    ],
  },
  {
    category: "ANALYTICS",
    items: [
      { name: "LLM Tracking", status: "Included" },
      { name: "Brand Interpretation", status: "Included" },
    ],
  },
  {
    category: "SOCIAL",
    items: [
      { name: "Backlinks", status: "Included" },
      { name: "Reddit Comments / month", status: "Included" },
    ],
  },
] as const;

const PLATFORM_WORKFLOWS = [
  "Website/company context",
  "Brand voice",
  "Research",
  "Content writing",
  "Content rewriting",
  "Competitor research",
  "SEO workflows",
  "Reddit workflows",
  "Backlink/community workflows",
  "Human-in-the-loop content workflow",
] as const;

const PUBLISHING_TARGETS = [
  "WordPress",
  "Strapi",
  "Sanity",
  "Contentful",
  "Webflow",
  "Ghost",
  "Contao",
] as const;

export function PricingSection() {
  return (
    <Section
      id="pricing"
      labelledBy="pricing-heading"
      className="cloud-atmosphere relative overflow-hidden"
    >
      <SectionHeader
        headingId="pricing-heading"
        eyebrow="Pricing"
        title="All the capabilities. One plan. $129/month."
        description={`All core ${SITE_CONFIG.competitorName}-level capabilities included in one plan—without splitting your team across four separate tiers.`}
        align="center"
      />

      <div className="mx-auto mt-12 max-w-5xl">
        {/* Large visual single-plan pricing card */}
        <div className="overflow-hidden rounded-3xl border border-stone-200/90 bg-white/95 shadow-xs backdrop-blur-sm">
          {/* Card top header */}
          <div className="flex flex-col justify-between gap-6 border-b border-stone-200/80 bg-[#fbfbfa]/90 p-7 sm:flex-row sm:items-end sm:p-10">
            <div>
              <div className="flex items-center gap-3">
                <BrandMark />
                <span className="rounded-full border border-stone-200 bg-white px-3 py-0.5 font-mono text-[11px] uppercase tracking-wider text-slate-600">
                  Single Plan
                </span>
              </div>
              <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">
                All core Gehirn-level capabilities included in one plan.
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
                One flat monthly subscription
              </p>
            </div>
          </div>

          {/* Four Gehirn-style feature categories */}
          <div className="grid divide-y divide-stone-200/80 md:grid-cols-2 md:divide-y-0">
            {FEATURE_CATEGORIES.map((group, index) => (
              <div
                key={group.category}
                className={`p-6 sm:p-8 ${
                  index % 2 === 0 ? "md:border-r md:border-stone-200/80" : ""
                } ${index < 2 ? "md:border-b md:border-stone-200/80" : ""}`}
              >
                <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {group.category}
                </h3>

                <ul className="mt-4 divide-y divide-stone-200/70">
                  {group.items.map((item) => (
                    <li
                      key={item.name}
                      className="flex items-center justify-between gap-4 py-3 first:pt-1 last:pb-1"
                    >
                      <span className="flex items-center gap-2.5 text-sm font-medium text-[#14181f]">
                        <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-[#fbfbfa] text-[#14181f]">
                          <Check className="h-3 w-3" aria-hidden="true" />
                        </span>
                        <span>{item.name}</span>
                      </span>
                      <span className="shrink-0 font-mono text-xs text-slate-500">
                        {item.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Core workflows & publishing structure */}
          <div className="border-t border-stone-200/80 bg-[#fbfbfa]/60 p-6 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Core Context, Writing &amp; Channel Workflows
                </h3>
                <ul className="mt-4 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                  {PLATFORM_WORKFLOWS.map((workflow) => (
                    <li
                      key={workflow}
                      className="flex items-start gap-2.5 text-sm leading-6 text-slate-700"
                    >
                      <Check
                        className="mt-1 h-4 w-4 shrink-0 text-[#14181f]"
                        aria-hidden="true"
                      />
                      <span>{workflow}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-stone-200/80 pt-6 lg:col-span-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Publishing &amp; Integrations
                </h3>

                <ul className="mt-4 space-y-2.5">
                  <li className="flex items-center justify-between gap-3 text-sm text-slate-700">
                    <span className="flex items-center gap-2.5">
                      <Check
                        className="h-4 w-4 shrink-0 text-[#14181f]"
                        aria-hidden="true"
                      />
                      <span>CMS publishing</span>
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      Workflow + planned connectors
                    </span>
                  </li>
                  <li className="flex items-center justify-between gap-3 text-sm text-slate-700">
                    <span className="flex items-center gap-2.5">
                      <Check
                        className="h-4 w-4 shrink-0 text-[#14181f]"
                        aria-hidden="true"
                      />
                      <span>GitHub publishing</span>
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      Planned connector
                    </span>
                  </li>
                </ul>

                <div className="mt-4">
                  <p className="font-mono text-[11px] text-slate-500">
                    Target CMS platforms (roadmap connectors):
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {PUBLISHING_TARGETS.map((cms) => (
                      <span
                        key={cms}
                        className="rounded-md border border-stone-200 bg-white px-2.5 py-1 font-mono text-[11px] text-slate-600"
                      >
                        {cms}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card bottom CTA footer */}
          <div className="flex flex-col justify-between gap-4 border-t border-stone-200/80 bg-white px-6 py-6 sm:flex-row sm:items-center sm:px-10">
            <div>
              <p className="text-sm font-semibold text-[#14181f]">
                All the capabilities. One plan. {SITE_CONFIG.priceMonthly}
                {SITE_CONFIG.priceUnit}.
              </p>
              <p className="mt-0.5 text-xs text-slate-600">
                Content, Research, Analytics, Social, and Publishing workflows
                under one subscription.
              </p>
            </div>

            <Link
              href="/features"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#14181f] px-6 py-3 text-sm font-medium text-white transition-all duration-150 hover:bg-[#232933] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14181f] focus-visible:ring-offset-2"
            >
              <span>Start with Stak</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* Concise explanation below the pricing card */}
        <p className="mx-auto mt-6 max-w-2xl text-center text-sm leading-6 text-slate-600">
          Instead of splitting features across four separate plan tiers,{" "}
          {SITE_CONFIG.name} combines content, research, analytics, social, and
          publishing capabilities into one flat {SITE_CONFIG.priceMonthly}
          {SITE_CONFIG.priceUnit} subscription.
        </p>
      </div>
    </Section>
  );
}
