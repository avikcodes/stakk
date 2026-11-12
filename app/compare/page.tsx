import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buildPageMetadata } from "@/lib/metadata";
import { SITE_CONFIG } from "@/lib/site";
import { PageShell } from "@/components/layout/PageShell";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CompareCrossLinks } from "@/components/compare/CompareCrossLinks";
import { PageCtaSection } from "@/components/ui/PageCtaSection";

export const metadata = buildPageMetadata({
  title: "Compare",
  description:
    "Comparison hub for evaluating Stak against AI search and content workflow platforms—starting with Stak vs Gehirn.md.",
  path: "/compare",
});

const COMPARISON_GUIDES = [
  {
    slug: "/compare/stak-vs-gehirn",
    title: "Stak vs Gehirn.md",
    badge: "Primary Comparison",
    summary:
      "Full Gehirn-style capabilities at one flat $129/month plan. Side-by-side comparison across pricing, research, content, brand context, AI visibility, social workflows, and integrations.",
    ctaLabel: "Read Stak vs Gehirn.md",
  },
] as const;

const EVALUATION_DIMENSIONS = [
  {
    title: "Pricing & Plan Tiers",
    detail:
      "Evaluate whether all core workflow categories are included in a single flat subscription ($129/month on Stak) or gated across separate plan tiers.",
  },
  {
    title: "Brand Context Architecture",
    detail:
      "Check how company positioning, website structure, sitemap, and writing style are stored and enforced prior to generating or rewriting drafts.",
  },
  {
    title: "Research, AI Visibility & Social",
    detail:
      "Verify how keyword research, competitor analysis, LLM tracking, Reddit workflows, and backlink discovery work together in one workflow.",
  },
  {
    title: "Review & Publishing Handoff",
    detail:
      "Confirm human-in-the-loop review gates, clean Markdown/HTML export, and which CMS or GitHub connectors are active versus planned.",
  },
] as const;

export default function ComparePage() {
  return (
    <PageShell
      breadcrumbs={[{ name: "Compare", url: `${SITE_CONFIG.url}/compare` }]}
    >
      <PageHero
        eyebrow="Comparison Hub"
        title="Compare Stak against AI search and content platforms."
        description="Structured, factual comparisons designed to help teams evaluate pricing, workflow scope, brand context, AI visibility, and publishing integrations."
        breadcrumbLabel="Compare"
        primaryCta={{
          label: "Read Stak vs Gehirn.md",
          href: "/compare/stak-vs-gehirn",
        }}
        secondaryCta={{
          label: "View $129/month Pricing",
          href: "/pricing",
        }}
      />

      <Section labelledBy="published-comparisons-heading" muted>
        <SectionHeader
          headingId="published-comparisons-heading"
          eyebrow="Published Comparisons"
          title="Side-by-side platform comparisons"
          description="Select a comparison below to review pricing structure, workflow capabilities, and integration scope."
        />

        <div className="mt-10 grid gap-6">
          {COMPARISON_GUIDES.map((guide) => (
            <article
              key={guide.slug}
              className="flex flex-col justify-between gap-6 rounded-2xl border border-stone-200/90 bg-white p-7 shadow-2xs sm:flex-row sm:items-center sm:p-8"
            >
              <div className="max-w-2xl">
                <span className="rounded-full border border-stone-200 bg-[#fbfbfa] px-3 py-0.5 font-mono text-[11px] uppercase tracking-wider text-slate-600">
                  {guide.badge}
                </span>
                <h3 className="mt-3 font-serif text-3xl font-normal tracking-tight text-[#14181f]">
                  {guide.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {guide.summary}
                </p>
              </div>

              <div className="shrink-0">
                <Link
                  href={guide.slug}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#14181f] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#232933]"
                >
                  <span>{guide.ctaLabel}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section labelledBy="comparison-methodology-heading">
        <SectionHeader
          headingId="comparison-methodology-heading"
          eyebrow="Methodology"
          title="How we structure every comparison"
          description="Every comparison evaluates platforms on verifiable product scope, workflow design, and published pricing without fabricated benchmarks."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {EVALUATION_DIMENSIONS.map((item) => (
            <article
              key={item.title}
              className="rounded-xl border border-stone-200/90 bg-white p-6"
            >
              <h3 className="text-base font-semibold text-[#14181f]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {item.detail}
              </p>
            </article>
          ))}
        </div>

        <CompareCrossLinks currentPath="/compare" />
      </Section>

      <PageCtaSection />
    </PageShell>
  );
}
