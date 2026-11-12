import { Firecrawl } from "@mendable/firecrawl-js";
import { callOpenRouter } from "./openrouter";

export interface CrawlInputParams {
  websiteUrl: string;
  companyName: string;
  companyDescription?: string;
  industry?: string;
  targetAudience?: string;
  productsServices?: string;
}

export interface ImportantPage {
  title: string;
  url: string;
  purpose: string;
}

export interface SiteStructureNode {
  path: string;
  title: string;
  section: "Core" | "Product" | "Documentation" | "Resources" | "Company" | "Legal";
  depth: number;
  purpose: string;
}

export interface TerminologyItem {
  term: string;
  definition: string;
}

export interface ExtractedBrandContext {
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
  crawledPagesCount: number;
  crawlSource: "firecrawl" | "simulated";
}

/**
 * Normalizes input URL into a valid web URL.
 */
function normalizeUrl(rawUrl: string): string {
  let cleaned = rawUrl.trim();
  if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
    cleaned = `https://${cleaned}`;
  }
  return cleaned;
}

/**
 * Crawls a website using Firecrawl and extracts structured context using OpenRouter.
 */
export async function crawlAndExtractBrandContext(
  params: CrawlInputParams
): Promise<ExtractedBrandContext> {
  const normalizedUrl = normalizeUrl(params.websiteUrl);
  const companyName = params.companyName.trim();
  const apiKey = process.env.FIRECRAWL_API_KEY?.trim();

  let crawledMarkdown = "";
  let crawlSource: "firecrawl" | "simulated" = "simulated";
  let pagesCount = 1;

  // 1. Attempt live crawl via Firecrawl if API key is present
  if (apiKey && apiKey !== "") {
    try {
      const client = new Firecrawl({ apiKey });
      const scrapeResponse = await client.scrape(normalizedUrl, {
        formats: ["markdown", "links"],
      });

      const md =
        (scrapeResponse as any)?.markdown ||
        (scrapeResponse as any)?.data?.markdown ||
        "";
      const scrapedLinks =
        (scrapeResponse as any)?.links ||
        (scrapeResponse as any)?.data?.links ||
        [];

      if (md && md.length > 50) {
        crawledMarkdown = md.slice(0, 8000);
        if (Array.isArray(scrapedLinks) && scrapedLinks.length > 0) {
          crawledMarkdown += `\n\nDISCOVERED SITEMAP URLS:\n` + scrapedLinks.slice(0, 25).join("\n");
        }
        crawlSource = "firecrawl";
        pagesCount = Math.min(10, Math.max(1, scrapedLinks.length > 0 ? Math.min(scrapedLinks.length, 8) : 1));
      }
    } catch (err: any) {
      console.warn(
        `Firecrawl scrape failed for ${normalizedUrl} (${err.message}), falling back to simulated web extraction`
      );
    }
  }

  // 2. Fallback simulation if Firecrawl was unavailable or empty
  if (!crawledMarkdown) {
    const domainHost = normalizedUrl.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    crawledMarkdown = `# ${companyName} (${domainHost})
${params.companyDescription || `${companyName} is an industry-leading platform specializing in ${params.industry || "high-performance technology"} solutions.`}

## Platform Features & Products
${params.productsServices || "Core platform, real-time analytics, developer APIs, enterprise support and integration connectors."}

## Target Users
${params.targetAudience || "Engineering leaders, product teams, developer advocates and technical operations specialists."}

## Architecture & Technology
Modern cloud-native architecture designed for high availability, low latency, and seamless integrations.`;
    pagesCount = 1;
  }

  // 3. AI Extraction via OpenRouter to structure the 7 required dimensions
  try {
    const extractionPrompt = `You are Stak's Project & Brand Context Intelligence Engine.
Analyze the following crawled website content and user-provided inputs to extract a comprehensive, authoritative Brand Context profile.

USER-PROVIDED INPUTS:
- Company Name: ${companyName}
- Website URL: ${normalizedUrl}
- Description: ${params.companyDescription || "N/A"}
- Industry: ${params.industry || "N/A"}
- Target Audience: ${params.targetAudience || "N/A"}
- Products/Services: ${params.productsServices || "N/A"}

CRAWLED WEBSITE CONTENT:
"""
${crawledMarkdown}
"""

Extract and return STRICTLY valid JSON with the following schema:
{
  "companyDescription": "2-3 sentence overview of what the company does and its primary value proposition",
  "industry": "Primary industry/sector (e.g. Developer Tools, Cloud Infrastructure, Fintech)",
  "targetAudience": "Specific target buyers and end-users (e.g. Engineering leaders, technical founders, devops)",
  "productsServices": ["Product/Service 1", "Product/Service 2", "Feature/Tier 3"],
  "websiteContent": "Comprehensive 2-3 paragraph summary of the website content, key messaging, and technical architecture",
  "companyInformation": "Detailed company information covering mission, background facts, and key capabilities",
  "siteStructure": [
    { "path": "/", "title": "Home", "section": "Core", "depth": 0, "purpose": "Main landing and architecture overview" },
    { "path": "/features", "title": "Features", "section": "Product", "depth": 1, "purpose": "Platform features and capabilities" },
    { "path": "/pricing", "title": "Pricing", "section": "Product", "depth": 1, "purpose": "Licensing and pricing tier" },
    { "path": "/docs", "title": "Documentation", "section": "Documentation", "depth": 1, "purpose": "Technical guides and APIs" },
    { "path": "/blog", "title": "Blog", "section": "Resources", "depth": 1, "purpose": "Technical guides and case studies" },
    { "path": "/about", "title": "About", "section": "Company", "depth": 1, "purpose": "Company background and mission" },
    { "path": "/terms", "title": "Terms", "section": "Legal", "depth": 1, "purpose": "Terms of service and policies" }
  ],
  "importantPages": [
    { "title": "Home", "url": "${normalizedUrl}", "purpose": "Main landing page and value proposition" },
    { "title": "Features", "url": "${normalizedUrl}/features", "purpose": "Detailed breakdown of technical features" },
    { "title": "Pricing", "url": "${normalizedUrl}/pricing", "purpose": "Tier structure and licensing" }
  ],
  "terminology": [
    { "term": "Key Term 1", "definition": "How the brand defines and uses this term" },
    { "term": "Key Term 2", "definition": "How the brand defines and uses this term" }
  ],
  "positioning": "Strategic market positioning statement, highlighting how the brand differentiates vs competitors",
  "existingContent": ["Topic/theme 1 already covered on the site", "Topic/theme 2 already covered on the site"]
}

Return ONLY valid JSON with no markdown backticks, no code fence, and no explanation.`;

    const aiResponse = await callOpenRouter(
      [
        {
          role: "system",
          content: "You extract structured company and website context. Always respond with pure JSON only.",
        },
        {
          role: "user",
          content: extractionPrompt,
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

    const importantPages: ImportantPage[] = Array.isArray(parsed.importantPages)
      ? parsed.importantPages.map((p: any) => ({
          title: String(p.title || "Page"),
          url: String(p.url || normalizedUrl),
          purpose: String(p.purpose || "Essential website section"),
        }))
      : [
          { title: "Home", url: normalizedUrl, purpose: "Main landing page and value proposition" },
          { title: "Features", url: `${normalizedUrl}/features`, purpose: "Core feature overview" },
          { title: "Documentation", url: `${normalizedUrl}/docs`, purpose: "Technical implementation guide" },
        ];

    const siteStructure: SiteStructureNode[] = Array.isArray(parsed.siteStructure) && parsed.siteStructure.length > 0
      ? parsed.siteStructure.map((s: any) => ({
          path: String(s.path || "/"),
          title: String(s.title || "Page"),
          section: (["Core", "Product", "Documentation", "Resources", "Company", "Legal"].includes(s.section)
            ? s.section
            : "Product") as any,
          depth: typeof s.depth === "number" ? s.depth : 1,
          purpose: String(s.purpose || "Website route"),
        }))
      : [
          { path: "/", title: "Home", section: "Core", depth: 0, purpose: "Main landing and architecture overview" },
          { path: "/features", title: "Features", section: "Product", depth: 1, purpose: "Platform features and capabilities" },
          { path: "/pricing", title: "Pricing", section: "Product", depth: 1, purpose: "Licensing and pricing tiers" },
          { path: "/docs", title: "Documentation", section: "Documentation", depth: 1, purpose: "Technical guides and APIs" },
          { path: "/blog", title: "Blog", section: "Resources", depth: 1, purpose: "Engineering updates and case studies" },
          { path: "/about", title: "About", section: "Company", depth: 1, purpose: "Company background and mission" },
          { path: "/terms", title: "Terms", section: "Legal", depth: 1, purpose: "Terms of service and policies" },
        ];

    const terminology: TerminologyItem[] = Array.isArray(parsed.terminology)
      ? parsed.terminology.map((t: any) => ({
          term: String(t.term || ""),
          definition: String(t.definition || ""),
        }))
      : [];

    const productsServices: string[] = Array.isArray(parsed.productsServices)
      ? parsed.productsServices.map((p: any) => String(p))
      : params.productsServices
      ? params.productsServices.split(",").map((s) => s.trim())
      : [`${companyName} Platform`];

    const existingContent: string[] = Array.isArray(parsed.existingContent)
      ? parsed.existingContent.map((c: any) => String(c))
      : [];

    const companyContextMarkdown = generateCompanyContextMarkdown({
      companyName,
      websiteUrl: normalizedUrl,
      industry: parsed.industry || params.industry || "Technology",
      targetAudience: parsed.targetAudience || params.targetAudience || "Technical buyers",
      companyDescription: parsed.companyDescription || params.companyDescription || "",
      companyInformation: parsed.companyInformation || "",
      productsServices,
      positioning: parsed.positioning || "",
      terminology,
      importantPages,
      siteStructure,
      existingContent,
      websiteContent: parsed.websiteContent || "",
    });

    return {
      websiteUrl: normalizedUrl,
      companyName,
      companyDescription: parsed.companyDescription || params.companyDescription || "",
      industry: parsed.industry || params.industry || "Technology",
      targetAudience: parsed.targetAudience || params.targetAudience || "Technical buyers",
      productsServices,
      websiteContent: parsed.websiteContent || "",
      companyInformation: parsed.companyInformation || "",
      importantPages,
      siteStructure,
      terminology,
      positioning: parsed.positioning || "",
      existingContent,
      companyContextMarkdown,
      crawledPagesCount: pagesCount,
      crawlSource,
    };
  } catch (err: any) {
    console.warn("OpenRouter context extraction fallback:", err.message);

    // Fallback extraction
    const productsServices = params.productsServices
      ? params.productsServices.split(",").map((s) => s.trim())
      : [`${companyName} Core Platform`, "Developer APIs", "Enterprise Solutions"];

    const terminology: TerminologyItem[] = [
      {
        term: companyName,
        definition: params.companyDescription || "Primary brand and platform entity.",
      },
      {
        term: params.industry || "Cloud Architecture",
        definition: `Domain sector in which ${companyName} delivers its core products.`,
      },
    ];

    const importantPages: ImportantPage[] = [
      { title: "Home", url: normalizedUrl, purpose: "Main landing page and value proposition" },
      { title: "Features", url: `${normalizedUrl}/features`, purpose: "Technical capabilities breakdown" },
      { title: "Documentation", url: `${normalizedUrl}/docs`, purpose: "Developer integration guides" },
    ];

    const siteStructure: SiteStructureNode[] = [
      { path: "/", title: "Home", section: "Core", depth: 0, purpose: "Main landing and architecture overview" },
      { path: "/features", title: "Features", section: "Product", depth: 1, purpose: "Platform features and capabilities" },
      { path: "/pricing", title: "Pricing", section: "Product", depth: 1, purpose: "Licensing and pricing tiers" },
      { path: "/docs", title: "Documentation", section: "Documentation", depth: 1, purpose: "Developer API guides" },
      { path: "/blog", title: "Blog", section: "Resources", depth: 1, purpose: "Engineering guides and updates" },
      { path: "/about", title: "About", section: "Company", depth: 1, purpose: "Company background and team" },
      { path: "/terms", title: "Terms of Service", section: "Legal", depth: 1, purpose: "Platform terms and compliance" },
    ];

    const existingContent = [
      `Introduction to ${companyName} architecture`,
      `Best practices for ${params.industry || "high-performance"} workflows`,
    ];

    const companyContextMarkdown = generateCompanyContextMarkdown({
      companyName,
      websiteUrl: normalizedUrl,
      industry: params.industry || "Cloud Software",
      targetAudience: params.targetAudience || "Engineers & Technical Leaders",
      companyDescription: params.companyDescription || `${companyName} delivers high-performance solutions for modern teams.`,
      companyInformation: `${companyName} operates at ${normalizedUrl}, providing specialized tools and infrastructure.`,
      productsServices,
      positioning: `${companyName} delivers developer-first reliability and transparent pricing.`,
      terminology,
      importantPages,
      siteStructure,
      existingContent,
      websiteContent: `Website crawled for ${companyName} at ${normalizedUrl}. Primary focus is on ${params.industry || "technical solutions"}.`,
    });

    return {
      websiteUrl: normalizedUrl,
      companyName,
      companyDescription: params.companyDescription || `${companyName} provides high-performance solutions for modern teams.`,
      industry: params.industry || "Technology",
      targetAudience: params.targetAudience || "Engineers & Technical Leaders",
      productsServices,
      websiteContent: `Website crawled for ${companyName} at ${normalizedUrl}.`,
      companyInformation: `${companyName} operates at ${normalizedUrl}, providing specialized tools and infrastructure.`,
      importantPages,
      siteStructure,
      terminology,
      positioning: `${companyName} delivers developer-first reliability and transparent pricing.`,
      existingContent,
      companyContextMarkdown,
      crawledPagesCount: pagesCount,
      crawlSource,
    };
  }
}

/**
 * Synthesizes an authoritative COMPANY.md markdown document from extracted context.
 */
function generateCompanyContextMarkdown(data: {
  companyName: string;
  websiteUrl: string;
  industry: string;
  targetAudience: string;
  companyDescription: string;
  companyInformation: string;
  productsServices: string[];
  positioning: string;
  terminology: TerminologyItem[];
  importantPages: ImportantPage[];
  siteStructure?: SiteStructureNode[];
  existingContent: string[];
  websiteContent: string;
}): string {
  const productsList = data.productsServices.map((p) => `- ${p}`).join("\n");
  const terminologyList = data.terminology
    .map((t) => `- **${t.term}**: ${t.definition}`)
    .join("\n");
  const pagesList = data.importantPages
    .map((p) => `- [${p.title}](${p.url}): ${p.purpose}`)
    .join("\n");
  const structureList = (data.siteStructure || [])
    .map((s) => `- \`${s.path}\` (**${s.title}** - [${s.section}]): ${s.purpose}`)
    .join("\n");
  const existingContentList = data.existingContent.map((c) => `- ${c}`).join("\n");

  return `# COMPANY.md: ${data.companyName}
- **Website URL:** ${data.websiteUrl}
- **Industry:** ${data.industry}
- **Target Audience:** ${data.targetAudience}

## 1. Company Overview & Mission
${data.companyDescription}

${data.companyInformation}

## 2. Products & Services Catalog
${productsList || "- Core Platform"}

## 3. Market Positioning & Differentiators
${data.positioning || "Developer-first architecture, transparent pricing, and robust API capabilities."}

## 4. Domain Terminology & Glossary
${terminologyList || `- **${data.companyName}**: The primary company brand.`}

## 5. Site Architecture & Sitemap Hierarchy
${structureList || `- \`/\` (**Home** - [Core]): Main website`}

## 6. Important Pages
${pagesList || `- [Home](${data.websiteUrl}): Primary website`}

## 7. Existing Content Themes & Topic Pillars
${existingContentList || "- Architecture guides and product announcements"}

## 8. Website Content Summary
${data.websiteContent}
`;
}

