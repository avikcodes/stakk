import { NextResponse } from "next/server";
import { removeSavedKeyword } from "@/lib/db/research-service";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId parameter is required" },
        { status: 400 }
      );
    }

    const success = await removeSavedKeyword(projectId, id);
    return NextResponse.json({ success });
  } catch (error: any) {
    console.error("Delete saved keyword error:", error);
    return NextResponse.json(
      { error: "Failed to remove saved keyword" },
      { status: 500 }
    );
  }
}

