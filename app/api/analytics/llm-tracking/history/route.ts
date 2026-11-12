import { NextRequest, NextResponse } from "next/server";
import { getPromptTrackingHistory } from "@/lib/db/analytics-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const promptId = searchParams.get("promptId");

    if (!promptId) {
      return NextResponse.json({ error: "promptId is required" }, { status: 400 });
    }

    const history = await getPromptTrackingHistory(promptId);
    return NextResponse.json({ history });
  } catch (err: any) {
    console.error("GET /api/analytics/llm-tracking/history error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load tracking history" },
      { status: 500 }
    );
  }
}
