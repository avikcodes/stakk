import { pgTable, text, timestamp, integer, uuid, pgEnum, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const articleStatusEnum = pgEnum("article_status", [
  "draft",
  "in_review",
  "published",
]);

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  domain: text("domain"),
  description: text("description"),
  companyContext: text("company_context"), // COMPANY.md & facts
  industry: text("industry"),
  targetAudience: text("target_audience"),
  productsServices: text("products_services"),
  monthlyArticleLimit: integer("monthly_article_limit").default(250).notNull(),
  articlesThisMonth: integer("articles_this_month").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const projectBrandContexts = pgTable("project_brand_contexts", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  websiteUrl: text("website_url").notNull(),
  companyName: text("company_name").notNull(),
  companyDescription: text("company_description"),
  industry: text("industry"),
  targetAudience: text("target_audience"),
  productsServices: text("products_services"), // JSON array or text list
  websiteContent: text("website_content"), // Crawled website content summary
  companyInformation: text("company_information"), // Company overview, mission, key facts
  importantPages: text("important_pages"), // JSON array of [{ title, url, purpose }]
  siteStructure: text("site_structure"), // JSON array of sitemap / site hierarchy [{ path, title, section, depth, purpose }]
  terminology: text("terminology"), // JSON array of [{ term, definition }]
  positioning: text("positioning"), // Market positioning & stance
  existingContent: text("existing_content"), // JSON array of existing content topics
  companyContextMarkdown: text("company_context_markdown"), // Full synthesized COMPANY.md
  crawlStatus: text("crawl_status").default("completed").notNull(), // "crawling" | "completed" | "failed"
  crawledPagesCount: integer("crawled_pages_count").default(1).notNull(),
  crawledAt: timestamp("crawled_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const brandVoice = pgTable("brand_voice", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  writingStyle: text("writing_style"),
  tone: text("tone"),
  terminology: text("terminology"), // JSON array of [{ term, definition, usage }]
  sentenceStyle: text("sentence_style"),
  preferredVocabulary: text("preferred_vocabulary"), // JSON array or list of preferred words
  brandPositioning: text("brand_positioning"),
  productLanguage: text("product_language"),
  audienceLanguage: text("audience_language"),
  toneGuidelines: text("tone_guidelines"), // Full authoritative TONE.md
  bannedPhrases: text("banned_phrases"), // Comma-separated list of clichés
  styleRules: text("style_rules"),
  status: text("status").default("approved").notNull(), // "draft" | "approved"
  analyzedSourcesCount: integer("analyzed_sources_count").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const articles = pgTable("articles", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  slug: text("slug"),
  content: text("content").default("").notNull(),
  status: articleStatusEnum("status").default("draft").notNull(),
  wordCount: integer("word_count").default(0).notNull(),
  workflowStage: text("workflow_stage").default("validate").notNull(),
  workflowData: text("workflow_data"), // Serialized JSON of all intermediate stage results
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const articleContext = pgTable("article_context", {
  id: uuid("id").defaultRandom().primaryKey(),
  articleId: uuid("article_id")
    .references(() => articles.id, { onDelete: "cascade" })
    .notNull(),
  targetKeywords: text("target_keywords"),
  researchBrief: text("research_brief"),
  outline: text("outline"),
  sources: text("sources"),
  humanReviewNotes: text("human_review_notes"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const savedKeywords = pgTable("saved_keywords", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  keyword: text("keyword").notNull(),
  intent: text("intent").default("informational").notNull(), // informational, commercial, transactional, navigational
  difficulty: text("difficulty").default("medium").notNull(), // low, medium, high
  opportunityScore: integer("opportunity_score").default(80).notNull(), // 1-100
  trend: text("trend").default("rising").notNull(), // rising, breakout, stable, etc.
  topicCluster: text("topic_cluster"),
  notes: text("notes"),
  sourceQuery: text("source_query"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const keywordResearchRuns = pgTable("keyword_research_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  query: text("query").notNull(),
  queryType: text("query_type").default("topic").notNull(), // "topic" | "keyword"
  rawWebResults: text("raw_web_results"), // JSON string of live Firecrawl results
  analysisResult: text("analysis_result").notNull(), // JSON string of OpenRouter synthesis
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const multiAgentResearch = pgTable("multi_agent_research", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  topic: text("topic").notNull(),
  keyword: text("keyword"),
  instructions: text("instructions"),
  status: text("status").default("completed").notNull(), // "running" | "completed" | "failed"
  currentStage: text("current_stage").default("synthesis").notNull(),
  stagesData: text("stages_data").notNull(), // JSON string storing intermediate agent outputs
  findings: text("findings"), // Key research findings
  facts: text("facts"), // Important facts & figures
  sources: text("sources"), // JSON array of citations from Firecrawl
  marketInsights: text("market_insights"),
  topicAngles: text("topic_angles"),
  contentIdeas: text("content_ideas"),
  opportunities: text("opportunities"),
  synthesizedDossier: text("synthesized_dossier").notNull(), // Final markdown research brief
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const trackedPrompts = pgTable("tracked_prompts", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  promptText: text("prompt_text").notNull(),
  targetBrand: text("target_brand").notNull(),
  knownCompetitors: text("known_competitors"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const llmTrackingRuns = pgTable("llm_tracking_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  promptId: uuid("prompt_id")
    .references(() => trackedPrompts.id, { onDelete: "cascade" })
    .notNull(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  model: text("model").default("google/gemini-2.0-flash-001").notNull(),
  aiResponse: text("ai_response").notNull(),
  brandMentioned: boolean("brand_mentioned").default(false).notNull(),
  brandMentionContext: text("brand_mention_context"),
  competingBrandsDetected: text("competing_brands_detected"), // JSON array string of detected competitors
  status: text("status").default("completed").notNull(), // "completed" | "failed"
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const brandInterpretations = pgTable("brand_interpretations", {
  id: uuid("id").defaultRandom().primaryKey(),
  runId: uuid("run_id")
    .references(() => llmTrackingRuns.id, { onDelete: "cascade" })
    .notNull(),
  promptId: uuid("prompt_id")
    .references(() => trackedPrompts.id, { onDelete: "cascade" })
    .notNull(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  brandName: text("brand_name").notNull(),
  brandDescription: text("brand_description").notNull(),
  productsServices: text("products_services").notNull(), // JSON array string
  positioning: text("positioning").notNull(),
  audienceInterpretation: text("audience_interpretation").notNull(),
  competitorsMentioned: text("competitors_mentioned").notNull(), // JSON array string
  strengths: text("strengths").notNull(), // JSON array string
  weaknesses: text("weaknesses").notNull(), // JSON array string
  notableChanges: text("notable_changes").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const backlinkOpportunities = pgTable("backlink_opportunities", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  targetUrl: text("target_url").notNull(),
  targetDomain: text("target_domain").notNull(),
  pageTitle: text("page_title").notNull(),
  niche: text("niche").notNull(),
  relevanceScore: text("relevance_score").default("high").notNull(), // "direct" | "high" | "relevant"
  recommendedAnchor: text("recommended_anchor"),
  suggestedContext: text("suggested_context"),
  matchedArticleId: uuid("matched_article_id"),
  matchedArticleTitle: text("matched_article_title"),
  status: text("status").default("discovered").notNull(), // "discovered" | "contacted" | "linked" | "archived"
  liveResearchSnippet: text("live_research_snippet"),
  pitchDraft: text("pitch_draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const backlinkCommunityMembers = pgTable("backlink_community_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  domain: text("domain").notNull(),
  niche: text("niche").notNull(),
  collaborationType: text("collaboration_type").default("Contextual Link Exchange").notNull(),
  editorialGuidelines: text("editorial_guidelines").notNull(),
  status: text("status").default("open").notNull(), // "open" | "active" | "reviewing"
  verified: boolean("verified").default(true).notNull(),
  contactEmail: text("contact_email"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const backlinkCollaborations = pgTable("backlink_collaborations", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  communityMemberId: uuid("community_member_id")
    .references(() => backlinkCommunityMembers.id, { onDelete: "cascade" })
    .notNull(),
  articleId: uuid("article_id"),
  proposedUrl: text("proposed_url").notNull(),
  collaborationType: text("collaboration_type").notNull(),
  pitchMessage: text("pitch_message").notNull(),
  status: text("status").default("proposed").notNull(), // "proposed" | "accepted" | "published" | "declined"
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const redditComments = pgTable("reddit_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  threadTitle: text("thread_title").notNull(),
  threadUrl: text("thread_url").notNull(),
  subreddit: text("subreddit").notNull(), // e.g. "r/webdev", "r/SaaS"
  threadSnippet: text("thread_snippet"), // OP post content / discussion context
  authorUsername: text("author_username"),
  commentDraft: text("comment_draft").notNull(),
  status: text("status").default("drafted").notNull(), // "drafted" | "approved" | "posted"
  notes: text("notes"),
  postedAt: timestamp("posted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Exactly eight supported publishing integrations
export const SUPPORTED_INTEGRATIONS = [
  "strapi",
  "github",
  "wordpress",
  "sanity",
  "contentful",
  "webflow",
  "ghost",
  "contao",
] as const;

export type SupportedIntegrationType = (typeof SUPPORTED_INTEGRATIONS)[number];

export const publishingIntegrations = pgTable("publishing_integrations", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  integrationType: text("integration_type").notNull(), // "strapi" | "github" | "wordpress" | "sanity" | "contentful" | "webflow" | "ghost" | "contao"
  connectionStatus: text("connection_status").default("disconnected").notNull(), // "connected" | "disconnected" | "error"
  configuration: text("configuration"), // Non-sensitive config: siteUrl, repo, branch, contentPath, spaceId, dataset, environment
  encryptedCredentials: text("encrypted_credentials"), // AES-256-GCM encrypted server-side JSON string
  lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const articlePublications = pgTable("article_publications", {
  id: uuid("id").defaultRandom().primaryKey(),
  articleId: uuid("article_id")
    .references(() => articles.id, { onDelete: "cascade" })
    .notNull(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  integrationType: text("integration_type").notNull(), // "strapi" | "github" | "wordpress" | "sanity" | "contentful" | "webflow" | "ghost" | "contao"
  status: text("status").notNull(), // "success" | "failed"
  publishedUrl: text("published_url"),
  remoteId: text("remote_id"),
  publishingOptions: text("publishing_options"), // JSON string
  errorMessage: text("error_message"),
  publishedAt: timestamp("published_at", { withTimezone: true }).defaultNow().notNull(),
});

// Relations
export const projectsRelations = relations(projects, ({ one, many }) => ({
  articles: many(articles),
  savedKeywords: many(savedKeywords),
  researchRuns: many(keywordResearchRuns),
  multiAgentResearch: many(multiAgentResearch),
  trackedPrompts: many(trackedPrompts),
  llmTrackingRuns: many(llmTrackingRuns),
  brandInterpretations: many(brandInterpretations),
  backlinkOpportunities: many(backlinkOpportunities),
  backlinkCollaborations: many(backlinkCollaborations),
  redditComments: many(redditComments),
  publishingIntegrations: many(publishingIntegrations),
  articlePublications: many(articlePublications),
  brandVoice: one(brandVoice, {
    fields: [projects.id],
    references: [brandVoice.projectId],
  }),
}));

export const redditCommentsRelations = relations(redditComments, ({ one }) => ({
  project: one(projects, {
    fields: [redditComments.projectId],
    references: [projects.id],
  }),
}));

export const backlinkOpportunitiesRelations = relations(backlinkOpportunities, ({ one }) => ({
  project: one(projects, {
    fields: [backlinkOpportunities.projectId],
    references: [projects.id],
  }),
}));

export const backlinkCommunityMembersRelations = relations(backlinkCommunityMembers, ({ many }) => ({
  collaborations: many(backlinkCollaborations),
}));

export const backlinkCollaborationsRelations = relations(backlinkCollaborations, ({ one }) => ({
  project: one(projects, {
    fields: [backlinkCollaborations.projectId],
    references: [projects.id],
  }),
  communityMember: one(backlinkCommunityMembers, {
    fields: [backlinkCollaborations.communityMemberId],
    references: [backlinkCommunityMembers.id],
  }),
}));

export const trackedPromptsRelations = relations(trackedPrompts, ({ one, many }) => ({
  project: one(projects, {
    fields: [trackedPrompts.projectId],
    references: [projects.id],
  }),
  runs: many(llmTrackingRuns),
  interpretations: many(brandInterpretations),
}));

export const llmTrackingRunsRelations = relations(llmTrackingRuns, ({ one }) => ({
  project: one(projects, {
    fields: [llmTrackingRuns.projectId],
    references: [projects.id],
  }),
  prompt: one(trackedPrompts, {
    fields: [llmTrackingRuns.promptId],
    references: [trackedPrompts.id],
  }),
  interpretation: one(brandInterpretations, {
    fields: [llmTrackingRuns.id],
    references: [brandInterpretations.runId],
  }),
}));

export const brandInterpretationsRelations = relations(brandInterpretations, ({ one }) => ({
  run: one(llmTrackingRuns, {
    fields: [brandInterpretations.runId],
    references: [llmTrackingRuns.id],
  }),
  prompt: one(trackedPrompts, {
    fields: [brandInterpretations.promptId],
    references: [trackedPrompts.id],
  }),
  project: one(projects, {
    fields: [brandInterpretations.projectId],
    references: [projects.id],
  }),
}));

export const multiAgentResearchRelations = relations(multiAgentResearch, ({ one }) => ({
  project: one(projects, {
    fields: [multiAgentResearch.projectId],
    references: [projects.id],
  }),
}));

export const savedKeywordsRelations = relations(savedKeywords, ({ one }) => ({
  project: one(projects, {
    fields: [savedKeywords.projectId],
    references: [projects.id],
  }),
}));

export const keywordResearchRunsRelations = relations(keywordResearchRuns, ({ one }) => ({
  project: one(projects, {
    fields: [keywordResearchRuns.projectId],
    references: [projects.id],
  }),
}));

export const articlesRelations = relations(articles, ({ one, many }) => ({
  project: one(projects, {
    fields: [articles.projectId],
    references: [projects.id],
  }),
  context: one(articleContext, {
    fields: [articles.id],
    references: [articleContext.articleId],
  }),
  publications: many(articlePublications),
}));

export const brandVoiceRelations = relations(brandVoice, ({ one }) => ({
  project: one(projects, {
    fields: [brandVoice.projectId],
    references: [projects.id],
  }),
}));

export const articleContextRelations = relations(articleContext, ({ one }) => ({
  article: one(articles, {
    fields: [articleContext.articleId],
    references: [articles.id],
  }),
}));

export const publishingIntegrationsRelations = relations(publishingIntegrations, ({ one }) => ({
  project: one(projects, {
    fields: [publishingIntegrations.projectId],
    references: [projects.id],
  }),
}));

export const articlePublicationsRelations = relations(articlePublications, ({ one }) => ({
  article: one(articles, {
    fields: [articlePublications.articleId],
    references: [articles.id],
  }),
  project: one(projects, {
    fields: [articlePublications.projectId],
    references: [projects.id],
  }),
}));

export const projectBrandContextsRelations = relations(projectBrandContexts, ({ one }) => ({
  project: one(projects, {
    fields: [projectBrandContexts.projectId],
    references: [projects.id],
  }),
}));

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ProjectBrandContext = typeof projectBrandContexts.$inferSelect;
export type NewProjectBrandContext = typeof projectBrandContexts.$inferInsert;
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type ArticleContext = typeof articleContext.$inferSelect;
export type NewArticleContext = typeof articleContext.$inferInsert;
export type BrandVoice = typeof brandVoice.$inferSelect;
export type NewBrandVoice = typeof brandVoice.$inferInsert;
export type SavedKeyword = typeof savedKeywords.$inferSelect;
export type NewSavedKeyword = typeof savedKeywords.$inferInsert;
export type KeywordResearchRun = typeof keywordResearchRuns.$inferSelect;
export type NewKeywordResearchRun = typeof keywordResearchRuns.$inferInsert;
export type MultiAgentResearch = typeof multiAgentResearch.$inferSelect;
export type NewMultiAgentResearch = typeof multiAgentResearch.$inferInsert;
export type TrackedPrompt = typeof trackedPrompts.$inferSelect;
export type NewTrackedPrompt = typeof trackedPrompts.$inferInsert;
export type LlmTrackingRun = typeof llmTrackingRuns.$inferSelect;
export type NewLlmTrackingRun = typeof llmTrackingRuns.$inferInsert;
export type BrandInterpretation = typeof brandInterpretations.$inferSelect;
export type NewBrandInterpretation = typeof brandInterpretations.$inferInsert;
export type BacklinkOpportunity = typeof backlinkOpportunities.$inferSelect;
export type NewBacklinkOpportunity = typeof backlinkOpportunities.$inferInsert;
export type BacklinkCommunityMember = typeof backlinkCommunityMembers.$inferSelect;
export type NewBacklinkCommunityMember = typeof backlinkCommunityMembers.$inferInsert;
export type BacklinkCollaboration = typeof backlinkCollaborations.$inferSelect;
export type NewBacklinkCollaboration = typeof backlinkCollaborations.$inferInsert;
export type RedditComment = typeof redditComments.$inferSelect;
export type NewRedditComment = typeof redditComments.$inferInsert;
export type PublishingIntegration = typeof publishingIntegrations.$inferSelect;
export type NewPublishingIntegration = typeof publishingIntegrations.$inferInsert;
export type ArticlePublication = typeof articlePublications.$inferSelect;
export type NewArticlePublication = typeof articlePublications.$inferInsert;



