import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SITE_CONFIG } from "@/lib/site";

const INCLUDED_PILLARS = [
  {
    title: "Complete workflow coverage from day one",
    body: "You do not have to start on a stripped-down tier and upgrade later to unlock multi-agent research, brand interpretation, or Reddit workflows. Every major category is included in the $129/month subscription.",
  },
  {
    title: "Company context & brand voice built in",
    body: "Every workflow references your COMPANY.md and TONE.md brand context, website structure, sitemap, and existing content so articles, rewrites, and Reddit replies remain grounded in your business.",
  },
  {
    title: "Honest publishing & integration scope",
    body: "Structured Markdown and HTML export workflows work across any publishing stack today. Native connectors for GitHub and CMS platforms (WordPress, Strapi, Sanity, Contentful, Webflow, Ghost, Contao) are clearly marked as planned roadmap connectors.",
  },
] as const;

export function PricingIncludedSection() {
  return (
    <Section id="included" labelledBy="pricing-included-heading">
      <SectionHeader
        headingId="pricing-included-heading"
        eyebrow="What Is Included"
        title="How the single $129/month plan works"
        description={`A transparent look at what is included in ${SITE_CONFIG.name} and how it relates to our full feature set.`}
      />

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {INCLUDED_PILLARS.map((item) => (
          <article
            key={item.title}
            className="rounded-xl border border-stone-200/90 bg-white p-6"
          >
            <h3 className="text-base font-semibold text-[#14181f]">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-6 text-sm">
        <Link
          href="/features"
          className="font-medium text-[#14181f] underline decoration-stone-300 underline-offset-4 hover:decoration-[#14181f]"
        >
          Inspect full feature breakdowns on /features
        </Link>
        <Link
          href="/compare/stak-vs-gehirn"
          className="font-medium text-[#14181f] underline decoration-stone-300 underline-offset-4 hover:decoration-[#14181f]"
        >
          Read Stak vs Gehirn comparison
        </Link>
        <Link
          href="/integrations"
          className="font-medium text-[#14181f] underline decoration-stone-300 underline-offset-4 hover:decoration-[#14181f]"
        >
          See Publishing &amp; Integrations roadmap
        </Link>
      </div>
    </Section>
  );
}

