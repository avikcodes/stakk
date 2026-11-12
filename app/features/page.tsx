import { buildPageMetadata } from "@/lib/metadata";
import { SITE_CONFIG } from "@/lib/site";
import { PageShell } from "@/components/layout/PageShell";
import { FeaturesHero } from "@/components/features/FeaturesHero";
import { ContentCapabilitySection } from "@/components/features/ContentCapabilitySection";
import { ResearchCapabilitySection } from "@/components/features/ResearchCapabilitySection";
import { AnalyticsCapabilitySection } from "@/components/features/AnalyticsCapabilitySection";
import { SocialCapabilitySection } from "@/components/features/SocialCapabilitySection";
import { BrandContextCapabilitySection } from "@/components/features/BrandContextCapabilitySection";
import { PublishingCapabilitySection } from "@/components/features/PublishingCapabilitySection";
import { PageCtaSection } from "@/components/ui/PageCtaSection";

export const metadata = buildPageMetadata({
  title: "Features",
  description:
    "Complete Stak product features across Content, Research, Analytics, Social, Brand Context, and Publishing—all included in one $129/month plan.",
  path: "/features",
});

export default function FeaturesPage() {
  return (
    <PageShell
      breadcrumbs={[{ name: "Features", url: `${SITE_CONFIG.url}/features` }]}
    >
      <FeaturesHero />
      <ContentCapabilitySection />
      <ResearchCapabilitySection />
      <AnalyticsCapabilitySection />
      <SocialCapabilitySection />
      <BrandContextCapabilitySection />
      <PublishingCapabilitySection />
      <PageCtaSection
        secondaryLink={{
          label: "Compare Stak vs Gehirn.md",
          href: "/compare/stak-vs-gehirn",
        }}
      />
    </PageShell>
  );
}
