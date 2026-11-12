import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SITE_CONFIG } from "@/lib/site";

const PRICING_FAQS = [
  {
    question: "How many pricing plans does Stak have?",
    answer: `Stak has one plan: STAK at ${SITE_CONFIG.priceMonthly}${SITE_CONFIG.priceUnit}. There are no separate Starter, Growth, or Enterprise tiers splitting up core capabilities.`,
  },
  {
    question: "What capabilities are included for $129/month?",
    answer:
      "The $129/month plan includes Content (articles, projects, brand voice, content workflows), Research (keywords, multi-agent research, brainstorming, competitor research), Analytics (LLM tracking, AI visibility, brand interpretation), Social (Reddit workflows, backlinks, community workflows), and Publishing (export, publishing workflows, and CMS integrations).",
  },
  {
    question: "Are all CMS integrations live today?",
    answer:
      "No—and we state that transparently. Clean Markdown and HTML content exports and review-to-publish workflows are core outputs, while native connectors for GitHub, WordPress, Strapi, Sanity, Contentful, Webflow, Ghost, and Contao are planned roadmap integrations.",
  },
  {
    question: "How does Stak compare to Gehirn.md pricing?",
    answer: `Instead of choosing between four separate plan levels, Stak offers one flat ${SITE_CONFIG.priceMonthly}${SITE_CONFIG.priceUnit} subscription covering the major workflow categories. See our Stak vs Gehirn comparison for a full side-by-side overview.`,
  },
  {
    question: "Can agencies and content teams use the $129/month plan?",
    answer:
      "Yes. Marketing teams, editorial leads, and agencies running structured content projects, market research, LLM tracking, and Reddit/backlink workflows can use Stak under the same $129/month plan.",
  },
] as const;

export function PricingFaqSection() {
  return (
    <Section id="pricing-faq" labelledBy="pricing-faq-heading" muted>
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeader
            headingId="pricing-faq-heading"
            eyebrow="Pricing FAQ"
            title="Questions about the $129/month plan"
            description="Straightforward answers on plan scope, integrations, and comparing Stak vs Gehirn."
          />
          <div className="mt-6">
            <Link
              href="/compare/stak-vs-gehirn"
              className="text-sm font-medium text-[#14181f] underline decoration-stone-300 underline-offset-4 hover:decoration-[#14181f]"
            >
              Read Stak vs Gehirn →
            </Link>
          </div>
        </div>

        <div className="lg:col-span-8">
          <dl className="divide-y divide-stone-200/90 rounded-2xl border border-stone-200/90 bg-white">
            {PRICING_FAQS.map((item) => (
              <div key={item.question} className="p-6 sm:px-8">
                <dt className="text-base font-semibold text-[#14181f]">
                  {item.question}
                </dt>
                <dd className="mt-2 text-sm leading-6 text-slate-600">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Section>
  );
}

