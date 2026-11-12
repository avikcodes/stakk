"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  const router = useRouter();
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      router.push(`/app?url=${encodeURIComponent(url.trim())}`);
    } else {
      router.push("/app");
    }
  };

  return (
    <div className="flex w-full flex-col pt-6 pb-12 sm:pt-12 sm:pb-16">
      <header className="flex flex-col">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/80 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.12em] text-stone-600 mb-6 shadow-2xs">
            <Sparkles className="h-3 w-3 text-stone-700" />
            $129/mo Gehirn.md Alternative
          </span>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-[68px] font-normal leading-[1.05] tracking-[-0.025em] text-[#14181f]">
            Sounds like you. Not like AI.
          </h1>
        </div>

        <div>
          <p className="mt-6 max-w-[560px] text-[15px] sm:text-[16px] leading-[1.7] text-stone-600 font-light">
            Stak reads your site, your tone, and the facts you add. It deploys multi-agent research before drafting and asks before it guesses, so your voice and your knowledge stay in the draft. Search visibility is what that specific writing can earn.
          </p>
        </div>

        <div className="mt-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex h-13 sm:h-12 min-w-0 shrink-0 overflow-hidden rounded-xl border border-stone-300 bg-white focus-within:border-[#14181f] focus-within:ring-1 focus-within:ring-[#14181f] sm:flex-1 shadow-2xs transition-all">
                <span className="flex shrink-0 items-center border-r border-stone-200 bg-stone-50/80 px-3.5 text-[14px] text-stone-500 font-mono select-none">
                  https://
                </span>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="yourcompany.com"
                  spellCheck="false"
                  autoComplete="off"
                  className="h-full w-full min-w-0 appearance-none bg-transparent px-3 text-[15px] text-[#14181f] placeholder:text-stone-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="group flex h-13 sm:h-12 items-center justify-center gap-2 rounded-xl bg-[#14181f] px-6 text-[15px] font-medium text-white transition-all hover:bg-stone-800 active:scale-[0.98] whitespace-nowrap shadow-xs"
              >
                <span>Start with Stak</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-stone-500 font-mono">
            <span>One flat plan: $129/mo</span>
            <span className="text-stone-300">·</span>
            <span>250 articles/mo</span>
            <span className="text-stone-300">·</span>
            <span>20 projects</span>
            <span className="text-stone-300">·</span>
            <span>100 keywords</span>
            <span className="text-stone-300">·</span>
            <span>LLM Tracking</span>
          </div>
        </div>
      </header>
    </div>
  );
}
