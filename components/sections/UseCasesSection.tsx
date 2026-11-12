import { Briefcase, Building2, Layers } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SITE_CONFIG } from "@/lib/site";

const USE_CASES = [
  {
    icon: Building2,
    title: "B2B Marketing Teams",
    description:
      "Coordinate market research and brand-aligned articles across SEO, AEO, and GEO channels.",
  },
  {
    icon: Layers,
    title: "Content & Editorial Leads",
    description:
      "Keep briefs, drafts, and visibility improvements organized inside a single workflow.",
  },
  {
    icon: Briefcase,
    title: "Teams Seeking Flat Pricing",
    description: `Adopt an AI search and content platform at ${SITE_CONFIG.priceMonthly}${SITE_CONFIG.priceUnit} as an alternative to ${SITE_CONFIG.competitorName}.`,
  },
] as const;

export function UseCasesSection() {
  return (
    <Section id="use-cases" labelledBy="use-cases-heading" muted>
      <SectionHeader
        headingId="use-cases-heading"
        eyebrow="Use Cases"
        title={`How companies use ${SITE_CONFIG.name}`}
        description="Designed for teams managing research, brand-consistent publishing, and visibility across search and AI answer engines."
      />

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {USE_CASES.map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.title}
              className="rounded-xl border border-stone-200/90 bg-white p-6"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 bg-[#fbfbfa] text-[#14181f]">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-base font-semibold text-[#14181f]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {item.description}
              </p>
            </article>
          );
        })}
      </div>
    </Section>
  );
}
