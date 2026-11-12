import { NextRequest, NextResponse } from "next/server";
import { getArticlePublications, getProjectPublications } from "@/lib/db/integrations-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const articleId = searchParams.get("articleId");
    const projectId = searchParams.get("projectId");

    if (articleId) {
      const history = await getArticlePublications(articleId);
      return NextResponse.json({ history });
    }

    if (projectId) {
      const history = await getProjectPublications(projectId);
      return NextResponse.json({ history });
    }

    return NextResponse.json(
      { error: "Either articleId or projectId is required" },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("GET /api/integrations/history error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load publication history" },
      { status: 500 }
    );
  }
}

