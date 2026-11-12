import { BookOpen, Globe, Package, Sparkles } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

const CONTEXT_PILLARS = [
  {
    icon: Globe,
    title: "Company Website",
    description:
      "Reads existing pages, sitemap structure, and published documentation to avoid duplicate angles.",
  },
  {
    icon: Package,
    title: "Products & Capabilities",
    description:
      "Understands exact product scope, naming conventions, and pricing so drafts stay accurate.",
  },
  {
    icon: Sparkles,
    title: "Market Positioning",
    description:
      "Captures how your company differentiates, who it serves, and what claims are off-limits.",
  },
  {
    icon: BookOpen,
    title: "Writing Style & Tone",
    description:
      "Applies editorial rules, sentence cadence, and preferred vocabulary before generating text.",
  },
] as const;

export function BrandContextSection() {
  return (
    <Section id="brand-context" labelledBy="brand-context-heading">
      <SectionHeader
        headingId="brand-context-heading"
        eyebrow="03 · Brand Context"
        title="Grounded in your company before a single word is written"
        description="Stak indexes your website, products, positioning, and writing style upfront so every workflow step reflects your actual business."
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-12 lg:items-stretch">
        <div className="grid gap-5 sm:grid-cols-2 lg:col-span-8">
          {CONTEXT_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article
                key={pillar.title}
                className="rounded-xl border border-stone-200/90 bg-white p-6"
              >
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-[#fbfbfa] text-[#14181f]">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-[#14181f]">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {pillar.description}
                </p>
              </article>
            );
          })}
        </div>

        <aside className="flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-[#f8f8f6] p-6 lg:col-span-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-slate-500">
              Brand Profile Snapshot
            </p>
            <h3 className="mt-2 text-base font-semibold text-[#14181f]">
              Pre-generation context check
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Every brief and draft references the same shared company memory.
            </p>
          </div>

          <dl className="mt-6 space-y-3 border-t border-stone-200/80 pt-5 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-600">Source material</dt>
              <dd className="font-mono text-xs text-[#14181f]">
                Website &amp; docs
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-600">Product scope</dt>
              <dd className="font-mono text-xs text-[#14181f]">Verified</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-600">Editorial voice</dt>
              <dd className="font-mono text-xs text-[#14181f]">
                Clear &amp; factual
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-600">Positioning rules</dt>
              <dd className="font-mono text-xs text-[#14181f]">Enforced</dd>
            </div>
          </dl>
        </aside>
      </div>
    </Section>
  );
}

