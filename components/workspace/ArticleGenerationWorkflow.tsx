"use client";

import { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  Loader2,
  ArrowRight,
  SlidersHorizontal,
  FileText,
  AlertCircle,
  Eye,
  Edit3,
  X,
  Play,
  Check,
} from "lucide-react";
import {
  WORKFLOW_STAGES,
  WorkflowStageKey,
} from "@/lib/ai/workflow-pipeline";
import type { ProjectWithStats, ArticleWithContext, BrandVoiceData } from "@/lib/db/content-service";

interface ArticleGenerationWorkflowProps {
  project: ProjectWithStats;
  brandVoice: BrandVoiceData | null;
  onClose: () => void;
  onComplete: (article: ArticleWithContext) => void;
}

export function ArticleGenerationWorkflow({
  project,
  brandVoice,
  onClose,
  onComplete,
}: ArticleGenerationWorkflowProps) {
  // Input fields
  const [topic, setTopic] = useState("");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [instructions, setInstructions] = useState("");

  // Workflow state
  const [isStarted, setIsStarted] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [completedStages, setCompletedStages] = useState<WorkflowStageKey[]>([]);
  const [stageOutputs, setStageOutputs] = useState<Partial<Record<WorkflowStageKey, string>>>({});
  const [activeTab, setActiveTab] = useState<WorkflowStageKey>("research");
  const [createdArticleId, setCreatedArticleId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Editable intermediate output
  const [isEditingIntermediate, setIsEditingIntermediate] = useState(false);

  // Run a single stage
  const runStage = async (stageKey: WorkflowStageKey, currentOutputs: Partial<Record<WorkflowStageKey, string>>) => {
    setIsRunning(true);
    setError(null);

    try {
      const res = await fetch("/api/articles/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          topic: topic.trim(),
          targetKeyword: targetKeyword.trim(),
          instructions: instructions.trim(),
          stage: stageKey,
          previousOutputs: currentOutputs,
          articleId: createdArticleId,
          saveToArticle: stageKey === "validate",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Stage generation failed");
      }

      if (data.articleId) {
        setCreatedArticleId(data.articleId);
      }

      const updatedOutputs = {
        ...currentOutputs,
        [stageKey]: data.output,
      };

      setStageOutputs(updatedOutputs);
      if (!completedStages.includes(stageKey)) {
        setCompletedStages((prev) => [...prev, stageKey]);
      }
      setActiveTab(stageKey);

      return updatedOutputs;
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while executing the stage.");
      return null;
    } finally {
      setIsRunning(false);
    }
  };

  // Start workflow from user inputs
  const handleStartWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError("Please provide an article topic.");
      return;
    }

    setIsStarted(true);
    setCurrentStageIndex(0);
    await runStage("research", {});
  };

  // Proceed to next stage
  const handleProceedNext = async () => {
    if (currentStageIndex >= WORKFLOW_STAGES.length - 1) return;
    const nextIndex = currentStageIndex + 1;
    setCurrentStageIndex(nextIndex);
    const nextStage = WORKFLOW_STAGES[nextIndex].key;
    await runStage(nextStage, stageOutputs);
  };

  // Run all remaining stages continuously
  const handleRunAllRemaining = async () => {
    let currentOutputs = { ...stageOutputs };
    for (let i = currentStageIndex; i < WORKFLOW_STAGES.length; i++) {
      setCurrentStageIndex(i);
      const stageKey = WORKFLOW_STAGES[i].key;
      if (completedStages.includes(stageKey) && i === currentStageIndex) {
        continue;
      }
      const res = await runStage(stageKey, currentOutputs);
      if (!res) break;
      currentOutputs = res;
    }
  };

  // Finish workflow and open in full editor
  const handleFinishAndEdit = async () => {
    if (!createdArticleId) return;
    try {
      const res = await fetch(`/api/articles/${createdArticleId}`);
      if (res.ok) {
        const data = await res.json();
        onComplete(data.article);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isWorkflowCompleted = completedStages.includes("validate");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 sm:p-6 backdrop-blur-xs">
      <div className="flex h-[90vh] w-full max-w-5xl flex-col rounded-2xl border border-stone-200/90 bg-white shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-stone-200/80 bg-stone-50/70 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-900 text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-serif text-lg font-medium text-[#14181f]">
                Article Generation Workflow
              </h2>
              <p className="font-mono text-[11px] text-stone-500">
                Project: {project.name} · Multi-Agent Staged Pipeline
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200/60 hover:text-stone-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        {!isStarted ? (
          /* Initial Input Form */
          <div className="flex flex-1 flex-col justify-center overflow-y-auto px-6 py-10 sm:px-16 max-w-2xl mx-auto w-full">
            <div className="mb-6">
              <span className="font-mono text-xs uppercase tracking-wider text-stone-500">
                Stage 1 of 8: Setup
              </span>
              <h3 className="mt-1 font-serif text-2xl sm:text-3xl font-normal text-[#14181f]">
                What should Stak research and write about?
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                Stak will execute an 8-stage pipeline using your stored COMPANY.md and TONE.md context, pausing at each step for your review.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl bg-rose-50 p-3.5 text-xs text-rose-700 border border-rose-200 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleStartWorkflow} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-medium text-stone-800 mb-1.5">
                  Article Topic (Required)
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Scaling Database Connection Pooling for High-Concurrency Serverless Workloads"
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 shadow-2xs"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-stone-800 mb-1.5">
                  Target Keyword (Optional)
                </label>
                <input
                  type="text"
                  value={targetKeyword}
                  onChange={(e) => setTargetKeyword(e.target.value)}
                  placeholder="e.g. database connection pooling, serverless postgres"
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-stone-800 mb-1.5">
                  Editorial Instructions or Specific Focus (Optional)
                </label>
                <textarea
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Focus on memory limits and failover states; avoid generic cloud analogies."
                  className="w-full rounded-xl border border-stone-300 bg-white p-3 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 shadow-2xs leading-relaxed"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#14181f] py-3 text-sm font-medium text-white hover:bg-stone-800 transition-all shadow-xs"
                >
                  <span>Start 8-Stage Generation Workflow</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-[11px] font-mono text-stone-500">
                <span>Active Context: COMPANY.md + TONE.md</span>
                <span>Quota: 250 articles/month</span>
              </div>
            </form>
          </div>
        ) : (
          /* Staged Pipeline Execution Split Screen */
          <div className="flex flex-1 overflow-hidden">
            {/* Left Column: Visual Workflow Stepper */}
            <div className="w-72 sm:w-80 shrink-0 border-r border-stone-200/80 bg-stone-50/50 p-5 overflow-y-auto flex flex-col justify-between">
              <div>
                <div className="mb-4">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-stone-400">
                    Workflow Pipeline
                  </span>
                  <h4 className="font-serif text-base text-[#14181f] font-normal truncate" title={topic}>
                    {topic}
                  </h4>
                </div>

                {/* 8 Stages Vertical Stepper */}
                <div className="space-y-2">
                  {WORKFLOW_STAGES.map((s, idx) => {
                    const isCompleted = completedStages.includes(s.key);
                    const isCurrent = idx === currentStageIndex && isRunning;
                    const isSelected = activeTab === s.key;

                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => {
                          if (stageOutputs[s.key]) {
                            setActiveTab(s.key);
                          }
                        }}
                        disabled={!stageOutputs[s.key] && !isCurrent}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-mono text-left transition-all ${
                          isSelected
                            ? "bg-white border border-stone-300 text-stone-900 shadow-xs"
                            : "hover:bg-white/60 text-stone-600"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${
                              isCompleted
                                ? "bg-emerald-100 text-emerald-800 font-semibold"
                                : isCurrent
                                ? "bg-stone-900 text-white"
                                : "bg-stone-200 text-stone-500"
                            }`}
                          >
                            {isCompleted ? (
                              <Check className="h-3 w-3" />
                            ) : isCurrent ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              idx + 1
                            )}
                          </span>
                          <div>
                            <span className="font-medium text-stone-800">{s.label}</span>
                          </div>
                        </div>

                        {isCompleted && (
                          <span className="text-[10px] text-emerald-600 font-medium">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Workflow Actions */}
              <div className="pt-4 border-t border-stone-200/80 space-y-2">
                {!isWorkflowCompleted ? (
                  <>
                    <button
                      type="button"
                      onClick={handleProceedNext}
                      disabled={isRunning}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#14181f] py-2.5 text-xs font-medium text-white hover:bg-stone-800 disabled:opacity-50 transition-colors shadow-2xs"
                    >
                      {isRunning ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <span>Run Next Stage</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleRunAllRemaining}
                      disabled={isRunning}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white py-2 text-xs font-mono text-stone-700 hover:bg-stone-50 disabled:opacity-50 transition-colors"
                    >
                      <Play className="h-3 w-3" />
                      <span>Run All to Completion</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinishAndEdit}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-700 py-3 text-xs font-medium text-white hover:bg-emerald-800 transition-colors shadow-xs"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Review & Edit in Full Editor</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Live Intermediate Output & Human-in-the-Loop Review */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
              {/* Output Header */}
              <div className="flex items-center justify-between border-b border-stone-100 px-6 py-3 bg-stone-50/30">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs uppercase tracking-wider text-stone-500">
                    Stage Output:
                  </span>
                  <span className="font-serif text-sm font-medium text-stone-900">
                    {WORKFLOW_STAGES.find((s) => s.key === activeTab)?.label}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingIntermediate(!isEditingIntermediate)}
                    className="flex items-center gap-1 rounded-lg border border-stone-200 px-2.5 py-1 text-xs font-mono text-stone-600 hover:text-stone-900"
                  >
                    <Edit3 className="h-3 w-3" />
                    <span>{isEditingIntermediate ? "Preview" : "Edit Output"}</span>
                  </button>
                </div>
              </div>

              {/* Output Content */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                {stageOutputs[activeTab] ? (
                  isEditingIntermediate ? (
                    <textarea
                      rows={22}
                      value={stageOutputs[activeTab]}
                      onChange={(e) => {
                        setStageOutputs({
                          ...stageOutputs,
                          [activeTab]: e.target.value,
                        });
                      }}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/40 p-4 font-mono text-xs text-stone-800 leading-relaxed focus:outline-none focus:border-stone-900"
                    />
                  ) : (
                    <div className="prose prose-stone max-w-none text-sm text-stone-800 font-light leading-relaxed whitespace-pre-wrap font-sans">
                      {stageOutputs[activeTab]}
                    </div>
                  )
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-stone-400 mb-2" />
                    <p className="text-xs font-mono text-stone-500">
                      Executing {WORKFLOW_STAGES[currentStageIndex]?.label}...
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Human-in-the-Loop Banner */}
              <div className="border-t border-stone-100 bg-stone-50/60 px-6 py-3 flex items-center justify-between text-xs text-stone-500 font-mono">
                <span>Human-in-the-loop: Review and refine intermediate text at any stage.</span>
                <span>Unpublished Draft</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

