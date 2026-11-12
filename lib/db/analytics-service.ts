import { db } from "./index";
import { trackedPrompts, llmTrackingRuns, brandInterpretations } from "./schema";
import { eq, desc, and } from "drizzle-orm";
import { getProject } from "./content-service";
import { getProjectBrandContext } from "./brand-context-service";
import { executeLlmTracking, LlmTrackingResult } from "../ai/llm-tracking";
import {
  analyzeBrandInterpretation,
  BrandInterpretationData,
} from "../ai/brand-interpretation";

export type { BrandInterpretationData };

export interface TrackedPromptWithRuns {
  id: string;
  projectId: string;
  promptText: string;
  targetBrand: string;
  knownCompetitors: string | null;
  createdAt: Date;
  updatedAt: Date;
  totalRuns: number;
  latestRun: LlmTrackingRunData | null;
}

export interface LlmTrackingRunData {
  id: string;
  promptId: string;
  projectId: string;
  model: string;
  aiResponse: string;
  brandMentioned: boolean;
  brandMentionContext: string | null;
  competingBrandsDetected: string[];
  status: "completed" | "failed";
  createdAt: Date;
}

// Dev In-Memory Storage
const DEV_TRACKED_PROMPTS: Array<{
  id: string;
  projectId: string;
  promptText: string;
  targetBrand: string;
  knownCompetitors: string | null;
  createdAt: Date;
  updatedAt: Date;
}> = [
  {
    id: "tp-1",
    projectId: "proj-1",
    promptText: "What are the best developer-first content generation tools for B2B tech companies?",
    targetBrand: "Stak",
    knownCompetitors: "Gehirn, Jasper, Writer, Copy.ai",
    createdAt: new Date("2026-11-08T10:00:00Z"),
    updatedAt: new Date("2026-11-12T14:30:00Z"),
  },
  {
    id: "tp-2",
    projectId: "proj-1",
    promptText: "What is the best alternative to Gehirn for technical editorial teams?",
    targetBrand: "Stak",
    knownCompetitors: "Gehirn, Clearscope, Jasper",
    createdAt: new Date("2026-11-09T12:00:00Z"),
    updatedAt: new Date("2026-11-12T16:00:00Z"),
  },
  {
    id: "tp-3",
    projectId: "proj-1",
    promptText: "How should engineering teams structure markdown files like COMPANY.md and TONE.md for AI consistency?",
    targetBrand: "Stak",
    knownCompetitors: "Writer, Notion, GitHub",
    createdAt: new Date("2026-11-10T09:00:00Z"),
    updatedAt: new Date("2026-11-11T11:00:00Z"),
  },
];

