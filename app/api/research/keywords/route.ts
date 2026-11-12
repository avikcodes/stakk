import { NextResponse } from "next/server";
import { executeKeywordResearchOrchestrator } from "@/lib/db/research-service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId, query, queryType = "topic" } = body;

    if (!projectId || !query || !query.trim()) {
      return NextResponse.json(
        { error: "projectId and a non-empty query are required" },
        { status: 400 }
      );
    }

    const result = await executeKeywordResearchOrchestrator({
      projectId,
      query: query.trim(),
      queryType: queryType === "keyword" ? "keyword" : "topic",
    });

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error("Keyword research API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute keyword research" },
      { status: 500 }
    );
  }
}

