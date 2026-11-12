import { NextRequest, NextResponse } from "next/server";
import { getCommunityMembers } from "@/lib/db/backlinks-service";

export async function GET(_req: NextRequest) {
  try {
    const members = await getCommunityMembers();
    return NextResponse.json({ members });
  } catch (err: any) {
    console.error("GET /api/social/backlinks/community error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load community members" },
      { status: 500 }
    );
  }
}

