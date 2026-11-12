import { NextRequest, NextResponse } from "next/server";
import {
  getProjectIntegrations,
  connectIntegration,
  INTEGRATION_DEFINITIONS,
} from "@/lib/db/integrations-service";
import { validateIntegrationConnection } from "@/lib/publishing/connectors";
import { SupportedIntegrationType, SUPPORTED_INTEGRATIONS } from "@/lib/db/schema";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || "proj-1";

    const integrations = await getProjectIntegrations(projectId);
    return NextResponse.json({ integrations });
  } catch (err: any) {
    console.error("GET /api/integrations error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load integrations" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, integrationType, configuration, credentials, skipValidation } = body;

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

    const type = integrationType as SupportedIntegrationType;
    const def = INTEGRATION_DEFINITIONS[type];

    // Validate required configuration fields
    const safeConfig: Record<string, any> = {};
    for (const field of def.configFields) {
      const val = configuration?.[field.key];
      if (field.required && (!val || typeof val !== "string" || !val.trim())) {
        return NextResponse.json(
          { error: `Missing required field '${field.label}'` },
          { status: 400 }
        );
      }
      if (val !== undefined) {
        safeConfig[field.key] = typeof val === "string" ? val.trim() : val;
      }
    }

    // Validate required credential fields
    const safeCreds: Record<string, any> = {};
    for (const field of def.credentialFields) {
      const val = credentials?.[field.key];
      if (field.required && (!val || typeof val !== "string" || !val.trim())) {
        return NextResponse.json(
          { error: `Missing required credential '${field.label}'` },
          { status: 400 }
        );
      }
      if (val !== undefined) {
        safeCreds[field.key] = typeof val === "string" ? val.trim() : val;
      }
    }

    // Validate live API connection and credentials unless explicitly bypassed
    if (!skipValidation) {
      const validation = await validateIntegrationConnection(type, safeConfig, safeCreds);
      // Strictly catch invalid credentials (401/403) and reject save
      if (!validation.valid && (validation.statusCode === 401 || validation.statusCode === 403)) {
        return NextResponse.json(
          {
            error: validation.message,
            statusCode: validation.statusCode,
          },
          { status: 400 }
        );
      }
    }

    const integration = await connectIntegration(
      projectId,
      type,
      safeConfig,
      safeCreds
    );

    return NextResponse.json({
      success: true,
      integration,
    });
  } catch (err: any) {
    console.error("POST /api/integrations error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to connect integration" },
      { status: 500 }
    );
  }
}


