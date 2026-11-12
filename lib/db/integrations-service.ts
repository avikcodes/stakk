import { db } from "./index";
import {
  publishingIntegrations,
  PublishingIntegration,
  articlePublications,
  ArticlePublication,
  SUPPORTED_INTEGRATIONS,
  SupportedIntegrationType,
} from "./schema";
import { eq, and, desc } from "drizzle-orm";
import { encryptSecret, decryptSecret, maskSecret } from "../security/encryption";

export interface IntegrationFieldSpec {
  key: string;
  label: string;
  placeholder: string;
  required: boolean;
  type?: "text" | "url";
  helpText?: string;
}

export interface IntegrationDefinition {
  id: SupportedIntegrationType;
  name: string;
  category:
    | "Headless CMS"
    | "Developer Publishing"
    | "CMS Platform"
    | "Structured Content Platform"
    | "Composable Content Platform"
    | "Designer CMS"
    | "Publishing Platform"
    | "Open Source CMS";
  description: string;
  authType: string;
  configFields: IntegrationFieldSpec[];
  credentialFields: IntegrationFieldSpec[];
}

// Exactly eight supported integrations metadata definitions
export const INTEGRATION_DEFINITIONS: Record<SupportedIntegrationType, IntegrationDefinition> = {
  strapi: {
    id: "strapi",
    name: "Strapi",
    category: "Headless CMS",
    description:
      "Publish content entries directly to your self-hosted or cloud Strapi CMS collection via the REST/GraphQL Content API.",
    authType: "API Token (Bearer)",
    configFields: [
      {
        key: "serverUrl",
        label: "Strapi Server URL",
        placeholder: "https://strapi.example.com",
        required: true,
        type: "url",
        helpText: "Base URL of your Strapi instance without trailing slash.",
      },
      {
        key: "contentType",
        label: "Content Type / Collection",
        placeholder: "api::article.article",
        required: true,
        helpText: "Strapi collection API identifier (e.g. articles or api::article.article).",
      },
    ],
    credentialFields: [
      {
        key: "apiToken",
        label: "Strapi API Token",
        placeholder: "Enter Strapi Full Access or Custom API token",
        required: true,
        helpText: "Generated in Strapi Admin > Settings > API Tokens.",
      },
    ],
  },
  github: {
    id: "github",
    name: "GitHub",
    category: "Developer Publishing",
    description:
      "Commit research-grounded markdown articles directly into your Git repository (e.g., Hugo, Astro, Next.js, Starlight).",
    authType: "Personal Access Token",
    configFields: [
      {
        key: "repo",
        label: "Repository (owner/repo)",
        placeholder: "acme-corp/engineering-blog",
        required: true,
        helpText: "Target repository where markdown files should be committed.",
      },
      {
        key: "branch",
        label: "Target Branch",
        placeholder: "main",
        required: true,
        helpText: "Git branch to commit articles to (default: main).",
      },
      {
        key: "contentPath",
        label: "Content Directory Path",
        placeholder: "content/blog",
        required: true,
        helpText: "Directory within repository for markdown files (e.g. content/blog).",
      },
    ],
    credentialFields: [
      {
        key: "personalAccessToken",
        label: "GitHub Personal Access Token",
        placeholder: "ghp_...",
        required: true,
        helpText: "Personal Access Token with 'repo' scope or fine-grained Contents:Write permission.",
      },
    ],
  },
  wordpress: {
    id: "wordpress",
    name: "WordPress",
    category: "CMS Platform",
    description:
      "Publish posts as drafts or published articles directly via the WordPress Application Password REST API.",
    authType: "Application Password",
    configFields: [
      {
        key: "siteUrl",
        label: "WordPress Site URL",
        placeholder: "https://blog.example.com",
        required: true,
        type: "url",
        helpText: "The public URL of your WordPress installation.",
      },
      {
        key: "username",
        label: "WordPress Username",
        placeholder: "editor_stak",
        required: true,
        helpText: "WordPress user with Editor or Administrator role.",
      },
    ],
    credentialFields: [
      {
        key: "applicationPassword",
        label: "Application Password",
        placeholder: "xxxx xxxx xxxx xxxx",
        required: true,
        helpText: "Generated in WordPress Admin > Users > Profile > Application Passwords.",
      },
    ],
  },
  sanity: {
    id: "sanity",
    name: "Sanity",
    category: "Structured Content Platform",
    description:
      "Create and publish structured Sanity documents into your dataset using Sanity's Mutations API.",
    authType: "Write API Token",
    configFields: [
      {
        key: "projectId",
        label: "Sanity Project ID",
        placeholder: "abc123xyz",
        required: true,
        helpText: "Found in your Sanity project dashboard.",
      },
      {
        key: "dataset",
        label: "Dataset",
        placeholder: "production",
        required: true,
        helpText: "Target dataset name (e.g. production).",
      },
    ],
    credentialFields: [
      {
        key: "apiToken",
        label: "Sanity API Token (Write/Editor)",
        placeholder: "sk...",
        required: true,
        helpText: "Token with write permissions from manage.sanity.io.",
      },
    ],
  },
  contentful: {
    id: "contentful",
    name: "Contentful",
    category: "Composable Content Platform",
    description:
      "Deliver entries to your Contentful Space and Environment via the Content Management API (CMA).",
    authType: "Content Management Token (CMA)",
    configFields: [
      {
        key: "spaceId",
        label: "Space ID",
        placeholder: "x1y2z3a4b5",
        required: true,
        helpText: "Contentful Space identifier.",
      },
      {
        key: "environment",
        label: "Environment",
        placeholder: "master",
        required: true,
        helpText: "Target environment (default: master).",
      },
      {
        key: "contentTypeId",
        label: "Content Model ID",
        placeholder: "article",
        required: true,
        helpText: "Contentful Content Model ID (e.g. article or blogPost).",
      },
    ],
    credentialFields: [
      {
        key: "managementToken",
        label: "CMA Management Token",
        placeholder: "CFPAT-...",
        required: true,
        helpText: "Content Management Token generated in Space settings > API keys.",
      },
    ],
  },
  webflow: {
    id: "webflow",
    name: "Webflow",
    category: "Designer CMS",
    description:
      "Sync articles and metadata into Webflow CMS Collections using the Webflow Data API v2.",
    authType: "Webflow API Access Token",
    configFields: [
      {
        key: "siteId",
        label: "Webflow Site ID",
        placeholder: "64a0b1c2d3e4f5...",
        required: true,
        helpText: "Found in Webflow Site Settings > Integrations.",
      },
      {
        key: "collectionId",
        label: "Collection ID",
        placeholder: "64b0b1c2d3e4f5...",
        required: true,
        helpText: "CMS Collection ID for blog posts or articles.",
      },
    ],
    credentialFields: [
      {
        key: "apiToken",
        label: "Webflow API Token",
        placeholder: "Enter Webflow Access Token",
        required: true,
        helpText: "Site API token generated in Webflow dashboard.",
      },
    ],
  },
  ghost: {
    id: "ghost",
    name: "Ghost",
    category: "Publishing Platform",
    description:
      "Publish technical posts and newsletters straight to your Ghost site via the Ghost Admin API.",
    authType: "Admin API Key",
    configFields: [
      {
        key: "adminApiUrl",
        label: "Ghost Admin API URL",
        placeholder: "https://blog.example.com",
        required: true,
        type: "url",
        helpText: "The URL of your Ghost site without trailing slash.",
      },
    ],
    credentialFields: [
      {
        key: "adminApiKey",
        label: "Ghost Admin API Key",
        placeholder: "64a...:123...",
        required: true,
        helpText: "Admin API Key from Ghost Admin > Settings > Integrations > Custom Integration.",
      },
    ],
  },
  contao: {
    id: "contao",
    name: "Contao",
    category: "Open Source CMS",
    description:
      "Publish articles and news entries into Contao CMS archives via the Contao Content API.",
    authType: "OAuth / API Token",
    configFields: [
      {
        key: "siteUrl",
        label: "Contao Base URL",
        placeholder: "https://contao.example.com",
        required: true,
        type: "url",
        helpText: "URL of your Contao installation.",
      },
      {
        key: "archiveId",
        label: "News / Article Archive ID",
        placeholder: "1",
        required: true,
        helpText: "The numeric ID of the Contao archive to publish into.",
      },
    ],
    credentialFields: [
      {
        key: "apiToken",
        label: "Contao API Token / Client Secret",
        placeholder: "Enter Contao API Access Secret",
        required: true,
        helpText: "API access credential configured in Contao backend.",
      },
    ],
  },
};

