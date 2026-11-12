import { Bot, Eye, ScanSearch } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

const ANALYTICS_PILLARS = [
  {
    icon: Bot,
    title: "LLM tracking",
    description:
      "Track responses across major language models and AI answer surfaces for category, comparison, and brand-specific prompts.",
  },
  {
    icon: Eye,
    title: "AI visibility",
    description:
      "Monitor whether your website and product pages appear in AI-generated answers and where visibility gaps remain.",
  },
  {
    icon: ScanSearch,
    title: "Brand interpretation",
    description:
      "Inspect how AI systems describe your product scope, pricing, and differentiation compared against your intended positioning.",
  },
] as const;

const INTERPRETATION_LOG = [
  {
    prompt: "Category & product summary",
    observed: "Recognized as AI search, content, and workflow platform",
    status: "Aligned with COMPANY.md",
  },
  {
    prompt: "Pricing & plan structure",
    observed: "$129/month single plan with core workflows included",
    status: "Verified on stak.co.in",
  },
  {
    prompt: "Comparison & alternative queries",
    observed: "Highlighted alongside multi-tier tools in category",
    status: "Tracked in Analytics",
  },
] as const;

export function AnalyticsCapabilitySection() {
  return (
    <Section id="analytics" labelledBy="features-analytics-heading" muted>
      <SectionHeader
        headingId="features-analytics-heading"
        eyebrow="03 · Analytics"
        title="LLM tracking, AI visibility, and brand interpretation"
        description="Measure more than whether your brand is mentioned. Verify how AI search engines interpret your product, pricing, and positioning against your actual site."
      />

      <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:items-start">
        <div className="space-y-4 lg:col-span-5">
          {ANALYTICS_PILLARS.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="flex items-start gap-4 rounded-xl border border-stone-200/90 bg-white p-5"
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-[#fbfbfa] text-[#14181f]">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-[#14181f]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {item.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        {/* Product UI Mockup: LLM Tracking & Brand Interpretation */}
        <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xs lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 bg-[#f8f8f6] px-5 py-3.5">
            <div>
              <h3 className="text-sm font-semibold text-[#14181f]">
                AI Visibility &amp; Brand Interpretation Console
              </h3>
              <p className="font-mono text-[11px] text-slate-500">
                Illustrative prompt &amp; interpretation review
              </p>
            </div>
            <span className="rounded-full border border-stone-200 bg-white px-2.5 py-0.5 font-mono text-[11px] text-slate-600">
              LLM Tracking
            </span>
          </div>

          <div className="divide-y divide-stone-200/80">
            {INTERPRETATION_LOG.map((row) => (
              <div key={row.prompt} className="px-5 py-4 sm:px-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-mono text-xs uppercase tracking-wider text-slate-500">
                    {row.prompt}
                  </p>
                  <span className="rounded border border-stone-200 bg-[#fbfbfa] px-2 py-0.5 font-mono text-[11px] text-[#14181f]">
                    {row.status}
                  </span>
                </div>
                <p className="mt-1.5 text-sm font-medium text-[#14181f]">
                  {row.observed}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
