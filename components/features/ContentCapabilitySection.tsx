import { Check, FileEdit, FolderKanban, RefreshCw, Sparkles, UserCheck } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

const CONTENT_CAPABILITIES = [
  {
    icon: Sparkles,
    title: "AI article generation",
    description:
      "Draft long-form guides, comparisons, and product documentation directly from approved research briefs rather than blank prompts.",
  },
  {
    icon: RefreshCw,
    title: "Content rewriting",
    description:
      "Refresh existing articles to tighten positioning, update product facts, and restructure pages for answer and AI search visibility.",
  },
  {
    icon: FileEdit,
    title: "Brand voice & brand context",
    description:
      "Applies COMPANY.md and TONE.md throughout drafting and rewriting so terminology, claims, and writing style remain consistent.",
  },
  {
    icon: FolderKanban,
    title: "Content projects",
    description:
      "Organize briefs, drafts, rewrites, and optimization passes inside structured content projects tied to your domain.",
  },
  {
    icon: UserCheck,
    title: "Human review workflow",
    description:
      "Every generated or rewritten piece passes through an explicit human review workflow before export or publishing.",
  },
] as const;

const PROJECT_QUEUE = [
  {
    title: "AI Search Visibility Guide",
    type: "AI article generation",
    status: "Human Review",
  },
  {
    title: "Product Comparison Page",
    type: "Content rewriting",
    status: "Optimization",
  },
  {
    title: "GEO Implementation Checklist",
    type: "New project brief",
    status: "Drafting",
  },
] as const;

export function ContentCapabilitySection() {
  return (
    <Section id="content" labelledBy="features-content-heading" muted>
      <SectionHeader
        headingId="features-content-heading"
        eyebrow="01 · Content"
        title="AI article generation, rewriting, projects, and human review"
        description="Stak turns research briefs into structured articles and page rewrites grounded in brand voice and brand context, with human review built into every project."
      />

      <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:items-start">
        {/* Left capabilities */}
        <div className="space-y-4 lg:col-span-5">
          {CONTENT_CAPABILITIES.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="flex items-start gap-4 rounded-xl border border-stone-200/90 bg-white p-5"
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-[#fbfbfa] text-[#14181f]">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-[#14181f]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {item.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        {/* Right Product UI Mockup: Content Projects & Human Review Editor */}
        <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xs lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 bg-[#f8f8f6] px-5 py-3.5">
            <div>
              <h3 className="text-sm font-semibold text-[#14181f]">
                Content Projects &amp; Review Workspace
              </h3>
              <p className="font-mono text-[11px] text-slate-500">
                Illustrative content generation &amp; rewrite workspace
              </p>
            </div>
            <span className="rounded-full border border-stone-200 bg-white px-2.5 py-0.5 font-mono text-[11px] text-slate-700">
              Human Review Gate
            </span>
          </div>

          <div className="grid divide-y divide-stone-200/80 sm:grid-cols-12 sm:divide-x sm:divide-y-0">
            {/* Project list */}
            <div className="p-5 sm:col-span-5">
              <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
                Content Projects
              </p>
              <ul className="mt-3 space-y-2.5">
                {PROJECT_QUEUE.map((proj, idx) => (
                  <li
                    key={proj.title}
                    className={`rounded-xl border p-3 ${
                      idx === 0
                        ? "border-stone-300 bg-[#fbfbfa]"
                        : "border-stone-200/80 bg-white"
                    }`}
                  >
                    <p className="text-xs font-semibold text-[#14181f]">
                      {proj.title}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between gap-2 font-mono text-[10px] text-slate-500">
                      <span>{proj.type}</span>
                      <span className="rounded border border-stone-200 bg-white px-1.5 py-0.5 text-[#14181f]">
                        {proj.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Active draft review */}
            <div className="space-y-4 p-5 sm:col-span-7">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-md border border-stone-200 bg-[#fbfbfa] px-2.5 py-1 font-mono text-[11px] text-slate-700">
                  Context: COMPANY.md
                </span>
                <span className="rounded-md border border-stone-200 bg-[#fbfbfa] px-2.5 py-1 font-mono text-[11px] text-slate-700">
                  Voice: TONE.md
                </span>
              </div>

              <div className="rounded-xl border border-stone-200/80 bg-[#fbfbfa] p-4">
                <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
                  Draft Preview · Ready for Human Review
                </p>
                <p className="mt-2 font-serif text-xl text-[#14181f]">
                  Structuring technical guides for AI answer engines
                </p>
                <p className="mt-2 text-xs leading-6 text-slate-600">
                  Opens with a concise definition aligned with product scope,
                  follows verified research headings, and preserves exact brand
                  terminology before editorial approval.
                </p>
              </div>

              <ul className="space-y-2 border-t border-stone-200/80 pt-4">
                {[
                  "Research brief & competitor gaps linked",
                  "Brand voice and positioning verified",
                  "Human review sign-off required prior to publish",
                ].map((check) => (
                  <li
                    key={check}
                    className="flex items-center gap-2 text-xs text-slate-700"
                  >
                    <Check
                      className="h-3.5 w-3.5 shrink-0 text-[#14181f]"
                      aria-hidden="true"
                    />
                    <span>{check}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
