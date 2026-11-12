import Link from "next/link";
import { buildPageMetadata } from "@/lib/metadata";
import { SITE_CONFIG } from "@/lib/site";
import { PageShell } from "@/components/layout/PageShell";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import {
  USE_CASE_ENTRIES,
  UseCaseSections,
} from "@/components/use-cases/UseCaseSections";
import { PageCtaSection } from "@/components/ui/PageCtaSection";

export const metadata = buildPageMetadata({
  title: "Use Cases",
  description:
    "How SaaS companies, SEO agencies, marketing agencies, content teams, founders, ecommerce companies, and publishers use Stak.",
  path: "/use-cases",
});

export default function UseCasesPage() {
  return (
    <PageShell
      breadcrumbs={[{ name: "Use Cases", url: `${SITE_CONFIG.url}/use-cases` }]}
    >
      <PageHero
        eyebrow="Use Cases"
        title="How teams and companies use Stak."
        description="Dedicated workflows for SaaS companies, SEO agencies, marketing agencies, content teams, founders, ecommerce companies, and publishers—all included in one $129/month plan."
        breadcrumbLabel="Use Cases"
        primaryCta={{ label: "Start with Stak", href: "/pricing" }}
        secondaryCta={{ label: "Explore all features", href: "/features" }}
      />

      {/* Quick audience jump bar */}
      <div className="border-b border-stone-200/80 bg-white py-4">
        <Container>
          <nav
            aria-label="Use case categories"
            className="flex flex-wrap items-center gap-2"
          >
            <span className="mr-2 font-mono text-[11px] uppercase tracking-wider text-slate-500">
              Jump to:
            </span>
            {USE_CASE_ENTRIES.map((uc) => (
              <Link
                key={uc.id}
                href={`#${uc.id}`}
                className="rounded-lg border border-stone-200/90 bg-[#fbfbfa] px-3 py-1.5 font-mono text-xs text-slate-700 transition-colors hover:border-stone-300 hover:bg-white hover:text-[#14181f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14181f] focus-visible:ring-offset-2"
              >
                {uc.label}
              </Link>
            ))}
          </nav>
        </Container>
      </div>

      <UseCaseSections />

      <PageCtaSection
        secondaryLink={{ label: "Explore Integrations", href: "/integrations" }}
        muted={false}
      />
    </PageShell>
  );
}
