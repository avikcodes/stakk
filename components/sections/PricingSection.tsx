import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

export function PricingSection() {
  return (
    <div className="flex flex-col">
      <div className="-mx-6 h-px bg-stone-200/80" />
      <section
        id="pricing"
        aria-labelledby="landing-pricing-heading"
        className="scroll-mt-24 py-14 sm:py-18"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-stone-500 font-medium">
          Pricing
        </p>
        <h2
          id="landing-pricing-heading"
          className="mt-3 font-serif text-4xl sm:text-5xl font-normal leading-[1.12] tracking-[-0.02em] text-[#14181f]"
        >
          All the capabilities. One plan. $129/month.
        </h2>
        <p className="mt-4 max-w-[560px] text-[14px] sm:text-[15px] leading-[1.7] text-stone-600 font-light">
          Instead of separating features across starter, growth, and enterprise tiers, Stak includes everything in one straightforward monthly subscription.
        </p>

        {/* Pricing Card matching Gehirn's signature layout */}
        <div className="mt-10 overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm">
          {/* Card header banner with subtle sky atmosphere */}
          <div className="relative h-28 w-full overflow-hidden border-b border-stone-200/70 bg-gradient-to-r from-sky-100/60 via-blue-50/40 to-stone-100/50 p-6 flex items-end">
            <svg
              viewBox="0 0 1000 200"
              fill="none"
              preserveAspectRatio="none"
              className="absolute inset-x-0 bottom-0 h-16 w-full text-white/70 pointer-events-none"
            >
              <path
                d="M0 120C200 80 400 150 650 100C850 60 950 110 1000 90V200H0V120Z"
                fill="currentColor"
              />
            </svg>
            <div className="relative z-10 flex w-full items-baseline justify-between">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-stone-500">
                  Flat Subscription
                </span>
                <h3 className="font-serif text-3xl font-normal text-[#14181f]">
                  STAK
                </h3>
              </div>
              <div className="text-right">
                <span className="font-serif text-3xl sm:text-4xl font-normal text-[#14181f]">
                  $129
                </span>
                <span className="text-xs font-mono text-stone-500"> / month</span>
              </div>
            </div>
          </div>

          {/* Card body */}
          <div className="p-6 sm:p-8">
            <p className="text-sm text-stone-600 font-light mb-6">
              Full Gehirn-level capability stack in one plan. No tiers, no add-ons, no locked features.
            </p>

            <Link
              href="/app"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#14181f] py-3.5 px-6 text-sm font-medium text-white hover:bg-stone-800 active:scale-[0.99] transition-all shadow-xs"
            >
              <span>Start with Stak</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            {/* Feature categories in Gehirn's editorial layout */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8 border-t border-stone-100 pt-8">
              {/* CONTENT */}
              <div>
                <h4 className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#14181f] mb-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-stone-900" />
                  Content
                </h4>
                <ul className="space-y-2 text-xs text-stone-600 font-light">
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-stone-800 shrink-0" />
                    <span>250 articles / month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-stone-800 shrink-0" />
                    <span>20 projects</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-stone-800 shrink-0" />
                    <span>Brand voice & TONE.md</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-stone-800 shrink-0" />
                    <span>Human-in-the-loop review</span>
                  </li>
                </ul>
              </div>

              {/* RESEARCH */}
              <div>
                <h4 className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#14181f] mb-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-stone-900" />
                  Research
                </h4>
                <ul className="space-y-2 text-xs text-stone-600 font-light">
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-stone-800 shrink-0" />
                    <span>100 keywords</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-stone-800 shrink-0" />
                    <span>Multi-Agent Research / Brainstorm</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-stone-800 shrink-0" />
                    <span>Competitor coverage analysis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-stone-800 shrink-0" />
                    <span>Live web research synthesis</span>
                  </li>
                </ul>
              </div>

              {/* ANALYTICS */}
              <div>
                <h4 className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#14181f] mb-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-stone-900" />
                  Analytics
                </h4>
                <ul className="space-y-2 text-xs text-stone-600 font-light">
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-stone-800 shrink-0" />
                    <span>LLM Tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-stone-800 shrink-0" />
                    <span>Brand Interpretation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-stone-800 shrink-0" />
                    <span>AI search presence observation</span>
                  </li>
                </ul>
              </div>

              {/* PUBLISHING */}
              <div>
                <h4 className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#14181f] mb-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-stone-900" />
                  Publishing
                </h4>
                <ul className="space-y-2 text-xs text-stone-600 font-light">
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-stone-800 shrink-0" />
                    <span>Markdown & HTML export</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-stone-800 shrink-0" />
                    <span>Planned CMS connectors</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-stone-800 shrink-0" />
                    <span>Article versioning & drafts</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 border-t border-stone-100 pt-5 text-center">
              <Link
                href="/compare/stak-vs-gehirn"
                className="text-xs font-mono text-stone-600 underline underline-offset-4 hover:text-[#14181f] transition-colors"
              >
                Compare Stak vs Gehirn in detail →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
