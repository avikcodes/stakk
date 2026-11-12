import Link from "next/link";
import { buildPageMetadata } from "@/lib/metadata";
import { SITE_CONFIG } from "@/lib/site";
import { PageShell } from "@/components/layout/PageShell";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  ResourceCategoriesIndex,
  ResourcesCatalog,
} from "@/components/resources/ResourcesCatalog";
import { PageCtaSection } from "@/components/ui/PageCtaSection";

export const metadata = buildPageMetadata({
  title: "Resources",
  description:
    "Guides and playbooks across AI Visibility, GEO, AEO, AI SEO, SEO, Content Strategy, and Research.",
  path: "/resources",
});

export default function ResourcesPage() {
  return (
    <PageShell
      breadcrumbs={[{ name: "Resources", url: `${SITE_CONFIG.url}/resources` }]}
    >
      <PageHero
        eyebrow="Resources"
        title="Guides for AI visibility, GEO, AEO, and modern search."
        description="Practical documentation across AI Visibility, GEO, AEO, AI SEO, SEO, Content Strategy, and Research—built around brand context and verifiable HTML content."
        breadcrumbLabel="Resources"
        primaryCta={{ label: "Read What is GEO?", href: "/resources/what-is-geo" }}
        secondaryCta={{ label: "Visit the Blog", href: "/blog" }}
      />

      <Section labelledBy="resource-library-heading" muted>
        <SectionHeader
          headingId="resource-library-heading"
          eyebrow="Resource Library"
          title="Browse guides by discipline"
          description="Filter across all seven categories or open any guide directly."
        />

        <div className="mt-10">
          <ResourcesCatalog />
        </div>
      </Section>

      <Section labelledBy="resource-categories-heading">
        <SectionHeader
          headingId="resource-categories-heading"
          eyebrow="Coverage"
          title="Topic architecture across seven search & content disciplines"
          description="Our resource library is organized around the core workflows teams manage inside Stak."
        />

        <div className="mt-10">
          <ResourceCategoriesIndex />
        </div>

        <div className="mt-10 flex flex-wrap gap-6 text-sm">
          <Link
            href="/blog"
            className="font-medium text-[#14181f] underline decoration-stone-300 underline-offset-4 hover:decoration-[#14181f]"
          >
            Read editorial essays on /blog
          </Link>
          <Link
            href="/compare/stak-vs-gehirn"
            className="font-medium text-[#14181f] underline decoration-stone-300 underline-offset-4 hover:decoration-[#14181f]"
          >
            Compare Stak vs Gehirn.md
          </Link>
          <Link
            href="/alternatives/gehirn"
            className="font-medium text-[#14181f] underline decoration-stone-300 underline-offset-4 hover:decoration-[#14181f]"
          >
            Explore Gehirn.md Alternatives
          </Link>
        </div>
      </Section>

      <PageCtaSection />
    </PageShell>
  );
}
