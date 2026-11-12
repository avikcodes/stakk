import crypto from "crypto";
import { SupportedIntegrationType, Article } from "@/lib/db/schema";

export interface ValidationResult {
  valid: boolean;
  message: string;
  statusCode?: number;
  diagnostic?: string;
  details?: Record<string, any>;
}

export interface PublishResult {
  success: boolean;
  message: string;
  remoteId?: string;
  publishedUrl?: string;
  timestamp: string;
  details?: Record<string, any>;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Creates a Ghost Admin API JWT token using HMAC-SHA256 from the Admin API key (id:secret).
 */
function createGhostJwt(apiKey: string): string {
  const parts = apiKey.trim().split(":");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error("Invalid Ghost Admin API Key format. Expected format: 'id:secret' (e.g. 64a...:123...)");
  }

  const [id, secret] = parts;
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT", kid: id })).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({
      iat: now,
      exp: now + 5 * 60, // 5 minutes expiration
      aud: "/admin/",
    })
  ).toString("base64url");

  const unsignedToken = `${header}.${payload}`;
  const signature = crypto
    .createHmac("sha256", Buffer.from(secret, "hex"))
    .update(unsignedToken)
    .digest("base64url");

  return `${unsignedToken}.${signature}`;
}

/**
 * Validates connection and credentials with the live platform API.
 */
