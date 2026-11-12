export interface BlogAuthor {
  name: string;
  role: string;
  bio: string;
}

export interface BlogSection {
  heading: string;
  paragraphs: readonly string[];
  bullets?: readonly string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  author: BlogAuthor;
  publishedAt: string;
  updatedAt: string;
  category: string;
  readingTime: string;
  featuredImage: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  relatedSlugs: readonly string[];
  internalLinks: readonly { label: string; href: string }[];
  cta: {
    title: string;
    description: string;
    label: string;
    href: string;
  };
  sections: readonly BlogSection[];
}

const EDITORIAL_AUTHOR: BlogAuthor = {
  name: "Stak Editorial Team",
  role: "Product & Search Research",
  bio: "Writes practical guides on AI search optimization, GEO, brand context architecture (COMPANY.md and TONE.md), and editorial workflows at Stak.",
};

export const BLOG_POSTS: readonly BlogPost[] = [
  {
    slug: "company-md-and-tone-md-for-brand-aligned-ai-content",
    title: "Why COMPANY.md and TONE.md belong before any AI writing prompt",
    description:
      "How storing product positioning, website structure, and writing style in COMPANY.md and TONE.md keeps AI-assisted research, writing, and Reddit replies accurate.",
    author: EDITORIAL_AUTHOR,
    publishedAt: "2026-11-01",
    updatedAt: "2026-11-11",
    category: "Content Strategy",
    readingTime: "5 min read",
    featuredImage: {
      src: "/images/blog/brand-context-cover.svg",
      alt: "Diagram showing COMPANY.md and TONE.md markdown files feeding into editorial workflows",
      width: 1200,
      height: 630,
    },
    relatedSlugs: [
      "structuring-pages-for-seo-aeo-and-geo",
      "multi-agent-research-and-human-in-the-loop-review",
    ],
    internalLinks: [
      { label: "Brand Context on /features", href: "/features#brand-context" },
      {
        label: "Brand-Context Content Strategy Guide",
        href: "/resources/brand-context-content-strategy",
      },
      { label: "Stak $129/month Pricing", href: "/pricing" },
    ],
    cta: {
      title: "Build workflows grounded in your brand context",
      description:
        "Use COMPANY.md, TONE.md, multi-agent research, and human review in one $129/month plan.",
      label: "Explore Stak Features",
      href: "/features",
    },
    sections: [
      {
        heading: "Why generic AI drafts drift off-brand",
        paragraphs: [
          "Most AI content fails before a paragraph is written because the system does not know your actual product boundaries, sitemap, pricing, or editorial standards. Without explicit context, drafts fall back on vague superlatives and generic SaaS phrasing.",
          "Separating factual company knowledge from writing style solves both problems at the source.",
        ],
      },
      {
        heading: "What goes into COMPANY.md vs. TONE.md",
        paragraphs: [
          "COMPANY.md records concrete facts: what your platform does, what capabilities exist today versus on the roadmap, your canonical URLs, and how you position against alternatives.",
          "TONE.md defines how your team communicates: preferred vocabulary, sentence directness, formatting rules, and claims your brand avoids.",
        ],
        bullets: [
          "COMPANY.md holds positioning, product scope, sitemap structure, and existing content coverage.",
          "TONE.md governs voice, editorial restraint, and channel-specific tone rules.",
          "Both files remain readable, versionable, and editable by human reviewers.",
        ],
      },
      {
        heading: "Applying context across the full workflow",
        paragraphs: [
          "In Stak, brand context is not bolted onto the end of a prompt. It informs keyword and competitor research, guides article generation and rewriting, shapes Reddit comment drafts, and serves as the baseline for LLM brand interpretation checks.",
        ],
      },
    ],
  },
  {
    slug: "structuring-pages-for-seo-aeo-and-geo",
    title: "Structuring product and comparison pages for SEO, AEO, and GEO",
    description:
      "How clear HTML hierarchy, direct answers, honest comparison tables, and Schema.org metadata help search crawlers and AI answer engines understand your brand.",
    author: EDITORIAL_AUTHOR,
    publishedAt: "2026-11-05",
    updatedAt: "2026-11-11",
    category: "GEO",
    readingTime: "6 min read",
    featuredImage: {
      src: "/images/blog/ai-visibility-cover.svg",
      alt: "Three-column editorial diagram representing SEO, AEO, and GEO page structure",
      width: 1200,
      height: 630,
    },
    relatedSlugs: [
      "company-md-and-tone-md-for-brand-aligned-ai-content",
      "multi-agent-research-and-human-in-the-loop-review",
    ],
    internalLinks: [
      { label: "What is GEO?", href: "/resources/what-is-geo" },
      { label: "How AI Search Works", href: "/resources/how-ai-search-works" },
      { label: "Stak vs Gehirn.md", href: "/compare/stak-vs-gehirn" },
    ],
    cta: {
      title: "Track how AI search interprets your brand",
      description:
        "Combine LLM tracking, brand interpretation, and structured content workflows in one $129/month plan.",
      label: "View Pricing",
      href: "/pricing",
    },
    sections: [
      {
        heading: "One HTML foundation for three discovery layers",
        paragraphs: [
          "Teams do not need separate content silos for traditional search (SEO), answer boxes (AEO), and generative AI systems (GEO). A single well-structured HTML page serves all three when core facts are written clearly.",
        ],
        bullets: [
          "Use one H1 per page and logical H2/H3 subsections.",
          "State product category, pricing, and capabilities plainly in crawlable HTML.",
          "Include valid JSON-LD for Organization, WebSite, SoftwareApplication, and BreadcrumbList where applicable.",
        ],
      },
      {
        heading: "Why honest comparison pages perform better long-term",
        paragraphs: [
          "Comparison and alternative pages work best when they state verifiable facts rather than inventing negative claims about competitors. Direct side-by-side tables help buyers and AI retrieval systems evaluate pricing and product scope accurately.",
        ],
      },
    ],
  },
  {
    slug: "multi-agent-research-and-human-in-the-loop-review",
    title: "Separating multi-agent research from writing and human review",
    description:
      "Why breaking content operations into Company Context, Research, Multi-Agent Analysis, Content, Optimization, Review, and Publish reduces errors.",
    author: EDITORIAL_AUTHOR,
    publishedAt: "2026-11-09",
    updatedAt: "2026-11-11",
    category: "Research",
    readingTime: "5 min read",
    featuredImage: {
      src: "/images/blog/workflow-architecture-cover.svg",
      alt: "Connected four-stage pipeline diagram illustrating research, analysis, writing, and review",
      width: 1200,
      height: 630,
    },
    relatedSlugs: [
      "company-md-and-tone-md-for-brand-aligned-ai-content",
      "structuring-pages-for-seo-aeo-and-geo",
    ],
    internalLinks: [
      {
        label: "Multi-Agent Market Research Playbook",
        href: "/resources/multi-agent-market-research-playbook",
      },
      { label: "Explore 7-Stage Workflow on /features", href: "/features" },
      { label: "Explore Team Use Cases", href: "/use-cases" },
    ],
    cta: {
      title: "See the complete 7-stage Stak workflow",
      description:
        "From Company Context and Research through Human Review and Publish—all in one $129/month subscription.",
      label: "Start with Stak",
      href: "/pricing",
    },
    sections: [
      {
        heading: "Why single-shot prompting breaks down",
        paragraphs: [
          "Asking one prompt to discover keywords, analyze competitors, outline sections, and write finished prose forces guesswork. Research gets skipped, and errors slip straight into drafts.",
        ],
      },
      {
        heading: "The seven-stage Stak pipeline",
        paragraphs: [
          "Stak separates each concern so outputs can be inspected before the next stage runs: Company Context → Research → Multi-Agent Analysis → Content → Optimization → Review → Publish.",
        ],
        bullets: [
          "Research gathers keywords, competitor coverage, and live web facts first.",
          "Multi-Agent Analysis turns findings into prioritized content briefs.",
          "Human-in-the-loop Review confirms tone, accuracy, and readiness before export or CMS publishing.",
        ],
      },
    ],
  },
] as const;

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getRelatedBlogPosts(post: BlogPost): readonly BlogPost[] {
  return post.relatedSlugs
    .map((slug) => getBlogPostBySlug(slug))
    .filter((item): item is BlogPost => Boolean(item));
}

