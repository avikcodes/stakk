import { NextRequest, NextResponse } from "next/server";
import { getRedditUsage } from "@/lib/db/reddit-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || "proj-1";

    const usage = await getRedditUsage(projectId);
    return NextResponse.json({ usage });
  } catch (err: any) {
    console.error("GET /api/social/reddit/usage error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load Reddit usage" },
      { status: 500 }
    );
  }
}

