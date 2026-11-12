import type { ReactNode } from "react";
import { SITE_CONFIG } from "@/lib/site";
import { buildBreadcrumbSchema, type BreadcrumbItem } from "@/lib/structured-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

interface PageShellProps {
  breadcrumbs?: readonly BreadcrumbItem[];
  children: ReactNode;
}

export function PageShell({ breadcrumbs, children }: PageShellProps) {
  const breadcrumbJsonLd = breadcrumbs
    ? {
        "@context": "https://schema.org",
        ...buildBreadcrumbSchema([
          { name: "Home", url: SITE_CONFIG.url },
          ...breadcrumbs,
        ]),
      }
    : null;

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-[#14181f] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to content
      </a>
      {breadcrumbJsonLd ? <JsonLd data={breadcrumbJsonLd} /> : null}
      <SiteHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

