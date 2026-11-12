import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Sparkles, FileText, Search, BarChart3, FolderKanban } from "lucide-react";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Stak Workspace",
  description: "Start creating research-backed, brand-aligned articles with Stak.",
  alternates: {
    canonical: "/app",
  },
};

export default function AppPage() {
  return (
    <div className="min-h-screen bg-[#fbfbfa] text-[#14181f]">
      {/* Top bar */}
      <header className="border-b border-stone-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs font-mono text-stone-500 hover:text-stone-900 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Home
            </Link>
            <span className="h-4 w-px bg-stone-200" />
            <span className="font-serif text-lg tracking-[-0.02em] text-[#14181f]">
              STAK
            </span>
            <span className="rounded-full bg-stone-100 px-2.5 py-0.5 font-mono text-[11px] text-stone-600 border border-stone-200">
              Workspace Beta
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-500 font-mono">
              Plan: $129/mo (All Features)
            </span>
          </div>
        </div>
      </header>

      <main className="py-12 sm:py-16">
        <Container className="max-w-4xl">
          <div className="mb-8">
            <span className="font-mono text-xs uppercase tracking-widest text-stone-500">
              Project Onboarding
            </span>
            <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-normal text-[#14181f]">
              Initialize your brand workspace.
            </h1>
            <p className="mt-3 text-base text-stone-600 max-w-2xl font-light leading-relaxed">
              Stak starts by reading your website into COMPANY.md, TONE.md, and project context. Once indexed, multi-agent research and writing operate directly from your voice.
            </p>
          </div>

          {/* Setup card */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-sm">
            <label
              htmlFor="company-url"
              className="block text-sm font-medium text-stone-900"
            >
              Website URL
            </label>
            <p className="mt-1 text-xs text-stone-500">
              Enter your domain to extract brand voice, existing structure, and positioning.
            </p>
            <div className="mt-3 flex flex-col sm:flex-row gap-3">
              <div className="flex flex-1 items-center rounded-xl border border-stone-300 bg-stone-50/50 px-3 py-2.5 focus-within:border-stone-900 focus-within:bg-white transition-colors">
                <span className="font-mono text-sm text-stone-400 select-none">
                  https://
                </span>
                <input
                  id="company-url"
                  type="text"
                  placeholder="yourcompany.com"
                  className="w-full bg-transparent px-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none"
                  defaultValue="stak.co.in"
                />
              </div>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#14181f] px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-800 transition-colors whitespace-nowrap"
              >
                <Sparkles className="h-4 w-4" />
                Analyze Company Context
              </button>
            </div>

            <div className="mt-8 border-t border-stone-100 pt-6">
              <h2 className="text-xs font-mono uppercase tracking-wider text-stone-500 mb-4">
                What Stak will generate for your project:
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-stone-200/70 p-4 bg-stone-50/30">
                  <div className="flex items-center gap-2 text-stone-900 font-medium text-sm">
                    <FileText className="h-4 w-4 text-stone-600" />
                    COMPANY.md & TONE.md
                  </div>
                  <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
                    Extracted vocabulary, perspective, and brand tone guidelines so drafts never sound like generic AI.
                  </p>
                </div>

                <div className="rounded-xl border border-stone-200/70 p-4 bg-stone-50/30">
                  <div className="flex items-center gap-2 text-stone-900 font-medium text-sm">
                    <Search className="h-4 w-4 text-stone-600" />
                    Multi-Agent Keyword Vault
                  </div>
                  <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
                    Track up to 100 keywords with parallel agent brainstorming and competitor coverage analysis.
                  </p>
                </div>

                <div className="rounded-xl border border-stone-200/70 p-4 bg-stone-50/30">
                  <div className="flex items-center gap-2 text-stone-900 font-medium text-sm">
                    <FolderKanban className="h-4 w-4 text-stone-600" />
                    20 Active Projects
                  </div>
                  <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
                    Organize distinct products, websites, or client brands with 250 articles generated per month.
                  </p>
                </div>

                <div className="rounded-xl border border-stone-200/70 p-4 bg-stone-50/30">
                  <div className="flex items-center gap-2 text-stone-900 font-medium text-sm">
                    <BarChart3 className="h-4 w-4 text-stone-600" />
                    LLM Tracking & Interpretation
                  </div>
                  <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
                    Inspect how major AI engines describe your company, products, and competitive positioning.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </main>
    </div>
  );
}

