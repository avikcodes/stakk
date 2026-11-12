import Link from "next/link";
import { buildPageMetadata } from "@/lib/metadata";
import { SITE_CONFIG } from "@/lib/site";
import { PageShell } from "@/components/layout/PageShell";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { IntegrationsDirectory } from "@/components/integrations/IntegrationsDirectory";
import { PageCtaSection } from "@/components/ui/PageCtaSection";

export const metadata = buildPageMetadata({
  title: "Integrations",
  description:
    "Browse Stak's integrations directory across CMS platforms (WordPress, Webflow, Ghost, Contentful, Sanity, Strapi, Contao) and Developer / publishing (GitHub).",
  path: "/integrations",
});

export default function IntegrationsPage() {
  return (
    <PageShell
      breadcrumbs={[
        { name: "Integrations", url: `${SITE_CONFIG.url}/integrations` },
      ]}
    >
      <PageHero
        eyebrow="Integrations Directory"
        title="CMS and publishing integrations."
        description="Explore the CMS and developer publishing integrations planned for Stak. Every integration status is labeled transparently—nothing is marked Available before it is implemented."
        breadcrumbLabel="Integrations"
        primaryCta={{ label: "Start with Stak", href: "/pricing" }}
        secondaryCta={{
          label: "See Publishing Workflow",
          href: "/features#publishing",
        }}
      />

      <Section labelledBy="integrations-directory-heading" muted>
        <SectionHeader
          headingId="integrations-directory-heading"
          eyebrow="Directory"
          title="Filter by category or search integrations"
          description="Grouped by CMS and Developer / publishing, with clear status labels for every target connector."
        />

        <div className="mt-10">
          <IntegrationsDirectory />
        </div>

        <div className="mt-10 flex flex-wrap gap-6 text-sm">
          <Link
            href="/features#publishing"
            className="font-medium text-[#14181f] underline decoration-stone-300 underline-offset-4 hover:decoration-[#14181f]"
          >
            Read Publishing workflow on /features
          </Link>
          <Link
            href="/pricing"
            className="font-medium text-[#14181f] underline decoration-stone-300 underline-offset-4 hover:decoration-[#14181f]"
          >
            Review $129/month plan
          </Link>
        </div>
      </Section>

      <PageCtaSection
        secondaryLink={{ label: "Explore Use Cases", href: "/use-cases" }}
        muted={false}
      />
    </PageShell>
  );
}
