import { NextResponse } from "next/server";
import { getRecentResearchRuns } from "@/lib/db/research-service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "projectId parameter is required" }, { status: 400 });
  }

  const runs = await getRecentResearchRuns(projectId, 10);
  return NextResponse.json({ runs });
}

