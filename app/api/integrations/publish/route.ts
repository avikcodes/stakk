import { NextRequest, NextResponse } from "next/server";
import { getArticle, updateArticle } from "@/lib/db/content-service";
import { getIntegrationWithCredentials, recordPublication } from "@/lib/db/integrations-service";
import { publishArticleToIntegration } from "@/lib/publishing/connectors";
import { SupportedIntegrationType, SUPPORTED_INTEGRATIONS } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  let parsedProjectId: string = "";
  let parsedArticleId: string = "";
  let parsedType: SupportedIntegrationType | null = null;
  let parsedOptions: Record<string, any> = {};

  try {
    const body = await req.json();
    const { projectId, articleId, integrationType, publishingOptions } = body;

    parsedProjectId = projectId;
    parsedArticleId = articleId;
    parsedOptions = publishingOptions || {};

    if (!projectId || !articleId || !integrationType) {
      return NextResponse.json(
        { error: "projectId, articleId, and integrationType are required" },
        { status: 400 }
      );
    }

    if (!SUPPORTED_INTEGRATIONS.includes(integrationType as SupportedIntegrationType)) {
      return NextResponse.json(
        {
          error: `Invalid integration type '${integrationType}'. Stak supports exactly: ${SUPPORTED_INTEGRATIONS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const type = integrationType as SupportedIntegrationType;
    parsedType = type;

    // 1. Retrieve the existing article created by Stak
    const article = await getArticle(articleId);
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // 2. Retrieve server-side decrypted credentials for this integration
    const integrationData = await getIntegrationWithCredentials(projectId, type);
    if (!integrationData) {
      return NextResponse.json(
        {
          error: `${type} is not connected or credentials are missing. Configure connection in Publishing Integrations first.`,
        },
        { status: 400 }
      );
    }

    // Merge custom publishing options into configuration
    const effectiveConfig = {
      ...integrationData.configuration,
      ...parsedOptions,
    };

    // 3. Publish to target platform
    const result = await publishArticleToIntegration(
      type,
      effectiveConfig,
      integrationData.credentials,
      article as any
    );

    // 4. Update article status to published
    await updateArticle(article.id, {
      status: "published",
    });

    // 5. Record successful publication in history
    await recordPublication({
      articleId: article.id,
      projectId,
      integrationType: type,
      status: "success",
      publishedUrl: result.publishedUrl,
      remoteId: result.remoteId,
      publishingOptions: parsedOptions,
      errorMessage: undefined,
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err: any) {
    console.error("POST /api/integrations/publish error:", err);

    // Record failed publication in history if article & integration are known
    if (parsedArticleId && parsedProjectId && parsedType) {
      await recordPublication({
        articleId: parsedArticleId,
        projectId: parsedProjectId,
        integrationType: parsedType,
        status: "failed",
        publishingOptions: parsedOptions,
        errorMessage: err.message || "Unknown publishing error",
      }).catch(() => {});
    }

    return NextResponse.json(
      {
        error: err.message || "Failed to publish article to target integration.",
        result: {
          success: false,
          message: err.message || "Failed to publish article",
        },
      },
      { status: 500 }
    );
  }
}
