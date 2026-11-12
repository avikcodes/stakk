import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/Container";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  breadcrumbLabel: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbLabel,
  primaryCta,
  secondaryCta,
}: PageHeroProps) {
  return (
    <section
      aria-labelledby="page-hero-heading"
      className="cloud-atmosphere border-b border-stone-200/80 pt-12 pb-16 sm:pt-16 sm:pb-20"
    >
      <Container>
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-slate-500">
          <Link
            href="/"
            className="font-mono transition-colors hover:text-[#14181f]"
          >
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <span className="font-mono text-[#14181f]">{breadcrumbLabel}</span>
        </nav>

        <div className="animate-fade-up max-w-3xl">
          <p className="inline-flex items-center rounded-full border border-stone-200/90 bg-white/85 px-3.5 py-1 font-mono text-xs font-medium text-slate-700">
            {eyebrow}
          </p>

          <h1
            id="page-hero-heading"
            className="mt-5 font-serif text-4xl font-normal tracking-[-0.025em] text-balance text-[#14181f] sm:text-5xl sm:leading-[1.08]"
          >
            {title}
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-pretty text-slate-600 sm:text-lg sm:leading-8">
            {description}
          </p>

          {primaryCta || secondaryCta ? (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              {primaryCta ? (
                <Link
                  href={primaryCta.href}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#14181f] px-6 py-3 text-sm font-medium text-white transition-all duration-150 hover:bg-[#232933] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14181f] focus-visible:ring-offset-2"
                >
                  <span>{primaryCta.label}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              ) : null}
              {secondaryCta ? (
                <Link
                  href={secondaryCta.href}
                  className="inline-flex items-center justify-center rounded-lg border border-stone-300/90 bg-white/85 px-6 py-3 text-sm font-medium text-[#14181f] transition-colors duration-150 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14181f] focus-visible:ring-offset-2"
                >
                  {secondaryCta.label}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

