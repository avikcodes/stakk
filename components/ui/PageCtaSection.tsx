import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { SITE_CONFIG } from "@/lib/site";

interface PageCtaSectionProps {
  title?: string;
  description?: string;
  primaryCtaHref?: string;
  primaryCtaLabel?: string;
  secondaryLink?: { label: string; href: string };
  muted?: boolean;
}

export function PageCtaSection({
  title = `All the capabilities. One plan. ${SITE_CONFIG.priceMonthly}${SITE_CONFIG.priceUnit}.`,
  description = "Content, Research, Analytics, Social, Brand Context, and Publishing workflows combined into one flat monthly subscription.",
  primaryCtaHref = "/pricing",
  primaryCtaLabel = "Start with Stak",
  secondaryLink = { label: "Explore all features", href: "/features" },
  muted = true,
}: PageCtaSectionProps) {
  return (
    <Section labelledBy="page-cta-heading" muted={muted}>
      <div className="flex flex-col justify-between gap-6 rounded-2xl border border-stone-200/90 bg-white p-7 shadow-2xs sm:flex-row sm:items-center sm:p-10">
        <div className="max-w-xl">
          <p className="font-mono text-xs uppercase tracking-wider text-slate-500">
            {SITE_CONFIG.name} · {SITE_CONFIG.priceMonthly}
            {SITE_CONFIG.priceUnit}
          </p>
          <h2
            id="page-cta-heading"
            className="mt-2 font-serif text-2xl font-normal tracking-tight text-[#14181f] sm:text-3xl"
          >
            {title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href={primaryCtaHref}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#14181f] px-6 py-3 text-sm font-medium text-white transition-all duration-150 hover:bg-[#232933] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14181f] focus-visible:ring-offset-2"
          >
            <span>{primaryCtaLabel}</span>
            <span aria-hidden="true">→</span>
          </Link>
          <Link
            href={secondaryLink.href}
            className="inline-flex items-center justify-center rounded-lg border border-stone-300 bg-[#fbfbfa] px-5 py-3 text-sm font-medium text-[#14181f] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14181f] focus-visible:ring-offset-2"
          >
            {secondaryLink.label}
          </Link>
        </div>
      </div>
    </Section>
  );
}

