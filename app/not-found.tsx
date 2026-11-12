import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Container } from "@/components/ui/Container";
import { SITE_CONFIG } from "@/lib/site";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: `The requested page could not be found on ${SITE_CONFIG.name}.`,
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center py-20 sm:py-28">
        <Container>
          <div className="mx-auto max-w-xl rounded-2xl border border-stone-200/90 bg-white p-8 text-center shadow-2xs sm:p-12">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl border border-stone-200 bg-[#fbfbfa] text-[#14181f]">
              <FileQuestion className="h-6 w-6" aria-hidden="true" />
            </div>

            <p className="mt-6 font-mono text-xs font-medium uppercase tracking-wider text-slate-500">
              Error 404
            </p>
            <h1 className="mt-2 font-serif text-3xl font-normal tracking-tight text-[#14181f] sm:text-4xl">
              Page not found
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              The page you requested does not exist on {SITE_CONFIG.domain}.
              Return to the homepage to learn about {SITE_CONFIG.name}, our{" "}
              {SITE_CONFIG.priceMonthly}
              {SITE_CONFIG.priceUnit} alternative to{" "}
              {SITE_CONFIG.competitorName}.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#14181f] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#232933]"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to Homepage
              </Link>
              <Link
                href="/#pricing"
                className="inline-flex items-center justify-center rounded-lg border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-[#14181f] transition-colors hover:bg-stone-50"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}

