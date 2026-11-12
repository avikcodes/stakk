import { NextRequest, NextResponse } from "next/server";
import {
  getRedditComments,
  searchAndSaveRedditDiscussions,
} from "@/lib/db/reddit-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || "proj-1";
    const status = searchParams.get("status") || undefined;

    const comments = await getRedditComments(projectId, status);
    return NextResponse.json({ comments });
  } catch (err: any) {
    console.error("GET /api/social/reddit/comments error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load Reddit comments" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, topic } = body;

    if (!projectId || !topic || !topic.trim()) {
      return NextResponse.json(
        { error: "projectId and topic are required" },
        { status: 400 }
      );
    }

    const saved = await searchAndSaveRedditDiscussions(projectId, topic.trim());
    return NextResponse.json({ comments: saved }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/social/reddit/comments error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to research Reddit discussions" },
      { status: 500 }
    );
  }
}

