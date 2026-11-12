import Link from "next/link";
import { buildPageMetadata } from "@/lib/metadata";
import { SITE_CONFIG } from "@/lib/site";
import { PageShell } from "@/components/layout/PageShell";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DetailedComparisonTable } from "@/components/compare/DetailedComparisonTable";
import { CompareCrossLinks } from "@/components/compare/CompareCrossLinks";
import { PageCtaSection } from "@/components/ui/PageCtaSection";

export const metadata = buildPageMetadata({
  title: "Stak vs Gehirn.md",
  description:
    "Full Gehirn-style capabilities at one flat $129/month plan. Honest side-by-side comparison of Stak vs Gehirn.md across pricing, research, content, AI visibility, brand context, and integrations.",
  path: "/compare/stak-vs-gehirn",
});

const EVALUATION_SUMMARY = [
  {
    title: "When Stak is a strong fit",
    points: [
      "You want full Gehirn-style capabilities at one flat $129/month plan.",
      "You prefer a single transparent subscription over evaluating four separate plan tiers.",
      "You want COMPANY.md and TONE.md brand context, multi-agent research, LLM tracking, Reddit/backlink workflows, and human review under one plan.",
    ],
  },
  {
    title: "What to verify on Gehirn.md",
    points: [
      "Review Gehirn.md's official pricing page to see current monthly limits and tier structures.",
      "Check which live CMS or repository integrations are active today if immediate one-click CMS sync is a requirement.",
      "Compare how each platform's research and review workflow aligns with your editorial team.",
    ],
  },
] as const;

export default function StakVsGehirnPage() {
  return (
    <PageShell
      breadcrumbs={[
        { name: "Compare", url: `${SITE_CONFIG.url}/compare` },
        {
          name: "Stak vs Gehirn.md",
          url: `${SITE_CONFIG.url}/compare/stak-vs-gehirn`,
        },
      ]}
    >
      <PageHero
        eyebrow={`Comparison · Stak vs ${SITE_CONFIG.competitorName}`}
        title={`Stak vs ${SITE_CONFIG.competitorName}`}
        description={`Full ${SITE_CONFIG.competitorName}-style capabilities at one flat ${SITE_CONFIG.priceMonthly}${SITE_CONFIG.priceUnit} plan. An honest side-by-side comparison across pricing, research, content, brand context, AI visibility, social workflows, and publishing.`}
        breadcrumbLabel="Stak vs Gehirn.md"
        primaryCta={{ label: "Start with Stak", href: "/pricing" }}
        secondaryCta={{
          label: "Read Gehirn.md Alternative",
          href: "/alternatives/gehirn",
        }}
      />

      <Section labelledBy="detailed-table-heading" muted>
        <SectionHeader
          headingId="detailed-table-heading"
          eyebrow="Side-by-Side Comparison"
          title="Full Gehirn-style capabilities at one flat $129/month plan."
          description={`Compare ${SITE_CONFIG.name} and ${SITE_CONFIG.competitorName} objectively across core workflow categories without inflated claims.`}
        />

        <div className="mt-10">
          <DetailedComparisonTable />
        </div>
      </Section>

      <Section labelledBy="fit-guide-heading">
        <SectionHeader
          headingId="fit-guide-heading"
          eyebrow="Evaluation Guide"
          title="How to decide between Stak and Gehirn.md"
          description="Practical considerations for marketing teams, SEO agencies, and founders reviewing both platforms."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {EVALUATION_SUMMARY.map((col) => (
            <article
              key={col.title}
              className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-8"
            >
              <h3 className="text-base font-semibold text-[#14181f]">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.points.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2.5 text-sm leading-6 text-slate-600"
                  >
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#14181f]"
                      aria-hidden="true"
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-6 text-sm">
          <Link
            href="/features"
            className="font-medium text-[#14181f] underline decoration-stone-300 underline-offset-4 hover:decoration-[#14181f]"
          >
            Inspect complete Stak Features
          </Link>
          <Link
            href="/integrations"
            className="font-medium text-[#14181f] underline decoration-stone-300 underline-offset-4 hover:decoration-[#14181f]"
          >
            Review Integrations Directory
          </Link>
          <Link
            href="/pricing"
            className="font-medium text-[#14181f] underline decoration-stone-300 underline-offset-4 hover:decoration-[#14181f]"
          >
            See $129/month Single Plan
          </Link>
        </div>

        <CompareCrossLinks currentPath="/compare/stak-vs-gehirn" />
      </Section>

      <PageCtaSection />
    </PageShell>
  );
}
