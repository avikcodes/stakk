import { NextRequest, NextResponse } from "next/server";
import { getBrandInterpretation, generateBrandInterpretation } from "@/lib/db/analytics-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const runId = searchParams.get("runId");

    if (!runId) {
      return NextResponse.json({ error: "runId is required" }, { status: 400 });
    }

    const interpretation = await getBrandInterpretation(runId);
    return NextResponse.json({ interpretation });
  } catch (err: any) {
    console.error("GET /api/analytics/brand-interpretation error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load brand interpretation" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { runId } = body;

    if (!runId) {
      return NextResponse.json({ error: "runId is required" }, { status: 400 });
    }

    const interpretation = await generateBrandInterpretation(runId);
    return NextResponse.json({ interpretation }, { status: 200 });
  } catch (err: any) {
    console.error("POST /api/analytics/brand-interpretation error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate brand interpretation" },
      { status: 500 }
    );
  }
}

