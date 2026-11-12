import {
  ArrowRight,
  CheckCircle2,
  Compass,
  PenLine,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

const WORKFLOW_STAGES = [
  {
    step: "01",
    name: "Research",
    icon: Search,
    role: "Market & Search Agent",
    summary:
      "Gathers keywords, competitor angles, and search demand signals for the target topic.",
  },
  {
    step: "02",
    name: "Strategy",
    icon: Compass,
    role: "Editorial Planning Agent",
    summary:
      "Maps findings against brand context to define page structure, target intent, and outline.",
  },
  {
    step: "03",
    name: "Writing",
    icon: PenLine,
    role: "Brand Content Agent",
    summary:
      "Produces clear, factual drafts aligned with company products, positioning, and writing style.",
  },
  {
    step: "04",
    name: "Optimization",
    icon: SlidersHorizontal,
    role: "SEO / AEO / GEO Agent",
    summary:
      "Refines headings, direct-answer summaries, and semantic coverage for search and AI systems.",
  },
  {
    step: "05",
    name: "Review",
    icon: CheckCircle2,
    role: "Quality & Brand Gate",
    summary:
      "Verifies accuracy, tone consistency, and readiness before the piece moves to publishing.",
  },
] as const;

export function WorkflowSection() {
  return (
    <Section id="workflow" labelledBy="workflow-heading">
      <SectionHeader
        headingId="workflow-heading"
        eyebrow="05 · Multi-Agent Workflow"
        title="Research → Strategy → Writing → Optimization → Review"
        description="Instead of prompting a blank chat window, Stak separates content production into five coordinated stages so each step builds on verified research and brand context."
      />

      {/* Pipeline diagram */}
      <div className="mt-12 rounded-2xl border border-stone-200/90 bg-white p-5 shadow-2xs sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 pb-4">
          <span className="font-mono text-xs font-medium text-[#14181f]">
            Pipeline Architecture
          </span>
          <span className="font-mono text-xs text-slate-500">
            5 coordinated stages · Brand context persisted across all steps
          </span>
        </div>

        <ol className="grid gap-4 md:grid-cols-5">
          {WORKFLOW_STAGES.map((stage, index) => {
            const Icon = stage.icon;
            const isLast = index === WORKFLOW_STAGES.length - 1;
            return (
              <li key={stage.name} className="relative flex flex-col">
                <div className="flex h-full flex-col rounded-xl border border-stone-200/90 bg-[#fbfbfa] p-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 bg-white text-[#14181f]">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      {stage.step}
                    </span>
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-[#14181f]">
                    {stage.name}
                  </h3>
                  <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                    {stage.role}
                  </p>
                  <p className="mt-2.5 text-xs leading-5 text-slate-600">
                    {stage.summary}
                  </p>
                </div>

                {!isLast ? (
                  <div
                    aria-hidden="true"
                    className="hidden items-center justify-center md:flex md:absolute md:top-1/2 md:-right-3.5 md:z-10 md:-translate-y-1/2"
                  >
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-stone-200 bg-white text-slate-500">
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>

        <div className="mt-6 flex flex-col gap-2 rounded-xl border border-stone-200/80 bg-[#f8f8f6] px-4 py-3 text-xs text-slate-700 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-medium text-[#14181f]">
            Workflow outcome: publish-ready content aligned with research, brand
            voice, and AI-search structure.
          </span>
          <span className="font-mono text-slate-500">Human review ready</span>
        </div>
      </div>
    </Section>
  );
}

