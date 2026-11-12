import { SITE_CONFIG, STAK_CAPABILITIES } from "@/lib/site";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function buildBreadcrumbSchema(items: readonly BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${items[items.length - 1]?.url ?? SITE_CONFIG.url}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function getHomepageStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_CONFIG.url}/#organization`,
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.url,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_CONFIG.url}/icon.svg`,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_CONFIG.url}/#website`,
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.url,
        description: SITE_CONFIG.description,
        inLanguage: "en",
        publisher: {
          "@id": `${SITE_CONFIG.url}/#organization`,
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_CONFIG.url}/#software`,
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.url,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: SITE_CONFIG.description,
        publisher: {
          "@id": `${SITE_CONFIG.url}/#organization`,
        },
        featureList: [...STAK_CAPABILITIES],
        offers: {
          "@type": "Offer",
          name: "STAK",
          price: SITE_CONFIG.priceValue,
          priceCurrency: SITE_CONFIG.priceCurrency,
          url: `${SITE_CONFIG.url}/#pricing`,
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: SITE_CONFIG.priceValue,
            priceCurrency: SITE_CONFIG.priceCurrency,
            unitText: "MONTH",
          },
        },
      },
      buildBreadcrumbSchema([
        {
          name: "Home",
          url: SITE_CONFIG.url,
        },
      ]),
    ],
  };
}

