import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SITE_CONFIG } from "@/lib/site";

const FAQ_ITEMS = [
  {
    question: "What is Stak?",
    answer:
      "Stak is an AI search and content platform that helps companies research markets, generate brand-aligned content, improve SEO, AEO, and GEO visibility, and manage AI-search content workflows for $129/month.",
  },
  {
    question: "What is GEO?",
    answer:
      "GEO stands for Generative Engine Optimization. It focuses on structuring and writing clear, verifiable content so AI-powered search and answer systems can understand and reference your company accurately.",
  },
  {
    question: "What is AI search optimization?",
    answer:
      "AI search optimization combines traditional SEO fundamentals with direct-answer structure (AEO) and generative search clarity (GEO) so your pages are easy to discover across both search engines and AI assistants.",
  },
  {
    question: "How does Stak work?",
    answer:
      "Stak starts by learning your website, products, positioning, and writing style. It then runs a five-stage workflow—Research, Strategy, Writing, Optimization, and Review—to turn search opportunities into publish-ready drafts.",
  },
  {
    question: "How does Stak compare with Gehirn.md?",
    answer: `Stak is a $129/month alternative to ${SITE_CONFIG.competitorName}. Instead of comparing multiple plan tiers, Stak packages multi-agent research, brand context, content generation, AI visibility tracking, and publishing workflows under one flat monthly price.`,
  },
  {
    question: "Who is Stak for?",
    answer:
      "Stak is designed for B2B marketing teams, content leads, founders, and agencies that want one organized workflow for market research, brand-consistent writing, and search visibility.",
  },
  {
    question: "Does Stak monitor AI visibility?",
    answer:
      "Yes. LLM and AI visibility tracking is included in the $129/month Stak plan alongside SEO, AEO, and GEO content workflows.",
  },
  {
    question: "Does Stak work with AI search engines?",
    answer:
      "Yes. Stak helps teams research topics, structure direct answers, and maintain consistent brand context so content works well for both traditional search engines and modern AI search systems.",
  },
  {
    question: "How much does Stak cost?",
    answer: `Stak has one plan priced at ${SITE_CONFIG.priceMonthly}${SITE_CONFIG.priceUnit}. All core research, brand context, content generation, visibility tracking, and export workflows are part of that single plan.`,
  },
  {
    question: "Can agencies use Stak?",
    answer:
      "Yes. Agencies managing market research, brand voice, content projects, and SEO/AEO/GEO workflows for client websites can use Stak to keep research and writing aligned.",
  },
  {
    question: "Can I try Stak?",
    answer: `This site is the public marketing home for ${SITE_CONFIG.name} at ${SITE_CONFIG.url}. Enrollment details for the ${SITE_CONFIG.priceMonthly}${SITE_CONFIG.priceUnit} plan will be published here as public onboarding opens.`,
  },
] as const;

export function FaqSection() {
  return (
    <Section id="faq" labelledBy="faq-heading" muted>
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <SectionHeader
              headingId="faq-heading"
              eyebrow="FAQ"
              title="Frequently asked questions"
              description={`Direct answers about ${SITE_CONFIG.name}, GEO, AI search optimization, and our ${SITE_CONFIG.priceMonthly}${SITE_CONFIG.priceUnit} plan.`}
            />
          </div>
        </div>

        <div className="lg:col-span-8">
          <dl className="divide-y divide-stone-200/90 rounded-2xl border border-stone-200/90 bg-white">
            {FAQ_ITEMS.map((item) => (
              <div key={item.question} className="p-6 sm:px-8 sm:py-6">
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
