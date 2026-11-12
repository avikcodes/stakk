import { NextResponse } from "next/server";
import { getProject, getBrandVoice, createArticle, updateArticle } from "@/lib/db/content-service";
import { executeWorkflowStage, WorkflowStageKey } from "@/lib/ai/workflow-pipeline";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      projectId,
      topic,
      targetKeyword,
      instructions,
      stage,
      previousOutputs = {},
      articleId,
      saveToArticle = false,
    } = body;

    if (!projectId || !topic || !stage) {
      return NextResponse.json(
        { error: "projectId, topic, and stage are required" },
        { status: 400 }
      );
    }

    // 1. Fetch project and brand voice context
    const project = await getProject(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Strict Server-Side Limit: 250 articles per month
    if (!articleId && project.articlesThisMonth >= project.monthlyArticleLimit) {
      return NextResponse.json(
        {
          error: `Monthly limit of ${project.monthlyArticleLimit} articles reached for this project (${project.articlesThisMonth} / 250 this month). Limit resets next month.`,
        },
        { status: 400 }
      );
    }

    const brandVoice = await getBrandVoice(projectId);

    // 2. Execute the requested stage
    const result = await executeWorkflowStage(
      stage as WorkflowStageKey,
      {
        topic,
        targetKeyword,
        instructions,
        companyName: project.name,
        companyDomain: project.domain,
        companyContext: project.companyContext,
        brandVoiceGuidelines: brandVoice?.toneGuidelines,
        bannedPhrases: brandVoice?.bannedPhrases,
      },
      previousOutputs
    );

    let savedArticleId = articleId;

    // 3. Save or update article in Neon / DB when requested or at final validation stage
    if (saveToArticle || stage === "validate") {
      const allOutputs = {
        ...previousOutputs,
        [stage]: result.output,
      };

      const finalContent =
        allOutputs.validate ||
        allOutputs.humanize ||
        allOutputs.polish ||
        allOutputs.write ||
        allOutputs.draft ||
        result.output;

      if (savedArticleId) {
        await updateArticle(savedArticleId, {
          title: topic,
          content: finalContent,
          workflowStage: stage,
          workflowData: JSON.stringify(allOutputs),
          targetKeywords: targetKeyword,
          researchBrief: allOutputs.research || null,
          outline: allOutputs.structure || null,
          status: "draft", // Stays in draft for human-in-the-loop review!
        });
      } else {
        const createResult = await createArticle({
          projectId,
          title: topic,
          content: finalContent,
          status: "draft",
          workflowStage: stage,
          workflowData: JSON.stringify(allOutputs),
          targetKeywords: targetKeyword,
          researchBrief: allOutputs.research,
          outline: allOutputs.structure,
        });

        if (createResult.article) {
          savedArticleId = createResult.article.id;
        }
      }
    }

    return NextResponse.json({
      stage: result.stage,
      output: result.output,
      metadata: result.metadata,
      articleId: savedArticleId,
    });
  } catch (error: any) {
    console.error("Workflow execution error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute workflow stage" },
      { status: 500 }
    );
  }
}

