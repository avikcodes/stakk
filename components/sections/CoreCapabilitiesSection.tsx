import { Check, Bot, Sparkles, FileCode, Users } from "lucide-react";

export function CoreCapabilitiesSection() {
  return (
    <div className="flex flex-col">
      {/* 1. WRITING & CONTENT */}
      <div className="-mx-6 h-px bg-stone-200/80" />
      <section
        aria-labelledby="capability-writing-heading"
        className="py-14 sm:py-18"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-stone-500 font-medium">
          Writing
        </p>
        <h2
          id="capability-writing-heading"
          className="mt-3 font-serif text-3xl sm:text-4xl font-normal leading-[1.15] tracking-[-0.015em] text-[#14181f]"
        >
          Research first. Draft in your voice. Keep the human in the loop.
        </h2>
        <p className="mt-4 max-w-[560px] text-[14px] sm:text-[15px] leading-[1.7] text-stone-600 font-light">
          Stak generates up to 250 articles per month across 20 projects. Instead of feeding a prompt directly to a model, Stak synthesizes multi-agent research, references your company voice guidelines, and pauses for angle approval before drafting.
        </p>

        {/* Editorial visual mockup for Writing */}
        <div className="mt-8 rounded-2xl border border-stone-200/80 bg-white/95 p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="font-mono text-xs text-stone-700 font-medium">
                Draft Review · Project: Infrastructure B2B
              </span>
            </div>
            <span className="font-mono text-[11px] text-stone-500">
              TONE.md: 98% Voice Match
            </span>
          </div>

          <div className="mt-4 space-y-3 font-mono text-xs">
            <div className="flex items-start gap-2 rounded-lg bg-stone-50 p-3 text-stone-700">
              <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-stone-900">Angle approved: </span>
                Why database connection pooling fails under spiky AI workloads.
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-lg bg-stone-50 p-3 text-stone-700">
              <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-stone-900">Brand context applied: </span>
                Using verified latency numbers from internal benchmarks; excluded banned boilerplate buzzwords.
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-lg bg-stone-50 p-3 text-stone-700">
              <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-stone-900">Human-in-the-loop review: </span>
                Author inspected final conclusion and custom technical diagrams before publishing.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. RESEARCH & MULTI-AGENT */}
      <div className="-mx-6 h-px bg-stone-200/80" />
      <section
        aria-labelledby="capability-research-heading"
        className="py-14 sm:py-18"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-stone-500 font-medium">
          Research
        </p>
        <h2
          id="capability-research-heading"
          className="mt-3 font-serif text-3xl sm:text-4xl font-normal leading-[1.15] tracking-[-0.015em] text-[#14181f]"
        >
          Multi-agent brainstorming, live web analysis, and keyword tracking.
        </h2>
        <p className="mt-4 max-w-[560px] text-[14px] sm:text-[15px] leading-[1.7] text-stone-600 font-light">
          Track up to 100 keywords per month. Stak coordinates parallel specialized research agents to inspect search intent, brainstorm unique editorial angles, and analyze competitive white space before any writing starts.
        </p>

        {/* Supporting Agent Dispatch Mockup */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="rounded-xl border border-stone-200/80 bg-white/90 p-4 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-stone-800 mb-2">
              <Bot className="h-3.5 w-3.5 text-stone-600" />
              Agent 01: Search Intent
            </div>
            <p className="text-xs text-stone-600 leading-relaxed font-light">
              Analyzes real search results and direct-answer queries across 100 tracked keywords.
            </p>
          </div>

          <div className="rounded-xl border border-stone-200/80 bg-white/90 p-4 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-stone-800 mb-2">
              <Bot className="h-3.5 w-3.5 text-stone-600" />
              Agent 02: Competitor Gaps
            </div>
            <p className="text-xs text-stone-600 leading-relaxed font-light">
              Identifies missing technical arguments and points competitor guides overlook.
            </p>
          </div>

          <div className="rounded-xl border border-stone-200/80 bg-white/90 p-4 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-stone-800 mb-2">
              <Bot className="h-3.5 w-3.5 text-stone-600" />
              Agent 03: Brainstorm
            </div>
            <p className="text-xs text-stone-600 leading-relaxed font-light">
              Synthesizes insights into fresh, defensible editorial briefs tailored to your audience.
            </p>
          </div>
        </div>
      </section>

      {/* 3. BRAND VOICE & CONTEXT */}
      <div className="-mx-6 h-px bg-stone-200/80" />
      <section
        aria-labelledby="capability-context-heading"
        className="py-14 sm:py-18"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-stone-500 font-medium">
          Context
        </p>
        <h2
          id="capability-context-heading"
          className="mt-3 font-serif text-3xl sm:text-4xl font-normal leading-[1.15] tracking-[-0.015em] text-[#14181f]"
        >
          COMPANY.md and TONE.md keep every draft grounded.
        </h2>
        <p className="mt-4 max-w-[560px] text-[14px] sm:text-[15px] leading-[1.7] text-stone-600 font-light">
          Stak reads your site structure, existing articles, and positioning. It generates explicit markdown context files that describe your product features, forbidden clichés, preferred phrasing, and industry specifics.
        </p>

        {/* Supporting Code / Markdown Visual */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-stone-200/80 bg-stone-900 p-5 font-mono text-[12px] text-stone-300 shadow-2xs">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3 text-stone-400">
            <span className="flex items-center gap-2">
              <FileCode className="h-3.5 w-3.5 text-stone-400" />
              TONE.md · Brand Voice Specification
            </span>
            <span className="text-[11px] text-emerald-400">Active Specification</span>
          </div>
          <pre className="mt-4 overflow-x-auto text-stone-200 leading-relaxed">
{`# Brand Voice: Stak
- Perspective: Direct, engineering-informed, editorial, concise.
- Cadence: Short declarative sentences. Avoid unnecessary filler adverbs.
- Banned Phrasing: "delve into", "testament to", "game changer", "unlock".
- Fact Rule: Always cite primary benchmarks; never estimate without proof.`}
          </pre>
        </div>
      </section>

      {/* 4. OUTREACH & BACKLINK COMMUNITY */}
      <div className="-mx-6 h-px bg-stone-200/80" />
      <section
        aria-labelledby="capability-community-heading"
        className="py-14 sm:py-18"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-stone-500 font-medium">
          Community & Backlinks
        </p>
        <h2
          id="capability-community-heading"
          className="mt-3 font-serif text-3xl sm:text-4xl font-normal leading-[1.15] tracking-[-0.015em] text-[#14181f]"
        >
          Community participation and backlink discovery.
        </h2>
        <p className="mt-4 max-w-[560px] text-[14px] sm:text-[15px] leading-[1.7] text-stone-600 font-light">
          Monitor relevant discussions where your domain expertise adds value. Stak surfaces community threads, competitor brand discussions, and genuine backlink opportunities—designed to support high-quality brand participation rather than automated spam.
        </p>

        <div className="mt-8 rounded-2xl border border-stone-200/80 bg-white/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <span className="flex items-center gap-2 text-xs font-mono font-medium text-stone-800">
              <Users className="h-3.5 w-3.5 text-stone-600" />
              Community Discussion Monitor
            </span>
            <span className="rounded-full bg-stone-100 px-2 py-0.5 font-mono text-[10px] text-stone-600 border border-stone-200">
              Discovery Workflow
            </span>
          </div>
          <div className="mt-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between rounded-lg bg-stone-50/70 p-3">
              <div>
                <p className="font-medium text-stone-900">
                  r/DevOps: Best practices for database connection scaling in serverless
                </p>
                <p className="mt-0.5 text-[11px] text-stone-500">
                  High relevance · 48 comments · Opportunity for technical authority reference
                </p>
              </div>
              <span className="shrink-0 font-mono text-[11px] text-stone-500">2h ago</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-stone-50/70 p-3">
              <div>
                <p className="font-medium text-stone-900">
                  Hacker News: Lessons from migrating away from complex ORMs
                </p>
                <p className="mt-0.5 text-[11px] text-stone-500">
                  Direct match with project benchmarks in COMPANY.md
                </p>
              </div>
              <span className="shrink-0 font-mono text-[11px] text-stone-500">5h ago</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

