import { NextResponse } from "next/server";
import { getProjects, createProject } from "@/lib/db/content-service";

export async function GET() {
  const projects = await getProjects();
  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = body.name || body.companyName;
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Company / Project name is required" }, { status: 400 });
    }

    const domain = body.domain || body.websiteUrl || "";

    const result = await createProject({
      name: name.trim(),
      domain: domain.trim(),
      description: body.description || body.companyDescription,
      industry: body.industry,
      targetAudience: body.targetAudience,
      productsServices: body.productsServices,
      companyContext: body.companyContext,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ project: result.project }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}

