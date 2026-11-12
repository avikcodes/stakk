import { db } from "./index";
import {
  backlinkOpportunities,
  backlinkCommunityMembers,
  backlinkCollaborations,
  BacklinkOpportunity,
  BacklinkCommunityMember,
  BacklinkCollaboration,
} from "./schema";
import { eq, desc, and } from "drizzle-orm";
import { getProject, getArticles } from "./content-service";
import {
  discoverBacklinkOpportunities,
  generateCollaborationPitch,
  DiscoveredBacklinkOpportunity,
} from "../ai/backlinks";

// Dev In-Memory Storage for Community Members
const DEV_COMMUNITY_MEMBERS: BacklinkCommunityMember[] = [
  {
    id: "cm-1",
    name: "Cloud Native Weekly",
    domain: "cloudnativeweekly.dev",
    niche: "DevOps & Cloud Infrastructure",
    collaborationType: "Contextual Link Exchange",
    editorialGuidelines:
      "Accepts contextual links and citations in weekly technical deep dives. Requires technical markdown formatting and zero sales fluff.",
    status: "open",
    verified: true,
    contactEmail: "editor@cloudnativeweekly.dev",
    createdAt: new Date("2026-10-15T00:00:00Z"),
  },
  {
    id: "cm-2",
    name: "The Pragmatic Architect",
    domain: "pragmaticarchitect.io",
    niche: "Software Engineering & Architecture",
    collaborationType: "Editorial Co-citation",
    editorialGuidelines:
      "Looking for case studies and architectural blueprints on scaling developer tooling. Open to reciprocal resource link exchanges.",
    status: "active",
    verified: true,
    contactEmail: "alex@pragmaticarchitect.io",
    createdAt: new Date("2026-10-20T00:00:00Z"),
  },
  {
    id: "cm-3",
    name: "NextDev Dispatch",
    domain: "nextdevdispatch.com",
    niche: "Modern Web & TypeScript Ecosystem",
    collaborationType: "Resource Guide Inclusion",
    editorialGuidelines:
      "Curates modern developer-first tooling for technical founders. Actively accepts verified product guides and deep dives.",
    status: "open",
    verified: true,
    contactEmail: "collab@nextdevdispatch.com",
    createdAt: new Date("2026-11-01T00:00:00Z"),
  },
  {
    id: "cm-4",
    name: "B2B Product Digest",
    domain: "b2bproductdigest.com",
    niche: "B2B SaaS Growth & Content Strategy",
    collaborationType: "Guest Opinion & Citation",
    editorialGuidelines:
      "Editorial publication covering human-in-the-loop workflows, content engines, and SaaS positioning. Open to collaborative thought pieces.",
    status: "open",
    verified: true,
    contactEmail: "editorial@b2bproductdigest.com",
    createdAt: new Date("2026-11-04T00:00:00Z"),
  },
  {
    id: "cm-5",
    name: "Technical Writing Guild",
    domain: "techwritingguild.org",
    niche: "Documentation & Editorial Ops",
    collaborationType: "Contextual Reference Exchange",
    editorialGuidelines:
      "Publishes guidelines on TONE.md, styleguides, and preventing hallucinations in AI documentation. Welcomes authoritative references.",
    status: "active",
    verified: true,
    contactEmail: "community@techwritingguild.org",
    createdAt: new Date("2026-11-06T00:00:00Z"),
  },
];

