import Link from "next/link";
import { ArrowUpRight, Building2, Lock, ShieldCheck } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SITE_CONFIG, TRUST_LINKS } from "@/lib/site";

const TRUST_PILLARS = [
  {
    icon: ShieldCheck,
    title: "Grounded in real company context",
    description:
      "Content workflows reference your verified website, products, and positioning rather than inventing claims.",
  },
  {
    icon: Lock,
    title: "Clear data & privacy boundaries",
    description:
      "Company context, brand voice guidelines, and content projects are organized with transparent privacy and security practices.",
  },
  {
    icon: Building2,
    title: "Transparent pricing & policies",
    description: `One published ${SITE_CONFIG.priceMonthly}${SITE_CONFIG.priceUnit} rate and clear public documentation at ${SITE_CONFIG.domain}.`,
  },
] as const;

export function TrustSection() {
  return (
    <Section id="trust" labelledBy="trust-heading" muted>
      <SectionHeader
        headingId="trust-heading"
        eyebrow="Trust & Company"
        title="Built with transparency from pricing to policy"
        description={`${SITE_CONFIG.name} keeps product scope, pricing, and public company policies straightforward—read our About, Contact, Security, Privacy Policy, and Terms pages directly.`}
      />

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {TRUST_PILLARS.map((pillar) => {
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

      <div className="mt-8 rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 pb-4">
          <h3 className="text-sm font-semibold text-[#14181f]">
            Company &amp; Trust Pages
          </h3>
          <span className="font-mono text-xs text-slate-500">
            {SITE_CONFIG.domain}
          </span>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {TRUST_LINKS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group rounded-xl border border-stone-200/80 bg-[#fbfbfa] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-stone-300 hover:bg-white hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14181f] focus-visible:ring-offset-2"
            >
              <p className="flex items-center justify-between gap-1 text-sm font-semibold text-[#14181f]">
                <span>{item.label}</span>
                <ArrowUpRight
                  className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </p>
              <p className="mt-1.5 text-xs leading-5 text-slate-600">
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </Section>
  );
}
