import { NextRequest, NextResponse } from "next/server";
import { runTrackingEvaluation } from "@/lib/db/analytics-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { promptId } = body;

    if (!promptId) {
      return NextResponse.json({ error: "promptId is required" }, { status: 400 });
    }

    const run = await runTrackingEvaluation(promptId);
    return NextResponse.json({ run }, { status: 200 });
  } catch (err: any) {
    console.error("POST /api/analytics/llm-tracking/run error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to execute LLM tracking run" },
      { status: 500 }
    );
  }
}
