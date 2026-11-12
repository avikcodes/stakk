import Link from "next/link";
import { buildPageMetadata } from "@/lib/metadata";
import { SITE_CONFIG } from "@/lib/site";
import { PageShell } from "@/components/layout/PageShell";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { PageCtaSection } from "@/components/ui/PageCtaSection";

export const metadata = buildPageMetadata({
  title: "Privacy Policy",
  description:
    "Privacy Policy for Stak (stak.co.in) detailing public site data handling, brand context isolation, retention, and privacy rights.",
  path: "/privacy",
});

const PRIVACY_SECTIONS = [
  {
    heading: "1. Scope & Applicability",
    paragraphs: [
      `This Privacy Policy explains how ${SITE_CONFIG.name} (${SITE_CONFIG.url}) collects, uses, and protects information when you visit our public marketing website or use Stak product workflows.`,
    ],
  },
  {
    heading: "2. Information on Public Marketing Pages",
    paragraphs: [
      "You can browse every public page on stak.co.in without registering an account or submitting personal forms. Standard web hosting infrastructure may record transient technical request logs (such as requested URLs, HTTP status codes, and user-agent headers) to maintain site availability and security.",
    ],
  },
  {
    heading: "3. Workspace & Brand Context Information",
    paragraphs: [
      "When teams configure a Stak workspace, provided materials may include domain URLs, XML sitemaps, COMPANY.md product positioning files, TONE.md writing guidelines, keyword lists, and editorial drafts.",
      "This information is processed solely to perform your requested research, multi-agent analysis, content generation, rewriting, LLM tracking, and export workflows.",
    ],
  },
  {
    heading: "4. How Information Is Used & Shared",
    paragraphs: [
      "Stak does not sell customer brand context, editorial drafts, or personal information to third parties.",
      "Data is shared only with essential infrastructure and model-processing providers required to deliver requested workflows, bound by appropriate confidentiality and processing obligations, or when required by applicable law.",
    ],
  },
  {
    heading: "5. Data Retention & Deletion",
    paragraphs: [
      "Workspace materials and content projects are retained only as long as your subscription remains active or as necessary to comply with legal obligations. Workspace owners may export or request deletion of their company context and content records.",
    ],
  },
  {
    heading: "6. Security & Safeguards",
    paragraphs: [
      "We apply workspace isolation, access controls, and human-in-the-loop publishing safeguards as described on our Security page. No internet service can guarantee absolute security, so we encourage teams to avoid placing sensitive credentials inside editorial notes.",
    ],
  },
  {
    heading: "7. Policy Updates & Questions",
    paragraphs: [
      `Any revisions to this Privacy Policy will be published directly at ${SITE_CONFIG.url}/privacy with an updated effective date. For privacy-related questions, visit our Contact page.`,
    ],
  },
] as const;

export default function PrivacyPage() {
  return (
    <PageShell
      breadcrumbs={[
        { name: "Privacy Policy", url: `${SITE_CONFIG.url}/privacy` },
      ]}
    >
      <PageHero
        eyebrow="Privacy Policy · Effective November 11, 2026"
        title="Privacy Policy"
        description={`How ${SITE_CONFIG.name} (${SITE_CONFIG.domain}) handles public website visits, workspace brand context, and data retention.`}
        breadcrumbLabel="Privacy Policy"
        primaryCta={{ label: "Read Security Practices", href: "/security" }}
        secondaryCta={{ label: "Read Terms of Service", href: "/terms" }}
      />

      <Section labelledBy="privacy-doc-heading" muted>
        <div className="mx-auto max-w-3xl rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-10">
          <h2
            id="privacy-doc-heading"
            className="font-serif text-2xl font-normal tracking-tight text-[#14181f]"
          >
            Stak Privacy Policy
          </h2>

          <div className="mt-8 space-y-8">
            {PRIVACY_SECTIONS.map((item) => (
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
              href="/terms"
              className="font-medium text-[#14181f] underline decoration-stone-300 underline-offset-4 hover:decoration-[#14181f]"
            >
              Terms of Service
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
