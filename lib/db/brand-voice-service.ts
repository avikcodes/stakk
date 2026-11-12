import { db } from "./index";
import { brandVoice } from "./schema";
import { eq } from "drizzle-orm";
import { getProject, getArticles } from "./content-service";
import { getProjectBrandContext } from "./brand-context-service";
import {
  analyzeBrandVoiceFromSources,
  generateToneMdMarkdown,
  TerminologyDefinition,
  BrandVoiceAnalysisResult,
} from "../ai/brand-voice-analyzer";

export type { TerminologyDefinition, BrandVoiceAnalysisResult };

export interface BrandVoiceData {
  id: string;
  projectId: string;
  writingStyle: string;
  tone: string;
  terminology: TerminologyDefinition[];
  sentenceStyle: string;
  preferredVocabulary: string[];
  bannedPhrases: string;
  brandPositioning: string;
  productLanguage: string;
  audienceLanguage: string;
  styleRules: string;
  toneGuidelines: string;
  status: "draft" | "approved";
  analyzedSourcesCount: number;
  updatedAt: Date;
}

// In-Memory Dev Store for Brand Voice
const DEV_BRAND_VOICE = new Map<string, BrandVoiceData>();

// Seed default brand voice for proj-1 and proj-2
DEV_BRAND_VOICE.set("proj-1", {
  id: "bv-proj-1",
  projectId: "proj-1",
  writingStyle:
    "Technical, expository, and direct. Focuses on architectural trade-offs, reproducible benchmarks, and concrete editorial mechanics rather than broad marketing generalities.",
  tone: "Pragmatic, peer-to-peer, authoritative, and concise. Confident engineering cadence with zero promotional hype.",
  terminology: [
    {
      term: "COMPANY.md",
      definition: "Persistent repository-level document storing company facts, product tiers, and capabilities.",
      example: "The fact-checking agent validates claims against COMPANY.md.",
    },
    {
      term: "TONE.md",
      definition: "Specification file enforcing sentence rhythm, active voice, and banned cliché rules.",
      example: "Generated drafts strictly follow TONE.md style guidelines.",
    },
    {
      term: "Multi-Agent Research",
      definition: "Parallel autonomous agent dispatch investigating intent, competitor blindspots, and citations.",
      example: "Multi-agent research uncovers real SERP gaps before drafting begins.",
    },
    {
      term: "Human-in-the-Loop",
      definition: "Mandatory human review gates where editors approve outlines and drafts before publication.",
      example: "Stak keeps the human in the loop at every critical juncture.",
    },
  ],
  sentenceStyle:
    "Crisp, declarative sentences averaging 14-18 words. Active voice throughout, short paragraphs (2-3 sentences), structured lists, and bold conceptual anchors.",
  preferredVocabulary: [
    "architected",
    "deterministic",
    "reproducible",
    "concrete",
    "production-grade",
    "latency",
    "throughput",
  ],
  bannedPhrases:
    "delve into, revolutionize, game changer, seamlessly, unlock, in today's fast-paced world, power of, cutting-edge, spearhead, look no further",
  brandPositioning:
    "The engineering-first alternative to black-box content generation suites, offering 100% brand voice adherence and zero generic AI filler.",
  productLanguage:
    "Framed via architectural workflows, deterministic pipelines, and verified capacity limits ($129/mo flat, 250 articles/mo, 20 projects) rather than superlative adjectives.",
  audienceLanguage:
    "Speaks directly to technical founders, engineering managers, and B2B growth leaders as knowledgeable peers with technical respect.",
  styleRules:
    "- Write exclusively in active voice\n- Never use banned marketing clichés\n- Ground technical claims in verified architecture\n- Structure multi-step processes with numbered steps\n- Use markdown tables for comparative metrics",
  toneGuidelines: `# TONE.md: Stak Brand Voice Specification

## 1. Core Tone & Persona
Pragmatic, peer-to-peer, authoritative, and concise. Confident engineering cadence with zero promotional hype.

## 2. Writing Style
Technical, expository, and direct. Focuses on architectural trade-offs, reproducible benchmarks, and concrete editorial mechanics rather than broad marketing generalities.

## 3. Sentence Style & Cadence
Crisp, declarative sentences averaging 14-18 words. Active voice throughout, short paragraphs (2-3 sentences), structured lists, and bold conceptual anchors.

## 4. Product Language & Technical Framing
Framed via architectural workflows, deterministic pipelines, and verified capacity limits ($129/mo flat, 250 articles/mo, 20 projects) rather than superlative adjectives.

## 5. Audience Address & Perspective
Speaks directly to technical founders, engineering managers, and B2B growth leaders as knowledgeable peers with technical respect.

## 6. Brand Positioning & Market Stance
The engineering-first alternative to black-box content generation suites, offering 100% brand voice adherence and zero generic AI filler.

## 7. Domain Terminology & Glossary
- **COMPANY.md**: Persistent repository-level document storing company facts, product tiers, and capabilities. *(e.g. "The fact-checking agent validates claims against COMPANY.md.")*
- **TONE.md**: Specification file enforcing sentence rhythm, active voice, and banned cliché rules. *(e.g. "Generated drafts strictly follow TONE.md style guidelines.")*
- **Multi-Agent Research**: Parallel autonomous agent dispatch investigating intent, competitor blindspots, and citations. *(e.g. "Multi-agent research uncovers real SERP gaps before drafting begins.")*
- **Human-in-the-Loop**: Mandatory human review gates where editors approve outlines and drafts before publication. *(e.g. "Stak keeps the human in the loop at every critical juncture.")*

## 8. Preferred Vocabulary
\`architected\`, \`deterministic\`, \`reproducible\`, \`concrete\`, \`production-grade\`, \`latency\`, \`throughput\`

## 9. Banned Clichés & Marketing Fluff
> **Strict Rule:** The following phrases are prohibited across all drafts:
delve into, revolutionize, game changer, seamlessly, unlock, in today's fast-paced world, power of, cutting-edge, spearhead, look no further

## 10. Concrete Style Rules
- Write exclusively in active voice
- Never use banned marketing clichés
- Ground technical claims in verified architecture
- Structure multi-step processes with numbered steps
- Use markdown tables for comparative metrics
`,
  status: "approved",
  analyzedSourcesCount: 3,
  updatedAt: new Date("2026-11-12T00:00:00Z"),
});

