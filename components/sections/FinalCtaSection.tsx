import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function FinalCtaSection() {
  return (
    <div className="flex flex-col">
      <div className="-mx-6 h-px bg-stone-200/80" />
      <section
        aria-labelledby="landing-final-cta-heading"
        className="py-16 sm:py-20 text-center flex flex-col items-center"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-stone-600 mb-4">
          <Sparkles className="h-3 w-3 text-stone-700" />
          One Plan · $129/month
        </span>

        <h2
          id="landing-final-cta-heading"
          className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-[1.15] tracking-[-0.02em] text-[#14181f] max-w-lg"
        >
          Start writing in your brand voice.
        </h2>

        <p className="mt-4 max-w-md text-[14px] sm:text-[15px] leading-[1.7] text-stone-600 font-light">
          Deploy multi-agent research, draft with brand context, and observe LLM visibility—all within one flat $129/month plan.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/app"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#14181f] px-7 py-3 text-sm font-medium text-white hover:bg-stone-800 active:scale-[0.98] transition-all shadow-xs"
          >
            <span>Start with Stak</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/pricing"
            className="rounded-xl border border-stone-300 bg-white/80 px-6 py-3 text-sm font-medium text-stone-800 hover:border-stone-400 transition-colors"
          >
            Review Plan Details
          </Link>
        </div>

        <p className="mt-4 font-mono text-xs text-stone-500">
          No tier gating · 250 articles/month · 20 projects · 100 keywords
        </p>
      </section>
    </div>
  );
}

