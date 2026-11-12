import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SITE_CONFIG } from "@/lib/site";

const WORKFLOW_PIPELINE = [
  {
    step: "01",
    label: "Company Context",
    detail: "COMPANY.md, TONE.md, sitemap, existing pages, and positioning",
  },
  {
    step: "02",
    label: "Research",
    detail: "Keyword research, competitor research, and live web research",
  },
  {
    step: "03",
    label: "Multi-Agent Analysis",
    detail: "Brainstorming, topic prioritization, and search angle selection",
  },
  {
    step: "04",
    label: "Content",
    detail: "AI article generation, rewriting, and Reddit community drafts",
  },
  {
    step: "05",
    label: "Optimization",
    detail: "SEO, AEO, and GEO structure for search and AI visibility",
  },
  {
    step: "06",
    label: "Review",
    detail: "Human review workflow for accuracy, tone, and brand fit",
  },
  {
    step: "07",
    label: "Publish",
    detail: "Content export, CMS publishing, and GitHub workflows",
  },
] as const;

const FEATURE_SECTION_LINKS = [
  { label: "01 · Content", href: "#content" },
  { label: "02 · Research", href: "#research" },
  { label: "03 · Analytics", href: "#analytics" },
  { label: "04 · Social", href: "#social" },
  { label: "05 · Brand Context", href: "#brand-context" },
  { label: "06 · Publishing", href: "#publishing" },
] as const;

export function FeaturesHero() {
  return (
    <section
      aria-labelledby="features-hero-heading"
      className="cloud-atmosphere relative overflow-hidden border-b border-stone-200/80 pt-14 pb-16 sm:pt-20 sm:pb-24"
    >
      <Container>
        <div className="animate-fade-up max-w-3xl">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-stone-200/90 bg-white/85 px-4 py-1.5 text-xs font-medium text-slate-700 shadow-2xs">
            <span className="font-mono text-[#14181f]">Product Features</span>
            <span className="text-stone-300" aria-hidden="true">
              |
            </span>
            <span>
              Complete {SITE_CONFIG.competitorName} alternative ·{" "}
              {SITE_CONFIG.priceMonthly}
              {SITE_CONFIG.priceUnit}
            </span>
          </div>

          <h1
            id="features-hero-heading"
            className="mt-6 font-serif text-4xl font-normal tracking-[-0.025em] text-balance text-[#14181f] sm:text-5xl lg:text-[54px] lg:leading-[1.08]"
          >
            Built for the full AI search, content, and publishing workflow.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-pretty text-slate-600 sm:text-lg sm:leading-8">
            {SITE_CONFIG.name} connects company brand knowledge with multi-agent
            research, article generation and rewriting, LLM tracking, Reddit and
            backlink workflows, human review, and publishing—all included in one{" "}
            {SITE_CONFIG.priceMonthly}
            {SITE_CONFIG.priceUnit} plan.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#14181f] px-6 py-3 text-sm font-medium text-white transition-all duration-150 hover:bg-[#232933] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14181f] focus-visible:ring-offset-2"
            >
              <span>Start with Stak</span>
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/compare/stak-vs-gehirn"
              className="inline-flex items-center justify-center rounded-lg border border-stone-300/90 bg-white/85 px-6 py-3 text-sm font-medium text-[#14181f] transition-colors duration-150 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14181f] focus-visible:ring-offset-2"
            >
              Compare Stak vs {SITE_CONFIG.competitorName}
            </Link>
          </div>
        </div>

        {/* Complete 7-stage visual workflow */}
        <div className="mt-12 overflow-hidden rounded-2xl border border-stone-200/90 bg-white/95 shadow-xs backdrop-blur-sm sm:mt-14">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 bg-[#f8f8f6] px-5 py-3.5 sm:px-6">
            <div>
              <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#14181f]">
                Complete End-to-End Workflow
              </h2>
              <p className="mt-0.5 text-xs text-slate-600">
                Company context powers every stage from research to publish.
              </p>
            </div>
            <span className="font-mono text-xs text-slate-500">
              7 connected stages
            </span>
          </div>

          <ol className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-7">
            {WORKFLOW_PIPELINE.map((stage, index) => {
              const isLast = index === WORKFLOW_PIPELINE.length - 1;
              return (
                <li key={stage.label} className="relative flex flex-col">
                  <div className="flex h-full flex-col justify-between rounded-xl border border-stone-200/90 bg-[#fbfbfa] p-4">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] font-semibold text-slate-400">
                          {stage.step}
                        </span>
                        {!isLast ? (
                          <ArrowRight
                            className="h-3.5 w-3.5 text-slate-400 lg:hidden"
                            aria-hidden="true"
                          />
                        ) : null}
                      </div>
                      <h3 className="mt-2.5 text-sm font-semibold text-[#14181f]">
                        {stage.label}
                      </h3>
                      <p className="mt-1.5 text-xs leading-5 text-slate-600">
                        {stage.detail}
                      </p>
                    </div>
                  </div>

                  {!isLast ? (
                    <div
                      aria-hidden="true"
                      className="hidden lg:flex lg:absolute lg:top-1/2 lg:-right-2.5 lg:z-10 lg:-translate-y-1/2"
                    >
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-stone-200 bg-white text-slate-500">
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>

        {/* Category jump navigation */}
        <nav
          aria-label="Feature categories"
          className="mt-8 flex flex-wrap items-center gap-2"
        >
          <span className="mr-2 font-mono text-[11px] uppercase tracking-wider text-slate-500">
            Sections:
          </span>
          {FEATURE_SECTION_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg border border-stone-200/90 bg-white/85 px-3 py-1.5 font-mono text-xs text-slate-700 transition-colors hover:border-stone-300 hover:bg-white hover:text-[#14181f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14181f] focus-visible:ring-offset-2"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </Container>
    </section>
  );
}
