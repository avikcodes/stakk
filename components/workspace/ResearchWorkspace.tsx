"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  TrendingUp,
  Target,
  FileText,
  Lightbulb,
  ExternalLink,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FolderKanban,
  ArrowRight,
  Plus,
  Compass,
  History,
  Tag,
  Layers,
  Globe,
  ChevronDown,
  BookOpen,
  Copy,
  Check,
  X,
  RotateCcw,
} from "lucide-react";
import type { ProjectWithStats } from "@/lib/db/content-service";
import type { SavedKeywordData, ResearchRunData, MultiAgentResearchData } from "@/lib/db/research-service";
import type {
  KeywordResearchOutput,
  KeywordResultItem,
  KeywordOpportunityItem,
  TopicOpportunityItem,
} from "@/lib/ai/keyword-research";
import { MultiAgentResearchModal } from "./MultiAgentResearchModal";

interface ResearchWorkspaceProps {
  project: ProjectWithStats;
  projects?: ProjectWithStats[];
  onSelectProject?: (projectId: string) => void;
  onDraftArticle?: (topic: string, keyword?: string, researchBrief?: string) => void;
}

export function ResearchWorkspace({
  project,
  projects,
  onSelectProject,
  onDraftArticle,
}: ResearchWorkspaceProps) {
  // 1. PRIMARY RESEARCH NAVIGATION (Keyword Research vs Multi-Agent Research / Brainstorm)
  const [researchNav, setResearchNav] = useState<"keywords" | "multi-agent">("keywords");

  // Keyword Research state
  const [query, setQuery] = useState("");
  const [queryType, setQueryType] = useState<"topic" | "keyword">("topic");
  const [isSearching, setIsSearching] = useState(false);
  const [keywordError, setKeywordError] = useState<string | null>(null);
  const [lastFailedQuery, setLastFailedQuery] = useState<{ query: string; queryType: "topic" | "keyword" } | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);

  // Keyword sub-tabs: results, saved vault, or history
  const [keywordTab, setKeywordTab] = useState<"results" | "saved" | "history">("results");

  // Data state
  const [researchResult, setResearchResult] = useState<KeywordResearchOutput | null>(null);
  const [savedKeywords, setSavedKeywords] = useState<SavedKeywordData[]>([]);
  const [historyRuns, setHistoryRuns] = useState<ResearchRunData[]>([]);
  const [multiAgentDossiers, setMultiAgentDossiers] = useState<MultiAgentResearchData[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [isLoadingDossiers, setIsLoadingDossiers] = useState(false);

  // Multi-Agent Modal State
  const [showMultiAgentModal, setShowMultiAgentModal] = useState(false);
  const [modalTopic, setModalTopic] = useState("");
  const [modalKeyword, setModalKeyword] = useState("");

  // Viewing single dossier state
  const [viewingDossier, setViewingDossier] = useState<MultiAgentResearchData | null>(null);
  const [copiedDossierId, setCopiedDossierId] = useState<string | null>(null);

  // Filter for saved keywords
  const [savedFilterTerm, setSavedFilterTerm] = useState("");

  // 1. Fetch saved keywords on project switch
  const loadSavedKeywords = useCallback(async (projId: string) => {
    setIsLoadingSaved(true);
    try {
      const res = await fetch(`/api/research/keywords/saved?projectId=${projId}`);
      if (res.ok) {
        const data = await res.json();
        setSavedKeywords(data.keywords || []);
      }
    } catch (err) {
      console.error("Failed to load saved keywords", err);
    } finally {
      setIsLoadingSaved(false);
    }
  }, []);

  // 2. Fetch keyword research history on project switch
  const loadHistoryRuns = useCallback(async (projId: string) => {
    try {
      const res = await fetch(`/api/research/keywords/history?projectId=${projId}`);
      if (res.ok) {
        const data = await res.json();
        setHistoryRuns(data.runs || []);
        if (data.runs && data.runs.length > 0 && !researchResult) {
          setResearchResult(data.runs[0].analysisResult);
        }
      }
    } catch (err) {
      console.error("Failed to load history runs", err);
    }
  }, [researchResult]);

  // 3. Fetch multi-agent research dossiers
  const loadMultiAgentDossiers = useCallback(async (projId: string) => {
    setIsLoadingDossiers(true);
    try {
      const res = await fetch(`/api/research/multi-agent?projectId=${projId}`);
      if (res.ok) {
        const data = await res.json();
        setMultiAgentDossiers(data.researchList || []);
      }
    } catch (err) {
      console.error("Failed to load multi-agent dossiers", err);
    } finally {
      setIsLoadingDossiers(false);
    }
  }, []);

  useEffect(() => {
    if (project?.id) {
      loadSavedKeywords(project.id);
      loadHistoryRuns(project.id);
      loadMultiAgentDossiers(project.id);
    }
  }, [project?.id, loadSavedKeywords, loadHistoryRuns, loadMultiAgentDossiers]);

  // Execute keyword research
  const handleExecuteResearch = async (e?: React.FormEvent, overrideQuery?: string, overrideType?: "topic" | "keyword") => {
    if (e) e.preventDefault();
    const targetQuery = overrideQuery !== undefined ? overrideQuery : query;
    const targetType = overrideType !== undefined ? overrideType : queryType;
    const cleanQuery = targetQuery.trim();

    if (!cleanQuery) {
      setKeywordError("Please enter a topic or keyword to research.");
      return;
    }

    setKeywordError(null);
    setLastFailedQuery(null);
    setIsSearching(true);
    setSuccessNotice(null);

    try {
      const res = await fetch("/api/research/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          query: cleanQuery,
          queryType: targetType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setKeywordError(data.error || "Failed to execute keyword research");
        setLastFailedQuery({ query: cleanQuery, queryType: targetType });
        return;
      }

      setResearchResult(data.result);
      setKeywordTab("results");
      loadHistoryRuns(project.id);
    } catch (err: any) {
      console.error(err);
      setKeywordError("A network error occurred while executing research. Please retry.");
      setLastFailedQuery({ query: cleanQuery, queryType: targetType });
    } finally {
      setIsSearching(false);
    }
  };

  // Save a keyword to project vault (locked limit: 100 keywords)
  const handleSaveKeyword = async (item: KeywordResultItem | KeywordOpportunityItem) => {
    if (savedKeywords.length >= 100) {
      setKeywordError("Maximum limit of 100 saved keywords reached for this project.");
      return;
    }

    try {
      const res = await fetch("/api/research/keywords/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          keyword: item.keyword,
          intent: item.intent,
          difficulty: item.difficulty,
          opportunityScore: item.opportunityScore,
          trend: "trend" in item ? item.trend : "+40% rising",
          topicCluster: "topicCluster" in item ? item.topicCluster : "Content Gap",
          notes: "gapRationale" in item ? item.gapRationale : "rationale" in item ? item.rationale : undefined,
          sourceQuery: researchResult?.query,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setKeywordError(data.error || "Failed to save keyword");
        return;
      }

      setSavedKeywords((prev) => [data.keyword, ...prev.filter((k) => k.id !== data.keyword.id)]);
      setSuccessNotice(`Saved "${item.keyword}" to project vault.`);
      setTimeout(() => setSuccessNotice(null), 3000);
    } catch (err) {
      setKeywordError("Failed to save keyword.");
    }
  };

  // Remove a saved keyword
  const handleRemoveSavedKeyword = async (keywordId: string, keywordText: string) => {
    try {
      const res = await fetch(`/api/research/keywords/saved/${keywordId}?projectId=${project.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSavedKeywords((prev) => prev.filter((k) => k.id !== keywordId));
        setSuccessNotice(`Removed "${keywordText}" from saved keywords.`);
        setTimeout(() => setSuccessNotice(null), 2500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Check if a keyword is already saved
  const isKeywordSaved = (kw: string) => {
    const clean = kw.trim().toLowerCase();
    return savedKeywords.some((k) => k.keyword.toLowerCase() === clean);
  };

  // Filtered saved keywords
  const filteredSavedKeywords = savedKeywords.filter((k) => {
    if (!savedFilterTerm.trim()) return true;
    const term = savedFilterTerm.toLowerCase();
    return (
      k.keyword.toLowerCase().includes(term) ||
      (k.topicCluster && k.topicCluster.toLowerCase().includes(term))
    );
  });

  const starterSuggestions = [
    `${project.name.toLowerCase()} vs alternatives`,
    "multi-agent search architecture",
    "b2b content research workflow",
    "brand voice context files",
    "declarative ai benchmarks",
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#fbfbfa]">
      {/* 1. TOP HEADER WITH RESEARCH NAVIGATION & LOCKED KEYWORD COUNTER (X / 100 keywords) */}
      <header className="h-16 shrink-0 border-b border-stone-200/80 bg-white/95 px-6 sm:px-8 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-4">
          {/* Project Dropdown / Info */}
          {projects && onSelectProject ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50/80 px-3 py-1.5 text-xs font-mono text-stone-900 hover:border-stone-300 transition-colors"
              >
                <FolderKanban className="h-3.5 w-3.5 text-stone-600" />
                <span className="font-medium">{project.name}</span>
                {project.domain && (
                  <span className="text-stone-400 hidden sm:inline">({project.domain})</span>
                )}
                <ChevronDown className="h-3 w-3 text-stone-400 ml-0.5" />
              </button>

              {isProjectDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 rounded-xl border border-stone-200 bg-white p-2 shadow-lg z-30">
                  <div className="px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-stone-400">
                    Switch Project ({projects.length} / 20)
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {projects.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          onSelectProject(p.id);
                          setIsProjectDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-mono text-left transition-colors ${
                          p.id === project.id
                            ? "bg-stone-100 text-stone-900 font-medium"
                            : "text-stone-600 hover:bg-stone-50"
                        }`}
                      >
                        <div className="truncate">
                          <div className="font-medium text-stone-900">{p.name}</div>
                          {p.domain && (
                            <div className="text-[10px] text-stone-400">{p.domain}</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h1 className="font-serif text-lg font-medium text-[#14181f]">
                Research Workspace
              </h1>
              <p className="text-[11px] font-mono text-stone-400">
                Project: <span className="text-stone-800 font-medium">{project.name}</span>
              </p>
            </div>
          )}

          <span className="h-5 w-px bg-stone-200 hidden sm:block" />

          {/* RESEARCH NAVIGATION: ONLY Keyword Research & Multi-Agent Research / Brainstorm */}
          <nav className="flex items-center gap-1 rounded-xl border border-stone-200 bg-stone-50 p-1 text-xs font-mono">
            <button
              type="button"
              onClick={() => setResearchNav("keywords")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 transition-colors ${
                researchNav === "keywords"
                  ? "bg-stone-900 text-white font-medium shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Search className="h-3.5 w-3.5" />
              <span>Keyword Research</span>
            </button>

            <button
              type="button"
              onClick={() => setResearchNav("multi-agent")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 transition-colors ${
                researchNav === "multi-agent"
                  ? "bg-stone-900 text-white font-medium shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Multi-Agent Research / Brainstorm</span>
            </button>
          </nav>
        </div>

        {/* LOCKED LIMIT USAGE DISPLAY: EXACT SPECIFICATION "X / 100 keywords" */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50/90 px-3.5 py-1.5 shadow-2xs">
            <Tag className="h-3.5 w-3.5 text-stone-600" />
            <div className="font-mono text-xs">
              <span className="font-semibold text-stone-900">{savedKeywords.length}</span>{" "}
              <span className="text-stone-500">/ 100 keywords</span>
            </div>
            <div className="w-10 h-1.5 rounded-full bg-stone-200 overflow-hidden ml-1">
              <div
                className={`h-full rounded-full transition-all ${
                  savedKeywords.length >= 90 ? "bg-amber-600" : "bg-stone-800"
                }`}
                style={{ width: `${Math.min(100, (savedKeywords.length / 100) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN SCROLLABLE WORKSPACE AREA */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10">
        <div className="mx-auto max-w-5xl space-y-8">
          {/* ======================================================== */}
          {/* SECTION 1: KEYWORD RESEARCH WORKSPACE                     */}
          {/* ======================================================== */}
          {researchNav === "keywords" && (
            <div className="space-y-8">
              {/* SEARCH & INPUT CARD */}
              <div className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-7 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="font-serif text-xl font-normal text-[#14181f]">
                      Keyword Research
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Discover related searches, content gaps, and search intent shifts for {project.name}.
                    </p>
                  </div>

                  {/* Mode Toggle: Topic vs Seed Keyword */}
                  <div className="inline-flex rounded-xl border border-stone-200 bg-stone-50 p-1 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setQueryType("topic")}
                      className={`rounded-lg px-3 py-1 transition-colors ${
                        queryType === "topic"
                          ? "bg-stone-900 text-white font-medium shadow-2xs"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      Topic Mode
                    </button>
                    <button
                      type="button"
                      onClick={() => setQueryType("keyword")}
                      className={`rounded-lg px-3 py-1 transition-colors ${
                        queryType === "keyword"
                          ? "bg-stone-900 text-white font-medium shadow-2xs"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      Seed Keyword
                    </button>
                  </div>
                </div>

                {/* Form Input Area */}
                <form onSubmit={handleExecuteResearch} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={
                          queryType === "topic"
                            ? "Enter topic (e.g. database connection pooling, brand voice ai, llm tracking)..."
                            : "Enter keyword (e.g. gehirn alternative, serverless postgres)..."
                        }
                        className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:bg-white shadow-2xs"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSearching}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#14181f] px-5 py-2.5 text-xs font-medium text-white hover:bg-stone-800 disabled:opacity-50 transition-colors shadow-2xs shrink-0"
                    >
                      {isSearching ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Researching Live Web...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5 text-stone-300" />
                          <span>Run Research</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Context Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-stone-500">
                    <span className="text-stone-400">Context:</span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5 text-stone-700">
                      <FolderKanban className="h-3 w-3" />
                      {project.name}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5 text-stone-700">
                      <FileText className="h-3 w-3" />
                      COMPANY.md
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5 text-stone-700">
                      <Globe className="h-3 w-3" />
                      Firecrawl Live Web
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5 text-stone-700">
                      <Sparkles className="h-3 w-3" />
                      OpenRouter AI
                    </span>
                  </div>

                  {/* Starter Suggestions */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-mono text-stone-400">Suggestions:</span>
                    {starterSuggestions.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => {
                          setQuery(sug);
                          handleExecuteResearch(undefined, sug);
                        }}
                        className="rounded-lg border border-stone-200 bg-white px-2 py-0.5 text-[11px] font-mono text-stone-600 hover:border-stone-400 hover:text-stone-900 transition-colors"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </form>
              </div>

              {/* ERROR STATE WITH RETRY BUTTON */}
              {keywordError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-800">
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                    <span>{keywordError}</span>
                  </div>
                  {lastFailedQuery && (
                    <button
                      type="button"
                      onClick={() => handleExecuteResearch(undefined, lastFailedQuery.query, lastFailedQuery.queryType)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-rose-800 text-white px-3 py-1 font-mono text-[11px] hover:bg-rose-900 transition-colors self-start sm:self-auto shrink-0"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Retry Research</span>
                    </button>
                  )}
                </div>
              )}

              {successNotice && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-center gap-2.5 text-xs text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{successNotice}</span>
                </div>
              )}

              {/* SUB-TABS: Results vs Saved Vault vs History */}
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setKeywordTab("results")}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono transition-colors ${
                      keywordTab === "results"
                        ? "bg-stone-900 text-white font-medium"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    <Compass className="h-3.5 w-3.5" />
                    <span>
                      Research Results{" "}
                      {researchResult ? `(${researchResult.relatedKeywords.length})` : ""}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setKeywordTab("saved")}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono transition-colors ${
                      keywordTab === "saved"
                        ? "bg-stone-900 text-white font-medium"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                    <span>Saved Keywords ({savedKeywords.length} / 100)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setKeywordTab("history")}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono transition-colors ${
                      keywordTab === "history"
                        ? "bg-stone-900 text-white font-medium"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    <History className="h-3.5 w-3.5" />
                    <span>History ({historyRuns.length})</span>
                  </button>
                </div>
              </div>

              {/* TAB 1A: RESEARCH RESULTS */}
              {keywordTab === "results" && (
                <div className="space-y-8">
                  {!researchResult ? (
                    <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center shadow-2xs">
                      <Compass className="h-8 w-8 text-stone-400 mx-auto mb-3" />
                      <h3 className="font-serif text-lg text-stone-800">
                        No keyword research query executed yet
                      </h3>
                      <p className="mt-1 text-xs text-stone-500 max-w-sm mx-auto">
                        Enter a topic or seed keyword above to execute live web research via Firecrawl and analyze opportunities with OpenRouter.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Landscape Overview */}
                      <div className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs uppercase tracking-wider text-stone-400">
                              Search Landscape
                            </span>
                            <span className="rounded-full bg-stone-100 px-2 py-0.5 font-mono text-[10px] text-stone-700">
                              Query: "{researchResult.query}"
                            </span>
                          </div>
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 font-mono text-[10px] text-emerald-700 border border-emerald-200">
                            Status: Completed ✓
                          </span>
                        </div>

                        <p className="text-sm font-serif text-stone-800 leading-relaxed">
                          {researchResult.landscapeSummary}
                        </p>

                        {/* SOURCE VIEWING (FIRECRAWL) */}
                        {researchResult.webSources.length > 0 && (
                          <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center gap-2 text-[11px] font-mono text-stone-400">
                            <span>Live Web Sources ({researchResult.webSources.length}):</span>
                            {researchResult.webSources.map((s, i) => (
                              <a
                                key={i}
                                href={s.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-900 underline truncate max-w-xs"
                                title={s.snippet}
                              >
                                <span>{s.title}</span>
                                <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Keyword Opportunities */}
                      {researchResult.keywordOpportunities.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-stone-800" />
                              <h3 className="font-serif text-lg text-stone-900">
                                Discovered Keyword Opportunities (Content Gaps)
                              </h3>
                            </div>
                            <span className="text-[11px] font-mono text-stone-400">
                              Untapped areas in project content
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {researchResult.keywordOpportunities.map((opp, idx) => {
                              const saved = isKeywordSaved(opp.keyword);
                              return (
                                <div
                                  key={idx}
                                  className="rounded-xl border border-stone-200/90 bg-white p-4 shadow-2xs flex flex-col justify-between hover:border-stone-300 transition-colors"
                                >
                                  <div>
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                      <span className="font-medium text-sm text-stone-900">
                                        {opp.keyword}
                                      </span>
                                      <span className="inline-flex items-center gap-1 rounded bg-stone-100 px-2 py-0.5 font-mono text-[10px] font-medium text-stone-800">
                                        Score: {opp.opportunityScore}/100
                                      </span>
                                    </div>
                                    <p className="text-xs text-stone-600 leading-relaxed mb-3">
                                      {opp.gapRationale}
                                    </p>
                                  </div>

                                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px] font-mono">
                                    <span className="capitalize text-stone-400">
                                      {opp.intent} · {opp.difficulty} diff
                                    </span>
                                    <div className="flex items-center gap-2">
                                      {onDraftArticle && (
                                        <button
                                          type="button"
                                          onClick={() => onDraftArticle(opp.keyword, opp.keyword)}
                                          className="text-stone-600 hover:text-stone-900 underline"
                                        >
                                          Draft Article →
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => handleSaveKeyword(opp)}
                                        disabled={saved}
                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors ${
                                          saved
                                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                            : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                                        }`}
                                      >
                                        {saved ? (
                                          <>
                                            <BookmarkCheck className="h-3 w-3 text-emerald-600" />
                                            <span>Saved</span>
                                          </>
                                        ) : (
                                          <>
                                            <Bookmark className="h-3 w-3" />
                                            <span>Save</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Related Keywords Table */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-stone-800" />
                            <h3 className="font-serif text-lg text-stone-900">
                              Related Keyword Results ({researchResult.relatedKeywords.length})
                            </h3>
                          </div>
                          <span className="text-[11px] font-mono text-stone-400">
                            Save up to 100 keywords in your vault
                          </span>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-2xs">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-stone-100 bg-stone-50/70 text-stone-500 font-mono text-[11px] uppercase tracking-wider">
                                <th className="py-3 px-5">Keyword</th>
                                <th className="py-3 px-3">Intent</th>
                                <th className="py-3 px-3">Opportunity</th>
                                <th className="py-3 px-3">Difficulty</th>
                                <th className="py-3 px-3">Trend</th>
                                <th className="py-3 px-3">Cluster</th>
                                <th className="py-3 px-5 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                              {researchResult.relatedKeywords.map((item, idx) => {
                                const saved = isKeywordSaved(item.keyword);
                                return (
                                  <tr key={idx} className="hover:bg-stone-50/70 transition-colors">
                                    <td className="py-3.5 px-5">
                                      <div className="font-medium text-stone-900">
                                        {item.keyword}
                                      </div>
                                      {item.rationale && (
                                        <div className="text-[11px] text-stone-400 mt-0.5 line-clamp-1">
                                          {item.rationale}
                                        </div>
                                      )}
                                    </td>
                                    <td className="py-3.5 px-3 font-mono">
                                      <span className="inline-flex rounded px-1.5 py-0.5 text-[10px] bg-stone-100 text-stone-700 capitalize">
                                        {item.intent}
                                      </span>
                                    </td>
                                    <td className="py-3.5 px-3 font-mono font-semibold text-stone-900">
                                      {item.opportunityScore}/100
                                    </td>
                                    <td className="py-3.5 px-3 font-mono capitalize text-stone-500">
                                      {item.difficulty}
                                    </td>
                                    <td className="py-3.5 px-3 font-mono text-[11px] text-emerald-700">
                                      {item.trend}
                                    </td>
                                    <td className="py-3.5 px-3 font-mono text-[11px] text-stone-500">
                                      {item.topicCluster}
                                    </td>
                                    <td className="py-3.5 px-5 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        {onDraftArticle && (
                                          <button
                                            type="button"
                                            onClick={() => onDraftArticle(item.keyword, item.keyword)}
                                            className="text-stone-400 hover:text-stone-800 text-[11px] font-mono"
                                            title="Draft article with this keyword"
                                          >
                                            Draft
                                          </button>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => handleSaveKeyword(item)}
                                          disabled={saved}
                                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-mono transition-colors ${
                                            saved
                                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                              : "bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100"
                                          }`}
                                        >
                                          {saved ? (
                                            <>
                                              <BookmarkCheck className="h-3 w-3 text-emerald-600" />
                                              <span>Saved</span>
                                            </>
                                          ) : (
                                            <>
                                              <Bookmark className="h-3 w-3" />
                                              <span>Save</span>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB 1B: SAVED KEYWORDS VAULT */}
              {keywordTab === "saved" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-serif text-lg text-stone-900">
                        Saved Keywords Vault
                      </h3>
                      <p className="text-xs text-stone-500">
                        Curated keywords for {project.name}. Enforced capacity: {savedKeywords.length} / 100 keywords.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                        <input
                          type="text"
                          value={savedFilterTerm}
                          onChange={(e) => setSavedFilterTerm(e.target.value)}
                          placeholder="Filter saved keywords..."
                          className="rounded-lg border border-stone-200 bg-white pl-8 pr-3 py-1.5 text-xs font-mono text-stone-800 focus:outline-none focus:border-stone-900"
                        />
                      </div>
                    </div>
                  </div>

                  {savedKeywords.length === 0 ? (
                    <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center shadow-2xs">
                      <Bookmark className="h-8 w-8 text-stone-400 mx-auto mb-3" />
                      <h4 className="font-serif text-base text-stone-800">
                        No saved keywords in this project yet
                      </h4>
                      <p className="mt-1 text-xs text-stone-500 max-w-sm mx-auto">
                        Search topics above and click "Save" on any keyword to add it to your 100-keyword vault.
                      </p>
                    </div>
                  ) : filteredSavedKeywords.length === 0 ? (
                    <div className="rounded-xl border border-stone-200 bg-white p-8 text-center text-xs text-stone-500">
                      No saved keywords match "{savedFilterTerm}".
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-2xs">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-stone-100 bg-stone-50/70 text-stone-500 font-mono text-[11px] uppercase tracking-wider">
                            <th className="py-3 px-5">Keyword</th>
                            <th className="py-3 px-3">Intent</th>
                            <th className="py-3 px-3">Opportunity</th>
                            <th className="py-3 px-3">Difficulty</th>
                            <th className="py-3 px-3">Trend</th>
                            <th className="py-3 px-3">Cluster</th>
                            <th className="py-3 px-5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {filteredSavedKeywords.map((kw) => (
                            <tr key={kw.id} className="hover:bg-stone-50/70 transition-colors">
                              <td className="py-3.5 px-5">
                                <div className="font-medium text-stone-900">{kw.keyword}</div>
                                {kw.notes && (
                                  <div className="text-[11px] text-stone-400 mt-0.5 line-clamp-1">
                                    {kw.notes}
                                  </div>
                                )}
                              </td>
                              <td className="py-3.5 px-3 font-mono">
                                <span className="inline-flex rounded px-1.5 py-0.5 text-[10px] bg-stone-100 text-stone-700 capitalize">
                                  {kw.intent}
                                </span>
                              </td>
                              <td className="py-3.5 px-3 font-mono font-semibold text-stone-900">
                                {kw.opportunityScore}/100
                              </td>
                              <td className="py-3.5 px-3 font-mono capitalize text-stone-500">
                                {kw.difficulty}
                              </td>
                              <td className="py-3.5 px-3 font-mono text-[11px] text-emerald-700">
                                {kw.trend}
                              </td>
                              <td className="py-3.5 px-3 font-mono text-[11px] text-stone-500">
                                {kw.topicCluster || "General"}
                              </td>
                              <td className="py-3.5 px-5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {onDraftArticle && (
                                    <button
                                      type="button"
                                      onClick={() => onDraftArticle(kw.keyword, kw.keyword)}
                                      className="text-stone-700 hover:text-black text-xs font-mono underline"
                                      title="Draft article with this keyword"
                                    >
                                      Draft →
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSavedKeyword(kw.id, kw.keyword)}
                                    className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                                    title="Remove saved keyword"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 1C: KEYWORD RESEARCH HISTORY */}
              {keywordTab === "history" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-lg text-stone-900">
                        Research History
                      </h3>
                      <p className="text-xs text-stone-500">
                        Historical runs for {project.name}.
                      </p>
                    </div>
                  </div>

                  {historyRuns.length === 0 ? (
                    <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center text-xs text-stone-500 shadow-2xs">
                      No previous research queries recorded yet.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {historyRuns.map((run) => (
                        <div
                          key={run.id}
                          onClick={() => {
                            setResearchResult(run.analysisResult);
                            setQuery(run.query);
                            setQueryType(run.queryType);
                            setKeywordTab("results");
                          }}
                          className="group cursor-pointer rounded-xl border border-stone-200/90 bg-white p-4 shadow-2xs hover:border-stone-400 transition-colors flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-stone-900 text-sm group-hover:text-black">
                                "{run.query}"
                              </span>
                              <span className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[10px] text-stone-600 capitalize">
                                {run.queryType}
                              </span>
                              <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-[10px] text-emerald-700 border border-emerald-200">
                                Completed ✓
                              </span>
                            </div>
                            <p className="text-xs text-stone-500 mt-1 line-clamp-1">
                              {run.analysisResult.landscapeSummary}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 text-right shrink-0">
                            <span className="text-[11px] font-mono text-stone-400">
                              {new Date(run.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span className="text-xs font-mono text-stone-600 group-hover:text-stone-900">
                              Open →
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 2: MULTI-AGENT RESEARCH / BRAINSTORM WORKSPACE    */}
          {/* ======================================================== */}
          {researchNav === "multi-agent" && (
            <div className="space-y-8">
              {/* HEADER / LAUNCHER CARD */}
              <div className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-7 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs uppercase tracking-wider text-stone-400">
                      Multi-Stage AI Pipeline
                    </span>
                    <span className="rounded bg-stone-100 px-2 py-0.5 font-mono text-[10px] text-stone-700">
                      6 Autonomous Agents
                    </span>
                  </div>
                  <h2 className="font-serif text-xl font-normal text-[#14181f]">
                    Multi-Agent Research / Brainstorm
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5 max-w-xl">
                    Executes planning, live Firecrawl web crawling, market analysis, competitor gap detection, brainstorming, and unified synthesis into an authoritative research dossier.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setModalTopic("");
                    setModalKeyword("");
                    setShowMultiAgentModal(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#14181f] px-5 py-2.5 text-xs font-medium text-white hover:bg-stone-800 transition-colors shadow-2xs shrink-0 self-start sm:self-auto"
                >
                  <Sparkles className="h-4 w-4 text-stone-300" />
                  <span>Start New Multi-Agent Run</span>
                </button>
              </div>

              {/* LIST OF COMPLETED RESEARCH RUNS & DOSSIERS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg text-stone-900">
                      Research Dossiers & Runs ({multiAgentDossiers.length})
                    </h3>
                    <p className="text-xs text-stone-500">
                      Persisted research runs for {project.name}. Ready for direct handoff to Content.
                    </p>
                  </div>
                </div>

                {isLoadingDossiers ? (
                  <div className="py-12 text-center text-xs font-mono text-stone-500">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-stone-400" />
                    <span>Loading multi-agent research runs...</span>
                  </div>
                ) : multiAgentDossiers.length === 0 ? (
                  <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center shadow-2xs">
                    <BookOpen className="h-8 w-8 text-stone-400 mx-auto mb-3" />
                    <h4 className="font-serif text-base text-stone-800">
                      No multi-agent research runs recorded yet
                    </h4>
                    <p className="mt-1 text-xs text-stone-500 max-w-sm mx-auto">
                      Launch a multi-stage research run to investigate market dynamics, live documentation, and competitor gaps.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowMultiAgentModal(true)}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#14181f] px-4 py-2 text-xs font-medium text-white"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-stone-300" />
                      <span>Launch Multi-Agent Research</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {multiAgentDossiers.map((dossier) => (
                      <div
                        key={dossier.id}
                        className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-2xs space-y-3.5 hover:border-stone-300 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-serif text-base font-medium text-stone-900">
                                {dossier.topic}
                              </h4>
                              {/* RUN STATUS BADGE */}
                              <span
                                className={`rounded px-2 py-0.5 font-mono text-[10px] border ${
                                  dossier.status === "completed"
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : dossier.status === "failed"
                                    ? "bg-rose-50 text-rose-800 border-rose-200"
                                    : "bg-amber-50 text-amber-800 border-amber-200"
                                }`}
                              >
                                Status: {dossier.status === "completed" ? "Completed ✓" : dossier.status}
                              </span>
                            </div>
                            {dossier.keyword && (
                              <span className="text-[11px] font-mono text-stone-400 mt-0.5 block">
                                Target Keyword: {dossier.keyword}
                              </span>
                            )}
                          </div>

                          <span className="text-[11px] font-mono text-stone-400">
                            {new Date(dossier.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        {dossier.findings && (
                          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                            {dossier.findings}
                          </p>
                        )}

                        {/* SOURCE VIEWING (FIRECRAWL) */}
                        {dossier.sources && dossier.sources.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-stone-400">
                            <span>Sources:</span>
                            {dossier.sources.slice(0, 3).map((s, i) => (
                              <a
                                key={i}
                                href={s.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-900 underline truncate max-w-xs"
                              >
                                <span>{s.title}</span>
                                <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            ))}
                          </div>
                        )}

                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs font-mono">
                          <span className="text-stone-400 text-[11px]">
                            {dossier.facts?.length || 0} facts · {dossier.sources?.length || 0} sources
                          </span>

                          <div className="flex items-center gap-2.5">
                            {dossier.status === "failed" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setModalTopic(dossier.topic);
                                  setModalKeyword(dossier.keyword || "");
                                  setShowMultiAgentModal(true);
                                }}
                                className="inline-flex items-center gap-1 text-rose-700 hover:underline text-xs"
                              >
                                <RotateCcw className="h-3 w-3" />
                                <span>Retry Research</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setViewingDossier(dossier)}
                              className="text-stone-600 hover:text-stone-900 underline text-xs"
                            >
                              View Dossier
                            </button>

                            {onDraftArticle && (
                              <button
                                type="button"
                                onClick={() =>
                                  onDraftArticle(
                                    dossier.topic,
                                    dossier.keyword || undefined,
                                    dossier.synthesizedDossier
                                  )
                                }
                                className="inline-flex items-center gap-1 text-stone-900 font-medium hover:underline text-xs"
                              >
                                <span>Send to Content Workflow →</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. MULTI-AGENT RESEARCH MODAL RUNNER */}
      {showMultiAgentModal && (
        <MultiAgentResearchModal
          project={project}
          initialTopic={modalTopic}
          initialKeyword={modalKeyword}
          onClose={() => {
            setShowMultiAgentModal(false);
            loadMultiAgentDossiers(project.id);
          }}
          onUseInContent={(data) => {
            if (onDraftArticle) {
              onDraftArticle(data.topic, data.keyword, data.researchBrief);
            }
            setShowMultiAgentModal(false);
          }}
        />
      )}

      {/* 4. DOSSIER VIEWER DRAWER / MODAL */}
      {viewingDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-xs">
          <div className="flex h-[88vh] w-full max-w-4xl flex-col rounded-2xl border border-stone-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-stone-200 px-6">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg font-medium text-stone-900">
                    {viewingDossier.topic}
                  </h3>
                  <span className="rounded bg-emerald-50 px-2 py-0.5 font-mono text-[10px] text-emerald-700 border border-emerald-200">
                    Completed ✓
                  </span>
                </div>
                <span className="text-[11px] font-mono text-stone-400">
                  Synthesized Multi-Agent Research Dossier
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(viewingDossier.synthesizedDossier);
                    setCopiedDossierId(viewingDossier.id);
                    setTimeout(() => setCopiedDossierId(null), 2000);
                  }}
                  className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-mono text-stone-700 hover:bg-stone-100"
                >
                  {copiedDossierId === viewingDossier.id ? "Copied!" : "Copy Dossier"}
                </button>
                {onDraftArticle && (
                  <button
                    type="button"
                    onClick={() => {
                      onDraftArticle(
                        viewingDossier.topic,
                        viewingDossier.keyword || undefined,
                        viewingDossier.synthesizedDossier
                      );
                      setViewingDossier(null);
                    }}
                    className="rounded-lg bg-[#14181f] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-stone-800"
                  >
                    Send to Content Workflow →
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setViewingDossier(null)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {/* SOURCES CAROUSEL / CHIPS */}
              {viewingDossier.sources && viewingDossier.sources.length > 0 && (
                <div className="rounded-xl border border-stone-100 bg-stone-50/70 p-4 space-y-2">
                  <div className="font-mono text-xs font-semibold uppercase text-stone-800">
                    Live Web Citations (Firecrawl)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {viewingDossier.sources.map((src, i) => (
                      <a
                        key={i}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-stone-200 bg-white p-2.5 text-xs hover:border-stone-400 transition-colors"
                      >
                        <div className="font-medium text-stone-900 truncate flex items-center justify-between">
                          <span>{src.title}</span>
                          <ExternalLink className="h-3 w-3 text-stone-400 shrink-0 ml-1" />
                        </div>
                        <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">
                          {src.snippet}
                        </p>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* DOSSIER FULL MARKDOWN */}
              <div className="rounded-xl border border-stone-100 bg-white p-6 shadow-2xs">
                <pre className="whitespace-pre-wrap font-serif text-[15px] leading-relaxed text-stone-800">
                  {viewingDossier.synthesizedDossier}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
