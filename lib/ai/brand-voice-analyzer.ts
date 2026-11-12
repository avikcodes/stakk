import { callOpenRouter } from "./openrouter";

export interface TerminologyDefinition {
  term: string;
  definition: string;
  example?: string;
}

export interface BrandVoiceAnalysisResult {
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
  toneGuidelines: string; // Full authoritative TONE.md markdown
  analyzedSourcesCount: number;
}

export interface AnalyzeBrandVoiceParams {
  companyName: string;
  websiteUrl?: string | null;
  websiteContent?: string | null;
  companyContextMarkdown?: string | null;
  industry?: string | null;
  targetAudience?: string | null;
  existingArticles?: Array<{
    title: string;
    content: string;
    targetKeywords?: string | null;
  }>;
}

/**
 * Analyzes website content and existing articles using OpenRouter
 * to understand the project's brand voice across all 8 required dimensions.
 */
export async function analyzeBrandVoiceFromSources(
  params: AnalyzeBrandVoiceParams
): Promise<BrandVoiceAnalysisResult> {
  const company = params.companyName.trim() || "Company";
  const existingArts = params.existingArticles || [];

  // 1. Prepare Content Corpus
  const articlesCorpus = existingArts
    .slice(0, 5)
    .map(
      (a, i) =>
        `--- ARTICLE SAMPLE ${i + 1}: "${a.title}" ---\nKeywords: ${
          a.targetKeywords || "N/A"
        }\nContent Excerpt:\n${a.content.slice(0, 1200)}`
    )
    .join("\n\n");

  const websiteCorpus = params.websiteContent
    ? `--- WEBSITE CONTENT ---\n${params.websiteContent.slice(0, 2000)}`
    : `Website: ${params.websiteUrl || "N/A"}\nOverview: ${params.companyContextMarkdown?.slice(0, 800) || ""}`;

  const prompt = `You are Stak's Brand Voice & Editorial Intelligence Engine.
Analyze the following existing content samples and website material for "${company}" to extract an authoritative Brand Voice specification.

COMPANY: ${company}
INDUSTRY: ${params.industry || "B2B Technology / Infrastructure"}
TARGET AUDIENCE: ${params.targetAudience || "Technical Decision Makers & Engineers"}

WEBSITE CONTEXT:
"""
${websiteCorpus}
"""

EXISTING ARTICLES:
"""
${articlesCorpus || "No existing articles yet. Base analysis on website content and industry benchmarks."}
"""

Extract and return STRICTLY valid JSON with the following 8 core dimensions:
{
  "writingStyle": "Detailed 2-3 sentence definition of the writing style (e.g., technical, expository, authoritative, zero-fluff)",
  "tone": "Core tone characteristics (e.g., pragmatic, direct, engineer-to-engineer, objective, confident)",
  "terminology": [
    { "term": "Key Term 1", "definition": "Definition or usage rule in content", "example": "Brief contextual sentence" },
    { "term": "Key Term 2", "definition": "Definition or usage rule in content", "example": "Brief contextual sentence" }
  ],
  "sentenceStyle": "Sentence length distribution, active voice preference, cadence, and rhythm (e.g. crisp declarative sentences, concise paragraphs, bold transitions)",
  "preferredVocabulary": ["architected", "benchmark", "production-ready", "deterministic", "reproducible", "latency", "throughput"],
  "bannedPhrases": "delve into, revolutionize, game changer, seamlessly, unlock, in today's fast-paced world, power of, robust solution, spearhead",
  "brandPositioning": "How the brand positions its value against competitors and category standards (e.g. engineering alternative to black-box content mills)",
  "productLanguage": "How features and product capabilities are named, framed, and described (concrete mechanics rather than abstract marketing claims)",
  "audienceLanguage": "How the copy addresses the reader (speaks peer-to-peer to practitioners with architectural depth rather than patronizing advice)",
  "styleRules": "- Write exclusively in active voice\\n- Use bulleted lists for multi-point comparisons\\n- Ground every claim in measurable benchmarks\\n- Avoid buzzwords and hype adjectives"
}

Return ONLY valid JSON. No markdown code block, no backticks, no extra text.`;

  try {
    const aiResponse = await callOpenRouter(
      [
        {
          role: "system",
          content: "You are a brand voice auditor. Always return clean, pure JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      {
        temperature: 0.2,
        maxTokens: 2500,
      }
    );

    let cleanJson = aiResponse.trim();
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    }

    const parsed = JSON.parse(cleanJson);

    const terminology: TerminologyDefinition[] = Array.isArray(parsed.terminology)
      ? parsed.terminology.map((t: any) => ({
          term: String(t.term || ""),
          definition: String(t.definition || ""),
          example: t.example ? String(t.example) : undefined,
        }))
      : [];

    const preferredVocabulary: string[] = Array.isArray(parsed.preferredVocabulary)
      ? parsed.preferredVocabulary.map((v: any) => String(v))
      : ["production-ready", "deterministic", "authoritative", "architected", "latency"];

    const writingStyle = String(parsed.writingStyle || "Technical, direct, and authoritative.");
    const tone = String(parsed.tone || "Pragmatic, developer-to-developer, objective, and concise.");
    const sentenceStyle = String(parsed.sentenceStyle || "Short, punchy declarative statements combined with technical depth.");
    const bannedPhrases = String(
      parsed.bannedPhrases ||
        "delve into, revolutionize, game changer, seamlessly, unlock, in today's fast-paced world, spearhead, cutting-edge"
    );
    const brandPositioning = String(
      parsed.brandPositioning || "Engineering-first platform delivering high precision and measurable results."
    );
    const productLanguage = String(
      parsed.productLanguage || "Described through explicit architectural mechanics, data flows, and concrete performance tiers."
    );
    const audienceLanguage = String(
      parsed.audienceLanguage || "Speaks directly to technical practitioners and leaders with zero condescension."
    );
    const styleRules = String(
      parsed.styleRules ||
        "- Use active voice throughout\n- Eliminate unnecessary adverbs\n- Avoid hyperbole\n- Format key comparisons in tables"
    );

    const toneGuidelines = generateToneMdMarkdown({
      companyName: company,
      tone,
      writingStyle,
      sentenceStyle,
      productLanguage,
      audienceLanguage,
      brandPositioning,
      terminology,
      preferredVocabulary,
      bannedPhrases,
      styleRules,
    });

    return {
      writingStyle,
      tone,
      terminology,
      sentenceStyle,
      preferredVocabulary,
      bannedPhrases,
      brandPositioning,
      productLanguage,
      audienceLanguage,
      styleRules,
      toneGuidelines,
      analyzedSourcesCount: (existingArts.length || 0) + (params.websiteContent ? 1 : 0),
    };
  } catch (err: any) {
    console.warn("OpenRouter brand voice extraction fallback:", err.message);

    // Fallback synthesis
    const terminology: TerminologyDefinition[] = [
      {
        term: company,
        definition: "The primary brand entity and platform name.",
        example: `${company} orchestrates content through multi-agent pipelines.`,
      },
      {
        term: "COMPANY.md",
        definition: "Repository-level file encoding verified facts, product tiers, and capabilities.",
      },
      {
        term: "TONE.md",
        definition: "Brand voice specification governing cadence, vocabulary, and banned phrases.",
      },
    ];

    const preferredVocabulary = [
      "architected",
      "deterministic",
      "reproducible",
      "concrete",
      "production-grade",
      "throughput",
    ];

    const writingStyle =
      "Technical, direct, and expository. Every paragraph delivers concrete information without introductory filler or promotional hype.";
    const tone =
      "Pragmatic, peer-to-peer, confident, and respectful of the reader's time. Clear engineering tone with zero corporate marketing speak.";
    const sentenceStyle =
      "Crisp, rhythmic sentences with active verbs. Short paragraphs (2-3 sentences) mixed with structural bullet points and markdown tables.";
    const bannedPhrases =
      "delve into, revolutionize, game changer, seamlessly, unlock, in today's fast-paced world, power of, cutting-edge, spearhead";
    const brandPositioning =
      "The engineering-grade alternative to black-box content generators, prioritizing factual fidelity and brand voice adherence.";
    const productLanguage =
      "Framed through technical capabilities, latency benchmarks, and verified feature constraints rather than superlative marketing adjectives.";
    const audienceLanguage =
      "Addresses software engineers, technical leads, and founders as knowledgeable peers. Explains architectural trade-offs honestly.";
    const styleRules =
      "- Write exclusively in active voice\n- Never use banned marketing clichés\n- Ground technical claims in verified architecture\n- Structure multi-step processes with numbered steps";

    const toneGuidelines = generateToneMdMarkdown({
      companyName: company,
      tone,
      writingStyle,
      sentenceStyle,
      productLanguage,
      audienceLanguage,
      brandPositioning,
      terminology,
      preferredVocabulary,
      bannedPhrases,
      styleRules,
    });

    return {
      writingStyle,
      tone,
      terminology,
      sentenceStyle,
      preferredVocabulary,
      bannedPhrases,
      brandPositioning,
      productLanguage,
      audienceLanguage,
      styleRules,
      toneGuidelines,
      analyzedSourcesCount: existingArts.length + 1,
    };
  }
}

