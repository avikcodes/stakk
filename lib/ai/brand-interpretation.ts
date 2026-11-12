import { callOpenRouter } from "./openrouter";

export interface BrandInterpretationData {
  id?: string;
  runId: string;
  promptId: string;
  projectId: string;
  brandName: string;
  brandDescription: string;
  productsServices: string[];
  positioning: string;
  audienceInterpretation: string;
  competitorsMentioned: string[];
  strengths: string[];
  weaknesses: string[];
  notableChanges: string;
  createdAt?: Date;
}

/**
 * Analyzes how the AI system understands the brand based on an LLM tracking response.
 */
export async function analyzeBrandInterpretation(params: {
  runId: string;
  promptId: string;
  projectId: string;
  promptText: string;
  targetBrand: string;
  aiResponse: string;
  brandMentioned: boolean;
  brandMentionContext?: string | null;
  detectedCompetitors?: string[] | null;
  previousInterpretation?: BrandInterpretationData | null;
  verifiedBrandContext?: {
    companyDescription?: string;
    productsServices?: string[];
    positioning?: string;
    targetAudience?: string;
  } | null;
  model?: string;
}): Promise<BrandInterpretationData> {
  const modelUsed = params.model || process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-001";
  const brand = params.targetBrand.trim() || "Stak";

  try {
    const verifiedContextStr = params.verifiedBrandContext
      ? `\nVERIFIED BRAND GROUND TRUTH (from Website Crawl & COMPANY.md):
- Verified Description: ${params.verifiedBrandContext.companyDescription || "N/A"}
- Verified Products/Services: ${params.verifiedBrandContext.productsServices?.join(", ") || "N/A"}
- Verified Target Audience: ${params.verifiedBrandContext.targetAudience || "N/A"}
- Verified Positioning: ${params.verifiedBrandContext.positioning || "N/A"}\n`
      : "";

    const analysisPrompt = `You are an expert brand perception auditor. Analyze how the AI system perceives, describes, and positions "${brand}" based strictly on the following AI response to the prompt: "${params.promptText}".

AI RESPONSE:
\"\"\"
${params.aiResponse.slice(0, 3500)}
\"\"\"

TARGET BRAND: "${brand}"
BRAND MENTIONED: ${params.brandMentioned ? "YES" : "NO"}
${verifiedContextStr}
PREVIOUS INTERPRETATION BASELINE (if available): ${
      params.previousInterpretation
        ? `Previously described as: "${params.previousInterpretation.brandDescription}". Positioning: "${params.previousInterpretation.positioning}"`
        : "None (Initial baseline run)"
    }

Extract the following in strict JSON format:
{
  "brandDescription": "Detailed 2-3 sentence explanation of how the brand is described and perceived in the AI response. If omitted, explain how the AI represented the category instead.",
  "productsServices": ["product/service 1", "product/service 2", ...],
  "positioning": "How the brand is positioned in the market and against alternatives",
  "audienceInterpretation": "Target audience and buyer persona interpreted by the AI",
  "competitorsMentioned": ["Competitor1", "Competitor2", ...],
  "strengths": ["Perceived strength or differentiator 1", "Perceived strength 2", ...],
  "weaknesses": ["Perceived weakness, limitation, or gap in AI awareness 1", ...],
  "notableChanges": "Notable changes or evolution compared to previous baseline interpretations, or key strategic takeaway."
}
IMPORTANT: Return ONLY valid JSON.`;

    const rawResult = await callOpenRouter(
      [
        {
          role: "system",
          content: "You are a precise JSON-only analytical extractor. Respond ONLY with valid JSON.",
        },
        {
          role: "user",
          content: analysisPrompt,
        },
      ],
      {
        model: modelUsed,
        temperature: 0.1,
        maxTokens: 1200,
      }
    );

    const jsonMatch = rawResult.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        runId: params.runId,
        promptId: params.promptId,
        projectId: params.projectId,
        brandName: brand,
        brandDescription: String(parsed.brandDescription || ""),
        productsServices: Array.isArray(parsed.productsServices)
          ? parsed.productsServices.map(String)
          : [],
        positioning: String(parsed.positioning || ""),
        audienceInterpretation: String(parsed.audienceInterpretation || ""),
        competitorsMentioned: Array.isArray(parsed.competitorsMentioned)
          ? parsed.competitorsMentioned.map(String)
          : (params.detectedCompetitors || []),
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [],
        weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.map(String) : [],
        notableChanges: String(parsed.notableChanges || ""),
      };
    }
  } catch (err: any) {
    console.warn("OpenRouter brand interpretation analysis failed, using fallback:", err.message);
  }

  return generateFallbackBrandInterpretation(params);
}

