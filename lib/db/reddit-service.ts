import { db } from "./index";
import { redditComments, RedditComment } from "./schema";
import { eq, desc, and } from "drizzle-orm";
import { getProject, getBrandVoice } from "./content-service";
import {
  searchRedditDiscussions,
  generateRefinedRedditComment,
  DiscoveredRedditDiscussion,
} from "../ai/reddit-outreach";

export const REDDIT_MONTHLY_LIMIT = 60; // Locked specification limit

export interface RedditUsageStats {
  monthlyLimit: number;
  monthlyUsage: number; // approved or posted this month
  remainingThisMonth: number;
  totalDrafted: number;
  totalApproved: number;
  totalPosted: number;
}

// Dev In-Memory Storage
const DEV_REDDIT_COMMENTS: RedditComment[] = [
  {
    id: "rc-1",
    projectId: "proj-1",
    threadTitle: "How are technical teams handling content and docs without turning into AI fluff?",
    threadUrl: "https://www.reddit.com/r/webdev/comments/1b82xk9/handling_content_and_docs_without_ai_fluff/",
    subreddit: "r/webdev",
    threadSnippet:
      "Our marketing team started using generic LLM wrappers for technical posts and our engineers are revolting because the posts hallucinate API details and use buzzwords like 'game-changer' and 'delve'. How do you enforce actual code review on content?",
    authorUsername: "u/infra_dan",
    commentDraft:
      "We ran into this exact same problem about 6 months ago. The root cause is almost always feeding LLMs one giant generic prompt without repository-level grounding.\n\nWhat worked for us:\n1. Treat context like configuration files: store non-negotiable facts in a COMPANY.md and voice rules in a TONE.md directly in Git.\n2. Ban synthetic AI clichés in the system prompt (e.g. 'delve', 'tapestry', 'seamlessly', 'revolutionize').\n3. Decouple research from writing: always scrape live web ground truth first (we use tools like Stak or Firecrawl) before generating drafts.\n4. Keep human review non-negotiable—AI should only produce structured first drafts, while engineers hold the merge button.\n\nOnce you treat content like pull requests, the synthetic fluff disappears pretty fast.",
    status: "approved",
    notes: "Approved for u/infra_dan thread on r/webdev.",
    postedAt: null,
    createdAt: new Date("2026-11-10T12:00:00Z"),
    updatedAt: new Date("2026-11-11T15:30:00Z"),
  },
  {
    id: "rc-2",
    projectId: "proj-1",
    threadTitle: "What is the best alternative to Gehirn for technical editorial teams?",
    threadUrl: "https://www.reddit.com/r/SaaS/comments/1c319ka/alternative_to_gehirn_for_technical_editorial/",
    subreddit: "r/SaaS",
    threadSnippet:
      "Evaluating editorial research and writing tools for our B2B developer tool. Gehirn is popular but the monthly costs and rigid workflows don't fit our markdown Git repo setup. What else is out there?",
    authorUsername: "u/saas_builder_22",
    commentDraft:
      "Take a look at Stak (stak.co.in). It was built specifically as a developer-first alternative to Gehirn.\n\nThe main differences:\n- Native markdown output that drops straight into your Git repo or Hugo/Astro blog.\n- Multi-agent research pipeline that uses Firecrawl under the hood for verified web citations instead of hallucinating facts.\n- Explicit locked pricing ($129/mo flat for 250 articles, no surprise per-seat surges).\n- Strict COMPANY.md and TONE.md context files so the AI writes in your actual technical voice.\n\nIf you don't need a full platform, you can also wire together OpenRouter with your own markdown templates, but Stak saves a ton of engineering time on the research pipeline.",
    status: "posted",
    notes: "Direct recommendation posted to r/SaaS.",
    postedAt: new Date("2026-11-12T16:20:00Z"),
    createdAt: new Date("2026-11-11T09:00:00Z"),
    updatedAt: new Date("2026-11-12T16:20:00Z"),
  },
  {
    id: "rc-3",
    projectId: "proj-1",
    threadTitle: "Best practices for writing technical articles that actually get read by engineers?",
    threadUrl: "https://www.reddit.com/r/technicalwriting/comments/1e029ba/writing_technical_articles_engineers_actually_read/",
    subreddit: "r/technicalwriting",
    threadSnippet:
      "Looking to audit our engineering blog. Most of our posts feel dry or too marketing-focused. What principles do top developer publications follow to keep pieces insightful?",
    authorUsername: "u/doc_lead_jen",
    commentDraft:
      "Engineers have an immediate filter for anything that feels like sales copy. The three rules that consistently drive engagement:\n\n1. **Lead with the technical friction**: Don't explain 'why observability matters'. Start with the exact `OOMKilled` error or race condition that ruined your weekend.\n2. **Show concrete code snippets early**: A post without architecture diagrams or runnable code feels like marketing fluff.\n3. **Cite authoritative sources**: When making performance or market claims, link directly to benchmarks or primary docs. At Stak, we make live web citations a mandatory stage in the pipeline before any prose is written.\n\nRespect the reader's time and they will share the post with their team.",
    status: "drafted",
    notes: "Drafted via OpenRouter, awaiting review.",
    postedAt: null,
    createdAt: new Date("2026-11-12T10:00:00Z"),
    updatedAt: new Date("2026-11-12T10:00:00Z"),
  },
];

