import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { buildPageMetadata } from "@/lib/metadata";
import { SITE_CONFIG } from "@/lib/site";
import { PageShell } from "@/components/layout/PageShell";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CompareCrossLinks } from "@/components/compare/CompareCrossLinks";
import { PageCtaSection } from "@/components/ui/PageCtaSection";

export const metadata = buildPageMetadata({
  title: "Alternatives",
  description:
    "What makes a complete AI search and content platform alternative—and how Stak delivers full Gehirn-style capabilities at one flat $129/month plan.",
  path: "/alternatives",
});

const ALTERNATIVE_MEANING = [
  {
    title: "Connected research, writing, and visibility",
    description:
      "A true AI search and content platform alternative replaces disconnected keyword tools, standalone writers, and manual brand prompts with one workflow from Company Context to Publish.",
  },
  {
    title: "Explicit brand context before generation",
    description:
      "Instead of generic templates, platforms in this category ground every draft in your website structure, sitemap, product facts, and writing style.",
  },
  {
    title: "Transparent pricing across the full workflow",
    description:
      "Teams evaluating alternatives often look for predictable monthly pricing that keeps Content, Research, Analytics, Social, and Publishing together.",
  },
] as const;

const STAK_ALTERNATIVE_PILLARS = [
  "Full Gehirn-style capabilities at one flat $129/month plan",
  "COMPANY.md and TONE.md brand knowledge across every workflow step",
  "Keyword, competitor, live web, and multi-agent research before drafting",
  "LLM tracking, AI visibility, and brand interpretation",
  "Reddit research, Reddit comments, and backlink workflows",
  "Human-in-the-loop review and structured export/publishing workflows",
] as const;

export default function AlternativesPage() {
  return (
    <PageShell
      breadcrumbs={[
        { name: "Alternatives", url: `${SITE_CONFIG.url}/alternatives` },
      ]}
    >
      <PageHero
        eyebrow="Alternatives"
        title="Choosing an AI search and content platform alternative."
        description={`What an alternative to an AI search and content platform means in practice—and how ${SITE_CONFIG.name} brings full ${SITE_CONFIG.competitorName}-style capabilities into one flat ${SITE_CONFIG.priceMonthly}${SITE_CONFIG.priceUnit} plan.`}
        breadcrumbLabel="Alternatives"
        primaryCta={{
          label: "Read Gehirn.md Alternative",
          href: "/alternatives/gehirn",
        }}
        secondaryCta={{
          label: "Compare Stak vs Gehirn.md",
          href: "/compare/stak-vs-gehirn",
        }}
      />

      <Section labelledBy="what-alternative-means-heading" muted>
        <SectionHeader
          headingId="what-alternative-means-heading"
          eyebrow="Category Overview"
          title="What an AI search and content platform alternative means"
          description="Modern search visibility spans traditional search engines, AI answer surfaces, and community discussions—so an alternative must cover the whole loop."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {ALTERNATIVE_MEANING.map((item) => (
            <article
              key={item.title}
              className="rounded-xl border border-stone-200/90 bg-white p-6"
            >
              <h3 className="text-base font-semibold text-[#14181f]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </Section>

      <Section labelledBy="primary-comparison-heading">
        <div className="rounded-3xl border border-stone-200/90 bg-white p-7 shadow-xs sm:p-10">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <p className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-500">
                Primary Comparison · {SITE_CONFIG.competitorName}
              </p>
              <h2
                id="primary-comparison-heading"
                className="mt-2 font-serif text-3xl font-normal tracking-tight text-[#14181f]"
              >
                Introducing Stak as a {SITE_CONFIG.competitorName} alternative
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Full {SITE_CONFIG.competitorName}-style capabilities at one flat{" "}
                {SITE_CONFIG.priceMonthly}
                {SITE_CONFIG.priceUnit} plan. Instead of splitting research,
                content, LLM tracking, social workflows, and publishing across
                multiple tiers, Stak includes them together in one subscription.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/alternatives/gehirn"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#14181f] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#232933]"
                >
                  <span>Explore Gehirn.md Alternative</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/compare/stak-vs-gehirn"
                  className="inline-flex items-center justify-center rounded-lg border border-stone-300 bg-[#fbfbfa] px-5 py-3 text-sm font-medium text-[#14181f] transition-colors hover:bg-white"
                >
                  Stak vs Gehirn.md Table
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200/80 bg-[#fbfbfa] p-6 lg:col-span-5">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-500">
                Stak Single-Plan Scope
              </h3>
              <ul className="mt-4 space-y-2.5">
                {STAK_ALTERNATIVE_PILLARS.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2.5 text-sm leading-6 text-slate-700"
                  >
                    <Check
                      className="mt-1 h-4 w-4 shrink-0 text-[#14181f]"
                      aria-hidden="true"
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <CompareCrossLinks currentPath="/alternatives" />
      </Section>

      <PageCtaSection />
    </PageShell>
  );
}
