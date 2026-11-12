import Link from "next/link";
import { Building2, FileText, Mail, ShieldCheck } from "lucide-react";
import { buildPageMetadata } from "@/lib/metadata";
import { SITE_CONFIG } from "@/lib/site";
import { PageShell } from "@/components/layout/PageShell";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PageCtaSection } from "@/components/ui/PageCtaSection";

export const metadata = buildPageMetadata({
  title: "Contact",
  description:
    "Contact Stak for product and $129/month plan questions, agency workflow inquiries, security disclosures, and privacy or legal requests.",
  path: "/contact",
});

const CONTACT_CHANNELS = [
  {
    icon: Mail,
    category: "Product & Plan Inquiries",
    title: "Questions on the $129/month plan",
    description:
      "Review included Content, Research, Analytics, Social, Brand Context, and Publishing workflows or ask about team onboarding.",
    href: "/pricing",
    linkLabel: "View $129/month plan",
  },
  {
    icon: Building2,
    category: "Agencies & Multi-Project Teams",
    title: "Agency & multi-brand workflows",
    description:
      "Learn how SEO agencies, marketing agencies, and content teams structure separate COMPANY.md and TONE.md workspaces per client.",
    href: "/use-cases",
    linkLabel: "Explore agency use cases",
  },
  {
    icon: ShieldCheck,
    category: "Security & Vulnerability Disclosure",
    title: "Security practices & reporting",
    description:
      "Review workspace isolation, human-in-the-loop review controls, and least-privilege connector boundaries before reaching out.",
    href: "/security",
    linkLabel: "Read Security page",
  },
  {
    icon: FileText,
    category: "Privacy & Legal",
    title: "Privacy Policy & Terms inquiries",
    description:
      "Inspect how public website information, brand context data, retention, and subscription terms are documented.",
    href: "/privacy",
    linkLabel: "Read Privacy Policy",
  },
] as const;

const INQUIRY_CHECKLIST = [
  "Your company or agency website URL (so context scope is clear)",
  "Primary workflows you are evaluating (Content, Research, Analytics, Social, or Publishing)",
  "Whether you are evaluating Stak as a Gehirn.md alternative",
  "Any CMS or GitHub publishing integrations your team relies on",
] as const;

export default function ContactPage() {
  return (
    <PageShell
      breadcrumbs={[{ name: "Contact", url: `${SITE_CONFIG.url}/contact` }]}
    >
      <PageHero
        eyebrow="Contact"
        title="Contact the Stak team."
        description={`Official inquiry paths and preparation checklist for teams evaluating ${SITE_CONFIG.name} at ${SITE_CONFIG.domain}.`}
        breadcrumbLabel="Contact"
        primaryCta={{ label: "Review $129/month Plan", href: "/pricing" }}
        secondaryCta={{ label: "Explore Features", href: "/features" }}
      />

      <Section labelledBy="contact-channels-heading" muted>
        <SectionHeader
          headingId="contact-channels-heading"
          eyebrow="Inquiry Areas"
          title="Where to start based on your question"
          description="Select the area that matches your inquiry to inspect documentation or prepare your request."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {CONTACT_CHANNELS.map((channel) => {
            const Icon = channel.icon;
            return (
              <article
                key={channel.title}
                className="flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-6"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-[#fbfbfa] text-[#14181f]">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
                      {channel.category}
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-[#14181f]">
                    {channel.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {channel.description}
                  </p>
                </div>

                <div className="mt-5 border-t border-stone-200/80 pt-4">
                  <Link
                    href={channel.href}
                    className="text-sm font-medium text-[#14181f] underline decoration-stone-300 underline-offset-4 hover:decoration-[#14181f]"
                  >
                    {channel.linkLabel}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </Section>

      <Section labelledBy="contact-guidance-heading">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-6">
            <SectionHeader
              headingId="contact-guidance-heading"
              eyebrow="Inquiry Checklist"
              title="Helpful context to include when reaching out"
              description={`Public enrollment updates and official communication for ${SITE_CONFIG.name} are published directly on ${SITE_CONFIG.url}.`}
            />
          </div>

          <div className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-8 lg:col-span-6">
            <h3 className="text-base font-semibold text-[#14181f]">
              Recommended details
            </h3>
            <ul className="mt-4 space-y-3">
              {INQUIRY_CHECKLIST.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm leading-6 text-slate-600"
                >
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#14181f]"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap gap-5 border-t border-stone-200/80 pt-5 text-sm">
              <Link
                href="/about"
                className="font-medium text-[#14181f] underline decoration-stone-300 underline-offset-4 hover:decoration-[#14181f]"
              >
                About Stak
              </Link>
              <Link
                href="/privacy"
                className="font-medium text-[#14181f] underline decoration-stone-300 underline-offset-4 hover:decoration-[#14181f]"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="font-medium text-[#14181f] underline decoration-stone-300 underline-offset-4 hover:decoration-[#14181f]"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </Section>

      <PageCtaSection />
    </PageShell>
  );
}