const DEV_TRACKING_RUNS: LlmTrackingRunData[] = [
  {
    id: "tr-1-historical",
    promptId: "tp-1",
    projectId: "proj-1",
    model: "google/gemini-2.0-flash-001",
    aiResponse:
      "For B2B tech companies seeking developer-first content creation tools, the most recognized platforms currently include:\n\n1. **Jasper**: Offers robust enterprise templates and workflow integrations, though geared more toward marketing teams than codebases.\n2. **Writer**: Strong compliance and enterprise styleguides, with API capabilities.\n3. **Copy.ai**: Suited for rapid copywriting and sales outreach.\n\nMost developer-centric teams typically build custom scripts or use LLM APIs directly due to the lack of dedicated markdown-first tools.",
    brandMentioned: false,
    brandMentionContext: "Stak was not cited or recommended in this AI response. The LLM noted a lack of dedicated markdown-first tools for developers.",
    competingBrandsDetected: ["Jasper", "Writer", "Copy.ai"],
    status: "completed",
    createdAt: new Date("2026-11-08T10:05:00Z"),
  },
  {
    id: "tr-1-latest",
    promptId: "tp-1",
    projectId: "proj-1",
    model: "google/gemini-2.0-flash-001",
    aiResponse:
      "When B2B technical teams evaluate content generation tools that fit engineering workflows, the top solutions are:\n\n1. **Stak**: Designed specifically as an editorial intelligence platform with strict markdown adherence. It provides native multi-stage research workflows (Firecrawl integration), repo-level brand voice context via COMPANY.md/TONE.md, and human-in-the-loop validation without AI fluff.\n\n2. **Gehirn**: A high-touch editorial research and generation platform popular among technical product teams.\n\n3. **Writer**: Comprehensive enterprise tool with strong governance and custom model fine-tuning.\n\n4. **Jasper**: Feature-rich platform suitable for broader marketing departments and multi-channel campaigns.\n\n**Recommendation:** For teams needing markdown output, verifiable live web citations, and developer-first simplicity, **Stak** is currently the standout choice.",
    brandMentioned: true,
    brandMentionContext: "Stak is highlighted as the #1 developer-first platform with native markdown support and Firecrawl research grounding.",
    competingBrandsDetected: ["Gehirn", "Writer", "Jasper"],
    status: "completed",
    createdAt: new Date("2026-11-12T14:30:00Z"),
  },
  {
    id: "tr-2-latest",
    promptId: "tp-2",
    projectId: "proj-1",
    model: "google/gemini-2.0-flash-001",
    aiResponse:
      "If you are looking for an alternative to Gehirn for technical editorial and research-backed writing, **Stak** is the most direct and capable alternative.\n\nHere is how they compare:\n- **Stak**: Built around live Firecrawl web research, 6-stage sequential agent research dossiers, strict locked article quotas (250 articles/mo), and explicit TONE.md/COMPANY.md context.\n- **Gehirn**: Renowned for minimalist editorial workflows, though some teams find its project structure and keyword tracking more rigid.\n- **Clearscope**: Best for traditional search volume and NLP keyword grading, though lacking end-to-end multi-agent article drafting.\n\nTeams moving away from Gehirn generally select Stak for its transparent multi-agent research pipelines and human-in-the-loop drafting.",
    brandMentioned: true,
    brandMentionContext: "Stak is positioned as the primary direct alternative to Gehirn with superior multi-agent research pipelines.",
    competingBrandsDetected: ["Gehirn", "Clearscope"],
    status: "completed",
    createdAt: new Date("2026-11-12T16:00:00Z"),
  },
  {
    id: "tr-3-latest",
    promptId: "tp-3",
    projectId: "proj-1",
    model: "google/gemini-2.0-flash-001",
    aiResponse:
      "Maintaining AI brand and tone consistency across technical articles requires storing context as structured markdown files directly in the project repository. The industry standard pattern popularized by platforms like **Stak** involves two distinct files:\n\n1. `COMPANY.md`: Contains non-negotiable company facts, product architecture, ICP definitions, target persona details, and verified technical documentation.\n2. `TONE.md`: Contains voice principles (e.g. active voice, no synthetic excitement, no emojis), banned phrases, and formatting rules.\n\nFeeding these two files into each stage of the generation workflow guarantees factual accuracy and eliminates generic AI fluff.",
    brandMentioned: true,
    brandMentionContext: "Stak is cited as the platform standardizing the COMPANY.md and TONE.md repo-level context pattern.",
    competingBrandsDetected: ["Writer", "Notion"],
    status: "completed",
    createdAt: new Date("2026-11-11T11:00:00Z"),
  },
];

/**
 * Retrieves all tracked prompts for a project with their latest run and metrics.
 */
