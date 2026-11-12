import { db } from "./index";
import { savedKeywords, keywordResearchRuns, multiAgentResearch } from "./schema";
import { eq, desc, and } from "drizzle-orm";
import { getProject, getArticles } from "./content-service";
import { runKeywordResearch, KeywordResearchOutput } from "../ai/keyword-research";

export interface SavedKeywordData {
  id: string;
  projectId: string;
  keyword: string;
  intent: "informational" | "commercial" | "transactional" | "navigational";
  difficulty: "low" | "medium" | "high";
  opportunityScore: number;
  trend: string;
  topicCluster: string | null;
  notes: string | null;
  sourceQuery: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResearchRunData {
  id: string;
  projectId: string;
  query: string;
  queryType: "topic" | "keyword";
  rawWebResults: string | null;
  analysisResult: KeywordResearchOutput;
  createdAt: Date;
}

// Dev memory store with seed keywords (locked limit: 100 keywords max per project)
const DEV_SAVED_KEYWORDS: SavedKeywordData[] = [
  {
    id: "sk-1",
    projectId: "proj-1",
    keyword: "gehirn alternative",
    intent: "commercial",
    difficulty: "low",
    opportunityScore: 98,
    trend: "+82% breakout",
    topicCluster: "Competitor Comparisons",
    notes: "Primary commercial keyword for Stak positioning.",
    sourceQuery: "gehirn vs stak",
    createdAt: new Date("2026-11-10"),
    updatedAt: new Date("2026-11-10"),
  },
  {
    id: "sk-2",
    projectId: "proj-1",
    keyword: "multi agent content research",
    intent: "informational",
    difficulty: "medium",
    opportunityScore: 94,
    trend: "+64% rising",
    topicCluster: "Research Workflows",
    notes: "High interest among marketing and technical content leads.",
    sourceQuery: "ai search research",
    createdAt: new Date("2026-11-11"),
    updatedAt: new Date("2026-11-11"),
  },
  {
    id: "sk-3",
    projectId: "proj-1",
    keyword: "brand voice context files TONE.md",
    intent: "informational",
    difficulty: "low",
    opportunityScore: 91,
    trend: "+48% rising",
    topicCluster: "Brand Voice",
    notes: "Grounding LLMs in editorial guidelines.",
    sourceQuery: "brand voice AI",
    createdAt: new Date("2026-11-12"),
    updatedAt: new Date("2026-11-12"),
  },
  {
    id: "sk-4",
    projectId: "proj-1",
    keyword: "flat pricing ai content platform",
    intent: "commercial",
    difficulty: "low",
    opportunityScore: 89,
    trend: "+35% steady",
    topicCluster: "Pricing & Plans",
    notes: "Direct contrast to per-seat and token surcharge models.",
    sourceQuery: "ai content pricing",
    createdAt: new Date("2026-11-12"),
    updatedAt: new Date("2026-11-12"),
  },
  {
    id: "sk-5",
    projectId: "proj-2",
    keyword: "postgres serverless connection pooling",
    intent: "commercial",
    difficulty: "medium",
    opportunityScore: 92,
    trend: "+52% rising",
    topicCluster: "Database Scaling",
    notes: "Core category keyword for InfraScale.",
    sourceQuery: "serverless postgres",
    createdAt: new Date("2026-11-08"),
    updatedAt: new Date("2026-11-08"),
  },
];

const DEV_RESEARCH_RUNS: Record<string, ResearchRunData[]> = {};

// 1. Get saved keywords for a project (Locked limit: 100 max)
export async function getSavedKeywords(projectId: string): Promise<SavedKeywordData[]> {
  if (db) {
    try {
      const dbKeywords = await db
        .select()
        .from(savedKeywords)
        .where(eq(savedKeywords.projectId, projectId as any))
        .orderBy(desc(savedKeywords.createdAt));

      if (dbKeywords.length > 0) {
        return dbKeywords.map((k) => ({
          id: k.id,
          projectId: k.projectId,
          keyword: k.keyword,
          intent: k.intent as any,
          difficulty: k.difficulty as any,
          opportunityScore: k.opportunityScore,
          trend: k.trend,
          topicCluster: k.topicCluster,
          notes: k.notes,
          sourceQuery: k.sourceQuery,
          createdAt: k.createdAt,
          updatedAt: k.updatedAt,
        }));
      }
    } catch (e) {
      console.warn("DB saved keywords query failed, using dev store", e);
    }
  }

  return DEV_SAVED_KEYWORDS.filter((k) => k.projectId === projectId);
}

// 2. Save a keyword (Enforcing strict locked limit: 100 keywords max per project)
export async function saveKeyword(
  projectId: string,
  data: {
    keyword: string;
    intent?: "informational" | "commercial" | "transactional" | "navigational";
    difficulty?: "low" | "medium" | "high";
    opportunityScore?: number;
    trend?: string;
    topicCluster?: string;
    notes?: string;
    sourceQuery?: string;
  }
): Promise<{ keyword: SavedKeywordData | null; error?: string }> {
  const currentKeywords = await getSavedKeywords(projectId);

  // Strict Locked Limit: 100 keywords
  if (currentKeywords.length >= 100) {
    return {
      keyword: null,
      error: "Maximum limit of 100 saved keywords reached for this project. Remove older keywords to save new ones.",
    };
  }

  // Check duplicate
  const cleanKeyword = data.keyword.trim().toLowerCase();
  const existing = currentKeywords.find((k) => k.keyword.toLowerCase() === cleanKeyword);
  if (existing) {
    return {
      keyword: existing,
      error: `Keyword "${data.keyword.trim()}" is already saved in this project.`,
    };
  }

  const newSaved: SavedKeywordData = {
    id: `sk-${Date.now()}`,
    projectId,
    keyword: data.keyword.trim(),
    intent: data.intent || "informational",
    difficulty: data.difficulty || "medium",
    opportunityScore: data.opportunityScore ?? 85,
    trend: data.trend || "+35% rising",
    topicCluster: data.topicCluster?.trim() || null,
    notes: data.notes?.trim() || null,
    sourceQuery: data.sourceQuery?.trim() || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  if (db) {
    try {
      const [inserted] = await db
        .insert(savedKeywords)
        .values({
          projectId: projectId as any,
          keyword: newSaved.keyword,
          intent: newSaved.intent,
          difficulty: newSaved.difficulty,
          opportunityScore: newSaved.opportunityScore,
          trend: newSaved.trend,
          topicCluster: newSaved.topicCluster,
          notes: newSaved.notes,
          sourceQuery: newSaved.sourceQuery,
        })
        .returning();

      if (inserted) {
        newSaved.id = inserted.id;
      }
    } catch (e) {
      console.warn("DB insert saved keyword failed, saving to dev store", e);
    }
  }

  DEV_SAVED_KEYWORDS.unshift(newSaved);
  return { keyword: newSaved };
}

// 3. Remove a saved keyword
export async function removeSavedKeyword(
  projectId: string,
  keywordId: string
): Promise<boolean> {
  if (db) {
    try {
      await db
        .delete(savedKeywords)
        .where(
          and(
            eq(savedKeywords.id, keywordId as any),
            eq(savedKeywords.projectId, projectId as any)
          )
        );
    } catch (e) {
      console.warn("DB delete saved keyword failed", e);
    }
  }

  const idx = DEV_SAVED_KEYWORDS.findIndex(
    (k) => k.id === keywordId && k.projectId === projectId
  );
  if (idx !== -1) {
    DEV_SAVED_KEYWORDS.splice(idx, 1);
  }
  return true;
}

// 4. Check if keyword is saved
export async function isKeywordSaved(
  projectId: string,
  keywordText: string
): Promise<boolean> {
  const current = await getSavedKeywords(projectId);
  const clean = keywordText.trim().toLowerCase();
  return current.some((k) => k.keyword.toLowerCase() === clean);
}

// 5. Save research run
export async function recordResearchRun(
  projectId: string,
  query: string,
  queryType: "topic" | "keyword",
  analysisResult: KeywordResearchOutput,
  rawWebResults?: any
): Promise<ResearchRunData> {
  const newRun: ResearchRunData = {
    id: `run-${Date.now()}`,
    projectId,
    query: query.trim(),
    queryType,
    rawWebResults: rawWebResults ? JSON.stringify(rawWebResults) : null,
    analysisResult,
    createdAt: new Date(),
  };

  if (db) {
    try {
      const [inserted] = await db
        .insert(keywordResearchRuns)
        .values({
          projectId: projectId as any,
          query: newRun.query,
          queryType: newRun.queryType,
          rawWebResults: newRun.rawWebResults,
          analysisResult: JSON.stringify(newRun.analysisResult),
        })
        .returning();

      if (inserted) {
        newRun.id = inserted.id;
      }
    } catch (e) {
      console.warn("DB insert research run failed, saving to dev store", e);
    }
  }

  if (!DEV_RESEARCH_RUNS[projectId]) {
    DEV_RESEARCH_RUNS[projectId] = [];
  }
  DEV_RESEARCH_RUNS[projectId].unshift(newRun);

  return newRun;
}

// 6. Get recent research runs for project
export async function getRecentResearchRuns(
  projectId: string,
  limit: number = 10
): Promise<ResearchRunData[]> {
  if (db) {
    try {
      const dbRuns = await db
        .select()
        .from(keywordResearchRuns)
        .where(eq(keywordResearchRuns.projectId, projectId as any))
        .orderBy(desc(keywordResearchRuns.createdAt))
        .limit(limit);

      if (dbRuns.length > 0) {
        return dbRuns.map((r) => ({
          id: r.id,
          projectId: r.projectId,
          query: r.query,
          queryType: r.queryType as any,
          rawWebResults: r.rawWebResults,
          analysisResult: JSON.parse(r.analysisResult),
          createdAt: r.createdAt,
        }));
      }
    } catch (e) {
      console.warn("DB research runs query failed, using dev store", e);
    }
  }

  return (DEV_RESEARCH_RUNS[projectId] || []).slice(0, limit);
}

// 7. Full Keyword Research Execution Orchestrator
export async function executeKeywordResearchOrchestrator({
  projectId,
  query,
  queryType = "topic",
}: {
  projectId: string;
  query: string;
  queryType?: "topic" | "keyword";
}): Promise<KeywordResearchOutput> {
  const project = await getProject(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  const existingArticles = await getArticles(projectId);

  // Execute research pipeline using project context + Firecrawl live search + OpenRouter synthesis
  const result = await runKeywordResearch({
    query,
    queryType,
    project: {
      name: project.name,
      domain: project.domain,
      companyContext: project.companyContext,
    },
    existingArticles: existingArticles.map((a) => ({
      title: a.title,
      targetKeywords: a.targetKeywords,
    })),
  });

  // Record research run in Neon / dev store
  await recordResearchRun(projectId, query, queryType, result, result.webSources);

  return result;
}

// Multi-Agent Research Data Model
export interface MultiAgentResearchData {
  id: string;
  projectId: string;
  topic: string;
  keyword: string | null;
  instructions: string | null;
  status: "running" | "completed" | "failed";
  currentStage: string;
  stagesData: Record<string, string>;
  findings: string | null;
  facts: string[] | null;
  sources: { title: string; url: string; snippet: string }[] | null;
  marketInsights: string | null;
  topicAngles: string[] | null;
  contentIdeas: { title: string; angle: string; takeaway: string }[] | null;
  opportunities: string[] | null;
  synthesizedDossier: string;
  createdAt: Date;
  updatedAt: Date;
}

const DEV_MULTI_AGENT_RESEARCH: MultiAgentResearchData[] = [
  {
    id: "mar-1",
    projectId: "proj-1",
    topic: "Multi-Agent Research vs Monolithic Prompts in Technical Content",
    keyword: "multi agent research workflow",
    instructions: "Focus on factual verification, LLM citation accuracy, and stage separation.",
    status: "completed",
    currentStage: "synthesis",
    stagesData: {
      planner: "Define investigation questions on prompt degradation and verification stages.",
      web: "Firecrawl live crawling found benchmarks showing 3x higher citation frequency for staged research.",
      market: "Engineering leads demand verifiable facts over generic AI adverbs.",
      competitor: "Legacy tools hide multi-stage research behind expensive custom enterprise plans.",
      brainstorm: "Thesis: Monolithic prompts hallucinate because planner, crawler, and writer roles collide.",
      synthesis: "Comprehensive dossier detailing stage-by-stage verification.",
    },
    findings: "Multi-agent research workflows prevent context pollution by isolating planning, live web search, competitive gap analysis, and synthesis into dedicated agent steps.",
    facts: [
      "Separating web crawling from writing reduces factual hallucination rates by up to 68%.",
      "Over 74% of technical B2B buyers ignore generic content that lacks reproducible benchmark data.",
      "Stak's $129/mo flat model provides complete multi-agent research without token surcharges.",
    ],
    sources: [
      {
        title: "Scaling Technical Content with Multi-Agent Architectures",
        url: "https://techtarget.com/insights/multi-agent-research",
        snippet: "Analysis of staged prompt chains vs single mega-prompts in enterprise content pipelines.",
      },
      {
        title: "LLM Benchmark: Factuality in Multi-Stage Workflows",
        url: "https://arxiv.org/abs/2401.08291",
        snippet: "Empirical study showing significant accuracy improvements when research and synthesis agents are decoupled.",
      },
    ],
    marketInsights: "Demand for declarative, fact-grounded content is accelerating as searchers use LLMs directly to evaluate products.",
    topicAngles: [
      "The Architecture of Multi-Agent Research: Why Single-Prompt AI Generates Fluff",
      "How to Build a Research Vault Grounded in Primary Documentation",
      "Why We Killed Per-Seat Pricing for AI Research Tools",
    ],
    contentIdeas: [
      {
        title: "The Architecture of Multi-Agent Content Research",
        angle: "First-principles engineering breakdown of stage separation.",
        takeaway: "Demonstrates authoritative category expertise while positioning Stak.",
      },
    ],
    opportunities: [
      "Directly attach this dossier into Stak's Content editor as the research brief.",
      "Publish comparison content exposing the flaws of single-prompt AI tools.",
    ],
    synthesizedDossier: `# Research Dossier: Multi-Agent Research vs Monolithic Prompts

## 1. Executive Summary
Technical decision-makers are rejecting generic AI-generated articles. Multi-agent research decouples planning, live web search, competitor analysis, and synthesis into discrete stages, resulting in dramatically higher factual accuracy.

## 2. Key Findings
- **Role Isolation**: When one prompt is asked to plan, search, filter, and write simultaneously, context limits cause hallucination and generic filler.
- **Primary Source Grounding**: Using Firecrawl to scrape actual live documentation ensures every claim is backed by a verified URL.

## 3. Important Facts & Metrics
- 68% reduction in factual errors when web research runs in a decoupled agent stage.
- 74% of buyers actively seek technical teardowns over marketing fluff.

## 4. Top Topic Angles for Content Workflow
1. The Architecture of Multi-Agent Content Research
2. Why Single-Prompt AI Fails Technical Readers
3. Declarative Fact Grounding with COMPANY.md Context

## 5. Next Steps for Content
- Use this research brief directly in the Article Generation Workflow.`,
    createdAt: new Date("2026-11-12"),
    updatedAt: new Date("2026-11-12"),
  },
];

// Fetch multi-agent research runs for a project
export async function getMultiAgentResearchList(
  projectId: string
): Promise<MultiAgentResearchData[]> {
  if (db) {
    try {
      const dbList = await db
        .select()
        .from(multiAgentResearch)
        .where(eq(multiAgentResearch.projectId, projectId as any))
        .orderBy(desc(multiAgentResearch.createdAt));

      if (dbList.length > 0) {
        return dbList.map((r) => ({
          id: r.id,
          projectId: r.projectId,
          topic: r.topic,
          keyword: r.keyword,
          instructions: r.instructions,
          status: r.status as any,
          currentStage: r.currentStage,
          stagesData: JSON.parse(r.stagesData || "{}"),
          findings: r.findings,
          facts: r.facts ? JSON.parse(r.facts) : null,
          sources: r.sources ? JSON.parse(r.sources) : null,
          marketInsights: r.marketInsights,
          topicAngles: r.topicAngles ? JSON.parse(r.topicAngles) : null,
          contentIdeas: r.contentIdeas ? JSON.parse(r.contentIdeas) : null,
          opportunities: r.opportunities ? JSON.parse(r.opportunities) : null,
          synthesizedDossier: r.synthesizedDossier,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        }));
      }
    } catch (e) {
      console.warn("DB multi-agent research list query failed, using dev store", e);
    }
  }

  return DEV_MULTI_AGENT_RESEARCH.filter((r) => r.projectId === projectId);
}

// Fetch single multi-agent research run
export async function getMultiAgentResearch(
  id: string
): Promise<MultiAgentResearchData | null> {
  if (db) {
    try {
      const [r] = await db
        .select()
        .from(multiAgentResearch)
        .where(eq(multiAgentResearch.id, id as any));

      if (r) {
        return {
          id: r.id,
          projectId: r.projectId,
          topic: r.topic,
          keyword: r.keyword,
          instructions: r.instructions,
          status: r.status as any,
          currentStage: r.currentStage,
          stagesData: JSON.parse(r.stagesData || "{}"),
          findings: r.findings,
          facts: r.facts ? JSON.parse(r.facts) : null,
          sources: r.sources ? JSON.parse(r.sources) : null,
          marketInsights: r.marketInsights,
          topicAngles: r.topicAngles ? JSON.parse(r.topicAngles) : null,
          contentIdeas: r.contentIdeas ? JSON.parse(r.contentIdeas) : null,
          opportunities: r.opportunities ? JSON.parse(r.opportunities) : null,
          synthesizedDossier: r.synthesizedDossier,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        };
      }
    } catch (e) {
      console.warn("DB multi-agent research query failed, checking dev store", e);
    }
  }

  return DEV_MULTI_AGENT_RESEARCH.find((r) => r.id === id) || null;
}

// Save or update multi-agent research
export async function saveMultiAgentResearch(
  data: {
    id?: string;
    projectId: string;
    topic: string;
    keyword?: string | null;
    instructions?: string | null;
    status?: "running" | "completed" | "failed";
    currentStage?: string;
    stagesData: Record<string, string>;
    findings?: string | null;
    facts?: string[] | null;
    sources?: { title: string; url: string; snippet: string }[] | null;
    marketInsights?: string | null;
    topicAngles?: string[] | null;
    contentIdeas?: { title: string; angle: string; takeaway: string }[] | null;
    opportunities?: string[] | null;
    synthesizedDossier: string;
  }
): Promise<MultiAgentResearchData> {
  const newResearch: MultiAgentResearchData = {
    id: data.id || `mar-${Date.now()}`,
    projectId: data.projectId,
    topic: data.topic.trim(),
    keyword: data.keyword?.trim() || null,
    instructions: data.instructions?.trim() || null,
    status: data.status || "completed",
    currentStage: data.currentStage || "synthesis",
    stagesData: data.stagesData,
    findings: data.findings || null,
    facts: data.facts || null,
    sources: data.sources || null,
    marketInsights: data.marketInsights || null,
    topicAngles: data.topicAngles || null,
    contentIdeas: data.contentIdeas || null,
    opportunities: data.opportunities || null,
    synthesizedDossier: data.synthesizedDossier,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  if (db) {
    try {
      const [inserted] = await db
        .insert(multiAgentResearch)
        .values({
          projectId: data.projectId as any,
          topic: newResearch.topic,
          keyword: newResearch.keyword,
          instructions: newResearch.instructions,
          status: newResearch.status,
          currentStage: newResearch.currentStage,
          stagesData: JSON.stringify(newResearch.stagesData),
          findings: newResearch.findings,
          facts: newResearch.facts ? JSON.stringify(newResearch.facts) : null,
          sources: newResearch.sources ? JSON.stringify(newResearch.sources) : null,
          marketInsights: newResearch.marketInsights,
          topicAngles: newResearch.topicAngles ? JSON.stringify(newResearch.topicAngles) : null,
          contentIdeas: newResearch.contentIdeas ? JSON.stringify(newResearch.contentIdeas) : null,
          opportunities: newResearch.opportunities ? JSON.stringify(newResearch.opportunities) : null,
          synthesizedDossier: newResearch.synthesizedDossier,
        })
        .returning();

      if (inserted) {
        newResearch.id = inserted.id;
      }
    } catch (e) {
      console.warn("DB insert multi-agent research failed, saving to dev store", e);
    }
  }

  const existingIdx = DEV_MULTI_AGENT_RESEARCH.findIndex((r) => r.id === newResearch.id);
  if (existingIdx !== -1) {
    DEV_MULTI_AGENT_RESEARCH[existingIdx] = newResearch;
  } else {
    DEV_MULTI_AGENT_RESEARCH.unshift(newResearch);
  }

  return newResearch;
}

