export function ResultsSection() {
  return (
    <div className="flex flex-col">
      <div className="-mx-6 h-px bg-stone-200/80" />
      <section
        aria-labelledby="landing-results-heading"
        className="py-14 sm:py-18"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-stone-500 font-medium">
          Results
        </p>
        <h2
          id="landing-results-heading"
          className="mt-3 font-serif text-3xl sm:text-4xl font-normal leading-[1.15] tracking-[-0.015em] text-[#14181f]"
        >
          Results speak more than thousand words.
        </h2>
        <p className="mt-4 max-w-[560px] text-[14px] sm:text-[15px] leading-[1.7] text-stone-600 font-light">
          Search visibility follows precision. When articles are drafted from multi-agent research briefs and governed by strict brand voice guidelines, both search engines and language models recognize the difference.
        </p>

        {/* Live honest product breakdown card */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-stone-200/80 bg-white/95 p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-100 pb-5">
            <div>
              <span className="font-mono text-xs text-stone-500 uppercase tracking-wider">
                Article Verification Report
              </span>
              <h3 className="mt-1 font-serif text-lg font-medium text-[#14181f]">
                Connection Pooling Architecture for High-Concurrency Clusters
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-mono text-xs font-medium text-emerald-700 border border-emerald-200/60">
                Verified Output
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-stone-200/60 bg-stone-50/50 p-4">
              <p className="font-mono text-xs text-stone-500">Research Grounding</p>
              <p className="mt-2 font-serif text-2xl text-[#14181f]">Multi-Agent</p>
              <p className="mt-1 text-xs text-stone-600 font-light">
                Built from 6 primary technical sources and live competitor analysis.
              </p>
            </div>

            <div className="rounded-xl border border-stone-200/60 bg-stone-50/50 p-4">
              <p className="font-mono text-xs text-stone-500">Brand Consistency</p>
              <p className="mt-2 font-serif text-2xl text-[#14181f]">TONE.md</p>
              <p className="mt-1 text-xs text-stone-600 font-light">
                Zero banned boilerplate adverbs; terminology matches company guidelines.
              </p>
            </div>

            <div className="rounded-xl border border-stone-200/60 bg-stone-50/50 p-4">
              <p className="font-mono text-xs text-stone-500">LLM Tracking</p>
              <p className="mt-2 font-serif text-2xl text-[#14181f]">Observed</p>
              <p className="mt-1 text-xs text-stone-600 font-light">
                Monitored brand citation presence across category queries.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

