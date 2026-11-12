import { NextRequest, NextResponse } from "next/server";
import {
  getBacklinkOpportunities,
  discoverAndSaveBacklinkOpportunities,
} from "@/lib/db/backlinks-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || "proj-1";

    const opportunities = await getBacklinkOpportunities(projectId);
    return NextResponse.json({ opportunities });
  } catch (err: any) {
    console.error("GET /api/social/backlinks/opportunities error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load backlink opportunities" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, query } = body;

    if (!projectId || !query || !query.trim()) {
      return NextResponse.json(
        { error: "projectId and query are required" },
        { status: 400 }
      );
    }

    const discovered = await discoverAndSaveBacklinkOpportunities(
      projectId,
      query.trim()
    );
    return NextResponse.json({ opportunities: discovered }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/social/backlinks/opportunities error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to discover backlink opportunities" },
      { status: 500 }
    );
  }
}

