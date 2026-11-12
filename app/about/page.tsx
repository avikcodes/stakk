import Link from "next/link";
import { buildPageMetadata } from "@/lib/metadata";
import { SITE_CONFIG } from "@/lib/site";
import { PageShell } from "@/components/layout/PageShell";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PageCtaSection } from "@/components/ui/PageCtaSection";

export const metadata = buildPageMetadata({
  title: "About",
  description:
    "Learn what Stak is, its AI Search & Content Platform category, who it serves, and the product team building a $129/month alternative to Gehirn.md.",
  path: "/about",
});

const PRODUCT_IDENTITY = [
  {
    label: "Product Category",
    title: "AI Search & Content Platform",
    body: "Stak brings together SEO, Answer Engine Optimization (AEO), Generative Engine Optimization (GEO), multi-agent market research, brand context management, LLM tracking, social workflows, and publishing handoffs.",
  },
  {
    label: "Who It Is For",
    title: "Teams, agencies, founders, and publishers",
    body: "Designed for SaaS companies, SEO agencies, marketing agencies, in-house content teams, founders, ecommerce companies, and digital publishers that want research, writing, and AI visibility in one place.",
  },
  {
    label: "The Team Behind Stak",
    title: "Built by an independent product & search software team",
    body: "Stak is developed by an independent software team focused on practical editorial tooling—replacing opaque multi-tier pricing and generic prompt wrappers with explicit COMPANY.md and TONE.md context and flat $129/month pricing.",
  },
] as const;

const GUIDING_PRINCIPLES = [
  {
    title: "Research before writing",
    description:
      "Useful articles and comparison pages begin with keyword research, competitor analysis, live web lookup, and brainstorming rather than blank prompts.",
  },
  {
    title: "Explicit brand context",
    description:
      "COMPANY.md and TONE.md keep website structure, sitemap awareness, product boundaries, and writing style visible and editable across every stage.",
  },
  {
    title: "Human-in-the-loop accountability",
    description:
      "Drafts, article rewrites, and Reddit community replies go through human review before anything is exported or published.",
  },
  {
    title: "Honest pricing and roadmap transparency",
    description:
      "All core capability categories are included in one $129/month plan, and planned CMS or GitHub connectors are clearly labeled rather than oversold.",
  },
] as const;

export default function AboutPage() {
  return (
    <PageShell
      breadcrumbs={[{ name: "About", url: `${SITE_CONFIG.url}/about` }]}
    >
      <PageHero
        eyebrow="About Stak"
        title="Built to make AI search and brand-aligned content workflows clear."
        description={`${SITE_CONFIG.name} (${SITE_CONFIG.domain}) is an AI Search & Content Platform offering full ${SITE_CONFIG.competitorName}-style capabilities—research, content, brand context, analytics, social workflows, and publishing—in one flat ${SITE_CONFIG.priceMonthly}${SITE_CONFIG.priceUnit} plan.`}
        breadcrumbLabel="About"
        primaryCta={{ label: "Explore Features", href: "/features" }}
        secondaryCta={{ label: "View Use Cases", href: "/use-cases" }}
      />

      <Section labelledBy="what-is-stak-heading" muted>
        <SectionHeader
          headingId="what-is-stak-heading"
          eyebrow="Company & Category"
          title="What Stak is, who it serves, and why we built it"
          description="Stak was created around a simple observation: teams adopting AI search workflows need grounded brand context and predictable pricing more than another tier matrix."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PRODUCT_IDENTITY.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-stone-200/90 bg-white p-6"
            >
              <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
                {item.label}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-[#14181f]">
                {item.title}
              </h3>
              <p className="mt-2.5 text-sm leading-6 text-slate-600">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </Section>

      <Section labelledBy="about-principles-heading">
        <SectionHeader
          headingId="about-principles-heading"
          eyebrow="Operating Principles"
          title="How we build and communicate"
          description="Four principles that guide both the Stak product architecture and our public documentation."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {GUIDING_PRINCIPLES.map((item) => (
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

        <div className="mt-10 flex flex-wrap gap-6 text-sm">
          <Link
            href="/compare/stak-vs-gehirn"
            className="font-medium text-[#14181f] underline decoration-stone-300 underline-offset-4 hover:decoration-[#14181f]"
          >
            Compare Stak vs Gehirn.md
          </Link>
          <Link
            href="/pricing"
            className="font-medium text-[#14181f] underline decoration-stone-300 underline-offset-4 hover:decoration-[#14181f]"
          >
            Review $129/month Pricing
          </Link>
          <Link
            href="/security"
            className="font-medium text-[#14181f] underline decoration-stone-300 underline-offset-4 hover:decoration-[#14181f]"
          >
            Read Security Approach
          </Link>
          <Link
            href="/contact"
            className="font-medium text-[#14181f] underline decoration-stone-300 underline-offset-4 hover:decoration-[#14181f]"
          >
            Contact Stak
          </Link>
        </div>
      </Section>

      <PageCtaSection />
    </PageShell>
  );
}
