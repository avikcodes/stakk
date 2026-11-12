import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/site";
import { getHomepageStructuredData } from "@/lib/structured-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { HeroSection } from "@/components/sections/HeroSection";
import { WhatStakDoesSection } from "@/components/sections/WhatStakDoesSection";
import { ResearchSection } from "@/components/sections/ResearchSection";
import { ContentSection } from "@/components/sections/ContentSection";
import { BrandContextSection } from "@/components/sections/BrandContextSection";
import { AiSearchGeoSection } from "@/components/sections/AiSearchGeoSection";
import { WorkflowSection } from "@/components/sections/WorkflowSection";
import { UseCasesSection } from "@/components/sections/UseCasesSection";
import { IntegrationsSection } from "@/components/sections/IntegrationsSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { ComparisonSection } from "@/components/sections/ComparisonSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { ResourcesSection } from "@/components/sections/ResourcesSection";
import { TrustSection } from "@/components/sections/TrustSection";

export const metadata: Metadata = {
  title: {
    absolute: SITE_CONFIG.title,
  },
  description: SITE_CONFIG.description,
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-[#14181f] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to content
      </a>
      <JsonLd data={getHomepageStructuredData()} />
      <SiteHeader />
      <main id="main-content" className="flex-1">
        <HeroSection />
        <WhatStakDoesSection />
        <ResearchSection />
        <ContentSection />
        <BrandContextSection />
        <AiSearchGeoSection />
        <WorkflowSection />
        <UseCasesSection />
        <IntegrationsSection />
        <PricingSection />
        <ComparisonSection />
        <FaqSection />
        <ResourcesSection />
        <TrustSection />
      </main>
      <SiteFooter />
    </div>
  );
}
