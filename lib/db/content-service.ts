import { db } from "./index";
import { projects, articles, brandVoice, articleContext } from "./schema";
import { eq, desc } from "drizzle-orm";
import { crawlAndSaveBrandContext } from "./brand-context-service";
import {
  getProjectBrandVoice,
  saveProjectBrandVoice,
  analyzeAndGenerateBrandVoice,
  BrandVoiceData,
} from "./brand-voice-service";

export type { BrandVoiceData };

export interface ProjectWithStats {
  id: string;
  name: string;
  domain: string | null;
  description: string | null;
  companyContext: string | null;
  industry: string | null;
  targetAudience: string | null;
  productsServices: string | null;
  monthlyArticleLimit: number;
  articlesThisMonth: number;
  totalArticles?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ArticleWithContext {
  id: string;
  projectId: string;
  title: string;
  slug: string | null;
  content: string;
  status: "draft" | "in_review" | "published";
  wordCount: number;
  workflowStage?: string | null;
  workflowData?: string | null;
  createdAt: Date;
  updatedAt: Date;
  targetKeywords?: string | null;
  researchBrief?: string | null;
  outline?: string | null;
  sources?: string | null;
  humanReviewNotes?: string | null;
}

// Development memory store with initial seed projects
const DEV_PROJECTS: ProjectWithStats[] = [
  {
    id: "proj-1",
    name: "Stak Core",
    domain: "stak.co.in",
    description: "AI search and editorial research platform",
    companyContext: `# COMPANY.md: Stak
- Product: Stak is a $129/month alternative to Gehirn.md.
- Core Pillars: Multi-agent research, brand voice context, article generation, LLM tracking.
- Target Audience: B2B marketing teams, content leads, founders, agencies.
- Pricing: Single plan at $129/month. 250 articles/month, 20 projects, 100 keywords.`,
    industry: "Developer Tools & Content Infrastructure",
    targetAudience: "Engineering leads, technical founders, and B2B SaaS growth teams.",
    productsServices: "Multi-Agent Article Generation, Live Web Research, LLM Tracking, Brand Interpretation",
    monthlyArticleLimit: 250,
    articlesThisMonth: 3,
    createdAt: new Date("2026-11-01"),
    updatedAt: new Date("2026-11-12"),
  },
  {
    id: "proj-2",
    name: "Infrastructure B2B",
    domain: "infra-scale.dev",
    description: "Database connection pooling and serverless systems",
    companyContext: `# COMPANY.md: InfraScale
- Product: High-performance connection pooler for serverless databases.
- Key Metrics: Sub-millisecond latency, zero connection timeouts, 99.999% uptime.
- Competitors: PgBouncer, Prisma Accelerate.`,
    industry: "Cloud Databases & Developer Infrastructure",
    targetAudience: "Full-stack engineers, backend developers, and DevOps architects.",
    productsServices: "Serverless Postgres Engine, Database Branching, Connection Pooling",
    monthlyArticleLimit: 250,
    articlesThisMonth: 1,
    createdAt: new Date("2026-11-05"),
    updatedAt: new Date("2026-11-10"),
  },
];

const DEV_ARTICLES: ArticleWithContext[] = [
  {
    id: "art-1",
    projectId: "proj-1",
    title: "Why Multi-Agent Research Beats Single-Prompt LLM Writing",
    slug: "why-multi-agent-research-beats-single-prompt-llm-writing",
    content: `## The Limit of Single-Prompt Generation

When you prompt a single language model to write an entire article, it relies exclusively on generalized parametric memory. It fills the space with predictable transitions, generic analogies, and superficial summaries that search engines and human readers immediately recognize as automated filler.

## How Multi-Agent Coordination Works

Instead of asking one model to plan, research, outline, write, and critique in a single pass, Stak splits the workflow into discrete specialized agents:

1. **Intent Analysis Agent:** Analyzes the target keyword and evaluates search results to determine the exact technical depth required.
2. **Competitive Coverage Agent:** Identifies missing angles and common objections that current top-ranking articles fail to address.
3. **Draft Synthesis Agent:** Constructs the prose strictly following the project's TONE.md and COMPANY.md specifications.

## Keeping the Human in the Loop

Before an article is finalized, the workflow pauses for human confirmation. The editor approves the angle, verifies key claims, and requests revisions if necessary. Quality and specificity earn visibility—raw volume does not.`,
    status: "published",
    wordCount: 168,
    workflowStage: "validate",
    workflowData: JSON.stringify({
      research: "Verified multi-agent coordination architecture.",
      structure: "Outlined 3 core sections covering intent, multi-agent dispatch, and human review.",
      validate: "Brand voice match: 98%. Zero banned clichés.",
    }),
    createdAt: new Date("2026-11-10"),
    updatedAt: new Date("2026-11-12"),
    targetKeywords: "multi-agent research, AI content workflow, brand voice",
    researchBrief: "Focus on technical architecture differences between monolithic prompt execution vs multi-stage agent pipelines. Cite latency and hallucination reduction.",
    outline: "1. The Limit of Single-Prompt Generation\n2. How Multi-Agent Coordination Works\n3. Keeping the Human in the Loop",
    sources: "Stak Internal Whitepaper, Gehirn.md architecture review",
    humanReviewNotes: "Approved for publication with focus on editorial voice.",
  },
  {
    id: "art-2",
    projectId: "proj-1",
    title: "Structuring COMPANY.md and TONE.md for Consistent Brand Voice",
    slug: "structuring-company-md-and-tone-md",
    content: `## Grounding AI in Reality

The primary cause of generic marketing content is context deficiency. When a model lacks detailed facts about your product architecture, pricing model, and customer benchmarks, it has no choice but to hallucinate boilerplate praise.

## Defining COMPANY.md

COMPANY.md acts as the persistent knowledge repository for your project:
- Value proposition and positioning
- Pricing structure ($129/month flat)
- Feature scope limitations (250 articles/month, 20 projects, 100 keywords)
- Verified customer metrics

## Enforcing TONE.md

TONE.md governs sentence rhythm and vocabulary constraints. By explicitly prohibiting overused AI clichés such as 'delve', 'revolutionize', and 'testament to', every generated draft reflects the true voice of an independent engineering team.`,
    status: "draft",
    wordCount: 124,
    workflowStage: "humanize",
    workflowData: JSON.stringify({
      research: "Reviewed context specification schemas.",
      humanize: "Filtered out all marketing buzzwords.",
    }),
    createdAt: new Date("2026-11-11"),
    updatedAt: new Date("2026-11-12"),
    targetKeywords: "COMPANY.md, TONE.md, brand voice AI, context files",
    researchBrief: "Explain file formats used by Gehirn and Stak. Show practical examples of banned vocabulary lists.",
    outline: "1. Grounding AI in Reality\n2. Defining COMPANY.md\n3. Enforcing TONE.md",
  },
  {
    id: "art-3",
    projectId: "proj-1",
    title: "Understanding LLM Brand Interpretation and Citation Presence",
    slug: "understanding-llm-brand-interpretation",
    content: `## Beyond Traditional Search Rank Tracking

Language models answer queries directly rather than presenting ten blue links. Brand Interpretation analyzes how major models describe your company when prompted with category problems.

## Measuring Citation Accuracy

When an LLM mentions your product, does it cite the correct pricing? Does it position your architecture accurately? LLM Tracking provides continuous visibility into AI model perception.`,
    status: "in_review",
    wordCount: 65,
    workflowStage: "write",
    createdAt: new Date("2026-11-12"),
    updatedAt: new Date("2026-11-12"),
    targetKeywords: "LLM Tracking, Brand Interpretation, AI citation",
    researchBrief: "Evaluate Perplexity, ChatGPT Search, and Claude category answers for Stak vs alternatives.",
    outline: "1. Beyond Traditional Search\n2. Measuring Citation Accuracy",
  },
  {
    id: "art-4",
    projectId: "proj-2",
    title: "Resolving Postgres Connection Exhaustion in Serverless Edge Functions",
    slug: "resolving-postgres-connection-exhaustion",
    content: `## The Connection Spike Problem

Serverless environments scale instances instantly. When 500 lambda functions spin up in parallel to handle a traffic burst, each attempts to open a direct TCP connection to PostgreSQL, instantly hitting 'max_connections'.

## Connection Pooling Layer

A dedicated pooler maintains a warm set of persistent connections to the database while serving thousands of ephemeral client sessions over HTTP or lightweight pooling protocols.`,
    status: "draft",
    wordCount: 78,
    workflowStage: "draft",
    createdAt: new Date("2026-11-08"),
    updatedAt: new Date("2026-11-10"),
    targetKeywords: "postgres connection pooling, serverless postgres, max_connections",
    researchBrief: "Benchmark connection latency under 1000 concurrent requests.",
    outline: "1. The Connection Spike Problem\n2. Connection Pooling Layer",
  },
];

// Content Service API

export async function getProjects(): Promise<ProjectWithStats[]> {
  if (db) {
    try {
      const dbProjects = await db.select().from(projects).orderBy(desc(projects.createdAt));
      if (dbProjects.length > 0) {
        return dbProjects.map((p) => ({
          ...p,
          domain: p.domain ?? null,
          description: p.description ?? null,
          companyContext: p.companyContext ?? null,
          industry: p.industry ?? null,
          targetAudience: p.targetAudience ?? null,
          productsServices: p.productsServices ?? null,
        }));
      }
    } catch (e) {
      console.warn("DB query failed, using dev store", e);
    }
  }
  return [...DEV_PROJECTS];
}

export async function getProject(id: string): Promise<ProjectWithStats | null> {
  const all = await getProjects();
  return all.find((p) => p.id === id) ?? null;
}

export async function createProject(data: {
  name: string;
  domain?: string;
  description?: string;
  industry?: string;
  targetAudience?: string;
  productsServices?: string;
  companyContext?: string;
}): Promise<{ project: ProjectWithStats | null; error?: string }> {
  const currentProjects = await getProjects();

  // Strict Server-Side Limit: 20 projects maximum
  if (currentProjects.length >= 20) {
    return {
      project: null,
      error: "Maximum limit of 20 projects reached. Plan includes up to 20 projects.",
    };
  }

  const cleanDomain = data.domain?.trim() || "example.com";
  const newProj: ProjectWithStats = {
    id: `proj-${Date.now()}`,
    name: data.name.trim(),
    domain: cleanDomain,
    description: data.description?.trim() || null,
    industry: data.industry?.trim() || "Technology",
    targetAudience: data.targetAudience?.trim() || "Technical buyers",
    productsServices: data.productsServices?.trim() || null,
    companyContext:
      data.companyContext ||
      `# COMPANY.md: ${data.name}\n- Website: ${cleanDomain}\n- Overview: ${data.description || ""}`,
    monthlyArticleLimit: 250,
    articlesThisMonth: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  if (db) {
    try {
      const [inserted] = await db
        .insert(projects)
        .values({
          name: newProj.name,
          domain: newProj.domain,
          description: newProj.description,
          industry: newProj.industry,
          targetAudience: newProj.targetAudience,
          productsServices: newProj.productsServices,
          companyContext: newProj.companyContext,
          monthlyArticleLimit: 250,
          articlesThisMonth: 0,
        })
        .returning();
      if (inserted) {
        newProj.id = inserted.id;
      }
    } catch (e) {
      console.warn("DB insert failed, saved to dev store", e);
    }
  }

  DEV_PROJECTS.unshift(newProj);

  // Automatically trigger Firecrawl crawl & extract brand context
  try {
    const brandContext = await crawlAndSaveBrandContext({
      projectId: newProj.id,
      websiteUrl: cleanDomain,
      companyName: newProj.name,
      companyDescription: data.description,
      industry: data.industry,
      targetAudience: data.targetAudience,
      productsServices: data.productsServices,
    });

    if (brandContext?.companyContextMarkdown) {
      newProj.companyContext = brandContext.companyContextMarkdown;
      newProj.description = brandContext.companyDescription || newProj.description;
      newProj.industry = brandContext.industry || newProj.industry;
      newProj.targetAudience = brandContext.targetAudience || newProj.targetAudience;
      newProj.productsServices = JSON.stringify(brandContext.productsServices);
    }

    // Automatically analyze Brand Voice context using OpenRouter
    await analyzeAndGenerateBrandVoice(newProj.id).catch(() => {});
  } catch (crawlErr) {
    console.warn("Initial website crawl failed during project creation:", crawlErr);
  }

  return { project: newProj };
}

export async function getArticles(
  projectId: string,
  statusFilter?: "draft" | "in_review" | "published" | "all"
): Promise<ArticleWithContext[]> {
  if (db) {
    try {
      let query = db.select().from(articles).where(eq(articles.projectId, projectId as any));
      const dbArticles = await query.orderBy(desc(articles.updatedAt));
      if (dbArticles.length > 0) {
        let list = dbArticles.map((a) => ({
          id: a.id,
          projectId: a.projectId,
          title: a.title,
          slug: a.slug,
          content: a.content,
          status: a.status as "draft" | "in_review" | "published",
          wordCount: a.wordCount,
          workflowStage: a.workflowStage,
          workflowData: a.workflowData,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
        }));
        if (statusFilter && statusFilter !== "all") {
          list = list.filter((a) => a.status === statusFilter);
        }
        return list;
      }
    } catch (e) {
      console.warn("DB article query failed, using dev store", e);
    }
  }

  let list = DEV_ARTICLES.filter((a) => a.projectId === projectId);
  if (statusFilter && statusFilter !== "all") {
    list = list.filter((a) => a.status === statusFilter);
  }
  return [...list].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export async function getArticle(articleId: string): Promise<ArticleWithContext | null> {
  if (db) {
    try {
      const [found] = await db.select().from(articles).where(eq(articles.id, articleId as any));
      if (found) {
        const [ctx] = await db.select().from(articleContext).where(eq(articleContext.articleId, articleId as any));
        return {
          id: found.id,
          projectId: found.projectId,
          title: found.title,
          slug: found.slug,
          content: found.content,
          status: found.status as "draft" | "in_review" | "published",
          wordCount: found.wordCount,
          workflowStage: found.workflowStage,
          workflowData: found.workflowData,
          createdAt: found.createdAt,
          updatedAt: found.updatedAt,
          targetKeywords: ctx?.targetKeywords ?? null,
          researchBrief: ctx?.researchBrief ?? null,
          outline: ctx?.outline ?? null,
          sources: ctx?.sources ?? null,
          humanReviewNotes: ctx?.humanReviewNotes ?? null,
        };
      }
    } catch (e) {
      console.warn("DB query failed, checking dev store", e);
    }
  }

  const found = DEV_ARTICLES.find((a) => a.id === articleId);
  return found ? { ...found } : null;
}

export async function createArticle(data: {
  projectId: string;
  title: string;
  content?: string;
  status?: "draft" | "in_review" | "published";
  targetKeywords?: string;
  researchBrief?: string;
  outline?: string;
  workflowStage?: string | null;
  workflowData?: string | null;
}): Promise<{ article: ArticleWithContext | null; error?: string }> {
  const project = await getProject(data.projectId);
  if (!project) {
    return { article: null, error: "Project not found" };
  }

  // Strict Server-Side Limit: 250 articles per month
  if (project.articlesThisMonth >= project.monthlyArticleLimit) {
    return {
      article: null,
      error: `Monthly limit of ${project.monthlyArticleLimit} articles reached for this project. Limit resets next month.`,
    };
  }

  const content = data.content || "";
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const newArticle: ArticleWithContext = {
    id: `art-${Date.now()}`,
    projectId: data.projectId,
    title: data.title.trim(),
    slug,
    content,
    status: data.status || "draft",
    wordCount,
    workflowStage: data.workflowStage || "validate",
    workflowData: data.workflowData || null,
    createdAt: new Date(),
    updatedAt: new Date(),
    targetKeywords: data.targetKeywords || null,
    researchBrief: data.researchBrief || null,
    outline: data.outline || null,
    sources: null,
    humanReviewNotes: null,
  };

  if (db) {
    try {
      const [inserted] = await db
        .insert(articles)
        .values({
          projectId: data.projectId as any,
          title: newArticle.title,
          slug: newArticle.slug,
          content: newArticle.content,
          status: newArticle.status,
          wordCount: newArticle.wordCount,
          workflowStage: newArticle.workflowStage || "validate",
          workflowData: newArticle.workflowData,
        })
        .returning();
      if (inserted) {
        newArticle.id = inserted.id;

        if (newArticle.targetKeywords || newArticle.researchBrief || newArticle.outline) {
          await db.insert(articleContext).values({
            articleId: inserted.id,
            targetKeywords: newArticle.targetKeywords,
            researchBrief: newArticle.researchBrief,
            outline: newArticle.outline,
          });
        }
      }
    } catch (e) {
      console.warn("DB insert article failed, saving to dev store", e);
    }
  }

  project.articlesThisMonth += 1;
  DEV_ARTICLES.unshift(newArticle);

  return { article: newArticle };
}

export async function updateArticle(
  articleId: string,
  data: Partial<ArticleWithContext>
): Promise<ArticleWithContext | null> {
  const current = await getArticle(articleId);
  if (!current) return null;

  const content = data.content !== undefined ? data.content : current.content;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const updated: ArticleWithContext = {
    ...current,
    ...data,
    wordCount,
    updatedAt: new Date(),
  };

  if (db) {
    try {
      await db
        .update(articles)
        .set({
          title: updated.title,
          content: updated.content,
          status: updated.status,
          wordCount: updated.wordCount,
          workflowStage: updated.workflowStage ?? "validate",
          workflowData: updated.workflowData,
          updatedAt: new Date(),
        })
        .where(eq(articles.id, articleId as any));

      if (
        data.targetKeywords !== undefined ||
        data.researchBrief !== undefined ||
        data.outline !== undefined
      ) {
        const [existingCtx] = await db
          .select()
          .from(articleContext)
          .where(eq(articleContext.articleId, articleId as any));

        if (existingCtx) {
          await db
            .update(articleContext)
            .set({
              targetKeywords: updated.targetKeywords,
              researchBrief: updated.researchBrief,
              outline: updated.outline,
              updatedAt: new Date(),
            })
            .where(eq(articleContext.articleId, articleId as any));
        } else {
          await db.insert(articleContext).values({
            articleId: articleId as any,
            targetKeywords: updated.targetKeywords,
            researchBrief: updated.researchBrief,
            outline: updated.outline,
          });
        }
      }
    } catch (e) {
      console.warn("DB update article failed, updating dev store", e);
    }
  }

  const idx = DEV_ARTICLES.findIndex((a) => a.id === articleId);
  if (idx !== -1) {
    DEV_ARTICLES[idx] = updated;
  } else {
    DEV_ARTICLES.unshift(updated);
  }

  return updated;
}

export async function deleteArticle(articleId: string): Promise<boolean> {
  if (db) {
    try {
      await db.delete(articles).where(eq(articles.id, articleId as any));
    } catch (e) {
      console.warn("DB delete article failed", e);
    }
  }

  const idx = DEV_ARTICLES.findIndex((a) => a.id === articleId);
  if (idx !== -1) {
    DEV_ARTICLES.splice(idx, 1);
  }
  return true;
}

export async function getBrandVoice(projectId: string): Promise<BrandVoiceData | null> {
  return getProjectBrandVoice(projectId);
}

export async function updateBrandVoice(
  projectId: string,
  data: Partial<BrandVoiceData>
): Promise<BrandVoiceData> {
  return saveProjectBrandVoice(projectId, data);
}
