import Link from "next/link";
import { ArrowUpRight, BookOpen, Compass } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { RESOURCE_LINKS } from "@/lib/site";

export function ResourcesSection() {
  return (
    <Section id="resources" labelledBy="resources-heading">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <SectionHeader
          headingId="resources-heading"
          eyebrow="Resources & Guides"
          title="Editorial guides, tools, and comparison library"
          description="Explore guides, frameworks, and comparisons covering AI search optimization, GEO workflows, and the Stak blog."
        />
        <Link
          href="/resources"
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-stone-200 bg-white px-3.5 py-1.5 font-mono text-xs text-slate-700 transition-colors hover:border-stone-300 hover:text-[#14181f]"
        >
          <BookOpen className="h-3.5 w-3.5 text-[#14181f]" aria-hidden="true" />
          <span>Explore Resources &amp; Blog</span>
        </Link>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {RESOURCE_LINKS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="group flex flex-col justify-between rounded-xl border border-stone-200/90 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14181f] focus-visible:ring-offset-2"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 bg-[#fbfbfa] text-[#14181f]">
                  <Compass className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="rounded-full border border-stone-200 bg-[#fbfbfa] px-2.5 py-0.5 font-mono text-[11px] text-slate-600">
                  {item.badge}
                </span>
              </div>

              <h3 className="mt-4 flex items-center gap-1.5 text-base font-semibold text-[#14181f]">
                <span>{item.label}</span>
                <ArrowUpRight
                  className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {item.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}
