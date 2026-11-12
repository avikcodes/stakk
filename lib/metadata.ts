import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/site";

interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
}

export function buildPageMetadata({
  title,
  description,
  path,
}: PageMetadataInput): Metadata {
  const fullUrl = `${SITE_CONFIG.url}${path}`;
  const socialTitle = `${title} | ${SITE_CONFIG.name}`;

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      url: fullUrl,
      siteName: SITE_CONFIG.name,
      title: socialTitle,
      description,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
    },
  };
}

