import { db } from "./index";
import { projectBrandContexts, projects } from "./schema";
import { eq } from "drizzle-orm";
import {
  crawlAndExtractBrandContext,
  ExtractedBrandContext,
  ImportantPage,
  SiteStructureNode,
  TerminologyItem,
} from "../ai/brand-context-crawler";
import { analyzeAndGenerateBrandVoice } from "./brand-voice-service";

export interface ProjectBrandContextData {
  id: string;
  projectId: string;
  websiteUrl: string;
  companyName: string;
  companyDescription: string;
  industry: string;
  targetAudience: string;
  productsServices: string[];
  websiteContent: string;
  companyInformation: string;
  importantPages: ImportantPage[];
  siteStructure: SiteStructureNode[];
  terminology: TerminologyItem[];
  positioning: string;
  existingContent: string[];
  companyContextMarkdown: string;
  crawlStatus: "completed" | "crawling" | "failed";
  crawledPagesCount: number;
  crawledAt: Date;
  updatedAt: Date;
}

// In-Memory Dev Store for Brand Context
const DEV_BRAND_CONTEXTS = new Map<string, ProjectBrandContextData>();

// Seed default context for proj-1 and proj-2
DEV_BRAND_CONTEXTS.set("proj-1", {
  id: "pbc-proj-1",
  projectId: "proj-1",
  websiteUrl: "https://stak.dev",
  companyName: "Stak",
  companyDescription:
    "Developer-first SEO and content intelligence platform that replaces manual writing teams with an orchestrated multi-agent pipeline and strict human-in-the-loop review.",
  industry: "Developer Tools & Content Infrastructure",
  targetAudience: "Engineering leads, technical founders, and B2B SaaS growth teams.",
  productsServices: [
    "Multi-Agent Article Generation",
    "Live Web Research via Firecrawl",
    "LLM Tracking & AI Visibility Monitoring",
    "Brand Interpretation Analysis",
    "Backlink Community Outreach",
    "Publishing Integrations (Strapi, GitHub, WordPress, Sanity, Contentful, Webflow, Ghost, Contao)",
  ],
  websiteContent:
    "Stak provides a deterministic editorial workspace connecting keyword research, multi-agent drafting, brand voice calibration, and one-click CMS publishing.",
  companyInformation:
    "Founded to give engineering and growth teams full visibility over how AI systems represent their product, backed by transparent flat pricing of $129/month.",
  importantPages: [
    { title: "Home", url: "https://stak.dev", purpose: "Main product architecture and feature overview" },
    { title: "Features", url: "https://stak.dev/features", purpose: "Deep dive into the 8-stage writing workflow" },
    { title: "Pricing", url: "https://stak.dev/pricing", purpose: "Single tier $129/mo flat rate documentation" },
    { title: "Integrations", url: "https://stak.dev/integrations", purpose: "Overview of the 8 supported publishing connectors" },
  ],
  siteStructure: [
    { path: "/", title: "Home", section: "Core", depth: 0, purpose: "Main product architecture and feature overview" },
    { path: "/features", title: "Features", section: "Product", depth: 1, purpose: "Deep dive into the 8-stage writing workflow" },
    { path: "/pricing", title: "Pricing", section: "Product", depth: 1, purpose: "Single tier $129/mo flat rate documentation" },
    { path: "/integrations", title: "Integrations", section: "Product", depth: 1, purpose: "Overview of the 8 supported publishing connectors" },
    { path: "/resources", title: "Resources", section: "Resources", depth: 1, purpose: "GEO, AEO, and AI search guides" },
    { path: "/blog", title: "Blog", section: "Resources", depth: 1, purpose: "Technical thought leadership articles" },
    { path: "/about", title: "About", section: "Company", depth: 1, purpose: "Mission and multi-agent architecture philosophy" },
    { path: "/terms", title: "Terms", section: "Legal", depth: 1, purpose: "Service level agreement and privacy terms" },
  ],
  terminology: [
    { term: "COMPANY.md", definition: "Persistent markdown document encoding company facts, product tiers, and capabilities." },
    { term: "TONE.md", definition: "Persistent rules governing style, sentence rhythm, and banned marketing clichés." },
    { term: "Multi-Agent Research", definition: "Parallel autonomous agent dispatch investigating intent, competitor blindspots, and citations." },
    { term: "Human-in-the-Loop", definition: "Mandatory verification points where human editors approve outlines and drafts before publishing." },
  ],
  positioning:
    "The engineering alternative to black-box automated content farms, offering 100% brand voice fidelity and zero generic AI filler.",
  existingContent: [
    "Why Multi-Agent Research Beats Single-Prompt LLM Writing",
    "Structuring COMPANY.md and TONE.md for Consistent Brand Voice",
    "Understanding LLM Brand Interpretation and Citation Presence",
  ],
  companyContextMarkdown: `# COMPANY.md: Stak
- **Website URL:** https://stak.dev
- **Industry:** Developer Tools & Content Infrastructure
- **Target Audience:** Engineering leads, technical founders, and B2B SaaS growth teams.

## 1. Company Overview & Mission
Developer-first SEO and content intelligence platform that replaces manual writing teams with an orchestrated multi-agent pipeline and strict human-in-the-loop review.

## 2. Products & Services Catalog
- Multi-Agent Article Generation
- Live Web Research via Firecrawl
- LLM Tracking & AI Visibility Monitoring
- Brand Interpretation Analysis
- Backlink Community Outreach
- Publishing Integrations (Strapi, GitHub, WordPress, Sanity, Contentful, Webflow, Ghost, Contao)

## 3. Market Positioning & Differentiators
The engineering alternative to black-box automated content farms, offering 100% brand voice fidelity and zero generic AI filler. Flat $129/month pricing with 250 articles/month.

## 4. Domain Terminology & Glossary
- **COMPANY.md**: Persistent markdown document encoding company facts, product tiers, and capabilities.
- **TONE.md**: Persistent rules governing style, sentence rhythm, and banned marketing clichés.
- **Multi-Agent Research**: Parallel autonomous agent dispatch investigating intent, competitor blindspots, and citations.

## 5. Important Pages & Architecture
- [Home](https://stak.dev): Main product architecture and feature overview
- [Features](https://stak.dev/features): Deep dive into the 8-stage writing workflow
- [Pricing](https://stak.dev/pricing): Single tier $129/mo flat rate documentation
- [Integrations](https://stak.dev/integrations): Overview of the 8 supported publishing connectors
`,
  crawlStatus: "completed",
  crawledPagesCount: 1,
  crawledAt: new Date("2026-11-10T00:00:00Z"),
  updatedAt: new Date("2026-11-12T00:00:00Z"),
});

