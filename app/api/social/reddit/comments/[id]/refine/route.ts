import { NextRequest, NextResponse } from "next/server";
import { refineComment } from "@/lib/db/reddit-service";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    const { instructions } = body;

    if (!id) {
      return NextResponse.json({ error: "Comment ID required" }, { status: 400 });
    }

    const refined = await refineComment(id, instructions);
    return NextResponse.json({ comment: refined });
  } catch (err: any) {
    console.error("POST /api/social/reddit/comments/[id]/refine error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to refine comment" },
      { status: 500 }
    );
  }
}

