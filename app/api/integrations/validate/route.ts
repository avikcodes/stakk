import { NextRequest, NextResponse } from "next/server";
import { validateIntegrationConnection } from "@/lib/publishing/connectors";
import { getIntegrationWithCredentials } from "@/lib/db/integrations-service";
import { SupportedIntegrationType, SUPPORTED_INTEGRATIONS } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, integrationType, configuration, credentials } = body;

    if (!integrationType || !SUPPORTED_INTEGRATIONS.includes(integrationType as SupportedIntegrationType)) {
      return NextResponse.json(
        {
          valid: false,
          message: `Invalid integration type '${integrationType}'. Stak supports exactly: ${SUPPORTED_INTEGRATIONS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const type = integrationType as SupportedIntegrationType;

    // Use supplied credentials or retrieve stored credentials if testing an existing connection
    let configToTest = configuration || {};
    let credsToTest = credentials || {};

    if ((!credentials || Object.keys(credentials).length === 0) && projectId) {
      const stored = await getIntegrationWithCredentials(projectId, type);
      if (stored) {
        configToTest = { ...stored.configuration, ...configToTest };
        credsToTest = stored.credentials;
      }
    }

    const result = await validateIntegrationConnection(type, configToTest, credsToTest);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("POST /api/integrations/validate error:", err);
    return NextResponse.json(
      {
        valid: false,
        message: err.message || "Failed to validate integration connection.",
      },
      { status: 500 }
    );
  }
}