/**
 * Sanitized integration structure returned safely to the client.
 * REAL SENSITIVE CREDENTIALS ARE NEVER RETURNED.
 */
export interface SanitizedIntegration {
  id: string;
  projectId: string;
  integrationType: SupportedIntegrationType;
  name: string;
  category: string;
  description: string;
  authType: string;
  connectionStatus: "connected" | "disconnected" | "error";
  configuration: Record<string, any>;
  hasCredentials: boolean;
  maskedCredentials: Record<string, string>;
  lastSyncAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// In-Memory Dev Storage (Resilient Fallback)
const DEV_INTEGRATIONS: Map<string, PublishingIntegration> = new Map([
  [
    "proj-1:github",
    {
      id: "int-github-default",
      projectId: "proj-1",
      integrationType: "github",
      connectionStatus: "connected",
      configuration: JSON.stringify({
        repo: "stak-hq/engineering-docs",
        branch: "main",
        contentPath: "content/articles",
      }),
      encryptedCredentials: encryptSecret(
        JSON.stringify({
          personalAccessToken: "ghp_secureMockDeveloperToken1234567890",
        })
      ),
      lastSyncAt: new Date("2026-11-12T18:00:00Z"),
      createdAt: new Date("2026-11-10T12:00:00Z"),
      updatedAt: new Date("2026-11-12T18:00:00Z"),
    },
  ],
]);

function buildSanitizedIntegration(
  record: PublishingIntegration | null,
  projectId: string,
  type: SupportedIntegrationType
): SanitizedIntegration {
  const meta = INTEGRATION_DEFINITIONS[type];

  let configObj: Record<string, any> = {};
  if (record?.configuration) {
    try {
      configObj = JSON.parse(record.configuration);
    } catch {
      configObj = {};
    }
  }

  let hasCredentials = false;
  const maskedCredentials: Record<string, string> = {};

  if (record?.encryptedCredentials) {
    const decrypted = decryptSecret(record.encryptedCredentials);
    if (decrypted) {
      try {
        const parsed = JSON.parse(decrypted);
        hasCredentials = true;
        for (const [key, value] of Object.entries(parsed)) {
          if (typeof value === "string") {
            maskedCredentials[key] = maskSecret(value);
          }
        }
      } catch {
        // Failed parse
      }
    }
  }

  return {
    id: record?.id || `virtual-${projectId}-${type}`,
    projectId,
    integrationType: type,
    name: meta.name,
    category: meta.category,
    description: meta.description,
    authType: meta.authType,
    connectionStatus: (record?.connectionStatus as any) || "disconnected",
    configuration: configObj,
    hasCredentials,
    maskedCredentials,
    lastSyncAt: record?.lastSyncAt || null,
    createdAt: record?.createdAt || new Date(),
    updatedAt: record?.updatedAt || new Date(),
  };
}

/**
 * Retrieves the 8 supported publishing integrations for a project.
 * All credentials are sanitized server-side before returning.
 */
export async function getProjectIntegrations(projectId: string): Promise<SanitizedIntegration[]> {
  const dbRecordsMap = new Map<SupportedIntegrationType, PublishingIntegration>();

  if (db) {
    try {
      const records = await db
        .select()
        .from(publishingIntegrations)
        .where(eq(publishingIntegrations.projectId, projectId));

      for (const rec of records) {
        if (SUPPORTED_INTEGRATIONS.includes(rec.integrationType as SupportedIntegrationType)) {
          dbRecordsMap.set(rec.integrationType as SupportedIntegrationType, rec);
        }
      }
    } catch (err) {
      console.warn("Neon DB query failed for publishing integrations, using memory store:", err);
    }
  }

  // Populate from in-memory if DB record missing
  return SUPPORTED_INTEGRATIONS.map((type) => {
    const dbRecord = dbRecordsMap.get(type);
    if (dbRecord) {
      return buildSanitizedIntegration(dbRecord, projectId, type);
    }

    const memKey = `${projectId}:${type}`;
    const memRecord = DEV_INTEGRATIONS.get(memKey) || null;
    return buildSanitizedIntegration(memRecord, projectId, type);
  });
}

/**
 * Connects or updates configuration and credentials for a supported integration.
 * SENSITIVE CREDENTIALS ARE ENCRYPTED SERVER-SIDE WITH AES-256-GCM.
 */
export async function connectIntegration(
  projectId: string,
  integrationType: SupportedIntegrationType,
  configuration: Record<string, any>,
  credentials: Record<string, any>
): Promise<SanitizedIntegration> {
  if (!SUPPORTED_INTEGRATIONS.includes(integrationType)) {
    throw new Error(`Unsupported integration type: ${integrationType}. Only the 8 supported integrations are permitted.`);
  }

  // Encrypt credentials server-side
  const encrypted = encryptSecret(JSON.stringify(credentials));
  const configString = JSON.stringify(configuration);
  const now = new Date();

  let savedRecord: PublishingIntegration | null = null;

  if (db) {
    try {
      const existing = await db
        .select()
        .from(publishingIntegrations)
        .where(
          and(
            eq(publishingIntegrations.projectId, projectId),
            eq(publishingIntegrations.integrationType, integrationType)
          )
        );

      if (existing.length > 0) {
        const [updated] = await db
          .update(publishingIntegrations)
          .set({
            connectionStatus: "connected",
            configuration: configString,
            encryptedCredentials: encrypted,
            updatedAt: now,
          })
          .where(eq(publishingIntegrations.id, existing[0].id))
          .returning();
        savedRecord = updated;
      } else {
        const [inserted] = await db
          .insert(publishingIntegrations)
          .values({
            projectId,
            integrationType,
            connectionStatus: "connected",
            configuration: configString,
            encryptedCredentials: encrypted,
            createdAt: now,
            updatedAt: now,
          })
          .returning();
        savedRecord = inserted;
      }
    } catch (err) {
      console.warn("Neon DB save failed, saving to in-memory store:", err);
    }
  }

  // Fallback to in-memory store
  if (!savedRecord) {
    const memKey = `${projectId}:${integrationType}`;
    savedRecord = {
      id: `int-${integrationType}-${Date.now()}`,
      projectId,
      integrationType,
      connectionStatus: "connected",
      configuration: configString,
      encryptedCredentials: encrypted,
      lastSyncAt: null,
      createdAt: now,
      updatedAt: now,
    };
    DEV_INTEGRATIONS.set(memKey, savedRecord);
  }

  return buildSanitizedIntegration(savedRecord, projectId, integrationType);
}

/**
 * Disconnects an integration and securely purges server-stored credentials.
 */
export async function disconnectIntegration(
  projectId: string,
  integrationType: SupportedIntegrationType
): Promise<SanitizedIntegration> {
  if (!SUPPORTED_INTEGRATIONS.includes(integrationType)) {
    throw new Error(`Unsupported integration type: ${integrationType}`);
  }

  const now = new Date();
  let updatedRecord: PublishingIntegration | null = null;

  if (db) {
    try {
      const existing = await db
        .select()
        .from(publishingIntegrations)
        .where(
          and(
            eq(publishingIntegrations.projectId, projectId),
            eq(publishingIntegrations.integrationType, integrationType)
          )
        );

      if (existing.length > 0) {
        const [updated] = await db
          .update(publishingIntegrations)
          .set({
            connectionStatus: "disconnected",
            configuration: null,
            encryptedCredentials: null,
            updatedAt: now,
          })
          .where(eq(publishingIntegrations.id, existing[0].id))
          .returning();
        updatedRecord = updated;
      }
    } catch (err) {
      console.warn("Neon DB disconnect failed, updating in-memory store:", err);
    }
  }

  // Update in-memory store
  const memKey = `${projectId}:${integrationType}`;
  if (!updatedRecord) {
    updatedRecord = {
      id: `int-${integrationType}-disconnected`,
      projectId,
      integrationType,
      connectionStatus: "disconnected",
      configuration: null,
      encryptedCredentials: null,
      lastSyncAt: null,
      createdAt: now,
      updatedAt: now,
    };
    DEV_INTEGRATIONS.set(memKey, updatedRecord);
  } else {
    DEV_INTEGRATIONS.delete(memKey);
  }

  return buildSanitizedIntegration(updatedRecord, projectId, integrationType);
}

/**
 * SERVER-SIDE ONLY helper to retrieve decrypted credentials for publishing workflows.
 * Never expose this function to client components or API route outputs.
 */
export async function getIntegrationWithCredentials(
  projectId: string,
  integrationType: SupportedIntegrationType
): Promise<{
  configuration: Record<string, any>;
  credentials: Record<string, any>;
} | null> {
  let record: PublishingIntegration | null = null;

  if (db) {
    try {
      const [found] = await db
        .select()
        .from(publishingIntegrations)
        .where(
          and(
            eq(publishingIntegrations.projectId, projectId),
            eq(publishingIntegrations.integrationType, integrationType)
          )
        );
      if (found) record = found;
    } catch (err) {
      console.warn("Neon DB error in getIntegrationWithCredentials:", err);
    }
  }

  if (!record) {
    const memKey = `${projectId}:${integrationType}`;
    record = DEV_INTEGRATIONS.get(memKey) || null;
  }

  if (!record || record.connectionStatus !== "connected" || !record.encryptedCredentials) {
    return null;
  }

  const decrypted = decryptSecret(record.encryptedCredentials);
  if (!decrypted) return null;

  try {
    const credentials = JSON.parse(decrypted);
    const configuration = record.configuration ? JSON.parse(record.configuration) : {};
    return { configuration, credentials };
  } catch {
    return null;
  }
}

// In-Memory Dev Storage for Publication History
const DEV_PUBLICATIONS: ArticlePublication[] = [
  {
    id: "pub-seed-1",
    articleId: "art-1",
    projectId: "proj-1",
    integrationType: "github",
    status: "success",
    publishedUrl: "https://github.com/stak-hq/engineering-docs/blob/main/content/articles/how-we-built-stak-markdown-first-alternative-to-gehirn.md",
    remoteId: "c8e23f98a2b",
    publishingOptions: JSON.stringify({
      targetBranch: "main",
      commitMessage: 'feat(content): publish "How We Built Stak" via Stak',
      contentPath: "content/articles",
    }),
    errorMessage: null,
    publishedAt: new Date("2026-11-12T18:00:00Z"),
  },
];

/**
 * Records a publication attempt (success or failure) in Neon / memory store.
 */
export async function recordPublication(data: {
  articleId: string;
  projectId: string;
  integrationType: SupportedIntegrationType;
  status: "success" | "failed";
  publishedUrl?: string;
  remoteId?: string;
  publishingOptions?: Record<string, any>;
  errorMessage?: string;
}): Promise<ArticlePublication> {
  const optionsString = data.publishingOptions ? JSON.stringify(data.publishingOptions) : null;
  const now = new Date();

  if (db) {
    try {
      const [inserted] = await db
        .insert(articlePublications)
        .values({
          articleId: data.articleId as any,
          projectId: data.projectId as any,
          integrationType: data.integrationType,
          status: data.status,
          publishedUrl: data.publishedUrl || null,
          remoteId: data.remoteId || null,
          publishingOptions: optionsString,
          errorMessage: data.errorMessage || null,
          publishedAt: now,
        })
        .returning();

      if (inserted) return inserted;
    } catch (err) {
      console.warn("Neon DB recordPublication failed, using memory fallback:", err);
    }
  }

  const newPub: ArticlePublication = {
    id: `pub-${Date.now()}`,
    articleId: data.articleId,
    projectId: data.projectId,
    integrationType: data.integrationType,
    status: data.status,
    publishedUrl: data.publishedUrl || null,
    remoteId: data.remoteId || null,
    publishingOptions: optionsString,
    errorMessage: data.errorMessage || null,
    publishedAt: now,
  };
  DEV_PUBLICATIONS.unshift(newPub);
  return newPub;
}

/**
 * Retrieves publication history for an article.
 */
export async function getArticlePublications(articleId: string): Promise<ArticlePublication[]> {
  if (db) {
    try {
      const records = await db
        .select()
        .from(articlePublications)
        .where(eq(articlePublications.articleId, articleId as any))
        .orderBy(desc(articlePublications.publishedAt));
      if (records.length > 0) return records;
    } catch (err) {
      console.warn("Neon DB query failed for articlePublications:", err);
    }
  }

  return DEV_PUBLICATIONS.filter((p) => p.articleId === articleId);
}

/**
 * Retrieves publication history for a project.
 */
export async function getProjectPublications(projectId: string): Promise<ArticlePublication[]> {
  if (db) {
    try {
      const records = await db
        .select()
        .from(articlePublications)
        .where(eq(articlePublications.projectId, projectId as any))
        .orderBy(desc(articlePublications.publishedAt));
      if (records.length > 0) return records;
    } catch (err) {
      console.warn("Neon DB query failed for project publications:", err);
    }
  }

  return DEV_PUBLICATIONS.filter((p) => p.projectId === projectId);
}


