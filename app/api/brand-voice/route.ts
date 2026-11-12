import { NextResponse } from "next/server";
import { getProjectBrandVoice, saveProjectBrandVoice } from "@/lib/db/brand-voice-service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }
  const brandVoice = await getProjectBrandVoice(projectId);
  return NextResponse.json({ brandVoice });
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    if (!body.projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }
    const updated = await saveProjectBrandVoice(body.projectId, body);
    return NextResponse.json({ brandVoice: updated });
  } catch (error: any) {
    console.error("PATCH /api/brand-voice error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update brand voice" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  return PATCH(req);
}