DEV_BRAND_VOICE.set("proj-2", {
  id: "bv-proj-2",
  projectId: "proj-2",
  writingStyle:
    "Systems engineering and database infrastructure focus. Prioritizes connection pooling math, connection exhaustion failure modes, and low-level protocol details.",
  tone: "Precise, deeply technical, benchmark-grounded, and objective.",
  terminology: [
    {
      term: "Instant Branching",
      definition: "Copy-on-write database isolation created in under 500ms.",
    },
    {
      term: "Separated Storage",
      definition: "Decoupled compute nodes communicating with distributed page servers.",
    },
  ],
  sentenceStyle: "Compact engineering sentences with latency metrics and code snippets.",
  preferredVocabulary: ["sub-millisecond", "failover", "autoscaling", "ephemeral", "pooling"],
  bannedPhrases: "magic, effortless, game-changing, silver bullet, revolutionary",
  brandPositioning: "The developer's serverless Postgres platform built for cloud-native scale.",
  productLanguage: "Framed around compute instances, autoscaling boundaries, and connection pooling protocols.",
  audienceLanguage: "Speaks directly to backend architects, database administrators, and full-stack devs.",
  styleRules: "- Always include latency benchmarks\n- Contrast connection pooling against direct TCP\n- Use code blocks for SQL and connection string examples",
  toneGuidelines: `# TONE.md: Neon Brand Voice Specification
## 1. Core Tone & Persona
Precise, deeply technical, benchmark-grounded, and objective.
`,
  status: "approved",
  analyzedSourcesCount: 1,
  updatedAt: new Date("2026-11-10T00:00:00Z"),
});

/**
 * Retrieves the Brand Voice context for a project from Neon DB or in-memory fallback.
 */
export async function getProjectBrandVoice(
  projectId: string
): Promise<BrandVoiceData | null> {
  if (db) {
    try {
      const records = await db
        .select()
        .from(brandVoice)
        .where(eq(brandVoice.projectId, projectId as any));

      if (records.length > 0) {
        const r = records[0];
        return {
          id: r.id,
          projectId: r.projectId,
          writingStyle: r.writingStyle || "Technical, direct, and authoritative.",
          tone: r.tone || "Pragmatic, peer-to-peer, and concise.",
          terminology: parseJsonSafe(r.terminology, []),
          sentenceStyle: r.sentenceStyle || "Short, declarative sentences with active voice.",
          preferredVocabulary: parseJsonSafe(r.preferredVocabulary, []),
          bannedPhrases:
            r.bannedPhrases ||
            "delve into, revolutionize, game changer, seamlessly, unlock, in today's fast-paced world",
          brandPositioning: r.brandPositioning || "Engineering-first platform.",
          productLanguage: r.productLanguage || "Concrete architectural capabilities.",
          audienceLanguage: r.audienceLanguage || "Speaks peer-to-peer to practitioners.",
          styleRules: r.styleRules || "- Use active voice\n- Avoid marketing hype",
          toneGuidelines: r.toneGuidelines || `# TONE.md: Brand Voice Specification\n`,
          status: (r.status as any) || "approved",
          analyzedSourcesCount: r.analyzedSourcesCount || 0,
          updatedAt: r.updatedAt || new Date(),
        };
      }
    } catch (err) {
      console.warn("Neon DB query failed for brandVoice:", err);
    }
  }

  return DEV_BRAND_VOICE.get(projectId) || null;
}

