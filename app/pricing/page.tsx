import { buildPageMetadata } from "@/lib/metadata";
import { SITE_CONFIG } from "@/lib/site";
import { PageShell } from "@/components/layout/PageShell";
import { PageHero } from "@/components/ui/PageHero";
import { PricingPlanSection } from "@/components/pricing/PricingPlanSection";
import { PricingIncludedSection } from "@/components/pricing/PricingIncludedSection";
import { PricingFaqSection } from "@/components/pricing/PricingFaqSection";
import { PageCtaSection } from "@/components/ui/PageCtaSection";

export const metadata = buildPageMetadata({
  title: "Pricing",
  description:
    "All the capabilities. One plan. $129/month. Stak includes Content, Research, Analytics, Social, and Publishing workflows in one flat subscription.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <PageShell
      breadcrumbs={[{ name: "Pricing", url: `${SITE_CONFIG.url}/pricing` }]}
    >
      <PageHero
        eyebrow={`Pricing · STAK ${SITE_CONFIG.priceMonthly}${SITE_CONFIG.priceUnit}`}
        title="All the capabilities. One plan. $129/month."
        description="The entire Stak product—Content, Research, Analytics, Social, Brand Context, and Publishing—is included in one flat monthly subscription."
        breadcrumbLabel="Pricing"
        primaryCta={{ label: "Start with Stak", href: "/contact" }}
        secondaryCta={{ label: "Stak vs Gehirn", href: "/compare/stak-vs-gehirn" }}
      />

      <PricingPlanSection />
      <PricingIncludedSection />
      <PricingFaqSection />

      <PageCtaSection
        primaryCtaHref="/contact"
        secondaryLink={{ label: "Stak vs Gehirn", href: "/compare/stak-vs-gehirn" }}
        muted={false}
      />
    </PageShell>
  );
}
