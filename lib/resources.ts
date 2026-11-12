export const RESOURCE_CATEGORIES = [
  "AI Visibility",
  "GEO",
  "AEO",
  "AI SEO",
  "SEO",
  "Content Strategy",
  "Research",
] as const;

export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number];

export interface ResourceSection {
  heading: string;
  body: string;
  bullets?: readonly string[];
}

export interface ResourceGuide {
  slug: string;
  title: string;
  description: string;
  category: ResourceCategory;
  readingTime: string;
  updatedAt: string;
  anchorId?: string;
  sections: readonly ResourceSection[];
  internalLinks: readonly { label: string; href: string }[];
}

export const RESOURCE_GUIDES: readonly ResourceGuide[] = [
  {
    slug: "what-is-geo",
    title: "What is GEO (Generative Engine Optimization)?",
    description:
      "A clear introduction to Generative Engine Optimization, how it relates to SEO and AEO, and how brand context helps AI systems interpret your product accurately.",
    category: "GEO",
    readingTime: "5 min read",
    updatedAt: "2026-11-11",
    anchorId: "geo-guides",
    sections: [
      {
        heading: "Definition of GEO",
        body: "Generative Engine Optimization (GEO) is the practice of structuring, writing, and verifying public web content so generative AI search and answer systems can retrieve, understand, and summarize your company accurately.",
        bullets: [
          "Focuses on factual clarity, consistent entity facts, and verifiable positioning.",
          "Complements traditional search indexing (SEO) and direct-answer formatting (AEO).",
          "Reduces ambiguity around what your product does, who it serves, and how it is priced.",
        ],
      },
      {
        heading: "Why brand context matters for GEO",
        body: "When pricing, capabilities, and positioning differ across landing pages, AI systems produce inconsistent summaries. Keeping company facts in COMPANY.md and voice standards in TONE.md gives every published page a consistent baseline.",
      },
      {
        heading: "How Stak supports GEO workflows",
        body: "Stak pairs multi-agent research and brand interpretation tracking with structured content projects and human review under one $129/month plan.",
      },
    ],
    internalLinks: [
      { label: "How AI Search Works", href: "/resources/how-ai-search-works" },
      { label: "Explore Stak Features", href: "/features" },
      { label: "See $129/month Pricing", href: "/pricing" },
    ],
  },
  {
    slug: "how-ai-search-works",
    title: "How AI Search Works",
    description:
      "How AI search systems discover pages, extract entity facts, synthesize multi-source answers, and decide which brands to reference.",
    category: "AI SEO",
    readingTime: "6 min read",
    updatedAt: "2026-11-11",
    anchorId: "ai-seo-guides",
    sections: [
      {
        heading: "Discovery, retrieval, and synthesis",
        body: "Modern AI search pipelines combine standard web crawling and index retrieval with language-model synthesis. If a page cannot be crawled cleanly or hides core facts behind client-only scripts, retrieval quality drops.",
        bullets: [
          "Server-rendered HTML ensures crawlers and retrieval pipelines read full text.",
          "Semantic headings (H1–H3) and clean metadata clarify page scope.",
          "Structured Schema.org JSON-LD reinforces Organization, WebSite, and SoftwareApplication entities.",
        ],
      },
      {
        heading: "How community and external citations interact",
        body: "AI systems often cross-check brand claims against third-party discussions, comparison pages, and community threads such as Reddit alongside your primary domain.",
      },
    ],
    internalLinks: [
      {
        label: "How to Optimize for AI Search",
        href: "/resources/how-to-optimize-for-ai-search",
      },
      {
        label: "Compare Stak vs Gehirn.md",
        href: "/compare/stak-vs-gehirn",
      },
    ],
  },
  {
    slug: "how-to-optimize-for-ai-search",
    title: "How to Optimize for AI Search",
    description:
      "Practical editorial and technical steps for structuring pages for Answer Engine Optimization (AEO) and AI search systems without keyword stuffing.",
    category: "AEO",
    readingTime: "6 min read",
    updatedAt: "2026-11-11",
    sections: [
      {
        heading: "Lead with direct answers",
        body: "Answer Engine Optimization (AEO) starts by answering the reader's core question plainly in the opening paragraph before expanding into supporting workflows and technical details.",
        bullets: [
          "Use descriptive headings that match real buyer and practitioner questions.",
          "Avoid vague slogans or unverified statistics that weaken factual credibility.",
          "Keep pricing, product scope, and comparison tables explicit in HTML.",
        ],
      },
      {
        heading: "Maintain human-in-the-loop review",
        body: "Every generated or rewritten article should pass human editorial verification to confirm that claims, product terminology, and internal links match current reality.",
      },
    ],
    internalLinks: [
      {
        label: "How to Monitor AI Brand Visibility",
        href: "/resources/how-to-monitor-ai-brand-visibility",
      },
      { label: "Explore Content Workflows", href: "/features#content" },
    ],
  },
  {
    slug: "how-to-monitor-ai-brand-visibility",
    title: "How to Monitor AI Brand Visibility",
    description:
      "A practical framework for tracking LLM visibility, auditing brand interpretation, and spotting where AI answers misstate your product or pricing.",
    category: "AI Visibility",
    readingTime: "5 min read",
    updatedAt: "2026-11-11",
    anchorId: "ai-visibility-checker",
    sections: [
      {
        heading: "Visibility vs. brand interpretation",
        body: "Monitoring AI visibility means checking two separate questions: whether your brand appears for category prompts, and whether the model interprets your product scope and pricing accurately.",
        bullets: [
          "Audit category discovery prompts (e.g., platform category and alternatives).",
          "Audit direct brand prompts (what your product does, who it is for, and pricing).",
          "Log discrepancies against COMPANY.md so content updates target real clarity gaps.",
        ],
      },
      {
        heading: "Closing visibility gaps with content projects",
        body: "When AI systems miss a capability or misstate pricing, publish or rewrite clear canonical documentation pages and reinforce them with consistent structured data.",
      },
    ],
    internalLinks: [
      { label: "See Analytics & LLM Tracking", href: "/features#analytics" },
      { label: "What is GEO?", href: "/resources/what-is-geo" },
    ],
  },
  {
    slug: "technical-seo-foundations-for-ai-crawlers",
    title: "Technical SEO Foundations for Search & AI Crawlers",
    description:
      "Essential technical checks covering canonical URLs, sitemaps, robots.txt, single-H1 structure, and crawlable HTML.",
    category: "SEO",
    readingTime: "4 min read",
    updatedAt: "2026-11-11",
    sections: [
      {
        heading: "Clean crawl signals",
        body: "Reliable organic and AI search performance depends on straightforward technical foundations: accurate canonical tags, clean robots.txt directives, complete XML sitemaps, and valid 404 responses with noindex.",
        bullets: [
          "Maintain one H1 per page with logical H2 and H3 subsections.",
          "Serve core copy and tables in server-rendered HTML.",
          "Use descriptive URLs and consistent internal linking across hub and comparison pages.",
        ],
      },
    ],
    internalLinks: [
      { label: "How AI Search Works", href: "/resources/how-ai-search-works" },
      { label: "Explore Stak Features", href: "/features" },
    ],
  },
  {
    slug: "brand-context-content-strategy",
    title: "Building a Brand-Context-First Content Strategy",
    description:
      "How to organize COMPANY.md, TONE.md, sitemaps, and existing content inventories before running research or generating articles.",
    category: "Content Strategy",
    readingTime: "5 min read",
    updatedAt: "2026-11-11",
    anchorId: "ai-visibility-resources",
    sections: [
      {
        heading: "Why content strategy starts with context",
        body: "Before selecting keywords or drafting pages, teams need a shared definition of their product boundaries, audience segments, and voice standards.",
        bullets: [
          "Document factual product capabilities and pricing in COMPANY.md.",
          "Define writing style, tone, and editorial guardrails in TONE.md.",
          "Map existing URLs and sitemap paths to prevent cannibalization and guide rewrites.",
        ],
      },
    ],
    internalLinks: [
      { label: "See Brand Context on /features", href: "/features#brand-context" },
      { label: "Explore Team Use Cases", href: "/use-cases" },
    ],
  },
  {
    slug: "multi-agent-market-research-playbook",
    title: "Multi-Agent Market, Competitor, and Web Research Playbook",
    description:
      "How separating keyword discovery, competitor coverage analysis, live web lookup, and brainstorming improves editorial briefs.",
    category: "Research",
    readingTime: "5 min read",
    updatedAt: "2026-11-11",
    sections: [
      {
        heading: "Separating research roles before drafting",
        body: "Asking one generic prompt to research, outline, and write at the same time often produces shallow content. Dedicated research passes gather keyword intent, competitor positioning, and live web facts first.",
        bullets: [
          "Run keyword and competitor gap checks grounded in product scope.",
          "Pull current web context to keep terminology accurate.",
          "Synthesize findings into structured outlines ready for Content Projects and human review.",
        ],
      },
    ],
    internalLinks: [
      { label: "See Research on /features", href: "/features#research" },
      { label: "Compare Alternatives", href: "/alternatives" },
    ],
  },
] as const;

export function getResourceBySlug(slug: string): ResourceGuide | undefined {
  return RESOURCE_GUIDES.find((item) => item.slug === slug);
}

