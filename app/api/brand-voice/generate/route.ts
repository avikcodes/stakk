import { NextRequest, NextResponse } from "next/server";
import { analyzeAndGenerateBrandVoice } from "@/lib/db/brand-voice-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const brandVoice = await analyzeAndGenerateBrandVoice(projectId);
    return NextResponse.json({
      success: true,
      message: "Successfully analyzed website and existing content to generate Brand Voice context.",
      brandVoice,
    });
  } catch (err: any) {
    console.error("POST /api/brand-voice/generate error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to analyze and generate brand voice" },
      { status: 500 }
    );
  }
}