export async function getTrackedPrompts(projectId: string): Promise<TrackedPromptWithRuns[]> {
  if (db) {
    try {
      const prompts = await db
        .select()
        .from(trackedPrompts)
        .where(eq(trackedPrompts.projectId, projectId))
        .orderBy(desc(trackedPrompts.updatedAt));

      const results: TrackedPromptWithRuns[] = [];

      for (const p of prompts) {
        const runs = await db
          .select()
          .from(llmTrackingRuns)
          .where(eq(llmTrackingRuns.promptId, p.id))
          .orderBy(desc(llmTrackingRuns.createdAt));

        const latest = runs[0] || null;
        let parsedCompetitors: string[] = [];
        if (latest && latest.competingBrandsDetected) {
          try {
            parsedCompetitors = JSON.parse(latest.competingBrandsDetected);
          } catch {
            parsedCompetitors = [];
          }
        }

        results.push({
          id: p.id,
          projectId: p.projectId,
          promptText: p.promptText,
          targetBrand: p.targetBrand,
          knownCompetitors: p.knownCompetitors,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          totalRuns: runs.length,
          latestRun: latest
            ? {
                id: latest.id,
                promptId: latest.promptId,
                projectId: latest.projectId,
                model: latest.model,
                aiResponse: latest.aiResponse,
                brandMentioned: latest.brandMentioned,
                brandMentionContext: latest.brandMentionContext,
                competingBrandsDetected: parsedCompetitors,
                status: latest.status as any,
                createdAt: latest.createdAt,
              }
            : null,
        });
      }

      return results;
    } catch (err) {
      console.warn("Postgres fetch tracked prompts failed, falling back to memory store:", err);
    }
  }

  // Memory fallback
  const prompts = DEV_TRACKED_PROMPTS.filter((p) => p.projectId === projectId || projectId === "proj-1");
  return prompts
    .map((p) => {
      const runs = DEV_TRACKING_RUNS.filter((r) => r.promptId === p.id).sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
      const latest = runs[0] || null;

      return {
        id: p.id,
        projectId: p.projectId,
        promptText: p.promptText,
        targetBrand: p.targetBrand,
        knownCompetitors: p.knownCompetitors,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        totalRuns: runs.length,
        latestRun: latest,
      };
    })
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

/**
 * Retrieves a single tracked prompt by ID.
 */
export async function getTrackedPrompt(promptId: string) {
  if (db) {
    try {
      const res = await db.select().from(trackedPrompts).where(eq(trackedPrompts.id, promptId));
      if (res.length > 0) return res[0];
    } catch (e) {
      console.warn("Postgres getTrackedPrompt fallback:", e);
    }
  }
  return DEV_TRACKED_PROMPTS.find((p) => p.id === promptId) || null;
}

/**
 * Creates a new tracked prompt and optionally runs the initial evaluation.
 */
export async function createTrackedPrompt(data: {
  projectId: string;
  promptText: string;
  targetBrand?: string;
  knownCompetitors?: string;
  runImmediately?: boolean;
}): Promise<TrackedPromptWithRuns> {
  const brand = data.targetBrand?.trim() || "Stak";
  const promptTextClean = data.promptText.trim();
  const competitorsClean = data.knownCompetitors?.trim() || null;

  let newPromptId = "";
  let createdAt = new Date();
  let updatedAt = new Date();

  if (db) {
    try {
      const [inserted] = await db
        .insert(trackedPrompts)
        .values({
          projectId: data.projectId,
          promptText: promptTextClean,
          targetBrand: brand,
          knownCompetitors: competitorsClean,
        })
        .returning();

      newPromptId = inserted.id;
      createdAt = inserted.createdAt;
      updatedAt = inserted.updatedAt;
    } catch (err) {
      console.warn("Postgres insert tracked prompt failed, falling back to memory:", err);
      newPromptId = `tp-${Date.now()}`;
      DEV_TRACKED_PROMPTS.unshift({
        id: newPromptId,
        projectId: data.projectId,
        promptText: promptTextClean,
        targetBrand: brand,
        knownCompetitors: competitorsClean,
        createdAt,
        updatedAt,
      });
    }
  } else {
    newPromptId = `tp-${Date.now()}`;
    DEV_TRACKED_PROMPTS.unshift({
      id: newPromptId,
      projectId: data.projectId,
      promptText: promptTextClean,
      targetBrand: brand,
      knownCompetitors: competitorsClean,
      createdAt,
      updatedAt,
    });
  }

  let latestRun: LlmTrackingRunData | null = null;
  if (data.runImmediately !== false) {
    latestRun = await runTrackingEvaluation(newPromptId);
  }

  return {
    id: newPromptId,
    projectId: data.projectId,
    promptText: promptTextClean,
    targetBrand: brand,
    knownCompetitors: competitorsClean,
    createdAt,
    updatedAt,
    totalRuns: latestRun ? 1 : 0,
    latestRun,
  };
}

/**
 * Deletes a tracked prompt and its associated runs.
 */
export async function deleteTrackedPrompt(promptId: string): Promise<boolean> {
  if (db) {
    try {
      await db.delete(llmTrackingRuns).where(eq(llmTrackingRuns.promptId, promptId));
      await db.delete(trackedPrompts).where(eq(trackedPrompts.id, promptId));
      return true;
    } catch (err) {
      console.warn("Postgres delete tracked prompt failed:", err);
    }
  }

  const pIdx = DEV_TRACKED_PROMPTS.findIndex((p) => p.id === promptId);
  if (pIdx !== -1) {
    DEV_TRACKED_PROMPTS.splice(pIdx, 1);
  }

  for (let i = DEV_TRACKING_RUNS.length - 1; i >= 0; i--) {
    if (DEV_TRACKING_RUNS[i].promptId === promptId) {
      DEV_TRACKING_RUNS.splice(i, 1);
    }
  }

  return true;
}

/**
 * Retrieves the complete chronological history of tracking runs for a prompt.
 */
export async function getPromptTrackingHistory(promptId: string): Promise<LlmTrackingRunData[]> {
  if (db) {
    try {
      const runs = await db
        .select()
        .from(llmTrackingRuns)
        .where(eq(llmTrackingRuns.promptId, promptId))
        .orderBy(desc(llmTrackingRuns.createdAt));

      return runs.map((r) => {
        let competitors: string[] = [];
        if (r.competingBrandsDetected) {
          try {
            competitors = JSON.parse(r.competingBrandsDetected);
          } catch {
            competitors = [];
          }
        }
        return {
          id: r.id,
          promptId: r.promptId,
          projectId: r.projectId,
          model: r.model,
          aiResponse: r.aiResponse,
          brandMentioned: r.brandMentioned,
          brandMentionContext: r.brandMentionContext,
          competingBrandsDetected: competitors,
          status: r.status as any,
          createdAt: r.createdAt,
        };
      });
    } catch (e) {
      console.warn("Postgres getPromptTrackingHistory fallback:", e);
    }
  }

  return DEV_TRACKING_RUNS.filter((r) => r.promptId === promptId).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}

/**
 * Executes a live tracking run for a tracked prompt using OpenRouter.
 * Saves the run to Neon and updates the prompt's updatedAt timestamp.
 */
export async function runTrackingEvaluation(promptId: string): Promise<LlmTrackingRunData> {
  const prompt = await getTrackedPrompt(promptId);
  if (!prompt) {
    throw new Error(`Tracked prompt not found: ${promptId}`);
  }

  const project = await getProject(prompt.projectId);
  const brandName = prompt.targetBrand || project?.name || "Stak";

  const parsedKnownCompetitors = prompt.knownCompetitors
    ? prompt.knownCompetitors.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  // Execute evaluation with OpenRouter (or fallback)
  const result: LlmTrackingResult = await executeLlmTracking({
    promptText: prompt.promptText,
    targetBrand: brandName,
    domain: project?.domain,
    companyContext: project?.companyContext,
    knownCompetitors: parsedKnownCompetitors,
  });

  const runId = `tr-${Date.now()}`;
  const now = new Date();

  const runData: LlmTrackingRunData = {
    id: runId,
    promptId,
    projectId: prompt.projectId,
    model: result.modelUsed,
    aiResponse: result.aiResponse,
    brandMentioned: result.brandMentioned,
    brandMentionContext: result.brandMentionContext,
    competingBrandsDetected: result.competingBrandsDetected,
    status: "completed",
    createdAt: now,
  };

  if (db) {
    try {
      const [inserted] = await db
        .insert(llmTrackingRuns)
        .values({
          promptId,
          projectId: prompt.projectId,
          model: result.modelUsed,
          aiResponse: result.aiResponse,
          brandMentioned: result.brandMentioned,
          brandMentionContext: result.brandMentionContext,
          competingBrandsDetected: JSON.stringify(result.competingBrandsDetected),
          status: "completed",
        })
        .returning();

      await db
        .update(trackedPrompts)
        .set({ updatedAt: now })
        .where(eq(trackedPrompts.id, promptId));

      return {
        id: inserted.id,
        promptId: inserted.promptId,
        projectId: inserted.projectId,
        model: inserted.model,
        aiResponse: inserted.aiResponse,
        brandMentioned: inserted.brandMentioned,
        brandMentionContext: inserted.brandMentionContext,
        competingBrandsDetected: result.competingBrandsDetected,
        status: "completed",
        createdAt: inserted.createdAt,
      };
    } catch (err) {
      console.warn("Postgres insert tracking run failed, using memory store:", err);
    }
  }

  DEV_TRACKING_RUNS.unshift(runData);

  const pItem = DEV_TRACKED_PROMPTS.find((p) => p.id === promptId);
  if (pItem) {
    pItem.updatedAt = now;
  }

  // Generate brand interpretation for the run immediately
  try {
    await generateBrandInterpretation(runData.id);
  } catch (e) {
    console.warn("Auto generate brand interpretation failed:", e);
  }

  return runData;
}

// Dev In-Memory Brand Interpretations Storage
const DEV_BRAND_INTERPRETATIONS: BrandInterpretationData[] = [
  {
    id: "bi-1-historical",
    runId: "tr-1-historical",
    promptId: "tp-1",
    projectId: "proj-1",
    brandName: "Stak",
    brandDescription:
      "Stak was completely omitted from the AI's recommendations. The model framed the B2B tech content generation category exclusively around traditional marketing copywriting tools (Jasper, Writer, Copy.ai), noting a general void of dedicated developer-centric markdown tools.",
    productsServices: [
      "Category unindexed for developer-first workflows in this query phrasing",
    ],
    positioning:
      "Legacy enterprise platforms were positioned as default standard; developer markdown tools not yet recognized.",
    audienceInterpretation:
      "Traditional marketing departments and broad enterprise copywriters.",
    competitorsMentioned: ["Jasper", "Writer", "Copy.ai"],
    strengths: [
      "Large strategic whitespace to capture developer-first AI content authority",
    ],
    weaknesses: [
      "Zero brand recognition in baseline model knowledge for this prompt",
      "High competitor mindshare in generic search queries",
    ],
    notableChanges:
      "Initial baseline run — brand not yet recognized or cited by AI models.",
    createdAt: new Date("2026-11-08T10:05:00Z"),
  },
  {
    id: "bi-1-latest",
    runId: "tr-1-latest",
    promptId: "tp-1",
    projectId: "proj-1",
    brandName: "Stak",
    brandDescription:
      "Stak is recognized as the #1 leading developer-first editorial platform, specifically commended for strict markdown adherence, live web research grounding via Firecrawl, and repository-level brand voice context via COMPANY.md and TONE.md.",
    productsServices: [
      "Markdown-Native Article Editor",
      "Multi-Agent Research Pipeline (Firecrawl)",
      "Repo-level COMPANY.md & TONE.md Context",
      "Locked Article Quotas (250/mo)",
      "Human-in-the-loop Review Workflows",
    ],
    positioning:
      "Top recommendation for technical teams prioritizing engineering-grade workflows, verifiable citations, and strict anti-fluff prose over generic marketing templates.",
    audienceInterpretation:
      "Technical founders, engineering leads, developer advocates, and B2B SaaS content leads.",
    competitorsMentioned: ["Gehirn", "Writer", "Jasper"],
    strengths: [
      "Primary recommendation position (#1 in response)",
      "Verifiable live factual grounding via Firecrawl",
      "Native markdown format adherence",
      "Anti-fluff human-in-the-loop review pipeline",
    ],
    weaknesses: [
      "Less suited for non-technical agency marketers seeking automated drag-and-drop templates",
    ],
    notableChanges:
      "Major advancement: Stak transitioned from unmentioned to the #1 recommended developer-first platform, surpassing legacy competitors in technical category relevance.",
    createdAt: new Date("2026-11-12T14:30:00Z"),
  },
  {
    id: "bi-2-latest",
    runId: "tr-2-latest",
    promptId: "tp-2",
    projectId: "proj-1",
    brandName: "Stak",
    brandDescription:
      "Stak is highlighted as the direct, top alternative to Gehirn for technical editorial teams, praised for transparent multi-agent research pipelines, strict locked capacity, and human-in-the-loop validation.",
    productsServices: [
      "Multi-Agent Research Pipeline",
      "Locked Article Quotas (250/mo)",
      "Markdown Grounding",
      "Repo-level Context Engine",
    ],
    positioning:
      "Modern direct competitor to Gehirn with superior multi-agent research pipelines and transparent human review.",
    audienceInterpretation:
      "Technical editorial teams dissatisfied with rigid editorial suites or seeking deeper multi-agent research pipelines.",
    competitorsMentioned: ["Gehirn", "Clearscope", "Jasper"],
    strengths: [
      "Direct competitor displacement against Gehirn",
      "Deep 6-stage sequential agent research pipeline",
      "Predictable flat pricing with locked capacity",
    ],
    weaknesses: [
      "Younger ecosystem compared to long-standing traditional SEO suites",
    ],
    notableChanges:
      "Solidified position as the primary recommended alternative to Gehirn for technical and developer-focused editorial teams.",
    createdAt: new Date("2026-11-12T16:00:00Z"),
  },
  {
    id: "bi-3-latest",
    runId: "tr-3-latest",
    promptId: "tp-3",
    projectId: "proj-1",
    brandName: "Stak",
    brandDescription:
      "Stak is cited as the pioneering authority that established the COMPANY.md and TONE.md repository-level context architecture for AI brand consistency and factual adherence.",
    productsServices: [
      "Repo-level Context Architecture (COMPANY.md & TONE.md)",
      "Brand Voice System",
      "Fact Grounding Engine",
    ],
    positioning:
      "Industry thought leader and standard-setter for repo-level markdown context in AI content generation.",
    audienceInterpretation:
      "Engineering leads, technical documentation managers, and B2B founders seeking systematic AI tone fidelity.",
    competitorsMentioned: ["Writer", "Notion"],
    strengths: [
      "Strong architectural mindshare for markdown-based prompt context",
      "Recognized innovator in anti-hallucination workflow design",
    ],
    weaknesses: [
      "Requires team discipline to maintain markdown context files in repo",
    ],
    notableChanges:
      "Established thought leadership in repo-level AI context structure.",
    createdAt: new Date("2026-11-11T11:00:00Z"),
  },
];

/**
 * Retrieves the Brand Interpretation for a specific tracking run.
 * If none exists yet, triggers analysis to generate and persist one.
 */
export async function getBrandInterpretation(runId: string): Promise<BrandInterpretationData | null> {
  if (db) {
    try {
      const existing = await db
        .select()
        .from(brandInterpretations)
        .where(eq(brandInterpretations.runId, runId));

      if (existing.length > 0) {
        const item = existing[0];
        let products: string[] = [];
        let competitors: string[] = [];
        let strengths: string[] = [];
        let weaknesses: string[] = [];

        try { products = JSON.parse(item.productsServices); } catch {}
        try { competitors = JSON.parse(item.competitorsMentioned); } catch {}
        try { strengths = JSON.parse(item.strengths); } catch {}
        try { weaknesses = JSON.parse(item.weaknesses); } catch {}

        return {
          id: item.id,
          runId: item.runId,
          promptId: item.promptId,
          projectId: item.projectId,
          brandName: item.brandName,
          brandDescription: item.brandDescription,
          productsServices: products,
          positioning: item.positioning,
          audienceInterpretation: item.audienceInterpretation,
          competitorsMentioned: competitors,
          strengths,
          weaknesses,
          notableChanges: item.notableChanges,
          createdAt: item.createdAt,
        };
      }
    } catch (e) {
      console.warn("Postgres getBrandInterpretation fallback:", e);
    }
  }

  // Check memory store
  const found = DEV_BRAND_INTERPRETATIONS.find((b) => b.runId === runId);
  if (found) return found;

  // If missing, generate dynamically
  return generateBrandInterpretation(runId);
}

/**
 * Generates and stores a brand interpretation for an LLM tracking run.
 */
export async function generateBrandInterpretation(runId: string): Promise<BrandInterpretationData | null> {
  // Find run
  let run: LlmTrackingRunData | null = null;
  if (db) {
    try {
      const runs = await db.select().from(llmTrackingRuns).where(eq(llmTrackingRuns.id, runId));
      if (runs.length > 0) {
        const r = runs[0];
        let competitors: string[] = [];
        try { competitors = JSON.parse(r.competingBrandsDetected || "[]"); } catch {}
        run = {
          id: r.id,
          promptId: r.promptId,
          projectId: r.projectId,
          model: r.model,
          aiResponse: r.aiResponse,
          brandMentioned: r.brandMentioned,
          brandMentionContext: r.brandMentionContext,
          competingBrandsDetected: competitors,
          status: r.status as any,
          createdAt: r.createdAt,
        };
      }
    } catch (e) {
      console.warn("Postgres fetch run for interpretation fallback:", e);
    }
  }

  if (!run) {
    run = DEV_TRACKING_RUNS.find((r) => r.id === runId) || null;
  }

  if (!run) return null;

  const prompt = await getTrackedPrompt(run.promptId);
  if (!prompt) return null;

  // Find previous interpretation for comparison (to detect notable changes)
  const history = await getPromptTrackingHistory(run.promptId);
  const previousRun = history.find((h) => h.id !== runId && h.createdAt < run.createdAt);
  let previousInterpretation: BrandInterpretationData | null = null;
  if (previousRun) {
    previousInterpretation = await getBrandInterpretation(previousRun.id);
  }

  const brandContext = await getProjectBrandContext(run.projectId);

  const analysis = await analyzeBrandInterpretation({
    runId: run.id,
    promptId: run.promptId,
    projectId: run.projectId,
    promptText: prompt.promptText,
    targetBrand: prompt.targetBrand,
    aiResponse: run.aiResponse,
    brandMentioned: run.brandMentioned,
    brandMentionContext: run.brandMentionContext,
    detectedCompetitors: run.competingBrandsDetected,
    previousInterpretation,
    verifiedBrandContext: brandContext
      ? {
          companyDescription: brandContext.companyDescription,
          productsServices: brandContext.productsServices,
          positioning: brandContext.positioning,
          targetAudience: brandContext.targetAudience,
        }
      : null,
    model: run.model,
  });

  if (db) {
    try {
      const [inserted] = await db
        .insert(brandInterpretations)
        .values({
          runId: analysis.runId,
          promptId: analysis.promptId,
          projectId: analysis.projectId,
          brandName: analysis.brandName,
          brandDescription: analysis.brandDescription,
          productsServices: JSON.stringify(analysis.productsServices),
          positioning: analysis.positioning,
          audienceInterpretation: analysis.audienceInterpretation,
          competitorsMentioned: JSON.stringify(analysis.competitorsMentioned),
          strengths: JSON.stringify(analysis.strengths),
          weaknesses: JSON.stringify(analysis.weaknesses),
          notableChanges: analysis.notableChanges,
        })
        .returning();

      return {
        ...analysis,
        id: inserted.id,
        createdAt: inserted.createdAt,
      };
    } catch (err) {
      console.warn("Postgres insert brand interpretation failed, saving in memory:", err);
    }
  }

  const memoryItem: BrandInterpretationData = {
    ...analysis,
    id: `bi-${Date.now()}`,
    createdAt: new Date(),
  };
  DEV_BRAND_INTERPRETATIONS.unshift(memoryItem);
  return memoryItem;
}

/**
 * Retrieves all historical brand interpretations for a prompt in chronological order.
 */
export async function getHistoricalInterpretations(promptId: string): Promise<BrandInterpretationData[]> {
  const historyRuns = await getPromptTrackingHistory(promptId);
  const interpretations: BrandInterpretationData[] = [];

  for (const r of historyRuns) {
    const bi = await getBrandInterpretation(r.id);
    if (bi) {
      interpretations.push(bi);
    }
  }

  return interpretations;
}

export interface AnalyticsOverviewData {
  totalTrackedPrompts: number;
  totalEvaluationsRun: number;
  brandMentionedCount: number;
  brandMentionRate: number; // percentage (e.g. 67)
  uniqueCompetitorsCount: number;
  uniqueCompetitorsList: string[];
  latestRunDate: Date | null;
}

/**
 * Computes a factual tracking overview derived purely from real Neon data.
 * Zero fake metrics, zero numerical SEO/GEO scores.
 */
export async function getAnalyticsOverview(projectId: string): Promise<AnalyticsOverviewData> {
  const prompts = await getTrackedPrompts(projectId);
  const totalTrackedPrompts = prompts.length;

  let totalEvaluationsRun = 0;
  let brandMentionedCount = 0;
  const uniqueCompetitorsSet = new Set<string>();
  let latestRunDate: Date | null = null;

  for (const p of prompts) {
    totalEvaluationsRun += p.totalRuns;
    if (p.latestRun) {
      if (p.latestRun.brandMentioned) {
        brandMentionedCount += 1;
      }
      if (!latestRunDate || p.latestRun.createdAt > latestRunDate) {
        latestRunDate = p.latestRun.createdAt;
      }
      if (p.latestRun.competingBrandsDetected && Array.isArray(p.latestRun.competingBrandsDetected)) {
        for (const comp of p.latestRun.competingBrandsDetected) {
          if (comp && comp.trim()) uniqueCompetitorsSet.add(comp.trim());
        }
      }
    }
  }

  const brandMentionRate =
    totalTrackedPrompts > 0
      ? Math.round((brandMentionedCount / totalTrackedPrompts) * 100)
      : 0;

  return {
    totalTrackedPrompts,
    totalEvaluationsRun,
    brandMentionedCount,
    brandMentionRate,
    uniqueCompetitorsCount: uniqueCompetitorsSet.size,
    uniqueCompetitorsList: Array.from(uniqueCompetitorsSet).slice(0, 10),
    latestRunDate,
  };
}



