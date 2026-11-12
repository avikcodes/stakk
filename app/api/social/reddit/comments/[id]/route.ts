import { NextRequest, NextResponse } from "next/server";
import {
  updateRedditComment,
  deleteRedditComment,
} from "@/lib/db/reddit-service";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Comment ID required" }, { status: 400 });
    }

    const updated = await updateRedditComment(id, body);
    return NextResponse.json({ comment: updated });
  } catch (err: any) {
    console.error("PATCH /api/social/reddit/comments/[id] error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update Reddit comment" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Comment ID required" }, { status: 400 });
    }

    const deleted = await deleteRedditComment(id);
    return NextResponse.json({ success: deleted, deletedId: id });
  } catch (err: any) {
    console.error("DELETE /api/social/reddit/comments/[id] error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete Reddit comment" },
      { status: 500 }
    );
  }
}

