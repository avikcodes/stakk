import { NextRequest, NextResponse } from "next/server";
import { deleteTrackedPrompt } from "@/lib/db/analytics-service";

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Prompt ID required" }, { status: 400 });
    }

    await deleteTrackedPrompt(id);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    console.error("DELETE /api/analytics/llm-tracking/prompts/[id] error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete tracked prompt" },
      { status: 500 }
    );
  }
}
