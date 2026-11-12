import Link from "next/link";
import { FOOTER_COLUMNS, SITE_CONFIG } from "@/lib/site";
import { Container } from "@/components/ui/Container";
import { BrandMark } from "@/components/ui/BrandMark";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-stone-200/80 bg-white py-14 sm:py-16">
      <Container>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-4">
            <Link href="/" className="inline-block">
              <BrandMark />
            </Link>
            <p className="max-w-xs text-sm leading-6 text-slate-600">
              {SITE_CONFIG.title}. A {SITE_CONFIG.priceMonthly}
              {SITE_CONFIG.priceUnit} alternative to {SITE_CONFIG.competitorName}{" "}
              for market research, brand-aligned content, and SEO/AEO/GEO
              workflows.
            </p>
            <p className="font-mono text-xs text-slate-500">
              {SITE_CONFIG.url}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.heading}>
                <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {column.heading}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-sm text-slate-600 transition-colors hover:text-[#14181f]"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-stone-200/80 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date("2026-01-01").getUTCFullYear()} {SITE_CONFIG.name}. All rights
            reserved.
          </p>
          <p className="font-mono">
            {SITE_CONFIG.priceMonthly}
            {SITE_CONFIG.priceUnit} · Canonical: {SITE_CONFIG.url}
          </p>
        </div>
      </Container>
    </footer>
  );
}
