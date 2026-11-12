import { NextRequest, NextResponse } from "next/server";
import {
  getProjectBrandContext,
  updateProjectBrandContext,
  crawlAndSaveBrandContext,
} from "@/lib/db/brand-context-service";
import { getProjectBrandVoice } from "@/lib/db/brand-voice-service";
import { getProject } from "@/lib/db/content-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const context = await getProjectBrandContext(projectId);
    const brandVoice = await getProjectBrandVoice(projectId);
    return NextResponse.json({ context, brandVoice });
  } catch (err: any) {
    console.error("GET /api/projects/context error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to retrieve project brand context" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      projectId,
      websiteUrl,
      companyName,
      companyDescription,
      industry,
      targetAudience,
      productsServices,
      reCrawl = false,
      updates,
    } = body;

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const project = await getProject(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (reCrawl) {
      const targetUrl = websiteUrl || project.domain || "https://example.com";
      const name = companyName || project.name;

      const updatedContext = await crawlAndSaveBrandContext({
        projectId,
        websiteUrl: targetUrl,
        companyName: name,
        companyDescription: companyDescription || project.description || undefined,
        industry: industry || project.industry || undefined,
        targetAudience: targetAudience || project.targetAudience || undefined,
        productsServices:
          typeof productsServices === "string"
            ? productsServices
            : Array.isArray(productsServices)
            ? productsServices.join(", ")
            : undefined,
      });

      const updatedBrandVoice = await getProjectBrandVoice(projectId);

      return NextResponse.json({
        success: true,
        message: "Successfully crawled website, mapped site structure, and refreshed brand context.",
        context: updatedContext,
        brandVoice: updatedBrandVoice,
      });
    }

    if (updates) {
      const updatedContext = await updateProjectBrandContext(projectId, updates);
      return NextResponse.json({
        success: true,
        message: "Brand context updated.",
        context: updatedContext,
      });
    }

    return NextResponse.json(
      { error: "Either 'reCrawl: true' or 'updates' object is required" },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("POST /api/projects/context error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process project brand context" },
      { status: 500 }
    );
  }
}

