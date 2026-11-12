import { Check, FileEdit, ListTree, MessageSquareQuote } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

const CONTENT_OUTPUTS = [
  {
    icon: ListTree,
    title: "Structured outlines from research",
    description:
      "Each draft starts from verified topic clusters, buyer questions, and competitive gaps.",
  },
  {
    icon: FileEdit,
    title: "SEO, AEO, and GEO formatting",
    description:
      "Clear headings, direct answers, and scannable sections designed for readers and search engines.",
  },
  {
    icon: MessageSquareQuote,
    title: "Consistent brand voice",
    description:
      "Terminology, tone, and product claims stay grounded in your approved brand rules.",
  },
] as const;

const DRAFT_CHECKS = [
  "Research brief attached to outline",
  "Direct-answer summary in opening section",
  "Brand terminology and tone verified",
  "Clean semantic heading hierarchy (H1–H3)",
] as const;

export function ContentSection() {
  return (
    <Section id="content" labelledBy="content-heading" muted>
      <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
        <div className="order-2 lg:order-1 lg:col-span-7">
          <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-2xs">
            <div className="flex items-center justify-between border-b border-stone-200/80 bg-[#f8f8f6] px-5 py-3.5">
              <div>
                <h3 className="text-sm font-semibold text-[#14181f]">
                  Editorial Draft Workspace
                </h3>
                <p className="font-mono text-xs text-slate-500">
                  Illustrative content structure preview
                </p>
              </div>
              <span className="rounded-full border border-stone-200 bg-white px-2.5 py-1 font-mono text-[11px] text-slate-600">
                SEO · AEO · GEO
              </span>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="rounded-xl border border-stone-200/80 bg-[#fbfbfa] p-4">
                <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
                  Page Outline
                </p>
                <p className="mt-1.5 font-serif text-xl text-[#14181f]">
                  How to structure technical guides for AI answer engines
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Lead with a concise direct answer, organize subtopics around
                  real buyer questions, and keep product terminology consistent
                  across every section.
                </p>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                {DRAFT_CHECKS.map((check) => (
                  <div
                    key={check}
                    className="flex items-start gap-2.5 rounded-lg border border-stone-200/80 bg-white px-3.5 py-2.5 text-xs text-slate-700"
                  >
                    <Check
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#14181f]"
                      aria-hidden="true"
                    />
                    <span>{check}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2 lg:col-span-5">
          <SectionHeader
            headingId="content-heading"
            eyebrow="02 · Content"
            title="Turn research into useful, brand-aligned content"
            description="Stak converts market research into clear, structured articles and landing pages tailored for SEO, AEO, and GEO without drifting from your brand voice."
          />

          <div className="mt-8 space-y-5">
            {CONTENT_OUTPUTS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-start gap-3.5">
                  <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-white text-[#14181f]">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-[#14181f]">
                      {item.title}
                    </h3>
                    <p className="mt-0.5 text-sm leading-6 text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
}