// Dev In-Memory Storage for Opportunities
const DEV_OPPORTUNITIES: BacklinkOpportunity[] = [
  {
    id: "bo-1",
    projectId: "proj-1",
    targetUrl: "https://pragmaticarchitect.io/guides/modern-editorial-tooling-for-devs",
    targetDomain: "pragmaticarchitect.io",
    pageTitle: "Modern Editorial Tooling & Architecture for Technical Teams (2026)",
    niche: "Software Engineering & Architecture",
    relevanceScore: "direct",
    recommendedAnchor: "Stak editorial intelligence",
    suggestedContext: "In the section discussing markdown-first alternatives to WordPress and Notion, cite Stak as a live research-grounded platform.",
    matchedArticleId: null,
    matchedArticleTitle: "Structuring Pages for SEO, AEO, and GEO",
    status: "discovered",
    liveResearchSnippet: "Engineering teams increasingly reject heavyweight CMS platforms in favor of Git-backed markdown pipelines that enforce code review standards for editorial content.",
    pitchDraft: "Hi Alex,\n\nLoved your recent breakdown on modern editorial tooling for developers on pragmaticarchitect.io. In your section on markdown pipelines, we built Stak specifically around Firecrawl live citations and repo-level TONE.md context.\n\nWe have a deep writeup on 'Structuring Pages for SEO, AEO, and GEO' that expands on the principles you outlined. Would you be open to a reference or co-citation? Happy to feature your guide on our site as well.\n\nBest,\nEditorial Lead at Stak",
    createdAt: new Date("2026-11-10T11:00:00Z"),
    updatedAt: new Date("2026-11-10T11:00:00Z"),
  },
  {
    id: "bo-2",
    projectId: "proj-1",
    targetUrl: "https://cloudnativeweekly.dev/issues/142-content-ops-for-infrastructure",
    targetDomain: "cloudnativeweekly.dev",
    pageTitle: "Issue #142: Content Operations & Documentation for Infra Engineers",
    niche: "DevOps & Cloud Native",
    relevanceScore: "high",
    recommendedAnchor: "markdown context files (COMPANY.md & TONE.md)",
    suggestedContext: "In the tools showcase discussing how to eliminate AI hallucinations in technical documentation.",
    matchedArticleId: null,
    matchedArticleTitle: "COMPANY.md and TONE.md for Brand-Aligned AI Content",
    status: "contacted",
    liveResearchSnippet: "Technical documentation leads are standardizing repo-level markdown rulebooks to eliminate generic synthetic prose from LLM documentation drafts.",
    pitchDraft: "Hi Cloud Native Weekly team,\n\nReading Issue #142 today—especially the notes on documentation standards. At Stak, we pioneered the COMPANY.md & TONE.md repo pattern to ensure factual grounding in technical writing.\n\nWould love to suggest our breakdown on this for your next curated resources section. Let me know what you think!\n\nBest,\nStak Team",
    createdAt: new Date("2026-11-11T14:30:00Z"),
    updatedAt: new Date("2026-11-12T09:15:00Z"),
  },
  {
    id: "bo-3",
    projectId: "proj-1",
    targetUrl: "https://b2bproductdigest.com/articles/human-in-the-loop-ai-workflows",
    targetDomain: "b2bproductdigest.com",
    pageTitle: "Human-in-the-Loop Content Workflows for High-Touch B2B SaaS",
    niche: "B2B SaaS Strategy",
    relevanceScore: "high",
    recommendedAnchor: "Stak human review pipeline",
    suggestedContext: "In the comparison between fully automated AI spam generators vs. high-touch human-in-the-loop editorial platforms.",
    matchedArticleId: null,
    matchedArticleTitle: "Multi-Agent Research and Human-in-the-Loop Review",
    status: "linked",
    liveResearchSnippet: "The winning enterprise content strategy in 2026 is human-in-the-loop validation: AI stages handle research and structure, while human editors maintain taste and factual veto.",
    pitchDraft: "Hi Sarah,\n\nYour recent analysis on human-in-the-loop workflows on b2bproductdigest.com was spot on. We've implemented this exact 8-stage sequence at Stak to protect domain authority from generic automated fluff.\n\nIf you're updating the piece or compiling a follow-up case study, we'd love to share our benchmark data.\n\nCheers,\nStak",
    createdAt: new Date("2026-11-09T08:00:00Z"),
    updatedAt: new Date("2026-11-12T17:00:00Z"),
  },
];