DEV_BRAND_CONTEXTS.set("proj-2", {
  id: "pbc-proj-2",
  projectId: "proj-2",
  websiteUrl: "https://neon.tech",
  companyName: "Neon",
  companyDescription: "Serverless Postgres with separated compute and storage, instant branching, and autoscaling.",
  industry: "Cloud Databases & Developer Infrastructure",
  targetAudience: "Full-stack engineers, backend developers, and DevOps architects.",
  productsServices: [
    "Serverless Postgres Engine",
    "Database Branching",
    "Autoscaling Compute",
    "Point-in-Time Recovery",
    "Connection Pooling",
  ],
  websiteContent: "Serverless Postgres platform built for high-scale applications.",
  companyInformation: "Modern cloud-native Postgres database engine with microsecond cold starts.",
  importantPages: [
    { title: "Home", url: "https://neon.tech", purpose: "Main landing page" },
    { title: "Docs", url: "https://neon.tech/docs", purpose: "Technical documentation" },
  ],
  siteStructure: [
    { path: "/", title: "Home", section: "Core", depth: 0, purpose: "Main landing and serverless architecture overview" },
    { path: "/docs", title: "Docs", section: "Documentation", depth: 1, purpose: "API, branching, and driver documentation" },
    { path: "/blog", title: "Blog", section: "Resources", depth: 1, purpose: "Postgres internals and engineering benchmarks" },
    { path: "/pricing", title: "Pricing", section: "Product", depth: 1, purpose: "Compute unit and storage pricing" },
    { path: "/about", title: "About", section: "Company", depth: 1, purpose: "Team, investors, and mission" },
  ],
  terminology: [
    { term: "Instant Branching", definition: "Copy-on-write clone of an entire Postgres database in seconds." },
    { term: "Separated Storage", definition: "Decoupled storage pages allowing compute to scale to zero." },
  ],
  positioning: "The premier serverless database for modern developer stacks.",
  existingContent: [
    "Resolving Postgres Connection Exhaustion in Serverless Edge Functions",
  ],
  companyContextMarkdown: `# COMPANY.md: Neon
- **Website URL:** https://neon.tech
- **Industry:** Cloud Databases & Developer Infrastructure
- **Target Audience:** Full-stack engineers, backend developers, and DevOps architects.

## 1. Company Overview & Mission
Serverless Postgres with separated compute and storage, instant branching, and autoscaling.
`,
  crawlStatus: "completed",
  crawledPagesCount: 1,
  crawledAt: new Date("2026-11-08T00:00:00Z"),
  updatedAt: new Date("2026-11-10T00:00:00Z"),
});

