import Link from "next/link";
import { ArrowRight, Compass, PenLine, Search, Workflow } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SITE_CONFIG } from "@/lib/site";

const WORKFLOW_CAPABILITIES = [
  {
    step: "01",
    icon: Search,
    title: "Market Research",
    description:
      "Research markets, topic demand, and competitive coverage before writing.",
  },
  {
    step: "02",
    icon: PenLine,
    title: "Brand-Aligned Content",
    description:
      "Create structured articles and pages aligned with your brand voice.",
  },
  {
    step: "03",
    icon: Compass,
    title: "SEO, AEO & GEO Visibility",
    description:
      "Improve visibility across traditional search and AI answer engines.",
  },
  {
    step: "04",
    icon: Workflow,
    title: "AI-Search Workflows",
    description:
      "Manage briefs, editorial production, and ongoing updates in one workflow.",
  },
] as const;

export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="cloud-atmosphere relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 lg:pt-28 lg:pb-32"
    >
      {/* Subtle architectural mist-horizon contour */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 320"
        fill="none"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-44 w-full text-stone-200/45 sm:h-56"
      >
        <path
          d="M0 240C240 180 420 280 720 220C1020 160 1200 240 1440 190V320H0V240Z"
          fill="currentColor"
          fillOpacity="0.22"
        />
        <path
          d="M0 270C300 230 520 300 840 250C1120 206 1280 265 1440 240V320H0V270Z"
          fill="#ffffff"
          fillOpacity="0.65"
        />
      </svg>

      <Container className="relative">
        <div className="animate-fade-up mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-stone-200/90 bg-white/85 px-4 py-1.5 text-xs font-medium text-slate-700 shadow-2xs backdrop-blur-sm">
            <span className="font-mono text-[#14181f]">
              {SITE_CONFIG.priceMonthly}
              {SITE_CONFIG.priceUnit}
            </span>
            <span className="text-stone-300" aria-hidden="true">
              |
            </span>
            <span>Alternative to {SITE_CONFIG.competitorName}</span>
          </div>

          <h1
            id="hero-heading"
            className="mt-7 font-serif text-4xl font-normal tracking-[-0.025em] text-balance text-[#14181f] sm:text-6xl sm:leading-[1.06]"
          >
            {SITE_CONFIG.title}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-pretty text-slate-600 sm:text-lg sm:leading-8">
            Stak helps companies research markets, create brand-aligned content,
            improve SEO, AEO, and GEO visibility, and manage AI-search content
            workflows—for a flat{" "}
            <span className="font-medium text-[#14181f]">
              {SITE_CONFIG.priceMonthly}
              {SITE_CONFIG.priceUnit}
            </span>
            .
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/pricing"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#14181f] px-6 py-3 text-sm font-medium text-white transition-all duration-150 hover:bg-[#232933] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14181f] focus-visible:ring-offset-2 sm:w-auto"
            >
              Start with Stak
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/features"
              className="inline-flex w-full items-center justify-center rounded-lg border border-stone-300/90 bg-white/85 px-6 py-3 text-sm font-medium text-[#14181f] transition-colors duration-150 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14181f] focus-visible:ring-offset-2 sm:w-auto"
            >
              See how it works
            </Link>
          </div>

          <p className="mt-4 font-mono text-xs text-slate-500">
            Flat {SITE_CONFIG.priceMonthly}
            {SITE_CONFIG.priceUnit} pricing · Built for teams leaving complex tiers
          </p>
        </div>

        {/* Restrained editorial workflow frame */}
        <div className="mx-auto mt-14 max-w-5xl overflow-hidden rounded-2xl border border-stone-200/90 bg-white/90 shadow-xs backdrop-blur-sm sm:mt-16">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 bg-[#f8f8f6]/90 px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-stone-300" aria-hidden="true" />
              <span className="font-mono text-xs text-slate-600">
                AI-Search &amp; Content Workflow
              </span>
            </div>
            <span className="font-mono text-xs font-medium text-[#14181f]">
              {SITE_CONFIG.priceMonthly}
              {SITE_CONFIG.priceUnit}
            </span>
          </div>

          <div className="grid divide-y divide-stone-200/80 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
            {WORKFLOW_CAPABILITIES.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="p-6 sm:odd:border-r sm:odd:border-stone-200/80 sm:[&:nth-child(-n+2)]:border-b sm:[&:nth-child(-n+2)]:border-stone-200/80 lg:odd:border-r-0 lg:[&:nth-child(-n+2)]:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 bg-[#fbfbfa] text-[#14181f]">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      {item.step}
                    </span>
                  </div>
                  <h2 className="mt-4 text-sm font-semibold tracking-tight text-[#14181f]">
                    {item.title}
                  </h2>
                  <p className="mt-1.5 text-sm leading-6 text-slate-600">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
