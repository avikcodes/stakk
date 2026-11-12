"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  RotateCw,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  History,
  FolderKanban,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  MessageSquare,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  Search,
  Columns2,
  FileText,
  Brain,
  Target,
  Users,
  Package,
  Check,
  AlertTriangle,
  GitCompare,
  Copy,
  CheckCheck,
} from "lucide-react";
import { Project } from "@/lib/db/schema";
import {
  TrackedPromptWithRuns,
  LlmTrackingRunData,
  BrandInterpretationData,
  AnalyticsOverviewData,
} from "@/lib/db/analytics-service";

interface AnalyticsWorkspaceProps {
  project: Project;
  projects: Project[];
  onSelectProject: (projectId: string) => void;
}

export function AnalyticsWorkspace({
  project,
  projects,
  onSelectProject,
}: AnalyticsWorkspaceProps) {
  // Navigation: EXACTLY "LLM Tracking" and "Brand Interpretation"
  const [analyticsNav, setAnalyticsNav] = useState<"tracking" | "interpretation">("tracking");

  // Filter & Search
  const [filter, setFilter] = useState<"all" | "mentioned" | "unmentioned">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Data state
  const [prompts, setPrompts] = useState<TrackedPromptWithRuns[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [historyRuns, setHistoryRuns] = useState<LlmTrackingRunData[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [currentInterpretation, setCurrentInterpretation] = useState<BrandInterpretationData | null>(null);
  const [overview, setOverview] = useState<AnalyticsOverviewData | null>(null);

  // Loading & Error states
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingInterpretation, setIsLoadingInterpretation] = useState(false);
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);
  const [runningPromptId, setRunningPromptId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasCopiedResponse, setHasCopiedResponse] = useState(false);

  // Project selector dropdown
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);

  // Modal states
  const [showNewPromptModal, setShowNewPromptModal] = useState(false);
  const [newPromptText, setNewPromptText] = useState("");
  const [newTargetBrand, setNewTargetBrand] = useState(project.name || "Stak");
  const [newCompetitors, setNewCompetitors] = useState("");
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // 1. Fetch Real Neon Tracking Overview
  const loadOverview = useCallback(async (projId: string) => {
    setIsLoadingOverview(true);
    try {
      const res = await fetch(`/api/analytics/overview?projectId=${projId}`);
      if (!res.ok) throw new Error("Failed to load overview");
      const data = await res.json();
      setOverview(data.overview);
    } catch (err: any) {
      console.warn("Overview load error:", err);
    } finally {
      setIsLoadingOverview(false);
    }
  }, []);

  // 2. Fetch Tracked Prompts for Active Project
  const loadPrompts = useCallback(async (projId: string) => {
    setIsLoadingPrompts(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/analytics/llm-tracking/prompts?projectId=${projId}`);
      if (!res.ok) throw new Error("Failed to load tracked prompts");
      const data = await res.json();
      const loaded: TrackedPromptWithRuns[] = data.prompts || [];
      setPrompts(loaded);

      // Auto-select first prompt if none selected or if previously selected prompt does not belong to project
      if (loaded.length > 0) {
        setSelectedPromptId((curr) => {
          if (curr && loaded.some((p) => p.id === curr)) return curr;
          return loaded[0].id;
        });
      } else {
        setSelectedPromptId(null);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to load tracked prompts");
    } finally {
      setIsLoadingPrompts(false);
    }
  }, []);

  useEffect(() => {
    if (project?.id) {
      loadPrompts(project.id);
      loadOverview(project.id);
      setNewTargetBrand(project.name || "Stak");
    }
  }, [project?.id, project?.name, loadPrompts, loadOverview]);

  // 3. Fetch History when selected prompt changes
  const loadPromptHistory = useCallback(async (promptId: string) => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`/api/analytics/llm-tracking/history?promptId=${promptId}`);
      if (!res.ok) throw new Error("Failed to load tracking history");
      const data = await res.json();
      const runs: LlmTrackingRunData[] = data.history || [];
      setHistoryRuns(runs);
      if (runs.length > 0) {
        setSelectedRunId(runs[0].id);
      } else {
        setSelectedRunId(null);
      }
    } catch (err: any) {
      console.error("Load history error:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (selectedPromptId) {
      loadPromptHistory(selectedPromptId);
    } else {
      setHistoryRuns([]);
      setSelectedRunId(null);
    }
  }, [selectedPromptId, loadPromptHistory]);

  const selectedPrompt = prompts.find((p) => p.id === selectedPromptId);
  const activeRun =
    historyRuns.find((r) => r.id === selectedRunId) ||
    selectedPrompt?.latestRun ||
    historyRuns[0] ||
    null;

  // Active run index in history (0 = latest, 1 = previous, etc.)
  const activeRunIndex = historyRuns.findIndex((r) => r.id === activeRun?.id);

  // 4. Fetch Brand Interpretation for activeRun
  useEffect(() => {
    if (!activeRun?.id) {
      setCurrentInterpretation(null);
      return;
    }

    let isCurrent = true;
    setIsLoadingInterpretation(true);

    fetch(`/api/analytics/brand-interpretation?runId=${activeRun.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load interpretation");
        return res.json();
      })
      .then((data) => {
        if (isCurrent && data.interpretation) {
          setCurrentInterpretation(data.interpretation);
        }
      })
      .catch((err) => {
        console.warn("Interpretation load failed:", err);
      })
      .finally(() => {
        if (isCurrent) setIsLoadingInterpretation(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [activeRun?.id]);

  // Execute or Retry an evaluation
  const handleRunEvaluation = async (promptId: string) => {
    setRunningPromptId(promptId);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/analytics/llm-tracking/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Evaluation run failed");
      }

      const { run } = await res.json();

      // Update prompt list with latest run
      setPrompts((prev) =>
        prev.map((p) => {
          if (p.id === promptId) {
            return {
              ...p,
              updatedAt: new Date(),
              totalRuns: p.totalRuns + 1,
              latestRun: run,
            };
          }
          return p;
        })
      );

      // Refresh overview
      loadOverview(project.id);

      // If active prompt, update history
      if (selectedPromptId === promptId) {
        setHistoryRuns((prev) => [run, ...prev]);
        setSelectedRunId(run.id);
      }
    } catch (err: any) {
      console.error("Run evaluation error:", err);
      setErrorMessage(err.message || "Failed to execute LLM tracking run");
    } finally {
      setRunningPromptId(null);
    }
  };

  // Create new tracked prompt
  const handleCreatePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromptText.trim()) {
      setModalError("Please enter a question or prompt to track.");
      return;
    }

    setIsSubmittingNew(true);
    setModalError(null);

    try {
      const res = await fetch("/api/analytics/llm-tracking/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          promptText: newPromptText.trim(),
          targetBrand: newTargetBrand.trim() || project.name || "Stak",
          knownCompetitors: newCompetitors.trim(),
          runImmediately: true,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create tracked prompt");
      }

      const { prompt: created } = await res.json();
      setPrompts((prev) => [created, ...prev]);
      setSelectedPromptId(created.id);
      setShowNewPromptModal(false);
      setNewPromptText("");
      setNewCompetitors("");
      loadOverview(project.id);
    } catch (err: any) {
      console.error(err);
      setModalError(err.message || "Failed to create prompt");
    } finally {
      setIsSubmittingNew(false);
    }
  };

  // Delete tracked prompt
  const handleDeletePrompt = async (promptId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Stop tracking this prompt and remove its response history?")) {
      return;
    }

    try {
      await fetch(`/api/analytics/llm-tracking/prompts/${promptId}`, {
        method: "DELETE",
      });

      setPrompts((prev) => prev.filter((p) => p.id !== promptId));
      if (selectedPromptId === promptId) {
        const remaining = prompts.filter((p) => p.id !== promptId);
        setSelectedPromptId(remaining.length > 0 ? remaining[0].id : null);
      }
      loadOverview(project.id);
    } catch (err) {
      console.error("Delete prompt error:", err);
    }
  };

  // Copy AI response to clipboard
  const handleCopyResponse = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopiedResponse(true);
    setTimeout(() => setHasCopiedResponse(false), 2000);
  };

  // Filtered prompts
  const filteredPrompts = prompts.filter((p) => {
    const matchesSearch =
      searchQuery === "" ||
      p.promptText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.targetBrand.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === "mentioned") {
      return p.latestRun?.brandMentioned === true;
    }
    if (filter === "unmentioned") {
      return p.latestRun?.brandMentioned === false;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#fbfbfa]">
      {/* 1. TOP BAR WITH EXACT TWO APPROVED NAVIGATION ITEMS */}
      <header className="h-16 shrink-0 border-b border-stone-200/80 bg-white/95 px-6 flex items-center justify-between backdrop-blur-xs">
        <div className="flex items-center gap-4">
          {/* Project Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50/80 px-3 py-2 text-xs font-mono text-stone-900 hover:border-stone-300 transition-colors"
            >
              <FolderKanban className="h-3.5 w-3.5 text-stone-600" />
              <span className="font-medium">{project.name || "Select Project"}</span>
              {project.domain && (
                <span className="text-stone-400 hidden sm:inline">({project.domain})</span>
              )}
              <ChevronDown className="h-3 w-3 text-stone-400 ml-1" />
            </button>

            {isProjectDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 rounded-xl border border-stone-200 bg-white p-2 shadow-lg z-30">
                <div className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-wider text-stone-400">
                  Projects ({projects.length} / 20 max)
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {projects.map((proj) => (
                    <button
                      key={proj.id}
                      type="button"
                      onClick={() => {
                        onSelectProject(proj.id);
                        setIsProjectDropdownOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-mono text-left transition-colors ${
                        proj.id === project.id
                          ? "bg-stone-100 text-stone-900 font-medium"
                          : "text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      <div className="truncate">
                        <div className="font-medium text-stone-900">{proj.name}</div>
                        {proj.domain && (
                          <div className="text-[10px] text-stone-400">{proj.domain}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-stone-200" />

          {/* EXACT NAVIGATION: LLM Tracking & Brand Interpretation */}
          <nav className="flex items-center gap-1.5 rounded-xl bg-stone-100 p-1 border border-stone-200/60 font-mono text-xs">
            <button
              type="button"
              onClick={() => setAnalyticsNav("tracking")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors ${
                analyticsNav === "tracking"
                  ? "bg-stone-900 text-white font-medium shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>LLM Tracking</span>
            </button>

            <button
              type="button"
              onClick={() => setAnalyticsNav("interpretation")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors ${
                analyticsNav === "interpretation"
                  ? "bg-stone-900 text-white font-medium shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Brain className="h-3.5 w-3.5" />
              <span>Brand Interpretation</span>
            </button>
          </nav>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setShowNewPromptModal(true);
              setModalError(null);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 px-3.5 py-2 text-xs font-medium text-white hover:opacity-90 transition-opacity shadow-xs"
          >
            <Plus className="h-3.5 w-3.5 text-stone-300" />
            <span>Track Prompt</span>
          </button>
        </div>
      </header>

      {/* 2. REAL NEON TRACKING OVERVIEW STRIP (Zero fake metrics, strictly factual Neon data) */}
      <div className="shrink-0 border-b border-stone-200/80 bg-white px-6 py-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-5xl">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
              Tracked Prompts
            </div>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="font-serif text-lg font-normal text-stone-900">
                {overview?.totalTrackedPrompts ?? prompts.length}
              </span>
              <span className="font-mono text-[11px] text-stone-400">active queries</span>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
              Evaluations Run
            </div>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="font-serif text-lg font-normal text-stone-900">
                {overview?.totalEvaluationsRun ?? 0}
              </span>
              <span className="font-mono text-[11px] text-stone-400">via OpenRouter</span>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
              Brand Mention Presence
            </div>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="font-serif text-lg font-normal text-stone-900">
                {overview?.brandMentionedCount ?? 0}
              </span>
              <span className="font-mono text-[11px] text-stone-400">
                / {overview?.totalTrackedPrompts ?? prompts.length} ({overview?.brandMentionRate ?? 0}%)
              </span>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
              Competitors Detected
            </div>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="font-serif text-lg font-normal text-stone-900">
                {overview?.uniqueCompetitorsCount ?? 0}
              </span>
              <span className="font-mono text-[11px] text-stone-400">unique brands</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner with Retry State */}
      {errorMessage && (
        <div className="shrink-0 bg-rose-50 border-b border-rose-200 px-6 py-2.5 flex items-center justify-between text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (selectedPromptId) handleRunEvaluation(selectedPromptId);
                else loadPrompts(project.id);
              }}
              className="underline font-mono hover:text-rose-950"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-600 hover:text-rose-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. MAIN WORKSPACE BODY */}
      <div className="flex-1 flex overflow-hidden">
        {/* ======================================================== */}
        {/* VIEW 1: LLM TRACKING                                     */}
        {/* ======================================================== */}
        {analyticsNav === "tracking" && (
          <div className="flex-1 flex overflow-hidden">
            {/* LEFT COLUMN: TRACKED PROMPTS LIST */}
            <div className="w-full md:w-5/12 lg:w-4/12 border-r border-stone-200/80 bg-white flex flex-col shrink-0">
              {/* Filter Bar & Search */}
              <div className="p-4 border-b border-stone-100 space-y-2.5">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tracked questions or brands..."
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/60 pl-8 pr-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:border-stone-400 transition-colors"
                  />
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setFilter("all")}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-mono transition-colors ${
                      filter === "all"
                        ? "bg-stone-900 text-white font-medium"
                        : "text-stone-500 hover:bg-stone-100"
                    }`}
                  >
                    All ({prompts.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter("mentioned")}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-mono transition-colors ${
                      filter === "mentioned"
                        ? "bg-emerald-800 text-white font-medium"
                        : "text-stone-500 hover:bg-stone-100"
                    }`}
                  >
                    Mentioned ({prompts.filter((p) => p.latestRun?.brandMentioned).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter("unmentioned")}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-mono transition-colors ${
                      filter === "unmentioned"
                        ? "bg-amber-800 text-white font-medium"
                        : "text-stone-500 hover:bg-stone-100"
                    }`}
                  >
                    Unmentioned ({prompts.filter((p) => p.latestRun?.brandMentioned === false).length})
                  </button>
                </div>
              </div>

              {/* Prompts List Body with Clean Empty & Loading States */}
              <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
                {isLoadingPrompts ? (
                  <div className="p-8 text-center text-xs font-mono text-stone-400 space-y-2">
                    <RotateCw className="mx-auto h-5 w-5 animate-spin text-stone-400" />
                    <div>Loading tracked prompts from Neon...</div>
                  </div>
                ) : filteredPrompts.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-400 mb-3">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div className="font-serif text-base text-stone-800 font-normal">
                      No tracked prompts found
                    </div>
                    <p className="mt-1 text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                      Track the questions your prospective buyers ask LLMs to audit brand presence and competitor citations.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowNewPromptModal(true)}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs font-mono text-stone-700 hover:bg-stone-50 shadow-2xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Track First Prompt</span>
                    </button>
                  </div>
                ) : (
                  filteredPrompts.map((p) => {
                    const isSelected = p.id === selectedPromptId;
                    const isRunning = runningPromptId === p.id;
                    const latest = p.latestRun;

                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPromptId(p.id)}
                        className={`p-4 cursor-pointer transition-colors text-left relative group ${
                          isSelected
                            ? "bg-stone-50/90 border-l-2 border-stone-900"
                            : "hover:bg-stone-50/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="font-medium text-xs text-[#14181f] line-clamp-2 leading-snug">
                            {p.promptText}
                          </div>

                          {/* 1-Click Run / Retry Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRunEvaluation(p.id);
                            }}
                            disabled={isRunning}
                            title="Run LLM evaluation again"
                            className="shrink-0 p-1 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-200/60 transition-colors disabled:opacity-50"
                          >
                            <RotateCw
                              className={`h-3.5 w-3.5 ${isRunning ? "animate-spin text-stone-900" : ""}`}
                            />
                          </button>
                        </div>

                        {/* Status Badges */}
                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                          {latest ? (
                            latest.brandMentioned ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-medium text-emerald-800 border border-emerald-200/70">
                                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                <span>Mentioned</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 font-mono text-[10px] font-medium text-amber-800 border border-amber-200/70">
                                <XCircle className="h-3 w-3 text-amber-600" />
                                <span>Not Mentioned</span>
                              </span>
                            )
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 font-mono text-[10px] text-stone-500">
                              Pending evaluation
                            </span>
                          )}

                          <span className="font-mono text-[10px] text-stone-400">
                            {p.totalRuns} {p.totalRuns === 1 ? "run" : "runs"}
                          </span>

                          {latest && (
                            <span className="font-mono text-[10px] text-stone-400 ml-auto">
                              {new Date(latest.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          )}
                        </div>

                        {/* Competitors Detected Pills */}
                        {latest && latest.competingBrandsDetected && latest.competingBrandsDetected.length > 0 && (
                          <div className="mt-2 flex flex-wrap items-center gap-1">
                            <span className="text-[10px] font-mono text-stone-400">Competitors:</span>
                            {latest.competingBrandsDetected.slice(0, 3).map((comp, idx) => (
                              <span
                                key={idx}
                                className="rounded-sm bg-stone-100 px-1.5 py-0.2 font-mono text-[9px] text-stone-600 border border-stone-200/60"
                              >
                                {comp}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Delete action */}
                        <div className="absolute right-3 bottom-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => handleDeletePrompt(p.id, e)}
                            className="text-stone-300 hover:text-rose-600 transition-colors p-1"
                            title="Delete prompt"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: DETAIL INSPECTOR & HISTORICAL RESPONSES */}
            <div className="hidden md:flex flex-1 flex-col overflow-y-auto bg-[#fbfbfa] p-6 lg:p-8">
              {selectedPrompt ? (
                <div className="max-w-3xl space-y-6">
                  {/* Prompt Header */}
                  <div className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-2xs">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-stone-400">
                          Tracked Query
                        </span>
                        <h2 className="mt-1 font-serif text-xl font-normal text-[#14181f] leading-snug">
                          "{selectedPrompt.promptText}"
                        </h2>

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-mono text-stone-500">
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5 text-stone-400" />
                            <span>Target Brand:</span>
                            <strong className="text-stone-800 font-medium">
                              {selectedPrompt.targetBrand}
                            </strong>
                          </div>

                          {selectedPrompt.knownCompetitors && (
                            <div className="flex items-center gap-1">
                              <span className="text-stone-400">• Watchlist:</span>
                              <span className="text-stone-700">
                                {selectedPrompt.knownCompetitors}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Run Again Action */}
                      <button
                        type="button"
                        onClick={() => handleRunEvaluation(selectedPrompt.id)}
                        disabled={runningPromptId === selectedPrompt.id}
                        className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50/80 px-3.5 py-2 text-xs font-mono text-stone-800 hover:bg-stone-100 disabled:opacity-50 transition-colors shadow-2xs shrink-0"
                      >
                        <RotateCw
                          className={`h-3.5 w-3.5 ${
                            runningPromptId === selectedPrompt.id
                              ? "animate-spin text-stone-900"
                              : "text-stone-500"
                          }`}
                        />
                        <span>
                          {runningPromptId === selectedPrompt.id ? "Running AI..." : "Run Again"}
                        </span>
                      </button>
                    </div>

                    {/* Historical Navigation Bar */}
                    <div className="mt-6 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        <span className="text-[11px] font-mono text-stone-400 shrink-0 flex items-center gap-1">
                          <History className="h-3 w-3" />
                          <span>Historical Runs:</span>
                        </span>
                        {historyRuns.map((run, idx) => {
                          const isSelected = run.id === (activeRun?.id || selectedRunId);
                          const isLatest = idx === 0;

                          return (
                            <button
                              key={run.id}
                              type="button"
                              onClick={() => setSelectedRunId(run.id)}
                              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-mono transition-colors shrink-0 ${
                                isSelected
                                  ? "bg-stone-900 text-white font-medium shadow-2xs"
                                  : "bg-stone-100 text-stone-600 hover:bg-stone-200/70"
                              }`}
                            >
                              <span>
                                {isLatest
                                  ? "Latest"
                                  : new Date(run.createdAt).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                    })}
                              </span>
                              {run.brandMentioned ? (
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                              ) : (
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Step Navigation Controls (Previous / Next Run) */}
                      {historyRuns.length > 1 && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (activeRunIndex < historyRuns.length - 1) {
                                setSelectedRunId(historyRuns[activeRunIndex + 1].id);
                              }
                            }}
                            disabled={activeRunIndex >= historyRuns.length - 1}
                            className="p-1 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-100 disabled:opacity-30 transition-colors"
                            title="Older run"
                          >
                            <ChevronLeft className="h-3.5 w-3.5" />
                          </button>
                          <span className="font-mono text-[10px] text-stone-400 px-1">
                            {activeRunIndex + 1} / {historyRuns.length}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (activeRunIndex > 0) {
                                setSelectedRunId(historyRuns[activeRunIndex - 1].id);
                              }
                            }}
                            disabled={activeRunIndex <= 0}
                            className="p-1 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-100 disabled:opacity-30 transition-colors"
                            title="Newer run"
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Active Response Viewer Card */}
                  {activeRun ? (
                    <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-2xs space-y-5">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-stone-600" />
                          <h3 className="font-serif text-base font-normal text-[#14181f]">
                            AI Response Captured
                          </h3>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[11px] text-stone-400">
                            {new Date(activeRun.createdAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyResponse(activeRun.aiResponse)}
                            className="flex items-center gap-1 rounded-lg border border-stone-200 px-2 py-1 text-[11px] font-mono text-stone-600 hover:bg-stone-50"
                          >
                            {hasCopiedResponse ? (
                              <>
                                <CheckCheck className="h-3 w-3 text-emerald-600" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Brand Mention Status Alert */}
                      <div>
                        {activeRun.brandMentioned ? (
                          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-3.5">
                            <div className="flex items-center gap-2 font-mono text-xs font-medium text-emerald-800">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                              <span>Brand Mentioned in Model Recommendations</span>
                            </div>
                            {activeRun.brandMentionContext && (
                              <p className="mt-1.5 text-xs text-emerald-900/80 font-sans leading-relaxed">
                                {activeRun.brandMentionContext}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-3.5">
                            <div className="flex items-center gap-2 font-mono text-xs font-medium text-amber-800">
                              <XCircle className="h-4 w-4 text-amber-600 shrink-0" />
                              <span>Brand Omitted from Model Recommendations</span>
                            </div>
                            {activeRun.brandMentionContext && (
                              <p className="mt-1.5 text-xs text-amber-900/80 font-sans leading-relaxed">
                                {activeRun.brandMentionContext}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Raw Response Text */}
                      <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-5 font-sans text-xs text-stone-800 leading-relaxed whitespace-pre-line select-text">
                        {activeRun.aiResponse}
                      </div>

                      {/* Competing Brands Detected */}
                      <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] font-mono text-stone-400">Competitors detected:</span>
                          {activeRun.competingBrandsDetected && activeRun.competingBrandsDetected.length > 0 ? (
                            activeRun.competingBrandsDetected.map((comp, idx) => (
                              <span
                                key={idx}
                                className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-mono text-stone-700 border border-stone-200/70"
                              >
                                {comp}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs font-mono text-stone-400">None detected</span>
                          )}
                        </div>

                        <span className="text-[11px] font-mono text-stone-400">
                          Model: {activeRun.model}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center">
                      <div className="font-serif text-base text-stone-800">No Run Results Available</div>
                      <p className="mt-1 text-xs font-mono text-stone-400">
                        Click "Run Again" to evaluate this prompt with OpenRouter.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-center">
                  <div>
                    <MessageSquare className="mx-auto h-8 w-8 text-stone-300 mb-2" />
                    <div className="font-serif text-lg text-stone-700">Select a prompt</div>
                    <p className="text-xs font-mono text-stone-400 mt-1">
                      Choose a prompt on the left to inspect its responses and evaluation history.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: BRAND INTERPRETATION                             */}
        {/* ======================================================== */}
        {analyticsNav === "interpretation" && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10">
            <div className="mx-auto max-w-6xl space-y-6">
              {/* Header Card & Prompt Picker */}
              <div className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-stone-800" />
                      <h2 className="font-serif text-xl font-normal text-[#14181f]">
                        Brand Interpretation
                      </h2>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      How AI systems understand, position, and describe {project.name || "your brand"} across evaluation queries.
                    </p>
                  </div>

                  {/* Prompt Selector Dropdown */}
                  {prompts.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-stone-400 shrink-0">Tracked Query:</span>
                      <select
                        value={selectedPromptId || ""}
                        onChange={(e) => setSelectedPromptId(e.target.value)}
                        className="rounded-xl border border-stone-200 bg-stone-50/80 px-3 py-1.5 text-xs font-mono text-stone-800 focus:outline-hidden focus:border-stone-400"
                      >
                        {prompts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.promptText.slice(0, 48)}...
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Historical Interpretation Navigation */}
                {historyRuns.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      <span className="text-[11px] font-mono text-stone-400 shrink-0 flex items-center gap-1">
                        <History className="h-3 w-3" />
                        <span>Interpretation Timeline:</span>
                      </span>
                      {historyRuns.map((run, idx) => {
                        const isSelected = run.id === (activeRun?.id || selectedRunId);
                        const isLatest = idx === 0;

                        return (
                          <button
                            key={run.id}
                            type="button"
                            onClick={() => setSelectedRunId(run.id)}
                            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-mono transition-colors shrink-0 ${
                              isSelected
                                ? "bg-stone-900 text-white font-medium shadow-2xs"
                                : "bg-stone-100 text-stone-600 hover:bg-stone-200/70"
                            }`}
                          >
                            <span>
                              {isLatest
                                ? "Latest Run"
                                : new Date(run.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                            </span>
                            {run.brandMentioned ? (
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            ) : (
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Stepper Controls */}
                    {historyRuns.length > 1 && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (activeRunIndex < historyRuns.length - 1) {
                              setSelectedRunId(historyRuns[activeRunIndex + 1].id);
                            }
                          }}
                          disabled={activeRunIndex >= historyRuns.length - 1}
                          className="flex items-center gap-1 rounded-lg border border-stone-200 px-2 py-1 text-[11px] font-mono text-stone-600 hover:bg-stone-100 disabled:opacity-30"
                        >
                          <ChevronLeft className="h-3 w-3" />
                          <span>Older Run</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (activeRunIndex > 0) {
                              setSelectedRunId(historyRuns[activeRunIndex - 1].id);
                            }
                          }}
                          disabled={activeRunIndex <= 0}
                          className="flex items-center gap-1 rounded-lg border border-stone-200 px-2 py-1 text-[11px] font-mono text-stone-600 hover:bg-stone-100 disabled:opacity-30"
                        >
                          <span>Newer Run</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SIDE-BY-SIDE PRESENTATION: ORIGINAL LLM RESPONSE vs BRAND INTERPRETATION */}
              {activeRun ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  {/* LEFT PANE: ORIGINAL LLM RESPONSE */}
                  <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-stone-500" />
                        <h3 className="font-serif text-base font-normal text-[#14181f]">
                          Original LLM Response
                        </h3>
                      </div>
                      <span className="font-mono text-[11px] text-stone-400">
                        {new Date(activeRun.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Brand Mention Pill */}
                    <div>
                      {activeRun.brandMentioned ? (
                        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-3">
                          <div className="flex items-center gap-1.5 font-mono text-xs font-medium text-emerald-800">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span>Brand Cited in Response</span>
                          </div>
                          {activeRun.brandMentionContext && (
                            <p className="mt-1 text-xs text-emerald-900/80 font-sans leading-relaxed">
                              {activeRun.brandMentionContext}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-3">
                          <div className="flex items-center gap-1.5 font-mono text-xs font-medium text-amber-800">
                            <XCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                            <span>Brand Omitted from Recommendations</span>
                          </div>
                          {activeRun.brandMentionContext && (
                            <p className="mt-1 text-xs text-amber-900/80 font-sans leading-relaxed">
                              {activeRun.brandMentionContext}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Raw Text Box */}
                    <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-4 font-sans text-xs text-stone-800 leading-relaxed whitespace-pre-line select-text">
                      {activeRun.aiResponse}
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] font-mono text-stone-400">
                      <span>Model: {activeRun.model}</span>
                      <span>Audited via OpenRouter</span>
                    </div>
                  </div>

                  {/* RIGHT PANE: BRAND INTERPRETATION */}
                  <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-stone-800" />
                        <h3 className="font-serif text-base font-normal text-[#14181f]">
                          Brand Interpretation
                        </h3>
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-stone-400">
                        Perception Breakdown
                      </span>
                    </div>

                    {isLoadingInterpretation ? (
                      <div className="py-16 text-center text-xs font-mono text-stone-400 space-y-2">
                        <RotateCw className="mx-auto h-5 w-5 animate-spin text-stone-400" />
                        <div>Auditing brand perception...</div>
                      </div>
                    ) : currentInterpretation ? (
                      <div className="space-y-4">
                        {/* Notable Changes */}
                        {currentInterpretation.notableChanges && (
                          <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3.5">
                            <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-stone-700 uppercase tracking-wider">
                              <GitCompare className="h-3.5 w-3.5 text-stone-600" />
                              <span>Notable Changes vs Baseline</span>
                            </div>
                            <p className="mt-1 text-xs text-stone-800 font-sans leading-relaxed">
                              {currentInterpretation.notableChanges}
                            </p>
                          </div>
                        )}

                        {/* How the Brand is Described */}
                        <div className="space-y-1">
                          <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
                            How the Brand is Described
                          </span>
                          <div className="rounded-xl border border-stone-100 bg-stone-50/40 p-3.5 text-xs text-stone-800 font-sans leading-relaxed">
                            {currentInterpretation.brandDescription}
                          </div>
                        </div>

                        {/* Positioning */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-stone-400">
                            <Target className="h-3 w-3 text-stone-500" />
                            <span>Market Positioning</span>
                          </div>
                          <div className="rounded-xl border border-stone-100 bg-stone-50/40 p-3.5 text-xs text-stone-800 font-sans leading-relaxed">
                            {currentInterpretation.positioning}
                          </div>
                        </div>

                        {/* Audience Interpretation */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-stone-400">
                            <Users className="h-3 w-3 text-stone-500" />
                            <span>Audience Interpretation (ICP)</span>
                          </div>
                          <div className="rounded-xl border border-stone-100 bg-stone-50/40 p-3.5 text-xs text-stone-800 font-sans leading-relaxed">
                            {currentInterpretation.audienceInterpretation}
                          </div>
                        </div>

                        {/* Products & Services Associated */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-stone-400">
                            <Package className="h-3 w-3 text-stone-500" />
                            <span>Products & Services Associated</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {currentInterpretation.productsServices &&
                            currentInterpretation.productsServices.length > 0 ? (
                              currentInterpretation.productsServices.map((prod, idx) => (
                                <span
                                  key={idx}
                                  className="rounded-lg bg-stone-100 px-2.5 py-1 text-[11px] font-mono text-stone-700 border border-stone-200/70"
                                >
                                  {prod}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs font-mono text-stone-400">
                                None associated in this prompt
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Strengths & Weaknesses */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-3.5 space-y-2">
                            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-800 font-medium flex items-center gap-1">
                              <Check className="h-3 w-3 text-emerald-600" />
                              <span>Strengths</span>
                            </span>
                            <ul className="space-y-1 text-xs text-stone-700 font-sans">
                              {currentInterpretation.strengths && currentInterpretation.strengths.length > 0 ? (
                                currentInterpretation.strengths.map((str, idx) => (
                                  <li key={idx} className="flex items-start gap-1 leading-snug">
                                    <span className="text-emerald-600 shrink-0">•</span>
                                    <span>{str}</span>
                                  </li>
                                ))
                              ) : (
                                <li className="text-stone-400 font-mono text-[11px]">None cited</li>
                              )}
                            </ul>
                          </div>

                          <div className="rounded-xl border border-amber-100 bg-amber-50/30 p-3.5 space-y-2">
                            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-800 font-medium flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3 text-amber-600" />
                              <span>Weaknesses / Gaps</span>
                            </span>
                            <ul className="space-y-1 text-xs text-stone-700 font-sans">
                              {currentInterpretation.weaknesses && currentInterpretation.weaknesses.length > 0 ? (
                                currentInterpretation.weaknesses.map((w, idx) => (
                                  <li key={idx} className="flex items-start gap-1 leading-snug">
                                    <span className="text-amber-600 shrink-0">•</span>
                                    <span>{w}</span>
                                  </li>
                                ))
                              ) : (
                                <li className="text-stone-400 font-mono text-[11px]">None cited</li>
                              )}
                            </ul>
                          </div>
                        </div>

                        {/* Competitors Mentioned */}
                        <div className="pt-2 border-t border-stone-100">
                          <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 block mb-1.5">
                            Competitors Mentioned Alongside Brand
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {currentInterpretation.competitorsMentioned &&
                            currentInterpretation.competitorsMentioned.length > 0 ? (
                              currentInterpretation.competitorsMentioned.map((comp, idx) => (
                                <span
                                  key={idx}
                                  className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-mono text-stone-700 border border-stone-200/80"
                                >
                                  {comp}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs font-mono text-stone-400">None</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-12 text-center text-xs font-mono text-stone-400">
                        No interpretation generated for this run yet.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center">
                  <Brain className="mx-auto h-8 w-8 text-stone-300 mb-2" />
                  <div className="font-serif text-base text-stone-800">No Tracked Prompts in this Project</div>
                  <p className="mt-1 text-xs font-mono text-stone-400 max-w-sm mx-auto">
                    Track your first buyer prompt to generate automatic Brand Interpretations.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowNewPromptModal(true)}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-3.5 py-2 text-xs font-medium text-white shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Track Prompt</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. NEW TRACKED PROMPT MODAL */}
      {showNewPromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
              <div>
                <h3 className="font-serif text-lg font-medium text-[#14181f]">
                  Track Prompt on LLMs
                </h3>
                <p className="text-xs font-mono text-stone-500 mt-0.5">
                  Evaluate how OpenRouter LLMs answer user prompts about your industry and brand.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewPromptModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreatePrompt} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-medium text-stone-700 mb-1">
                  Prompt / Question to Track
                </label>
                <textarea
                  rows={3}
                  value={newPromptText}
                  onChange={(e) => setNewPromptText(e.target.value)}
                  placeholder="e.g. What are the best developer-first content generation tools for B2B tech companies?"
                  className="w-full rounded-xl border border-stone-200 p-3 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:border-stone-400 font-sans"
                  required
                />
              </div>

              {/* Sample Prompt Suggestions */}
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400 mb-1.5">
                  Quick Prompt Templates:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    `What is the best alternative to Gehirn for technical editorial teams?`,
                    `What are the top developer-first AI content platforms?`,
                    `How to structure COMPANY.md and TONE.md for AI consistency?`,
                  ].map((template, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewPromptText(template)}
                      className="rounded-lg bg-stone-100 hover:bg-stone-200/80 px-2 py-1 text-[11px] font-mono text-stone-700 text-left transition-colors"
                    >
                      "{template.slice(0, 48)}..."
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-mono font-medium text-stone-700 mb-1">
                    Target Brand to Detect
                  </label>
                  <input
                    type="text"
                    value={newTargetBrand}
                    onChange={(e) => setNewTargetBrand(e.target.value)}
                    placeholder="e.g. Stak"
                    className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 font-sans"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-stone-700 mb-1">
                    Known Competitors (Optional)
                  </label>
                  <input
                    type="text"
                    value={newCompetitors}
                    onChange={(e) => setNewCompetitors(e.target.value)}
                    placeholder="e.g. Gehirn, Jasper, Writer"
                    className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 font-sans"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowNewPromptModal(false)}
                  className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-mono text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNew}
                  className="flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-medium text-white hover:bg-stone-800 disabled:opacity-50"
                >
                  {isSubmittingNew ? (
                    <>
                      <RotateCw className="h-3 w-3 animate-spin" />
                      <span>Tracking & Evaluating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-stone-300" />
                      <span>Track & Evaluate Now</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