/**
 * Analyzes the project's website and existing content using OpenRouter,
 * synthesizes all 8 dimensions into BrandVoiceData + TONE.md,
 * and saves the generated Brand Voice context into Neon.
 */
export async function analyzeAndGenerateBrandVoice(
  projectId: string
): Promise<BrandVoiceData> {
  const project = await getProject(projectId);
  if (!project) {
    throw new Error(`Project not found: ${projectId}`);
  }

  // 1. Fetch website brand context
  const brandContext = await getProjectBrandContext(projectId);

  // 2. Fetch existing articles
  const existingArticles = await getArticles(projectId);

  // 3. Analyze using OpenRouter
  const analysis: BrandVoiceAnalysisResult = await analyzeBrandVoiceFromSources({
    companyName: project.name,
    websiteUrl: brandContext?.websiteUrl || project.domain,
    websiteContent: brandContext?.websiteContent,
    companyContextMarkdown: brandContext?.companyContextMarkdown || project.companyContext,
    industry: brandContext?.industry || project.industry,
    targetAudience: brandContext?.targetAudience || project.targetAudience,
    existingArticles: existingArticles.map((a) => ({
      title: a.title,
      content: a.content,
      targetKeywords: a.targetKeywords,
    })),
  });

  const now = new Date();
  const newVoiceData: BrandVoiceData = {
    id: `bv-${Date.now()}`,
    projectId,
    writingStyle: analysis.writingStyle,
    tone: analysis.tone,
    terminology: analysis.terminology,
    sentenceStyle: analysis.sentenceStyle,
    preferredVocabulary: analysis.preferredVocabulary,
    bannedPhrases: analysis.bannedPhrases,
    brandPositioning: analysis.brandPositioning,
    productLanguage: analysis.productLanguage,
    audienceLanguage: analysis.audienceLanguage,
    styleRules: analysis.styleRules,
    toneGuidelines: analysis.toneGuidelines,
    status: "approved",
    analyzedSourcesCount: analysis.analyzedSourcesCount,
    updatedAt: now,
  };

  // 4. Persist to Neon DB
  if (db) {
    try {
      const existing = await db
        .select()
        .from(brandVoice)
        .where(eq(brandVoice.projectId, projectId as any));

      if (existing.length > 0) {
        await db
          .update(brandVoice)
          .set({
            writingStyle: newVoiceData.writingStyle,
            tone: newVoiceData.tone,
            terminology: JSON.stringify(newVoiceData.terminology),
            sentenceStyle: newVoiceData.sentenceStyle,
            preferredVocabulary: JSON.stringify(newVoiceData.preferredVocabulary),
            bannedPhrases: newVoiceData.bannedPhrases,
            brandPositioning: newVoiceData.brandPositioning,
            productLanguage: newVoiceData.productLanguage,
            audienceLanguage: newVoiceData.audienceLanguage,
            styleRules: newVoiceData.styleRules,
            toneGuidelines: newVoiceData.toneGuidelines,
            status: "approved",
            analyzedSourcesCount: newVoiceData.analyzedSourcesCount,
            updatedAt: now,
          })
          .where(eq(brandVoice.id, existing[0].id));
        newVoiceData.id = existing[0].id;
      } else {
        const [inserted] = await db
          .insert(brandVoice)
          .values({
            projectId: projectId as any,
            writingStyle: newVoiceData.writingStyle,
            tone: newVoiceData.tone,
            terminology: JSON.stringify(newVoiceData.terminology),
            sentenceStyle: newVoiceData.sentenceStyle,
            preferredVocabulary: JSON.stringify(newVoiceData.preferredVocabulary),
            bannedPhrases: newVoiceData.bannedPhrases,
            brandPositioning: newVoiceData.brandPositioning,
            productLanguage: newVoiceData.productLanguage,
            audienceLanguage: newVoiceData.audienceLanguage,
            styleRules: newVoiceData.styleRules,
            toneGuidelines: newVoiceData.toneGuidelines,
            status: "approved",
            analyzedSourcesCount: newVoiceData.analyzedSourcesCount,
            updatedAt: now,
          })
          .returning();
        if (inserted) {
          newVoiceData.id = inserted.id;
        }
      }
    } catch (err) {
      console.warn("Neon DB persist failed for brandVoice:", err);
    }
  }

  // 5. Persist to in-memory store
  DEV_BRAND_VOICE.set(projectId, newVoiceData);

  return newVoiceData;
}

/**
 * Saves/updates the user's reviewed and edited Brand Voice context in Neon.
 */
