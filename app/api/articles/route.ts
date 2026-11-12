import { NextResponse } from "next/server";
import { getArticles, createArticle } from "@/lib/db/content-service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const status = searchParams.get("status") as any;

  if (!projectId) {
    return NextResponse.json({ error: "projectId parameter is required" }, { status: 400 });
  }

  const articles = await getArticles(projectId, status);
  return NextResponse.json({ articles });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.projectId || !body.title) {
      return NextResponse.json(
        { error: "projectId and title are required" },
        { status: 400 }
      );
    }

    const result = await createArticle({
      projectId: body.projectId,
      title: body.title,
      content: body.content,
      status: body.status,
      targetKeywords: body.targetKeywords,
      researchBrief: body.researchBrief,
      outline: body.outline,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ article: result.article }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create article" }, { status: 500 });
  }
}

