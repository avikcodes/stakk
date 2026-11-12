import Link from "next/link";
import { buildPageMetadata } from "@/lib/metadata";
import { SITE_CONFIG } from "@/lib/site";
import { PageShell } from "@/components/layout/PageShell";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CompareCrossLinks } from "@/components/compare/CompareCrossLinks";
import { PageCtaSection } from "@/components/ui/PageCtaSection";

export const metadata = buildPageMetadata({
  title: "Gehirn.md Alternative",
  description:
    "Stak is a $129/month Gehirn.md alternative offering Content, Research, Brand Context, Analytics, AI visibility, Social workflows, and Publishing in one plan.",
  path: "/alternatives/gehirn",
});

const OVERVIEW_BLOCKS = [
  {
    title: "What Gehirn.md is",
    body: "Gehirn.md is an AI search and content platform designed around structured company context, multi-agent research, content projects, LLM brand tracking, Reddit/backlink social workflows, and CMS publishing across tiered plans.",
  },
  {
    title: "What Stak is",
    body: `Stak is The AI Search & Content Platform (${SITE_CONFIG.url}) built around that same complete workflow model—connecting company brand knowledge, research, writing, AI visibility, social workflows, and publishing into one $129/month product.`,
  },
  {
    title: "Pricing difference",
    body: "Instead of evaluating four separate plan tiers, Stak offers one flat $129/month subscription with all core capability categories included. Check Gehirn.md directly for its current plan tiers and allowances.",
  },
] as const;

const CAPABILITY_BREAKDOWN = [
  {
    heading: "Research capabilities",
    detail:
      "Stak includes keyword research, multi-agent research, brainstorming, competitor research, and live web research so content briefs begin from verified market demand rather than blank prompts.",
    href: "/features#research",
    linkLabel: "See Research on /features",
  },
  {
    heading: "Content capabilities",
    detail:
      "Includes AI article generation, content rewriting, structured Content Projects, pre-writing content research, and a human review workflow so editors approve every draft before publishing.",
    href: "/features#content",
    linkLabel: "See Content on /features",
  },
  {
    heading: "Brand context",
    detail:
      "Stores company knowledge in COMPANY.md and voice rules in TONE.md—capturing website structure, sitemap, existing content, brand positioning, and writing style prior to generation.",
    href: "/features#brand-context",
    linkLabel: "See Brand Context on /features",
  },
  {
    heading: "Analytics",
    detail:
      "Provides LLM tracking and brand interpretation workflows to see how language models describe your company, pricing, and category across recurring prompts.",
    href: "/features#analytics",
    linkLabel: "See Analytics on /features",
  },
  {
    heading: "AI visibility",
    detail:
      "Supports SEO, AEO, and GEO content structure alongside AI visibility tracking so pages remain clear for traditional search crawlers and modern AI answer engines.",
    href: "/resources#ai-visibility-checker",
    linkLabel: "Open AI Visibility framework",
  },
  {
    heading: "Social workflows",
    detail:
      "Covers Reddit workflows, Reddit research, draft Reddit comments grounded in brand voice, and backlink/community workflows organized for human review.",
    href: "/features#social",
    linkLabel: "See Social on /features",
  },
  {
    heading: "Publishing",
    detail:
      "Supports clean Markdown and HTML content export and structured review-to-publish handoff, with CMS publishing and GitHub publishing workflows designed into the project lifecycle.",
    href: "/features#publishing",
    linkLabel: "See Publishing on /features",
  },
  {
    heading: "Integrations",
    detail:
      "Target connectors on the publishing roadmap include WordPress, Webflow, Ghost, Contentful, Sanity, Strapi, Contao, and GitHub—each honestly marked as Planned on /integrations until live.",
    href: "/integrations",
    linkLabel: "Browse Integrations Directory",
  },
] as const;

export default function GehirnAlternativePage() {
  return (
    <PageShell
      breadcrumbs={[
        { name: "Alternatives", url: `${SITE_CONFIG.url}/alternatives` },
        {
          name: "Gehirn.md Alternative",
          url: `${SITE_CONFIG.url}/alternatives/gehirn`,
        },
      ]}
    >
      <PageHero
        eyebrow={`Gehirn.md Alternative · ${SITE_CONFIG.priceMonthly}${SITE_CONFIG.priceUnit}`}
        title={`Stak — A ${SITE_CONFIG.priceMonthly}${SITE_CONFIG.priceUnit} alternative to ${SITE_CONFIG.competitorName}.`}
        description="Full Gehirn-style capabilities at one flat $129/month plan—covering Research, Content, Brand Context, Analytics, AI visibility, Social workflows, Publishing, and Integrations."
        breadcrumbLabel="Gehirn.md Alternative"
        primaryCta={{ label: "Start with Stak", href: "/pricing" }}
        secondaryCta={{
          label: "Stak vs Gehirn.md",
          href: "/compare/stak-vs-gehirn",
        }}
      />

      {/* What Gehirn is / What Stak is / Pricing difference */}
      <Section labelledBy="overview-comparison-heading" muted>
        <SectionHeader
          headingId="overview-comparison-heading"
          eyebrow="Overview & Pricing"
          title={`Understanding ${SITE_CONFIG.competitorName} and Stak`}
          description="An objective look at both platforms and how Stak's single-plan pricing model is structured."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {OVERVIEW_BLOCKS.map((block) => (
            <article
              key={block.title}
              className="rounded-2xl border border-stone-200/90 bg-white p-6"
            >
              <h3 className="text-base font-semibold text-[#14181f]">
                {block.title}
              </h3>
              <p className="mt-2.5 text-sm leading-6 text-slate-600">
                {block.body}
              </p>
            </article>
          ))}
        </div>
      </Section>

      {/* Deep breakdown of every requested capability area */}
      <Section labelledBy="capability-areas-heading">
        <SectionHeader
          headingId="capability-areas-heading"
          eyebrow="Capability Breakdown"
          title="How Stak covers every workflow pillar"
          description="Explore research, content, brand context, analytics, AI visibility, social workflows, publishing, and integrations in detail."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {CAPABILITY_BREAKDOWN.map((item) => (
            <article
              key={item.heading}
              className="flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-6"
            >
              <div>
                <h3 className="text-base font-semibold text-[#14181f]">
                  {item.heading}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.detail}
                </p>
              </div>
              <div className="mt-5 border-t border-stone-200/75 pt-4">
                <Link
                  href={item.href}
                  className="text-sm font-medium text-[#14181f] underline decoration-stone-300 underline-offset-4 hover:decoration-[#14181f]"
                >
                  {item.linkLabel}
                </Link>
              </div>
            </article>
          ))}
        </div>

        <CompareCrossLinks currentPath="/alternatives/gehirn" />
      </Section>

      <PageCtaSection
        secondaryLink={{
          label: "Read Stak vs Gehirn.md",
          href: "/compare/stak-vs-gehirn",
        }}
      />
    </PageShell>
  );
}
