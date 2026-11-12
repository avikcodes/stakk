import { NextRequest, NextResponse } from "next/server";
import { getTrackedPrompts, createTrackedPrompt } from "@/lib/db/analytics-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || "proj-1";

    const prompts = await getTrackedPrompts(projectId);
    return NextResponse.json({ prompts });
  } catch (err: any) {
    console.error("GET /api/analytics/llm-tracking/prompts error:", err);
    return NextResponse.json({ error: err.message || "Failed to load tracked prompts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, promptText, targetBrand, knownCompetitors, runImmediately } = body;

    if (!projectId || !promptText || !promptText.trim()) {
      return NextResponse.json(
        { error: "projectId and promptText are required" },
        { status: 400 }
      );
    }

    const created = await createTrackedPrompt({
      projectId,
      promptText: promptText.trim(),
      targetBrand: targetBrand?.trim() || "Stak",
      knownCompetitors: knownCompetitors?.trim() || undefined,
      runImmediately: runImmediately ?? true,
    });

    return NextResponse.json({ prompt: created }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/analytics/llm-tracking/prompts error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create tracked prompt" },
      { status: 500 }
    );
  }
}