// Dev In-Memory Storage for Collaborations
const DEV_COLLABORATIONS: Array<BacklinkCollaboration & { communityMemberName?: string; communityMemberDomain?: string }> = [
  {
    id: "collab-1",
    projectId: "proj-1",
    communityMemberId: "cm-1",
    articleId: null,
    proposedUrl: "https://cloudnativeweekly.dev/issues/142-content-ops-for-infrastructure",
    collaborationType: "Contextual Link Exchange",
    pitchMessage:
      "Hi Cloud Native Weekly editorial team, we'd love to feature your recent issue in our upcoming developer resources digest in exchange for citing our COMPANY.md & TONE.md guide in your documentation section.",
    status: "proposed",
    createdAt: new Date("2026-11-11T14:40:00Z"),
    updatedAt: new Date("2026-11-11T14:40:00Z"),
  },
];

/**
 * Retrieves all backlink opportunities for a project.
 */
export async function getBacklinkOpportunities(projectId: string): Promise<BacklinkOpportunity[]> {
  if (db) {
    try {
      const items = await db
        .select()
        .from(backlinkOpportunities)
        .where(eq(backlinkOpportunities.projectId, projectId))
        .orderBy(desc(backlinkOpportunities.updatedAt));

      return items;
    } catch (err) {
      console.warn("Postgres fetch backlink opportunities fallback:", err);
    }
  }

  return DEV_OPPORTUNITIES.filter(
    (o) => o.projectId === projectId || projectId === "proj-1"
  ).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

/**
 * Discovers and records new backlink opportunities using Firecrawl live web research and OpenRouter analysis.
 */
export async function discoverAndSaveBacklinkOpportunities(
  projectId: string,
  topicOrQuery: string
): Promise<BacklinkOpportunity[]> {
  const project = await getProject(projectId);
  const articles = await getArticles(projectId);

  const discovered = await discoverBacklinkOpportunities({
    topicOrQuery,
    projectName: project?.name || "Stak",
    projectDomain: project?.domain,
    companyContext: project?.companyContext,
    articles: articles.map((a) => ({ id: a.id, title: a.title })),
  });

  const saved: BacklinkOpportunity[] = [];

  for (const item of discovered) {
    const oppId = `bo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date();

    if (db) {
      try {
        const [inserted] = await db
          .insert(backlinkOpportunities)
          .values({
            projectId,
            targetUrl: item.targetUrl,
            targetDomain: item.targetDomain,
            pageTitle: item.pageTitle,
            niche: item.niche,
            relevanceScore: item.relevanceScore,
            recommendedAnchor: item.recommendedAnchor,
            suggestedContext: item.suggestedContext,
            matchedArticleTitle: item.matchedArticleTitle,
            liveResearchSnippet: item.liveResearchSnippet,
            pitchDraft: item.pitchDraft,
            status: "discovered",
          })
          .returning();

        saved.push(inserted);
        continue;
      } catch (err) {
        console.warn("Postgres insert opportunity failed, saving in memory:", err);
      }
    }

    const memoryItem: BacklinkOpportunity = {
      id: oppId,
      projectId,
      targetUrl: item.targetUrl,
      targetDomain: item.targetDomain,
      pageTitle: item.pageTitle,
      niche: item.niche,
      relevanceScore: item.relevanceScore,
      recommendedAnchor: item.recommendedAnchor,
      suggestedContext: item.suggestedContext,
      matchedArticleId: null,
      matchedArticleTitle: item.matchedArticleTitle || null,
      status: "discovered",
      liveResearchSnippet: item.liveResearchSnippet,
      pitchDraft: item.pitchDraft,
      createdAt: now,
      updatedAt: now,
    };
    DEV_OPPORTUNITIES.unshift(memoryItem);
    saved.push(memoryItem);
  }

  return saved;
}

/**
 * Updates an opportunity's status (discovered, contacted, linked, archived).
 */
export async function updateOpportunityStatus(
  id: string,
  status: "discovered" | "contacted" | "linked" | "archived"
): Promise<boolean> {
  const now = new Date();
  if (db) {
    try {
      await db
        .update(backlinkOpportunities)
        .set({ status, updatedAt: now })
        .where(eq(backlinkOpportunities.id, id));
      return true;
    } catch (err) {
      console.warn("Postgres update opportunity fallback:", err);
    }
  }

  const opp = DEV_OPPORTUNITIES.find((o) => o.id === id);
  if (opp) {
    opp.status = status;
    opp.updatedAt = now;
    return true;
  }
  return false;
}

/**
 * Deletes a backlink opportunity.
 */
export async function deleteOpportunity(id: string): Promise<boolean> {
  if (db) {
    try {
      await db.delete(backlinkOpportunities).where(eq(backlinkOpportunities.id, id));
      return true;
    } catch (err) {
      console.warn("Postgres delete opportunity fallback:", err);
    }
  }

  const idx = DEV_OPPORTUNITIES.findIndex((o) => o.id === id);
  if (idx !== -1) {
    DEV_OPPORTUNITIES.splice(idx, 1);
    return true;
  }
  return false;
}

/**
 * Retrieves verified publisher community members.
 */
export async function getCommunityMembers(): Promise<BacklinkCommunityMember[]> {
  if (db) {
    try {
      const members = await db.select().from(backlinkCommunityMembers);
      if (members.length > 0) return members;
    } catch (err) {
      console.warn("Postgres getCommunityMembers fallback:", err);
    }
  }
  return DEV_COMMUNITY_MEMBERS;
}

/**
 * Retrieves community collaboration requests for a project.
 */
export async function getCollaborations(projectId: string): Promise<Array<BacklinkCollaboration & { communityMember?: BacklinkCommunityMember }>> {
  const members = await getCommunityMembers();

  if (db) {
    try {
      const collabs = await db
        .select()
        .from(backlinkCollaborations)
        .where(eq(backlinkCollaborations.projectId, projectId))
        .orderBy(desc(backlinkCollaborations.updatedAt));

      return collabs.map((c) => ({
        ...c,
        communityMember: members.find((m) => m.id === c.communityMemberId),
      }));
    } catch (err) {
      console.warn("Postgres getCollaborations fallback:", err);
    }
  }

  return DEV_COLLABORATIONS.filter(
    (c) => c.projectId === projectId || projectId === "proj-1"
  ).map((c) => ({
    ...c,
    communityMember: members.find((m) => m.id === c.communityMemberId),
  }));
}

/**
 * Creates a community collaboration proposal.
 */
export async function createCollaboration(data: {
  projectId: string;
  communityMemberId: string;
  articleId?: string | null;
  proposedUrl: string;
  collaborationType: string;
  pitchMessage: string;
}): Promise<BacklinkCollaboration> {
  const now = new Date();
  const id = `collab-${Date.now()}`;

  if (db) {
    try {
      const [inserted] = await db
        .insert(backlinkCollaborations)
        .values({
          projectId: data.projectId,
          communityMemberId: data.communityMemberId,
          articleId: data.articleId || null,
          proposedUrl: data.proposedUrl,
          collaborationType: data.collaborationType,
          pitchMessage: data.pitchMessage,
          status: "proposed",
        })
        .returning();

      return inserted;
    } catch (err) {
      console.warn("Postgres insert collaboration failed, using memory:", err);
    }
  }

  const memoryCollab: BacklinkCollaboration = {
    id,
    projectId: data.projectId,
    communityMemberId: data.communityMemberId,
    articleId: data.articleId || null,
    proposedUrl: data.proposedUrl,
    collaborationType: data.collaborationType,
    pitchMessage: data.pitchMessage,
    status: "proposed",
    createdAt: now,
    updatedAt: now,
  };
  DEV_COLLABORATIONS.unshift(memoryCollab);
  return memoryCollab;
}

/**
 * Updates collaboration status (proposed, accepted, published, declined).
 */
export async function updateCollaborationStatus(
  id: string,
  status: "proposed" | "accepted" | "published" | "declined"
): Promise<boolean> {
  const now = new Date();
  if (db) {
    try {
      await db
        .update(backlinkCollaborations)
        .set({ status, updatedAt: now })
        .where(eq(backlinkCollaborations.id, id));
      return true;
    } catch (err) {
      console.warn("Postgres update collaboration fallback:", err);
    }
  }

  const c = DEV_COLLABORATIONS.find((item) => item.id === id);
  if (c) {
    c.status = status;
    c.updatedAt = now;
    return true;
  }
  return false;
}

