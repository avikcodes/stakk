import { ArrowRight, CheckCircle2, Layers, AlertCircle } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SITE_CONFIG } from "@/lib/site";

const PROBLEM_POINTS = [
  "Research lives across disconnected spreadsheets, keyword tools, and manual notes.",
  "Generic drafts ignore product positioning, terminology, and brand writing style.",
  "Teams struggle to adapt existing SEO workflows for AEO and AI answer systems.",
] as const;

const STAK_CAPABILITIES = [
  "Connects market and competitor research directly to editorial strategy.",
  "Applies company brand context before generating or refining any draft.",
  "Structures content for traditional search engines and modern AI answer engines.",
] as const;

export function WhatStakDoesSection() {
  return (
    <Section id="features" labelledBy="what-stak-does-heading" muted>
      <SectionHeader
        headingId="what-stak-does-heading"
        eyebrow="What Stak Does"
        title="One structured workflow from market research to AI-search content"
        description={`${SITE_CONFIG.name} replaces fragmented research and drafting steps with a single platform built for SEO, AEO, and GEO visibility—priced at a flat ${SITE_CONFIG.priceMonthly}${SITE_CONFIG.priceUnit}.`}
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-stone-200/90 bg-white/80 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-[#fbfbfa] text-slate-600">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-slate-500">
                The Problem
              </p>
              <h3 className="text-base font-semibold text-[#14181f]">
                Fragmented tools and off-brand drafts
              </h3>
            </div>
          </div>

          <ul className="mt-6 space-y-3.5">
            {PROBLEM_POINTS.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 text-sm leading-6 text-slate-600"
              >
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-400"
                  aria-hidden="true"
                />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-stone-300/90 bg-white p-6 shadow-2xs sm:p-8">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#14181f] text-white">
              <Layers className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-slate-500">
                With {SITE_CONFIG.name}
              </p>
              <h3 className="text-base font-semibold text-[#14181f]">
                Grounded, end-to-end content production
              </h3>
            </div>
          </div>

          <ul className="mt-6 space-y-3.5">
            {STAK_CAPABILITIES.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 text-sm leading-6 text-slate-700"
              >
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#14181f]"
                  aria-hidden="true"
                />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-stone-200/90 bg-white/90 px-6 py-4">
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-slate-600">
          <span className="font-medium text-[#14181f]">Problem</span>
          <ArrowRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <span className="font-medium text-[#14181f]">Workflow</span>
          <ArrowRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <span className="font-medium text-[#14181f]">Capabilities</span>
          <ArrowRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <span className="font-medium text-[#14181f]">Publish-ready content</span>
        </div>
        <span className="font-mono text-xs text-slate-500">
          Alternative to {SITE_CONFIG.competitorName} · {SITE_CONFIG.priceMonthly}
          {SITE_CONFIG.priceUnit}
        </span>
      </div>
    </Section>
  );
}