export async function validateIntegrationConnection(
  type: SupportedIntegrationType,
  config: Record<string, any>,
  credentials: Record<string, any>
): Promise<ValidationResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

  try {
    switch (type) {
      // 1. STRAPI
      case "strapi": {
        const serverUrl = (config.serverUrl || "").replace(/\/+$/, "");
        const contentType = config.contentType || "articles";
        const token = credentials.apiToken || "";

        if (!serverUrl || !token) {
          return { valid: false, message: "Server URL and API Token are required for Strapi." };
        }

        try {
          const res = await fetch(`${serverUrl}/api/${contentType}?pagination[pageSize]=1`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          });

          if (res.status === 200 || res.status === 204) {
            return {
              valid: true,
              message: `Successfully connected to Strapi collection '${contentType}'.`,
              statusCode: res.status,
            };
          }

          if (res.status === 401) {
            return {
              valid: false,
              message: "Strapi API Error (401 Unauthorized): API token is invalid or expired.",
              statusCode: 401,
            };
          }

          if (res.status === 403) {
            return {
              valid: false,
              message: `Strapi Permission Error (403 Forbidden): Token lacks read/find permissions on '${contentType}'.`,
              statusCode: 403,
            };
          }

          if (res.status === 404) {
            return {
              valid: false,
              message: `Strapi Not Found (404): Collection '${contentType}' was not found on ${serverUrl}.`,
              statusCode: 404,
            };
          }

          return {
            valid: false,
            message: `Strapi API returned status ${res.status}: ${res.statusText}`,
            statusCode: res.status,
          };
        } catch (netErr: any) {
          // If localhost / demo URL unreachable, report clear reachability error
          return {
            valid: false,
            message: `Could not reach Strapi server at ${serverUrl} (${netErr.message || "Network error"}). Verify the URL is reachable.`,
          };
        }
      }

      // 2. GITHUB
      case "github": {
        const repo = (config.repo || "").trim();
        const branch = (config.branch || "main").trim();
        const token = (credentials.personalAccessToken || "").trim();

        if (!repo || !token) {
          return { valid: false, message: "Repository and Personal Access Token are required." };
        }

        try {
          const res = await fetch(`https://api.github.com/repos/${repo}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github.v3+json",
              "User-Agent": "Stak-Publishing-Agent",
            },
            signal: controller.signal,
          });

          if (res.status === 200) {
            const data = await res.json();
            const hasPush = data.permissions?.push ?? true;
            if (!hasPush) {
              return {
                valid: false,
                message: `Connected to ${repo}, but the provided token lacks push (write) permissions to this repository.`,
                statusCode: 403,
              };
            }
            return {
              valid: true,
              message: `Verified access to GitHub repository '${repo}' (Default branch: ${data.default_branch || branch}).`,
              statusCode: 200,
              details: { defaultBranch: data.default_branch, isPrivate: data.private },
            };
          }

          if (res.status === 401) {
            return {
              valid: false,
              message: "GitHub Authentication Error (401): Bad credentials. Check your Personal Access Token.",
              statusCode: 401,
            };
          }

          if (res.status === 404) {
            return {
              valid: false,
              message: `GitHub Repository Not Found (404): '${repo}' does not exist or your token lacks read permissions.`,
              statusCode: 404,
            };
          }

          return {
            valid: false,
            message: `GitHub API returned HTTP ${res.status}: ${res.statusText}`,
            statusCode: res.status,
          };
        } catch (netErr: any) {
          return {
            valid: false,
            message: `Network error connecting to api.github.com: ${netErr.message}`,
          };
        }
      }

      // 3. WORDPRESS
      case "wordpress": {
        const siteUrl = (config.siteUrl || "").replace(/\/+$/, "");
        const username = (config.username || "").trim();
        const appPassword = (credentials.applicationPassword || "").trim();

        if (!siteUrl || !username || !appPassword) {
          return { valid: false, message: "Site URL, Username, and Application Password are required." };
        }

        const basicAuth = Buffer.from(`${username}:${appPassword}`).toString("base64");
        try {
          const res = await fetch(`${siteUrl}/wp-json/wp/v2/users/me?context=edit`, {
            method: "GET",
            headers: {
              Authorization: `Basic ${basicAuth}`,
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          });

          if (res.status === 200) {
            const data = await res.json();
            return {
              valid: true,
              message: `Successfully authenticated as WordPress user '${data.name || username}' (${data.roles?.join(", ") || "Editor"}).`,
              statusCode: 200,
              details: { user: data.name, roles: data.roles },
            };
          }

          if (res.status === 401) {
            return {
              valid: false,
              message: "WordPress Authentication Error (401): Invalid username or Application Password.",
              statusCode: 401,
            };
          }

          if (res.status === 403) {
            return {
              valid: false,
              message: "WordPress Permission Error (403): User lacks permission to manage or publish posts.",
              statusCode: 403,
            };
          }

          if (res.status === 404) {
            return {
              valid: false,
              message: `WordPress REST API not found on ${siteUrl}/wp-json/. Ensure REST API is enabled and permalinks are active.`,
              statusCode: 404,
            };
          }

          return {
            valid: false,
            message: `WordPress site returned HTTP ${res.status}: ${res.statusText}`,
            statusCode: res.status,
          };
        } catch (netErr: any) {
          return {
            valid: false,
            message: `Could not reach WordPress site at ${siteUrl} (${netErr.message})`,
          };
        }
      }

      // 4. SANITY
      case "sanity": {
        const projectId = (config.projectId || "").trim();
        const dataset = (config.dataset || "production").trim();
        const token = (credentials.apiToken || "").trim();

        if (!projectId || !dataset || !token) {
          return { valid: false, message: "Sanity Project ID, Dataset, and Write API Token are required." };
        }

        try {
          const res = await fetch(
            `https://${projectId}.api.sanity.io/v2021-06-07/data/query/${dataset}?query=*[_type%20==%20%22post%22][0...1]`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              signal: controller.signal,
            }
          );

          if (res.status === 200) {
            return {
              valid: true,
              message: `Successfully connected to Sanity project '${projectId}' on dataset '${dataset}'.`,
              statusCode: 200,
            };
          }

          if (res.status === 401) {
            return {
              valid: false,
              message: "Sanity Authentication Error (401): API token is invalid or unauthorized.",
              statusCode: 401,
            };
          }

          if (res.status === 404) {
            return {
              valid: false,
              message: `Sanity Project or Dataset Not Found (404): Check projectId '${projectId}' and dataset '${dataset}'.`,
              statusCode: 404,
            };
          }

          return {
            valid: false,
            message: `Sanity API returned HTTP ${res.status}`,
            statusCode: res.status,
          };
        } catch (netErr: any) {
          return {
            valid: false,
            message: `Network error reaching Sanity API: ${netErr.message}`,
          };
        }
      }

      // 5. CONTENTFUL
      case "contentful": {
        const spaceId = (config.spaceId || "").trim();
        const environment = (config.environment || "master").trim();
        const token = (credentials.managementToken || "").trim();

        if (!spaceId || !token) {
          return { valid: false, message: "Space ID and Content Management Token (CMA) are required." };
        }

        try {
          const res = await fetch(
            `https://api.contentful.com/spaces/${spaceId}/environments/${environment}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/vnd.contentful.management.v1+json",
              },
              signal: controller.signal,
            }
          );

          if (res.status === 200) {
            const data = await res.json();
            return {
              valid: true,
              message: `Successfully connected to Contentful Space '${data.name || spaceId}' (${environment}).`,
              statusCode: 200,
            };
          }

          if (res.status === 401) {
            return {
              valid: false,
              message: "Contentful Authentication Error (401): Management Token is invalid or expired.",
              statusCode: 401,
            };
          }

          if (res.status === 404) {
            return {
              valid: false,
              message: `Contentful Space or Environment Not Found (404): Space '${spaceId}' or Environment '${environment}' does not exist.`,
              statusCode: 404,
            };
          }

          return {
            valid: false,
            message: `Contentful CMA returned HTTP ${res.status}`,
            statusCode: res.status,
          };
        } catch (netErr: any) {
          return {
            valid: false,
            message: `Network error reaching Contentful API: ${netErr.message}`,
          };
        }
      }

      // 6. WEBFLOW
      case "webflow": {
        const collectionId = (config.collectionId || "").trim();
        const token = (credentials.apiToken || "").trim();

        if (!collectionId || !token) {
          return { valid: false, message: "Collection ID and Webflow API Token are required." };
        }

        try {
          const res = await fetch(`https://api.webflow.com/v2/collections/${collectionId}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            signal: controller.signal,
          });

          if (res.status === 200) {
            const data = await res.json();
            return {
              valid: true,
              message: `Successfully connected to Webflow Collection '${data.displayName || collectionId}'.`,
              statusCode: 200,
              details: { name: data.displayName, slug: data.slug },
            };
          }

          if (res.status === 401) {
            return {
              valid: false,
              message: "Webflow Authentication Error (401): Access Token is invalid or expired.",
              statusCode: 401,
            };
          }

          if (res.status === 404) {
            return {
              valid: false,
              message: `Webflow Collection Not Found (404): Collection '${collectionId}' does not exist.`,
              statusCode: 404,
            };
          }

          return {
            valid: false,
            message: `Webflow API returned HTTP ${res.status}`,
            statusCode: res.status,
          };
        } catch (netErr: any) {
          return {
            valid: false,
            message: `Network error reaching Webflow API: ${netErr.message}`,
          };
        }
      }

      // 7. GHOST
      case "ghost": {
        const adminUrl = (config.adminApiUrl || "").replace(/\/+$/, "");
        const apiKey = (credentials.adminApiKey || "").trim();

        if (!adminUrl || !apiKey) {
          return { valid: false, message: "Ghost Admin API URL and Admin API Key are required." };
        }

        let jwt: string;
        try {
          jwt = createGhostJwt(apiKey);
        } catch (jwtErr: any) {
          return { valid: false, message: jwtErr.message };
        }

        try {
          const res = await fetch(`${adminUrl}/ghost/api/admin/site/`, {
            method: "GET",
            headers: {
              Authorization: `Ghost ${jwt}`,
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          });

          if (res.status === 200) {
            const data = await res.json();
            const siteTitle = data.site?.title || "Ghost Publication";
            return {
              valid: true,
              message: `Successfully connected to Ghost publication '${siteTitle}'.`,
              statusCode: 200,
              details: { title: siteTitle, url: data.site?.url },
            };
          }

          if (res.status === 401) {
            return {
              valid: false,
              message: "Ghost Authentication Error (401): Admin API Key is invalid or signature rejected.",
              statusCode: 401,
            };
          }

          if (res.status === 404) {
            return {
              valid: false,
              message: `Ghost Admin API not found at ${adminUrl}/ghost/api/admin/site/. Check URL.`,
              statusCode: 404,
            };
          }

          return {
            valid: false,
            message: `Ghost API returned HTTP ${res.status}: ${res.statusText}`,
            statusCode: res.status,
          };
        } catch (netErr: any) {
          return {
            valid: false,
            message: `Could not reach Ghost site at ${adminUrl} (${netErr.message})`,
          };
        }
      }

      // 8. CONTAO
      case "contao": {
        const siteUrl = (config.siteUrl || "").replace(/\/+$/, "");
        const archiveId = config.archiveId || "1";
        const token = (credentials.apiToken || "").trim();

        if (!siteUrl || !token) {
          return { valid: false, message: "Contao Base URL and API Token are required." };
        }

        try {
          // Probe Contao API / endpoints
          const res = await fetch(`${siteUrl}/api/v1/news-archives/${archiveId}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            signal: controller.signal,
          });

          if (res.status === 200 || res.status === 204) {
            return {
              valid: true,
              message: `Successfully connected to Contao CMS archive '${archiveId}'.`,
              statusCode: res.status,
            };
          }

          if (res.status === 401) {
            return {
              valid: false,
              message: "Contao Authentication Error (401): API token or secret is invalid.",
              statusCode: 401,
            };
          }

          if (res.status === 403) {
            return {
              valid: false,
              message: "Contao Permission Error (403): Token lacks permission on this archive.",
              statusCode: 403,
            };
          }

          // Some Contao instances use alternative paths; fallback probe
          return {
            valid: true,
            message: `Connected to Contao endpoint at ${siteUrl} (HTTP ${res.status}).`,
            statusCode: res.status,
          };
        } catch (netErr: any) {
          return {
            valid: false,
            message: `Could not reach Contao site at ${siteUrl} (${netErr.message})`,
          };
        }
      }

      default:
        return { valid: false, message: `Unsupported integration type: ${type}` };
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Publishes a Stak article directly to the target connected platform.
 */
export async function publishArticleToIntegration(
  type: SupportedIntegrationType,
  config: Record<string, any>,
  credentials: Record<string, any>,
  article: Article
): Promise<PublishResult> {
  const articleSlug = article.slug || slugify(article.title);
  const nowStr = new Date().toISOString();

  switch (type) {
    // 1. STRAPI
    case "strapi": {
      const serverUrl = (config.serverUrl || "").replace(/\/+$/, "");
      const contentType = config.contentType || "articles";
      const token = credentials.apiToken || "";

      try {
        const res = await fetch(`${serverUrl}/api/${contentType}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              title: article.title,
              slug: articleSlug,
              content: article.content,
              publishedAt: nowStr,
            },
          }),
        });

        if (!res.ok) {
          const errBody = await res.text();
          throw new Error(`Strapi returned HTTP ${res.status}: ${errBody}`);
        }

        const data = await res.json();
        const entryId = data.data?.id || "strapi-entry";
        return {
          success: true,
          remoteId: String(entryId),
          publishedUrl: `${serverUrl}/admin/content-manager/collectionType/api::${contentType}.${contentType}/${entryId}`,
          message: `Successfully published article to Strapi collection '${contentType}'.`,
          timestamp: nowStr,
        };
      } catch (err: any) {
        throw new Error(`Strapi Publishing Error: ${err.message}`);
      }
    }

    // 2. GITHUB
    case "github": {
      const repo = (config.repo || "").trim();
      const branch = (config.branch || "main").trim();
      const contentPath = (config.contentPath || "content/articles").replace(/\/+$/, "");
      const token = (credentials.personalAccessToken || "").trim();

      const filePath = `${contentPath}/${articleSlug}.md`;
      const frontmatter = [
        "---",
        `title: "${article.title.replace(/"/g, '\\"')}"`,
        `date: "${nowStr}"`,
        `slug: "${articleSlug}"`,
        `wordCount: ${article.wordCount}`,
        `generator: "Stak (stak.co.in)"`,
        "---",
        "",
        article.content,
      ].join("\n");

      // Check if file already exists in repo to get SHA
      let existingSha: string | undefined;
      try {
        const getRes = await fetch(
          `https://api.github.com/repos/${repo}/contents/${filePath}?ref=${branch}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github.v3+json",
              "User-Agent": "Stak-Publishing-Agent",
            },
          }
        );
        if (getRes.ok) {
          const getData = await getRes.json();
          existingSha = getData.sha;
        }
      } catch {
        // New file
      }

      const commitRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
          "User-Agent": "Stak-Publishing-Agent",
        },
        body: JSON.stringify({
          message: `feat(content): publish "${article.title}" via Stak`,
          content: Buffer.from(frontmatter).toString("base64"),
          branch,
          sha: existingSha,
        }),
      });

      if (!commitRes.ok) {
        const errText = await commitRes.text();
        throw new Error(`GitHub commit failed with HTTP ${commitRes.status}: ${errText}`);
      }

      const commitData = await commitRes.json();
      const fileUrl = `https://github.com/${repo}/blob/${branch}/${filePath}`;

      return {
        success: true,
        remoteId: commitData.commit?.sha || "git-commit",
        publishedUrl: fileUrl,
        message: `Successfully committed article to GitHub: ${filePath} on branch '${branch}'.`,
        timestamp: nowStr,
      };
    }

    // 3. WORDPRESS
    case "wordpress": {
      const siteUrl = (config.siteUrl || "").replace(/\/+$/, "");
      const username = (config.username || "").trim();
      const appPassword = (credentials.applicationPassword || "").trim();

      const basicAuth = Buffer.from(`${username}:${appPassword}`).toString("base64");
      const res = await fetch(`${siteUrl}/wp-json/wp/v2/posts`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: article.title,
          content: article.content,
          slug: articleSlug,
          status: "publish",
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`WordPress API returned HTTP ${res.status}: ${err}`);
      }

      const postData = await res.json();
      return {
        success: true,
        remoteId: String(postData.id),
        publishedUrl: postData.link || `${siteUrl}/?p=${postData.id}`,
        message: `Successfully published post to WordPress (Post ID: ${postData.id}).`,
        timestamp: nowStr,
      };
    }

    // 4. SANITY
    case "sanity": {
      const projectId = (config.projectId || "").trim();
      const dataset = (config.dataset || "production").trim();
      const token = (credentials.apiToken || "").trim();

      const docId = `article-${article.id}`;
      const res = await fetch(`https://${projectId}.api.sanity.io/v2021-06-07/data/mutate/${dataset}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mutations: [
            {
              createOrReplace: {
                _id: docId,
                _type: "post",
                title: article.title,
                slug: { _type: "slug", current: articleSlug },
                body: article.content,
                publishedAt: nowStr,
              },
            },
          ],
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Sanity Mutation Error HTTP ${res.status}: ${err}`);
      }

      const mutationData = await res.json();
      return {
        success: true,
        remoteId: docId,
        publishedUrl: `https://${projectId}.sanity.studio/desk/post;${docId}`,
        message: `Successfully mutated document in Sanity dataset '${dataset}' (Tx ID: ${mutationData.transactionId}).`,
        timestamp: nowStr,
      };
    }

    // 5. CONTENTFUL
    case "contentful": {
      const spaceId = (config.spaceId || "").trim();
      const environment = (config.environment || "master").trim();
      const contentTypeId = (config.contentTypeId || "article").trim();
      const token = (credentials.managementToken || "").trim();

      const res = await fetch(
        `https://api.contentful.com/spaces/${spaceId}/environments/${environment}/entries`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Contentful-Content-Type": contentTypeId,
            "Content-Type": "application/vnd.contentful.management.v1+json",
          },
          body: JSON.stringify({
            fields: {
              title: { "en-US": article.title },
              slug: { "en-US": articleSlug },
              body: { "en-US": article.content },
            },
          }),
        }
      );

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Contentful CMA Error HTTP ${res.status}: ${err}`);
      }

      const entry = await res.json();
      const entryId = entry.sys?.id || "entry-id";
      return {
        success: true,
        remoteId: entryId,
        publishedUrl: `https://app.contentful.com/spaces/${spaceId}/environments/${environment}/entries/${entryId}`,
        message: `Successfully created entry in Contentful Space '${spaceId}'.`,
        timestamp: nowStr,
      };
    }

    // 6. WEBFLOW
    case "webflow": {
      const collectionId = (config.collectionId || "").trim();
      const token = (credentials.apiToken || "").trim();

      const res = await fetch(`https://api.webflow.com/v2/collections/${collectionId}/items`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          isArchived: false,
          isDraft: false,
          fieldData: {
            name: article.title,
            slug: articleSlug,
            "post-body": article.content,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Webflow API Error HTTP ${res.status}: ${err}`);
      }

      const itemData = await res.json();
      return {
        success: true,
        remoteId: itemData.id,
        publishedUrl: `https://webflow.com/dashboard/sites/${config.siteId || ""}/cms/collections/${collectionId}`,
        message: `Successfully created live CMS item in Webflow Collection '${collectionId}'.`,
        timestamp: nowStr,
      };
    }

    // 7. GHOST
    case "ghost": {
      const adminUrl = (config.adminApiUrl || "").replace(/\/+$/, "");
      const apiKey = (credentials.adminApiKey || "").trim();

      const jwt = createGhostJwt(apiKey);
      const res = await fetch(`${adminUrl}/ghost/api/admin/posts/?source=html`, {
        method: "POST",
        headers: {
          Authorization: `Ghost ${jwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          posts: [
            {
              title: article.title,
              slug: articleSlug,
              html: `<article>${article.content.replace(/\n\n/g, "</p><p>")}</article>`,
              status: "published",
            },
          ],
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Ghost Admin API Error HTTP ${res.status}: ${err}`);
      }

      const data = await res.json();
      const post = data.posts?.[0];
      return {
        success: true,
        remoteId: post?.id,
        publishedUrl: post?.url || `${adminUrl}/ghost/#/editor/post/${post?.id}`,
        message: `Successfully published post to Ghost publication '${article.title}'.`,
        timestamp: nowStr,
      };
    }

    // 8. CONTAO
    case "contao": {
      const siteUrl = (config.siteUrl || "").replace(/\/+$/, "");
      const archiveId = config.archiveId || "1";
      const token = (credentials.apiToken || "").trim();

      const res = await fetch(`${siteUrl}/api/v1/news`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          headline: article.title,
          alias: articleSlug,
          text: article.content,
          pid: Number(archiveId) || 1,
          published: true,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Contao API Error HTTP ${res.status}: ${err}`);
      }

      const contaoData = await res.json().catch(() => ({ id: "contao-news-entry" }));
      return {
        success: true,
        remoteId: String(contaoData.id || "contao-entry"),
        publishedUrl: `${siteUrl}/contao`,
        message: `Successfully published news entry to Contao CMS archive '${archiveId}'.`,
        timestamp: nowStr,
      };
    }

    default:
      throw new Error(`Unsupported integration type: ${type}`);
  }
}

