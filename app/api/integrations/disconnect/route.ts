import { NextRequest, NextResponse } from "next/server";
import { disconnectIntegration } from "@/lib/db/integrations-service";
import { SupportedIntegrationType, SUPPORTED_INTEGRATIONS } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, integrationType } = body;

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    if (!integrationType || !SUPPORTED_INTEGRATIONS.includes(integrationType as SupportedIntegrationType)) {
      return NextResponse.json(
        {
          error: `Invalid integration type '${integrationType}'. Stak supports exactly: ${SUPPORTED_INTEGRATIONS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const integration = await disconnectIntegration(
      projectId,
      integrationType as SupportedIntegrationType
    );

    return NextResponse.json({
      success: true,
      integration,
    });
  } catch (err: any) {
    console.error("POST /api/integrations/disconnect error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to disconnect integration" },
      { status: 500 }
    );
  }
}

