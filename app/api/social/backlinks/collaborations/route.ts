import { NextRequest, NextResponse } from "next/server";
import {
  getCollaborations,
  createCollaboration,
  updateCollaborationStatus,
} from "@/lib/db/backlinks-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || "proj-1";

    const collaborations = await getCollaborations(projectId);
    return NextResponse.json({ collaborations });
  } catch (err: any) {
    console.error("GET /api/social/backlinks/collaborations error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load collaborations" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, communityMemberId, proposedUrl, collaborationType, pitchMessage, articleId } = body;

    if (!projectId || !communityMemberId || !proposedUrl || !pitchMessage) {
      return NextResponse.json(
        { error: "projectId, communityMemberId, proposedUrl, and pitchMessage are required" },
        { status: 400 }
      );
    }

    const created = await createCollaboration({
      projectId,
      communityMemberId,
      articleId: articleId || null,
      proposedUrl: proposedUrl.trim(),
      collaborationType: collaborationType || "Contextual Link Exchange",
      pitchMessage: pitchMessage.trim(),
    });

    return NextResponse.json({ collaboration: created }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/social/backlinks/collaborations error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create collaboration proposal" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "id and status are required" }, { status: 400 });
    }

    const updated = await updateCollaborationStatus(id, status);
    return NextResponse.json({ success: updated });
  } catch (err: any) {
    console.error("PATCH /api/social/backlinks/collaborations error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update collaboration" },
      { status: 500 }
    );
  }
}