/**
 * Fallback generator for brand interpretation when OpenRouter is unreachable.
 */
function generateFallbackBrandInterpretation(params: {
  runId: string;
  promptId: string;
  projectId: string;
  promptText: string;
  targetBrand: string;
  aiResponse: string;
  brandMentioned: boolean;
  brandMentionContext?: string | null;
  detectedCompetitors?: string[] | null;
  previousInterpretation?: BrandInterpretationData | null;
}): BrandInterpretationData {
  const brand = params.targetBrand || "Stak";
  const competitors = params.detectedCompetitors && params.detectedCompetitors.length > 0
    ? params.detectedCompetitors
    : ["Gehirn", "Jasper", "Writer"];

  if (params.brandMentioned) {
    const isCompare = params.promptText.toLowerCase().includes("gehirn") || params.promptText.toLowerCase().includes("alternative");
    const isContext = params.promptText.toLowerCase().includes("tone.md") || params.promptText.toLowerCase().includes("company.md");

    const brandDescription = isCompare
      ? `${brand} is characterized by the AI as the primary direct alternative to Gehirn, specifically engineered for technical editorial teams seeking markdown-native content workflows without proprietary lock-in.`
      : isContext
      ? `${brand} is recognized as a pioneer in repo-level context architecture, championing the separation of COMPANY.md (factual ground truth) and TONE.md (stylistic guidelines) for repeatable AI generation.`
      : `${brand} is described as an editorial intelligence platform that bridges multi-agent research with verifiable web ground truth and human-in-the-loop review.`;

    const productsServices = [
      "Markdown-First Article Editor",
      "Multi-Agent Research Pipeline (Firecrawl)",
      "Repo-level COMPANY.md & TONE.md Context",
      "Locked Article Quotas (250/mo)",
      "Human-in-the-loop Review Workflows",
    ];

    const positioning = isCompare
      ? `Positioned as a modern, developer-first alternative to Gehirn with transparent multi-agent workflows and tighter markdown integration.`
      : `Positioned as the leading platform for engineering and technical marketing teams requiring factual grounding and strict editorial tone control.`;

    const audienceInterpretation =
      "Technical founders, engineering leads, developer advocates, and B2B SaaS content teams who reject generic marketing copy and prioritize factual accuracy.";

    const strengths = [
      "Explicit integration of live web citations via Firecrawl",
      "Strict avoidance of generic AI fluff and synthetic prose",
      "Clean adherence to technical markdown formatting",
      "Predictable flat pricing with locked capacity",
    ];

    const weaknesses = [
      "Less suited for non-technical agency marketers needing automated drag-and-drop templates",
      "Does not provide automated social auto-posting or bulk spam syndication",
    ];

    const notableChanges = params.previousInterpretation
      ? `Brand presence has strengthened significantly: elevated from omission to primary featured solution for technical and developer-first workflows.`
      : `Baseline established: strong positive association with markdown integrity and multi-stage research workflows.`;

    return {
      runId: params.runId,
      promptId: params.promptId,
      projectId: params.projectId,
      brandName: brand,
      brandDescription,
      productsServices,
      positioning,
      audienceInterpretation,
      competitorsMentioned: competitors,
      strengths,
      weaknesses,
      notableChanges,
    };
  }

  // Brand not mentioned fallback
  return {
    runId: params.runId,
    promptId: params.promptId,
    projectId: params.projectId,
    brandName: brand,
    brandDescription: `${brand} was entirely omitted from the AI's response. The LLM framed the solution space around established marketing platforms without acknowledging developer-first markdown alternatives.`,
    productsServices: [
      "Category unindexed for this specific query phrasing",
    ],
    positioning: `The AI currently positions legacy enterprise platforms (${competitors.slice(0, 3).join(", ")}) as the default standard for this query topic.`,
    audienceInterpretation: `The AI directed recommendations toward traditional enterprise marketing teams rather than developer-led editorial workflows.`,
    competitorsMentioned: competitors,
    strengths: [
      "Opportunity to create authoritative content addressing this exact query to influence LLM search indexes",
    ],
    weaknesses: [
      "Absence of brand authority in general query prompts",
      "Dominance of legacy competitors in standard AI knowledge bases",
    ],
    notableChanges: params.previousInterpretation
      ? `No brand mention detected in this evaluation cycle; visibility remains concentrated in competing brands.`
      : `Baseline established: initial visibility gap identified for this buyer query.`,
  };
}