/**
 * Retrieves the Brand Context for a project from Neon DB or in-memory fallback.
 */
export async function getProjectBrandContext(
  projectId: string
): Promise<ProjectBrandContextData | null> {
  if (db) {
    try {
      const records = await db
        .select()
        .from(projectBrandContexts)
        .where(eq(projectBrandContexts.projectId, projectId as any));

      if (records.length > 0) {
        const r = records[0];
        return {
          id: r.id,
          projectId: r.projectId,
          websiteUrl: r.websiteUrl,
          companyName: r.companyName,
          companyDescription: r.companyDescription || "",
          industry: r.industry || "Technology",
          targetAudience: r.targetAudience || "Technical buyers",
          productsServices: parseJsonSafe(r.productsServices, []),
          websiteContent: r.websiteContent || "",
          companyInformation: r.companyInformation || "",
          importantPages: parseJsonSafe(r.importantPages, []),
          siteStructure: parseJsonSafe(r.siteStructure, []),
          terminology: parseJsonSafe(r.terminology, []),
          positioning: r.positioning || "",
          existingContent: parseJsonSafe(r.existingContent, []),
          companyContextMarkdown: r.companyContextMarkdown || "",
          crawlStatus: (r.crawlStatus as any) || "completed",
          crawledPagesCount: r.crawledPagesCount || 1,
          crawledAt: r.crawledAt || new Date(),
          updatedAt: r.updatedAt || new Date(),
        };
      }
    } catch (err) {
      console.warn("Neon DB query failed for projectBrandContexts:", err);
    }
  }

  return DEV_BRAND_CONTEXTS.get(projectId) || null;
}

/**
 * Crawls the provided website using Firecrawl, extracts the 7 context dimensions,
 * and persists the processed context into Neon.
 */
