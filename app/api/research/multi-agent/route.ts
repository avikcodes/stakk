import { NextResponse } from "next/server";
import { getProject, getArticles } from "@/lib/db/content-service";
import {
  executeMultiAgentStage,
  MultiAgentStageKey,
  parseSynthesizedDossier,
} from "@/lib/ai/multi-agent-research";
import {
  getMultiAgentResearchList,
  saveMultiAgentResearch,
} from "@/lib/db/research-service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "projectId parameter is required" }, { status: 400 });
  }

  const list = await getMultiAgentResearchList(projectId);
  return NextResponse.json({ researchList: list });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      projectId,
      topic,
      keyword,
      instructions,
      stage,
      previousOutputs = {},
      researchId,
    } = body;

    if (!projectId || !topic || !stage) {
      return NextResponse.json(
        { error: "projectId, topic, and stage are required" },
        { status: 400 }
      );
    }

    const project = await getProject(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const existingArticles = await getArticles(projectId);
    const existingTitles = existingArticles.map((a) => a.title).slice(0, 10).join("; ");

    // Execute requested stage
    const stageResult = await executeMultiAgentStage(
      stage as MultiAgentStageKey,
      {
        topic: topic.trim(),
        keyword: keyword?.trim(),
        instructions: instructions?.trim(),
        companyName: project.name,
        companyDomain: project.domain,
        companyContext: project.companyContext,
        existingArticlesContext: existingTitles,
      },
      previousOutputs
    );

    let savedResearchId = researchId;
    let finalResearchData = null;

    // If final synthesis stage, compile and save to Neon / dev store
    if (stage === "synthesis") {
      const allOutputs = {
        ...previousOutputs,
        synthesis: stageResult.output,
      };

      const parsed = parseSynthesizedDossier(stageResult.output, stageResult.webSources || []);

      const saved = await saveMultiAgentResearch({
        id: savedResearchId,
        projectId,
        topic: topic.trim(),
        keyword: keyword?.trim() || null,
        instructions: instructions?.trim() || null,
        status: "completed",
        currentStage: "synthesis",
        stagesData: allOutputs,
        findings: parsed.findings,
        facts: parsed.facts,
        sources: parsed.sources,
        marketInsights: parsed.marketInsights,
        topicAngles: parsed.topicAngles,
        contentIdeas: parsed.contentIdeas,
        opportunities: parsed.opportunities,
        synthesizedDossier: stageResult.output,
      });

      savedResearchId = saved.id;
      finalResearchData = saved;
    }

    return NextResponse.json({
      stage: stageResult.stage,
      output: stageResult.output,
      webSources: stageResult.webSources || [],
      researchId: savedResearchId,
      finalResearch: finalResearchData,
    });
  } catch (error: any) {
    console.error("Multi-agent research stage error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute multi-agent research stage" },
      { status: 500 }
    );
  }
}

