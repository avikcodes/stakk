import Link from "next/link";
import { buildPageMetadata } from "@/lib/metadata";
import { SITE_CONFIG } from "@/lib/site";
import { PageShell } from "@/components/layout/PageShell";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { PageCtaSection } from "@/components/ui/PageCtaSection";

export const metadata = buildPageMetadata({
  title: "Terms of Service",
  description:
    "Terms of Service for Stak (stak.co.in) governing public website use, the $129/month subscription plan, content ownership, and acceptable use.",
  path: "/terms",
});

const TERMS_SECTIONS = [
  {
    heading: "1. Acceptance of Terms",
    paragraphs: [
      `By accessing ${SITE_CONFIG.url} or subscribing to ${SITE_CONFIG.name}, you agree to be bound by these Terms of Service and our Privacy Policy.`,
    ],
  },
  {
    heading: "2. Subscription Scope & $129/month Plan",
    paragraphs: [
      `${SITE_CONFIG.name} is offered as a single flat ${SITE_CONFIG.priceMonthly}${SITE_CONFIG.priceUnit} subscription covering Content, Research, Analytics, Social, Brand Context, and Publishing workflows as described on our Features and Pricing pages.`,
      "Unless explicitly stated as Live or Available, roadmap integrations (such as native CMS and GitHub connectors listed on /integrations) remain planned additions and are not guaranteed as immediately active.",
    ],
  },
  {
    heading: "3. Customer Ownership of Content & Brand Context",
    paragraphs: [
      "Customers retain all rights and ownership over their website materials, COMPANY.md and TONE.md files, research briefs, and generated or edited drafts.",
      "You grant Stak a limited license solely to process those materials to operate your workspace and deliver the outputs you request.",
    ],
  },
  {
    heading: "4. Human Review & Publishing Responsibility",
    paragraphs: [
      "Stak is designed with a human-in-the-loop review workflow. You are responsible for reviewing generated articles, rewrites, citations, and Reddit comments for factual accuracy, legal compliance, and community rules before publishing externally.",
    ],
  },
  {
    heading: "5. Acceptable Use",
    paragraphs: [
      "You agree not to use Stak to distribute unlawful, deceptive, or infringing content, automate spam across Reddit or third-party communities, or attempt to disrupt or probe platform infrastructure.",
    ],
  },
  {
    heading: "6. Disclaimers & Limitation of Liability",
    paragraphs: [
      "The website and service are provided on an 'as is' and 'as available' basis. To the maximum extent permitted by law, Stak disclaims implied warranties and is not liable for indirect, incidental, or consequential damages arising from third-party publishing platforms, search ranking fluctuations, or unreviewed publications.",
    ],
  },
  {
    heading: "7. Changes to Terms",
    paragraphs: [
      `We may update these Terms of Service from time to time by posting the revised version at ${SITE_CONFIG.url}/terms.`,
    ],
  },
] as const;

export default function TermsPage() {
  return (
    <PageShell
      breadcrumbs={[{ name: "Terms", url: `${SITE_CONFIG.url}/terms` }]}
    >
      <PageHero
        eyebrow="Terms of Service · Effective November 11, 2026"
        title="Terms of Service"
        description={`Terms governing use of ${SITE_CONFIG.name} (${SITE_CONFIG.domain}) and the ${SITE_CONFIG.priceMonthly}${SITE_CONFIG.priceUnit} subscription.`}
        breadcrumbLabel="Terms"
        primaryCta={{ label: "View $129/month Plan", href: "/pricing" }}
        secondaryCta={{ label: "Read Privacy Policy", href: "/privacy" }}
      />

      <Section labelledBy="terms-doc-heading" muted>
        <div className="mx-auto max-w-3xl rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-10">
          <h2
            id="terms-doc-heading"
            className="font-serif text-2xl font-normal tracking-tight text-[#14181f]"
          >
            Stak Terms of Service
          </h2>

          <div className="mt-8 space-y-8">
            {TERMS_SECTIONS.map((item) => (
              <section key={item.heading}>
                <h3 className="text-base font-semibold text-[#14181f]">
                  {item.heading}
                </h3>
                <div className="mt-2 space-y-3">
                  {item.paragraphs.map((para) => (
                    <p
                      key={para}
                      className="text-sm leading-7 text-slate-600"
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-6 border-t border-stone-200/80 pt-6 text-sm">
            <Link
              href="/privacy"
              className="font-medium text-[#14181f] underline decoration-stone-300 underline-offset-4 hover:decoration-[#14181f]"
            >
              Privacy Policy
            </Link>
            <Link
              href="/security"
              className="font-medium text-[#14181f] underline decoration-stone-300 underline-offset-4 hover:decoration-[#14181f]"
            >
              Security
            </Link>
            <Link
              href="/contact"
              className="font-medium text-[#14181f] underline decoration-stone-300 underline-offset-4 hover:decoration-[#14181f]"
            >
              Contact
            </Link>
          </div>
        </div>
      </Section>

      <PageCtaSection muted={false} />
    </PageShell>
  );
}
