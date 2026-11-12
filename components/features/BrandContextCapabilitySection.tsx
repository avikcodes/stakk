import { BookOpen, FileCode, Globe, LayoutList } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

const CONTEXT_SOURCES = [
  {
    icon: Globe,
    title: "Website structure & sitemap",
    description:
      "Reads your domain hierarchy and sitemap so every brief respects existing routes and internal linking paths.",
  },
  {
    icon: LayoutList,
    title: "Existing content",
    description:
      "Indexes published articles and product pages to avoid topic overlap and identify rewrite opportunities.",
  },
  {
    icon: BookOpen,
    title: "Brand positioning",
    description:
      "Encodes product scope, target audience, pricing ($129/month), and verified differentiators in COMPANY.md.",
  },
  {
    icon: FileCode,
    title: "Writing style & brand voice",
    description:
      "Captures sentence cadence, formatting rules, and approved vocabulary inside TONE.md.",
  },
] as const;

const CONTEXT_STAGE_USAGE = [
  {
    stage: "Research & Multi-Agent Analysis",
    usage:
      "Filters keyword, competitor, and web research through your actual product scope so brainstormed angles stay relevant.",
  },
  {
    stage: "Content & Optimization",
    usage:
      "Supplies verified company facts, sitemap links, and TONE.md style rules during article generation, rewriting, and SEO/AEO/GEO passes.",
  },
  {
    stage: "Social & Analytics",
    usage:
      "Grounds Reddit comments in accurate product context and compares LLM brand interpretation against COMPANY.md.",
  },
  {
    stage: "Review & Publish",
    usage:
      "Gives human reviewers an explicit baseline to verify tone, accuracy, and metadata before exporting or publishing.",
  },
] as const;

export function BrandContextCapabilitySection() {
  return (
    <Section id="brand-context" labelledBy="features-brand-context-heading" muted>
      <SectionHeader
        headingId="features-brand-context-heading"
        eyebrow="05 · Brand Context & Knowledge"
        title="How company context and brand knowledge guide every stage"
        description="Stak stores structured company knowledge in COMPANY.md and TONE.md—combining website structure, sitemap, existing content, brand positioning, and writing style across the entire workflow."
      />

      <div className="mt-12 grid gap-8 lg:grid-cols-12">
        {/* COMPANY.md & TONE.md Previews */}
        <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
          <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-200/80 bg-[#14181f] px-4 py-3 text-white">
              <span className="font-mono text-xs font-semibold">COMPANY.md</span>
              <span className="font-mono text-[11px] text-slate-300">
                Positioning &amp; Sitemap
              </span>
            </div>
            <div className="space-y-3 p-5 font-mono text-xs leading-6 text-slate-700">
              <p className="font-semibold text-[#14181f]"># Brand Positioning</p>
              <p>
                Verified capabilities, target teams, and flat $129/month pricing.
              </p>
              <p className="font-semibold text-[#14181f]">
                # Website Structure &amp; Sitemap
              </p>
              <p>
                Canonical URLs: /, /features, /pricing, /compare/stak-vs-gehirn.
              </p>
              <p className="font-semibold text-[#14181f]"># Existing Content</p>
              <p>
                Published guides and pages indexed to coordinate new drafts and
                rewrites.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-200/80 bg-[#14181f] px-4 py-3 text-white">
              <span className="font-mono text-xs font-semibold">TONE.md</span>
              <span className="font-mono text-[11px] text-slate-300">
                Writing Style &amp; Voice
              </span>
            </div>
            <div className="space-y-3 p-5 font-mono text-xs leading-6 text-slate-700">
              <p className="font-semibold text-[#14181f]"># Writing Style</p>
              <p>Clear, direct, editorial prose free of vague hype.</p>
              <p className="font-semibold text-[#14181f]"># Brand Voice Rules</p>
              <p>
                State facts directly, avoid unsupported statistics, and lead
                with clear answers.
              </p>
              <p className="font-semibold text-[#14181f]">
                # Channel Consistency
              </p>
              <p>
                Shared across articles, rewrites, and Reddit community drafts.
              </p>
            </div>
          </div>
        </div>

        {/* Context inputs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
          {CONTEXT_SOURCES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex items-start gap-3.5 rounded-xl border border-stone-200/90 bg-white p-4"
              >
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-[#fbfbfa] text-[#14181f]">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-[#14181f]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How brand knowledge flows through every workflow stage */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-stone-200/90 bg-white">
        <div className="border-b border-stone-200/80 bg-[#f8f8f6] px-6 py-4">
          <h3 className="text-sm font-semibold text-[#14181f]">
            How Brand Knowledge Is Used Throughout the Workflow
          </h3>
        </div>
        <div className="grid divide-y divide-stone-200/80 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          {CONTEXT_STAGE_USAGE.map((item, idx) => (
            <div
              key={item.stage}
              className={`p-5 ${
                idx % 2 === 0 ? "sm:border-r sm:border-stone-200/80 lg:border-r-0" : ""
              } ${idx < 2 ? "sm:border-b sm:border-stone-200/80 lg:border-b-0" : ""}`}
            >
              <p className="font-mono text-xs font-semibold text-[#14181f]">
                {item.stage}
              </p>
              <p className="mt-2 text-xs leading-6 text-slate-600">
                {item.usage}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
