import { NextRequest, NextResponse } from "next/server";
import { getHistoricalInterpretations } from "@/lib/db/analytics-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const promptId = searchParams.get("promptId");

    if (!promptId) {
      return NextResponse.json({ error: "promptId is required" }, { status: 400 });
    }

    const interpretations = await getHistoricalInterpretations(promptId);
    return NextResponse.json({ interpretations });
  } catch (err: any) {
    console.error("GET /api/analytics/brand-interpretation/history error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load historical brand interpretations" },
      { status: 500 }
    );
  }
}

