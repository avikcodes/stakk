import { NextRequest, NextResponse } from "next/server";
import {
  updateOpportunityStatus,
  deleteOpportunity,
} from "@/lib/db/backlinks-service";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "id and status are required" }, { status: 400 });
    }

    const updated = await updateOpportunityStatus(id, status);
    return NextResponse.json({ success: updated });
  } catch (err: any) {
    console.error("PATCH /api/social/backlinks/opportunities/[id] error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update opportunity" },
      { status: 500 }
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
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const deleted = await deleteOpportunity(id);
    return NextResponse.json({ success: deleted, deletedId: id });
  } catch (err: any) {
    console.error("DELETE /api/social/backlinks/opportunities/[id] error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete opportunity" },
      { status: 500 }
    );
  }
}

