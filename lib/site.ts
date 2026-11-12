export const SITE_CONFIG = {
  name: "Stak",
  domain: "stak.co.in",
  url: "https://stak.co.in",
  title: "Stak — The AI Search & Content Platform",
  description:
    "Stak is a $129/month alternative to Gehirn.md. Research markets, create brand-aligned content, and manage SEO, AEO, and GEO visibility workflows.",
  priceMonthly: "$129",
  priceValue: "129",
  priceCurrency: "USD",
  priceUnit: "/month",
  competitorName: "Gehirn.md",
} as const;

export const STAK_CAPABILITIES = [
  "Articles / month",
  "Projects",
  "Keywords",
  "Multi-Agent Research / Brainstorm",
  "LLM Tracking",
  "Brand Interpretation",
  "Backlinks",
  "Reddit Comments / month",
  "Website/company context",
  "Brand voice",
  "Content writing",
  "Content rewriting",
  "Competitor research",
  "SEO workflows",
  "Reddit workflows",
  "Backlink/community workflows",
  "Human-in-the-loop content workflow",
  "CMS publishing",
  "GitHub publishing",
] as const;

export const NAV_LINKS = [
  { label: "Features", href: "/features" },
  { label: "Use Cases", href: "/use-cases" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/#faq" },
] as const;

export interface SiteDirectoryLink {
  label: string;
  href: string;
  description: string;
  badge: string;
}

export const TRUST_LINKS: readonly SiteDirectoryLink[] = [
  {
    label: "About",
    href: "/about",
    description: "Company background, product focus, and editorial principles.",
    badge: "Company",
  },
  {
    label: "Contact",
    href: "/contact",
    description: "Direct communication details for teams, agencies, and inquiries.",
    badge: "Support",
  },
  {
    label: "Privacy Policy",
    href: "/privacy",
    description: "How website and brand context data are handled and protected.",
    badge: "Policy",
  },
  {
    label: "Terms",
    href: "/terms",
    description: "Terms governing the Stak website and $129/month subscription.",
    badge: "Legal",
  },
  {
    label: "Security",
    href: "/security",
    description: "Operational safeguards and brand context isolation practices.",
    badge: "Security",
  },
] as const;

export const RESOURCE_LINKS: readonly SiteDirectoryLink[] = [
  {
    label: "AI Visibility Checker",
    href: "/resources/how-to-monitor-ai-brand-visibility",
    description:
      "Framework for auditing how clearly your brand and pages appear across AI search systems.",
    badge: "AI Visibility",
  },
  {
    label: "GEO guides",
    href: "/resources/what-is-geo",
    description:
      "Practical playbooks for Generative Engine Optimization and entity clarity.",
    badge: "GEO",
  },
  {
    label: "AI SEO guides",
    href: "/resources/how-ai-search-works",
    description:
      "Editorial workflows combining keyword research with AEO and AI search.",
    badge: "AI SEO",
  },
  {
    label: "Gehirn alternatives",
    href: "/alternatives/gehirn",
    description:
      "Detailed overview of Stak as a flat $129/month alternative to Gehirn.md.",
    badge: "Comparison",
  },
  {
    label: "Stak vs Gehirn",
    href: "/compare/stak-vs-gehirn",
    description:
      "Side-by-side comparison across pricing, research, content, and brand context.",
    badge: "Comparison",
  },
  {
    label: "AI visibility resources",
    href: "/resources/how-to-optimize-for-ai-search",
    description:
      "Checklists and structured references for SEO, AEO, and GEO teams.",
    badge: "AEO",
  },
] as const;

export const FOOTER_COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Use Cases", href: "/use-cases" },
      { label: "Integrations", href: "/integrations" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    heading: "Compare",
    links: [
      { label: "Compare", href: "/compare" },
      { label: "Alternatives", href: "/alternatives" },
      { label: "Stak vs Gehirn", href: "/compare/stak-vs-gehirn" },
      { label: "Gehirn alternatives", href: "/alternatives/gehirn" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Resources", href: "/resources" },
      { label: "Blog", href: "/blog" },
      { label: "AI Visibility Checker", href: "/resources/how-to-monitor-ai-brand-visibility" },
      { label: "GEO guides", href: "/resources/what-is-geo" },
      { label: "AI SEO guides", href: "/resources/how-ai-search-works" },
      { label: "AI visibility resources", href: "/resources/how-to-optimize-for-ai-search" },
    ],
  },
  {
    heading: "Trust & Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Security", href: "/security" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
] as const;