/**
 * Generates an authoritative TONE.md markdown document from the 8 analyzed dimensions.
 */
export function generateToneMdMarkdown(data: {
  companyName: string;
  tone: string;
  writingStyle: string;
  sentenceStyle: string;
  productLanguage: string;
  audienceLanguage: string;
  brandPositioning: string;
  terminology: TerminologyDefinition[];
  preferredVocabulary: string[];
  bannedPhrases: string;
  styleRules: string;
}): string {
  const termsList = data.terminology
    .map((t) => `- **${t.term}**: ${t.definition}${t.example ? ` *(e.g. "${t.example}")*` : ""}`)
    .join("\n");

  const preferredWordsList = data.preferredVocabulary.map((v) => `\`${v}\``).join(", ");

  return `# TONE.md: ${data.companyName} Brand Voice Specification

## 1. Core Tone & Persona
${data.tone}

## 2. Writing Style
${data.writingStyle}

## 3. Sentence Style & Cadence
${data.sentenceStyle}

## 4. Product Language & Technical Framing
${data.productLanguage}

## 5. Audience Address & Perspective
${data.audienceLanguage}

## 6. Brand Positioning & Market Stance
${data.brandPositioning}

## 7. Domain Terminology & Glossary
${termsList || `- **${data.companyName}**: The primary company brand.`}

## 8. Preferred Vocabulary
${preferredWordsList || "`deterministic`, `architected`, `production-ready`"}

## 9. Banned Clichés & Marketing Fluff
> **Strict Rule:** The following phrases are prohibited across all drafts:
${data.bannedPhrases}

## 10. Concrete Style Rules
${data.styleRules}
`;
}