export async function saveProjectBrandVoice(
  projectId: string,
  updates: Partial<BrandVoiceData>
): Promise<BrandVoiceData> {
  const current = (await getProjectBrandVoice(projectId)) || {
    id: `bv-${Date.now()}`,
    projectId,
    writingStyle: "Technical, direct, and authoritative.",
    tone: "Pragmatic, peer-to-peer, and concise.",
    terminology: [],
    sentenceStyle: "Short, declarative sentences with active voice.",
    preferredVocabulary: [],
    bannedPhrases: "delve into, revolutionize, game changer, seamlessly, unlock",
    brandPositioning: "Engineering-first platform.",
    productLanguage: "Concrete capabilities.",
    audienceLanguage: "Speaks to technical practitioners.",
    styleRules: "- Use active voice\n- Avoid hype",
    toneGuidelines: "",
    status: "approved" as const,
    analyzedSourcesCount: 1,
    updatedAt: new Date(),
  };

  const project = await getProject(projectId);
  const companyName = project?.name || "Company";

  const updatedTone = updates.tone ?? current.tone;
  const updatedWritingStyle = updates.writingStyle ?? current.writingStyle;
  const updatedSentenceStyle = updates.sentenceStyle ?? current.sentenceStyle;
  const updatedProductLanguage = updates.productLanguage ?? current.productLanguage;
  const updatedAudienceLanguage = updates.audienceLanguage ?? current.audienceLanguage;
  const updatedPositioning = updates.brandPositioning ?? current.brandPositioning;
  const updatedTerminology = updates.terminology ?? current.terminology;
  const updatedPreferredVocab = updates.preferredVocabulary ?? current.preferredVocabulary;
  const updatedBannedPhrases = updates.bannedPhrases ?? current.bannedPhrases;
  const updatedStyleRules = updates.styleRules ?? current.styleRules;

  // Re-generate TONE.md with the edited dimensions
  const toneGuidelines =
    updates.toneGuidelines ||
    generateToneMdMarkdown({
      companyName,
      tone: updatedTone,
      writingStyle: updatedWritingStyle,
      sentenceStyle: updatedSentenceStyle,
      productLanguage: updatedProductLanguage,
      audienceLanguage: updatedAudienceLanguage,
      brandPositioning: updatedPositioning,
      terminology: updatedTerminology,
      preferredVocabulary: updatedPreferredVocab,
      bannedPhrases: updatedBannedPhrases,
      styleRules: updatedStyleRules,
    });

  const now = new Date();
  const savedData: BrandVoiceData = {
    ...current,
    ...updates,
    tone: updatedTone,
    writingStyle: updatedWritingStyle,
    sentenceStyle: updatedSentenceStyle,
    productLanguage: updatedProductLanguage,
    audienceLanguage: updatedAudienceLanguage,
    brandPositioning: updatedPositioning,
    terminology: updatedTerminology,
    preferredVocabulary: updatedPreferredVocab,
    bannedPhrases: updatedBannedPhrases,
    styleRules: updatedStyleRules,
    toneGuidelines,
    status: "approved",
    updatedAt: now,
  };

  // 1. Persist to Neon DB
  if (db) {
    try {
      const existing = await db
        .select()
        .from(brandVoice)
        .where(eq(brandVoice.projectId, projectId as any));

      if (existing.length > 0) {
        await db
          .update(brandVoice)
          .set({
            writingStyle: savedData.writingStyle,
            tone: savedData.tone,
            terminology: JSON.stringify(savedData.terminology),
            sentenceStyle: savedData.sentenceStyle,
            preferredVocabulary: JSON.stringify(savedData.preferredVocabulary),
            bannedPhrases: savedData.bannedPhrases,
            brandPositioning: savedData.brandPositioning,
            productLanguage: savedData.productLanguage,
            audienceLanguage: savedData.audienceLanguage,
            styleRules: savedData.styleRules,
            toneGuidelines: savedData.toneGuidelines,
            status: "approved",
            updatedAt: now,
          })
          .where(eq(brandVoice.id, existing[0].id));
      } else {
        await db.insert(brandVoice).values({
          projectId: projectId as any,
          writingStyle: savedData.writingStyle,
          tone: savedData.tone,
          terminology: JSON.stringify(savedData.terminology),
          sentenceStyle: savedData.sentenceStyle,
          preferredVocabulary: JSON.stringify(savedData.preferredVocabulary),
          bannedPhrases: savedData.bannedPhrases,
          brandPositioning: savedData.brandPositioning,
          productLanguage: savedData.productLanguage,
          audienceLanguage: savedData.audienceLanguage,
          styleRules: savedData.styleRules,
          toneGuidelines: savedData.toneGuidelines,
          status: "approved",
          updatedAt: now,
        });
      }
    } catch (err) {
      console.warn("Neon DB save failed for brandVoice:", err);
    }
  }

  // 2. Persist to in-memory store
  DEV_BRAND_VOICE.set(projectId, savedData);

  return savedData;
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

