import { NextResponse } from "next/server";
import { getSavedKeywords, saveKeyword } from "@/lib/db/research-service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "projectId parameter is required" }, { status: 400 });
  }

  const keywords = await getSavedKeywords(projectId);
  return NextResponse.json({
    keywords,
    count: keywords.length,
    limit: 100,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      projectId,
      keyword,
      intent,
      difficulty,
      opportunityScore,
      trend,
      topicCluster,
      notes,
      sourceQuery,
    } = body;

    if (!projectId || !keyword || !keyword.trim()) {
      return NextResponse.json(
        { error: "projectId and keyword are required" },
        { status: 400 }
      );
    }

    const result = await saveKeyword(projectId, {
      keyword: keyword.trim(),
      intent,
      difficulty,
      opportunityScore,
      trend,
      topicCluster,
      notes,
      sourceQuery,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ keyword: result.keyword }, { status: 201 });
  } catch (error: any) {
    console.error("Save keyword error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save keyword" },
      { status: 500 }
    );
  }
}