export async function crawlAndSaveBrandContext(params: {
  projectId: string;
  websiteUrl: string;
  companyName: string;
  companyDescription?: string;
  industry?: string;
  targetAudience?: string;
  productsServices?: string;
}): Promise<ProjectBrandContextData> {
  const extracted = await crawlAndExtractBrandContext({
    websiteUrl: params.websiteUrl,
    companyName: params.companyName,
    companyDescription: params.companyDescription,
    industry: params.industry,
    targetAudience: params.targetAudience,
    productsServices: params.productsServices,
  });

  const now = new Date();
  const contextData: ProjectBrandContextData = {
    id: `pbc-${Date.now()}`,
    projectId: params.projectId,
    websiteUrl: extracted.websiteUrl,
    companyName: extracted.companyName,
    companyDescription: extracted.companyDescription,
    industry: extracted.industry,
    targetAudience: extracted.targetAudience,
    productsServices: extracted.productsServices,
    websiteContent: extracted.websiteContent,
    companyInformation: extracted.companyInformation,
    importantPages: extracted.importantPages,
    siteStructure: extracted.siteStructure,
    terminology: extracted.terminology,
    positioning: extracted.positioning,
    existingContent: extracted.existingContent,
    companyContextMarkdown: extracted.companyContextMarkdown,
    crawlStatus: "completed",
    crawledPagesCount: extracted.crawledPagesCount,
    crawledAt: now,
    updatedAt: now,
  };

  // 1. Persist to Neon DB
  if (db) {
    try {
      // Check existing record
      const existing = await db
        .select()
        .from(projectBrandContexts)
        .where(eq(projectBrandContexts.projectId, params.projectId as any));

      if (existing.length > 0) {
        await db
          .update(projectBrandContexts)
          .set({
            websiteUrl: contextData.websiteUrl,
            companyName: contextData.companyName,
            companyDescription: contextData.companyDescription,
            industry: contextData.industry,
            targetAudience: contextData.targetAudience,
            productsServices: JSON.stringify(contextData.productsServices),
            websiteContent: contextData.websiteContent,
            companyInformation: contextData.companyInformation,
            importantPages: JSON.stringify(contextData.importantPages),
            siteStructure: JSON.stringify(contextData.siteStructure),
            terminology: JSON.stringify(contextData.terminology),
            positioning: contextData.positioning,
            existingContent: JSON.stringify(contextData.existingContent),
            companyContextMarkdown: contextData.companyContextMarkdown,
            crawlStatus: "completed",
            crawledPagesCount: contextData.crawledPagesCount,
            crawledAt: now,
            updatedAt: now,
          })
          .where(eq(projectBrandContexts.id, existing[0].id));
        contextData.id = existing[0].id;
      } else {
        const [inserted] = await db
          .insert(projectBrandContexts)
          .values({
            projectId: params.projectId as any,
            websiteUrl: contextData.websiteUrl,
            companyName: contextData.companyName,
            companyDescription: contextData.companyDescription,
            industry: contextData.industry,
            targetAudience: contextData.targetAudience,
            productsServices: JSON.stringify(contextData.productsServices),
            websiteContent: contextData.websiteContent,
            companyInformation: contextData.companyInformation,
            importantPages: JSON.stringify(contextData.importantPages),
            siteStructure: JSON.stringify(contextData.siteStructure),
            terminology: JSON.stringify(contextData.terminology),
            positioning: contextData.positioning,
            existingContent: JSON.stringify(contextData.existingContent),
            companyContextMarkdown: contextData.companyContextMarkdown,
            crawlStatus: "completed",
            crawledPagesCount: contextData.crawledPagesCount,
            crawledAt: now,
            updatedAt: now,
          })
          .returning();

        if (inserted) {
          contextData.id = inserted.id;
        }
      }

      // Update the parent project's companyContext & metadata in Neon
      await db
        .update(projects)
        .set({
          companyContext: contextData.companyContextMarkdown,
          domain: contextData.websiteUrl.replace(/^https?:\/\//, "").replace(/\/.*$/, ""),
          description: contextData.companyDescription,
          industry: contextData.industry,
          targetAudience: contextData.targetAudience,
          productsServices: JSON.stringify(contextData.productsServices),
          updatedAt: now,
        })
        .where(eq(projects.id, params.projectId as any));
    } catch (err) {
      console.warn("Neon DB persist failed for brand context:", err);
    }
  }

  // 2. Persist to in-memory store
  DEV_BRAND_CONTEXTS.set(params.projectId, contextData);

  // 3. Automatically build/refresh brand voice context using OpenRouter
  try {
    await analyzeAndGenerateBrandVoice(params.projectId);
  } catch (voiceErr) {
    console.warn("Auto-sync brand voice following crawl encountered warning:", voiceErr);
  }

  return contextData;
}

/**
 * Updates an existing brand context manually.
 */
export async function updateProjectBrandContext(
  projectId: string,
  updates: Partial<ProjectBrandContextData>
): Promise<ProjectBrandContextData> {
  const current = (await getProjectBrandContext(projectId)) || {
    id: `pbc-${Date.now()}`,
    projectId,
    websiteUrl: "https://example.com",
    companyName: "Company",
    companyDescription: "",
    industry: "Technology",
    targetAudience: "Buyers",
    productsServices: [],
    websiteContent: "",
    companyInformation: "",
    importantPages: [],
    siteStructure: [],
    terminology: [],
    positioning: "",
    existingContent: [],
    companyContextMarkdown: "",
    crawlStatus: "completed" as const,
    crawledPagesCount: 1,
    crawledAt: new Date(),
    updatedAt: new Date(),
  };

  const updated: ProjectBrandContextData = {
    ...current,
    ...updates,
    updatedAt: new Date(),
  };

  if (db) {
    try {
      await db
        .update(projectBrandContexts)
        .set({
          websiteUrl: updated.websiteUrl,
          companyName: updated.companyName,
          companyDescription: updated.companyDescription,
          industry: updated.industry,
          targetAudience: updated.targetAudience,
          productsServices: JSON.stringify(updated.productsServices),
          websiteContent: updated.websiteContent,
          companyInformation: updated.companyInformation,
          importantPages: JSON.stringify(updated.importantPages),
          siteStructure: JSON.stringify(updated.siteStructure),
          terminology: JSON.stringify(updated.terminology),
          positioning: updated.positioning,
          existingContent: JSON.stringify(updated.existingContent),
          companyContextMarkdown: updated.companyContextMarkdown,
          updatedAt: updated.updatedAt,
        })
        .where(eq(projectBrandContexts.projectId, projectId as any));

      await db
        .update(projects)
        .set({
          companyContext: updated.companyContextMarkdown,
          description: updated.companyDescription,
          industry: updated.industry,
          targetAudience: updated.targetAudience,
          productsServices: JSON.stringify(updated.productsServices),
          updatedAt: updated.updatedAt,
        })
        .where(eq(projects.id, projectId as any));
    } catch (err) {
      console.warn("Neon DB update failed for brand context:", err);
    }
  }

  DEV_BRAND_CONTEXTS.set(projectId, updated);
  return updated;
}

function parseJsonSafe<T>(val: any, fallback: T): T {
  if (!val) return fallback;
  if (typeof val === "object") return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

