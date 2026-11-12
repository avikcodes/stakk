import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/site";
import { getHomepageStructuredData } from "@/lib/structured-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { AtmosphericSky } from "@/components/ui/AtmosphericSky";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { HeroSection } from "@/components/sections/HeroSection";
import { LogoMarqueeSection } from "@/components/sections/LogoMarqueeSection";
import { ToolIntroSection } from "@/components/sections/ToolIntroSection";
import { CoreCapabilitiesSection } from "@/components/sections/CoreCapabilitiesSection";
import { ResultsSection } from "@/components/sections/ResultsSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { PhilosophySection } from "@/components/sections/PhilosophySection";
import { IntegrationsSection } from "@/components/sections/IntegrationsSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";

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
    <div className="relative min-h-screen text-[#14181f] overflow-x-hidden selection:bg-[#14181f] selection:text-white">
      {/* Soft atmospheric fixed sky backdrop matching Gehirn's ghibli sky treatment */}
      <AtmosphericSky />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-[#14181f] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to content
      </a>

      <JsonLd data={getHomepageStructuredData()} />

      {/* Centered editorial panel container matching Gehirn's signature layout */}
      <div className="flex w-full flex-col sm:py-10 md:py-12">
        <div className="mx-auto flex min-h-[100dvh] w-full max-w-[740px] lg:max-w-[840px] flex-col bg-white/70 backdrop-blur-md sm:min-h-[calc(100vh-6rem)] sm:rounded-2xl sm:border sm:border-stone-200/80 sm:shadow-[0_20px_60px_rgba(20,24,31,0.06)]">
          <SiteHeader />

          <main id="main-content" className="flex min-h-0 flex-1 flex-col px-6 pt-4 pb-6 sm:py-8">
            <HeroSection />
            <LogoMarqueeSection />
            <ToolIntroSection />
            <CoreCapabilitiesSection />
            <ResultsSection />
            <PricingSection />
            <PhilosophySection />
            <IntegrationsSection />
            <FaqSection />
            <FinalCtaSection />
          </main>

          <SiteFooter />
        </div>
      </div>
    </div>
  );
}
