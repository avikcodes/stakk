import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsOverview } from "@/lib/db/analytics-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || "proj-1";

    const overview = await getAnalyticsOverview(projectId);
    return NextResponse.json({ overview });
  } catch (err: any) {
    console.error("GET /api/analytics/overview error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load analytics overview" },
      { status: 500 }
    );
  }
}

