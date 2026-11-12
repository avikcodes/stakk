import Link from "next/link";
import { EyeOff, KeyRound, Lock, ShieldCheck, UserCheck } from "lucide-react";
import { buildPageMetadata } from "@/lib/metadata";
import { SITE_CONFIG } from "@/lib/site";
import { PageShell } from "@/components/layout/PageShell";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PageCtaSection } from "@/components/ui/PageCtaSection";

export const metadata = buildPageMetadata({
  title: "Security",
  description:
    "Stak's practical approach to security, brand context isolation, human-in-the-loop publishing controls, and privacy—stated plainly without invented certifications.",
  path: "/security",
});

const SECURITY_CONTROLS = [
  {
    icon: Lock,
    title: "Workspace & Brand Context Isolation",
    body: "Each organization's COMPANY.md, TONE.md, sitemap structure, and content projects are scoped to its own workspace boundaries and are not shared with unrelated customers.",
  },
  {
    icon: UserCheck,
    title: "Human-in-the-Loop Publishing Controls",
    body: "Generated articles, content rewrites, and Reddit comment drafts require explicit human review before export or publishing—preventing unreviewed automated posts.",
  },
  {
    icon: KeyRound,
    title: "Least-Privilege Connector Scope",
    body: "Planned CMS and GitHub integrations are designed to request only the permissions needed to create drafts or pull requests inside selected repositories or collections.",
  },
  {
    icon: EyeOff,
    title: "Data Minimization on Public Pages",
    body: `Browsing ${SITE_CONFIG.domain} requires no account creation or personal data submission, keeping public marketing traffic separate from customer workspaces.`,
  },
] as const;

export default function SecurityPage() {
  return (
    <PageShell
      breadcrumbs={[{ name: "Security", url: `${SITE_CONFIG.url}/security` }]}
    >
      <PageHero
        eyebrow="Security & Privacy Approach"
        title="Practical safeguards for your brand context and content workflows."
        description="We document Stak's architectural and operational approach to security and privacy plainly—without claiming third-party audit badges or certifications we do not hold."
        breadcrumbLabel="Security"
        primaryCta={{ label: "Read Privacy Policy", href: "/privacy" }}
        secondaryCta={{ label: "Read Terms of Service", href: "/terms" }}
      />

      <Section labelledBy="security-controls-heading" muted>
        <SectionHeader
          headingId="security-controls-heading"
          eyebrow="Architecture & Controls"
          title="How Stak protects company context and publishing safety"
          description="Security in an AI search and content platform starts with workspace isolation, minimal data collection, and human sign-off."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {SECURITY_CONTROLS.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="rounded-2xl border border-stone-200/90 bg-white p-6"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-[#fbfbfa] text-[#14181f]">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-[#14181f]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.body}
                </p>
              </article>
            );
          })}
        </div>
      </Section>

      <Section labelledBy="transparency-note-heading">
        <div className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-[#fbfbfa] text-[#14181f]">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2
                id="transparency-note-heading"
                className="font-serif text-2xl font-normal tracking-tight text-[#14181f]"
              >
                Transparency regarding certifications
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Stak does not display unverified compliance seals or fabricated
                security certifications. As formal third-party assessments or
                attestations are completed in the future, they will be
                documented accurately on this page.
              </p>
              <div className="mt-5 flex flex-wrap gap-6 text-sm">
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
                <Link
                  href="/contact"
                  className="font-medium text-[#14181f] underline decoration-stone-300 underline-offset-4 hover:decoration-[#14181f]"
                >
                  Contact Stak
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <PageCtaSection />
    </PageShell>
  );
}