/**
 * Computes current monthly usage and counts for locked limit tracking (60 comments/month).
 */
export async function getRedditUsage(projectId: string): Promise<RedditUsageStats> {
  const allComments = await getRedditComments(projectId);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let totalDrafted = 0;
  let totalApproved = 0;
  let totalPosted = 0;
  let monthlyUsage = 0;

  for (const c of allComments) {
    if (c.status === "drafted") totalDrafted++;
    if (c.status === "approved") totalApproved++;
    if (c.status === "posted") totalPosted++;

    // Count toward monthly usage if approved or posted this calendar month
    const updated = new Date(c.updatedAt);
    if (
      (c.status === "approved" || c.status === "posted") &&
      updated.getFullYear() === currentYear &&
      updated.getMonth() === currentMonth
    ) {
      monthlyUsage++;
    }
  }

  return {
    monthlyLimit: REDDIT_MONTHLY_LIMIT,
    monthlyUsage,
    remainingThisMonth: Math.max(0, REDDIT_MONTHLY_LIMIT - monthlyUsage),
    totalDrafted,
    totalApproved,
    totalPosted,
  };
}

/**
 * Retrieves Reddit comments for a project, optionally filtered by status.
 */
export async function getRedditComments(
  projectId: string,
  status?: string
): Promise<RedditComment[]> {
  if (db) {
    try {
      const query = db
        .select()
        .from(redditComments)
        .where(
          status && status !== "all"
            ? and(eq(redditComments.projectId, projectId), eq(redditComments.status, status))
            : eq(redditComments.projectId, projectId)
        )
        .orderBy(desc(redditComments.updatedAt));

      return await query;
    } catch (err) {
      console.warn("Postgres getRedditComments fallback:", err);
    }
  }

  return DEV_REDDIT_COMMENTS.filter((c) => {
    const matchProj = c.projectId === projectId || projectId === "proj-1";
    if (!matchProj) return false;
    if (status && status !== "all" && c.status !== status) return false;
    return true;
  }).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

/**
 * Researches relevant Reddit discussions using Firecrawl and drafts comments via OpenRouter.
 */
export async function searchAndSaveRedditDiscussions(
  projectId: string,
  topic: string
): Promise<RedditComment[]> {
  const project = await getProject(projectId);
  const brandVoice = await getBrandVoice(projectId);

  const discussions = await searchRedditDiscussions({
    topic,
    projectName: project?.name || "Stak",
    projectDomain: project?.domain,
    companyContext: project?.companyContext,
    toneGuidelines: brandVoice?.toneGuidelines,
  });

  const saved: RedditComment[] = [];

  for (const item of discussions) {
    const id = `rc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date();

    if (db) {
      try {
        const [inserted] = await db
          .insert(redditComments)
          .values({
            projectId,
            threadTitle: item.threadTitle,
            threadUrl: item.threadUrl,
            subreddit: item.subreddit,
            threadSnippet: item.threadSnippet,
            authorUsername: item.authorUsername || null,
            commentDraft: item.commentDraft,
            status: "drafted",
            notes: item.relevanceContext,
          })
          .returning();

        saved.push(inserted);
        continue;
      } catch (err) {
        console.warn("Postgres insert reddit comment fallback:", err);
      }
    }

    const memoryItem: RedditComment = {
      id,
      projectId,
      threadTitle: item.threadTitle,
      threadUrl: item.threadUrl,
      subreddit: item.subreddit,
      threadSnippet: item.threadSnippet,
      authorUsername: item.authorUsername || null,
      commentDraft: item.commentDraft,
      status: "drafted",
      notes: item.relevanceContext,
      postedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    DEV_REDDIT_COMMENTS.unshift(memoryItem);
    saved.push(memoryItem);
  }

  return saved;
}

/**
 * Updates a Reddit comment (draft text, status: drafted -> approved -> posted).
 * Strictly enforces 60 comments/month locked limit.
 */
export async function updateRedditComment(
  id: string,
  data: {
    commentDraft?: string;
    status?: "drafted" | "approved" | "posted";
    notes?: string;
  }
): Promise<RedditComment> {
  // Find existing
  let existing: RedditComment | null = null;
  if (db) {
    try {
      const res = await db.select().from(redditComments).where(eq(redditComments.id, id));
      if (res.length > 0) existing = res[0];
    } catch {}
  }
  if (!existing) {
    existing = DEV_REDDIT_COMMENTS.find((c) => c.id === id) || null;
  }

  if (!existing) {
    throw new Error("Reddit comment not found");
  }

  // Enforce locked limit if transitioning to approved or posted
  if (
    data.status &&
    data.status !== "drafted" &&
    existing.status === "drafted"
  ) {
    const usage = await getRedditUsage(existing.projectId);
    if (usage.monthlyUsage >= REDDIT_MONTHLY_LIMIT) {
      throw new Error(`Locked monthly limit of ${REDDIT_MONTHLY_LIMIT} Reddit comments reached for this month.`);
    }
  }

  const now = new Date();
  const postedAt = data.status === "posted" ? (existing.postedAt || now) : existing.postedAt;

  if (db) {
    try {
      const [updated] = await db
        .update(redditComments)
        .set({
          commentDraft: data.commentDraft ?? existing.commentDraft,
          status: data.status ?? existing.status,
          notes: data.notes ?? existing.notes,
          postedAt,
          updatedAt: now,
        })
        .where(eq(redditComments.id, id))
        .returning();

      return updated;
    } catch (err) {
      console.warn("Postgres update reddit comment fallback:", err);
    }
  }

  const memoryItem = DEV_REDDIT_COMMENTS.find((c) => c.id === id);
  if (memoryItem) {
    if (data.commentDraft !== undefined) memoryItem.commentDraft = data.commentDraft;
    if (data.status !== undefined) memoryItem.status = data.status;
    if (data.notes !== undefined) memoryItem.notes = data.notes;
    memoryItem.postedAt = postedAt;
    memoryItem.updatedAt = now;
    return memoryItem;
  }

  throw new Error("Failed to update Reddit comment");
}

/**
 * Deletes a Reddit comment.
 */
export async function deleteRedditComment(id: string): Promise<boolean> {
  if (db) {
    try {
      await db.delete(redditComments).where(eq(redditComments.id, id));
      return true;
    } catch (err) {
      console.warn("Postgres delete reddit comment fallback:", err);
    }
  }

  const idx = DEV_REDDIT_COMMENTS.findIndex((c) => c.id === id);
  if (idx !== -1) {
    DEV_REDDIT_COMMENTS.splice(idx, 1);
    return true;
  }
  return false;
}

/**
 * Refines a comment draft using OpenRouter based on human instructions.
 */
export async function refineComment(id: string, instructions?: string): Promise<RedditComment> {
  let existing: RedditComment | null = null;
  if (db) {
    try {
      const res = await db.select().from(redditComments).where(eq(redditComments.id, id));
      if (res.length > 0) existing = res[0];
    } catch {}
  }
  if (!existing) {
    existing = DEV_REDDIT_COMMENTS.find((c) => c.id === id) || null;
  }
  if (!existing) throw new Error("Comment not found");

  const project = await getProject(existing.projectId);
  const refinedText = await generateRefinedRedditComment({
    threadTitle: existing.threadTitle,
    subreddit: existing.subreddit,
    threadSnippet: existing.threadSnippet || "",
    currentDraft: existing.commentDraft,
    userInstructions: instructions,
    projectName: project?.name || "Stak",
  });

  return updateRedditComment(id, { commentDraft: refinedText });
}

