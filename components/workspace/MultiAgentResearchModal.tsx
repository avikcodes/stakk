"use client";

import { useState } from "react";
import {
  Sparkles,
  Search,
  Globe,
  TrendingUp,
  Target,
  Lightbulb,
  FileText,
  CheckCircle2,
  Loader2,
  AlertCircle,
  X,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Bookmark,
  Layers,
} from "lucide-react";
import type { ProjectWithStats } from "@/lib/db/content-service";
import {
  MULTI_AGENT_STAGES,
  MultiAgentStageKey,
} from "@/lib/ai/multi-agent-research";
import type { MultiAgentResearchData } from "@/lib/db/research-service";

interface MultiAgentResearchModalProps {
  project: ProjectWithStats;
  initialTopic?: string;
  initialKeyword?: string;
  onClose: () => void;
  onUseInContent: (data: {
    topic: string;
    keyword?: string;
    researchBrief: string;
    outline?: string;
  }) => void;
}

export function MultiAgentResearchModal({
  project,
  initialTopic = "",
  initialKeyword = "",
  onClose,
  onUseInContent,
}: MultiAgentResearchModalProps) {
  // Input fields
  const [topic, setTopic] = useState(initialTopic);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [instructions, setInstructions] = useState("");

  // Workflow state
  const [isRunning, setIsRunning] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(-1);
  const [stageOutputs, setStageOutputs] = useState<Partial<Record<MultiAgentStageKey, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [completedResult, setCompletedResult] = useState<MultiAgentResearchData | null>(null);
  const [copiedDossier, setCopiedDossier] = useState(false);

  // Active view tab once completed
  const [activeResultTab, setActiveResultTab] = useState<
    "dossier" | "facts" | "sources" | "angles" | "opportunities"
  >("dossier");

  // Run the multi-stage research pipeline sequentially
  const handleStartResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError("Please enter a research topic.");
      return;
    }

    setError(null);
    setIsRunning(true);
    setCompletedResult(null);

    const outputs: Partial<Record<MultiAgentStageKey, string>> = {};
    let activeResearchId: string | undefined = undefined;

    try {
      for (let i = 0; i < MULTI_AGENT_STAGES.length; i++) {
        const stageInfo = MULTI_AGENT_STAGES[i];
        setCurrentStageIndex(i);

        const res: Response = await fetch("/api/research/multi-agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: project.id,
            topic: topic.trim(),
            keyword: keyword.trim() || undefined,
            instructions: instructions.trim() || undefined,
            stage: stageInfo.key,
            previousOutputs: outputs,
            researchId: activeResearchId,
          }),
        });

        if (!res.ok) {
          const errData: any = await res.json();
          throw new Error(errData.error || `Stage ${stageInfo.name} failed`);
        }

        const data: any = await res.json();
        outputs[stageInfo.key] = data.output;
        setStageOutputs({ ...outputs });

        if (data.researchId) {
          activeResearchId = data.researchId;
        }

        if (stageInfo.key === "synthesis" && data.finalResearch) {
          setCompletedResult(data.finalResearch);
        }
      }
    } catch (err: any) {
      console.error("Multi-agent research error:", err);
      setError(err.message || "Failed to execute multi-agent research");
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyDossier = () => {
    if (!completedResult?.synthesizedDossier) return;
    navigator.clipboard.writeText(completedResult.synthesizedDossier);
    setCopiedDossier(true);
    setTimeout(() => setCopiedDossier(false), 2000);
  };

  const currentStageInfo =
    currentStageIndex >= 0 ? MULTI_AGENT_STAGES[currentStageIndex] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-xs">
      <div className="flex h-[90vh] w-full max-w-5xl flex-col rounded-2xl border border-stone-200 bg-[#fbfbfa] shadow-2xl overflow-hidden">
        {/* MODAL HEADER */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-stone-200 bg-white px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-stone-900 to-stone-800 text-white shadow-2xs">
              <Sparkles className="h-4 w-4 text-stone-200" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-medium text-stone-900">
                Multi-Agent Research / Brainstorm
              </h2>
              <p className="font-mono text-[11px] text-stone-400">
                6 Specialized AI Stages · Live Firecrawl Web Signals · Project: {project.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* WORKFLOW STEPPER BAR */}
        <div className="shrink-0 border-b border-stone-200 bg-stone-50/70 px-6 py-2.5 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max text-xs font-mono">
            {MULTI_AGENT_STAGES.map((st, i) => {
              const isPast =
                currentStageIndex > i ||
                (currentStageIndex === MULTI_AGENT_STAGES.length - 1 && !isRunning);
              const isCurrent = currentStageIndex === i && isRunning;

              return (
                <div key={st.key} className="flex items-center gap-2">
                  {i > 0 && <span className="text-stone-300">→</span>}
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-colors ${
                      isCurrent
                        ? "bg-stone-900 text-white font-medium shadow-2xs"
                        : isPast
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200/80"
                        : "bg-white text-stone-400 border border-stone-200/70"
                    }`}
                  >
                    {isCurrent ? (
                      <Loader2 className="h-3 w-3 animate-spin text-stone-200" />
                    ) : isPast ? (
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <span className="h-3 w-3 rounded-full border border-stone-300 flex items-center justify-center text-[9px]">
                        {i + 1}
                      </span>
                    )}
                    <span>{st.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BODY AREA */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* VIEW A: INITIAL SETUP INPUT (WHEN NOT STARTED YET) */}
          {currentStageIndex === -1 && !completedResult && (
            <div className="mx-auto max-w-2xl py-6 space-y-6">
              <div className="text-center space-y-2">
                <h3 className="font-serif text-2xl font-normal text-stone-900">
                  Ground Research in 6 Autonomous AI Stages
                </h3>
                <p className="text-xs text-stone-500 max-w-lg mx-auto leading-relaxed">
                  Stak launches specialized agents to plan technical questions, scrape live documentation via Firecrawl, evaluate competitor gaps, and synthesize a verified research brief for your content.
                </p>
              </div>

              {error && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleStartResearch} className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-2xs space-y-4">
                <div>
                  <label className="block font-mono text-xs font-semibold uppercase text-stone-700 mb-1.5">
                    Research Topic <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Scaling Postgres Connection Pools in Serverless Stacks"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:bg-white shadow-2xs"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs font-semibold uppercase text-stone-700 mb-1.5">
                    Target Keyword (Optional)
                  </label>
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="e.g. serverless postgres connection pooler"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:bg-white shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs font-semibold uppercase text-stone-700 mb-1.5">
                    Specialized Instructions & Focus Areas (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g. Cite specific latency benchmarks; compare with PgBouncer; emphasize failure modes under 1,000 concurrent edge lambdas."
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-3 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:bg-white shadow-2xs leading-relaxed"
                  />
                </div>

                <div className="rounded-xl border border-stone-100 bg-stone-50 p-3 text-[11px] font-mono text-stone-500 flex items-center justify-between">
                  <span>Context: {project.name} COMPANY.md attached</span>
                  <span className="text-stone-400">Live Firecrawl Search</span>
                </div>

                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-mono text-stone-600 hover:bg-stone-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#14181f] px-5 py-2.5 text-xs font-medium text-white hover:bg-stone-800 transition-colors shadow-2xs"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-stone-300" />
                    <span>Launch 6-Stage Research</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* VIEW B: ACTIVE RUNNING WORKFLOW VIEW */}
          {isRunning && currentStageInfo && (
            <div className="mx-auto max-w-3xl space-y-6 py-6">
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-2xs space-y-4 text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-900 text-white shadow-md mx-auto">
                  <Loader2 className="h-5 w-5 animate-spin text-stone-200" />
                </div>
                <div>
                  <div className="font-mono text-xs uppercase tracking-wider text-stone-400">
                    Active Agent (Stage {currentStageIndex + 1} of {MULTI_AGENT_STAGES.length})
                  </div>
                  <h3 className="font-serif text-xl text-stone-900 mt-1">
                    {currentStageInfo.name}
                  </h3>
                  <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">
                    {currentStageInfo.description}
                  </p>
                </div>
              </div>

              {/* Real-time Preview of Completed Stages */}
              <div className="space-y-3">
                <div className="font-mono text-xs uppercase tracking-wider text-stone-400">
                  Completed Stages Output
                </div>
                {Object.entries(stageOutputs).map(([key, content]) => {
                  const stageMeta = MULTI_AGENT_STAGES.find((s) => s.key === key);
                  return (
                    <div
                      key={key}
                      className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-medium text-stone-900">
                          {stageMeta?.name || key} ✓
                        </span>
                        <span className="font-mono text-[10px] text-stone-400">
                          {stageMeta?.role}
                        </span>
                      </div>
                      <pre className="font-mono text-[11px] text-stone-600 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                        {content}
                      </pre>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW C: COMPLETED RESEARCH DOSSIER & WORKFLOW INTEGRATION */}
          {!isRunning && completedResult && (
            <div className="space-y-6">
              {/* TOP ACTION BAR: USE IN CONTENT WORKFLOW */}
              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    Multi-Agent Synthesis Complete
                  </span>
                  <h3 className="font-serif text-xl text-stone-900 mt-1 font-normal">
                    {completedResult.topic}
                  </h3>
                </div>

                {/* Primary Content Workflow CTA */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyDossier}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs font-mono text-stone-700 hover:bg-stone-100 transition-colors"
                  >
                    {copiedDossier ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Dossier</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onUseInContent({
                        topic: completedResult.topic,
                        keyword: completedResult.keyword || undefined,
                        researchBrief: completedResult.synthesizedDossier,
                        outline: completedResult.topicAngles?.[0] || undefined,
                      });
                      onClose();
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#14181f] px-5 py-2 text-xs font-medium text-white hover:bg-stone-800 transition-colors shadow-2xs"
                  >
                    <Layers className="h-3.5 w-3.5 text-stone-300" />
                    <span>Send to Content Workflow →</span>
                  </button>
                </div>
              </div>

              {/* TABS FOR RESEARCH ARTIFACTS */}
              <div className="flex items-center gap-2 border-b border-stone-200 pb-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setActiveResultTab("dossier")}
                  className={`rounded-lg px-3 py-1.5 transition-colors ${
                    activeResultTab === "dossier"
                      ? "bg-stone-900 text-white font-medium"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  Synthesized Dossier
                </button>
                <button
                  type="button"
                  onClick={() => setActiveResultTab("facts")}
                  className={`rounded-lg px-3 py-1.5 transition-colors ${
                    activeResultTab === "facts"
                      ? "bg-stone-900 text-white font-medium"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  Important Facts ({completedResult.facts?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveResultTab("sources")}
                  className={`rounded-lg px-3 py-1.5 transition-colors ${
                    activeResultTab === "sources"
                      ? "bg-stone-900 text-white font-medium"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  Live Web Sources ({completedResult.sources?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveResultTab("angles")}
                  className={`rounded-lg px-3 py-1.5 transition-colors ${
                    activeResultTab === "angles"
                      ? "bg-stone-900 text-white font-medium"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  Topic Angles & Content Ideas
                </button>
                <button
                  type="button"
                  onClick={() => setActiveResultTab("opportunities")}
                  className={`rounded-lg px-3 py-1.5 transition-colors ${
                    activeResultTab === "opportunities"
                      ? "bg-stone-900 text-white font-medium"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  Opportunities ({completedResult.opportunities?.length || 0})
                </button>
              </div>

              {/* TAB 1: SYNTHESIZED DOSSIER (MARKDOWN FORMATTED) */}
              {activeResultTab === "dossier" && (
                <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-2xs">
                  <pre className="whitespace-pre-wrap font-serif text-[15px] leading-relaxed text-stone-800">
                    {completedResult.synthesizedDossier}
                  </pre>
                </div>
              )}

              {/* TAB 2: IMPORTANT FACTS */}
              {activeResultTab === "facts" && (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-2xs">
                    <h4 className="font-serif text-lg text-stone-900 mb-4">
                      Verified Technical Facts & Empirical Metrics
                    </h4>
                    <div className="space-y-2.5">
                      {completedResult.facts?.map((fact, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 rounded-xl border border-stone-100 bg-stone-50/60 p-3 text-xs text-stone-700"
                        >
                          <span className="font-mono text-stone-400 font-semibold">{idx + 1}.</span>
                          <span className="leading-relaxed">{fact}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SOURCES & CITATIONS (FROM FIRECRAWL) */}
              {activeResultTab === "sources" && (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-2xs space-y-3">
                    <h4 className="font-serif text-lg text-stone-900 mb-2">
                      Primary Sources & Citations Extracted via Firecrawl
                    </h4>
                    {completedResult.sources?.map((s, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-stone-200/80 bg-stone-50/50 p-4 space-y-1.5"
                      >
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-sm text-stone-900 hover:underline inline-flex items-center gap-1.5"
                        >
                          <span>{s.title}</span>
                          <ExternalLink className="h-3 w-3 text-stone-400" />
                        </a>
                        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                          {s.snippet}
                        </p>
                        <span className="text-[10px] font-mono text-stone-400 truncate block">
                          {s.url}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: TOPIC ANGLES & CONTENT IDEAS */}
              {activeResultTab === "angles" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {completedResult.contentIdeas?.map((idea, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="font-serif text-base text-stone-900 mb-1">
                            {idea.title}
                          </div>
                          <p className="text-xs text-stone-600 leading-relaxed mb-3">
                            {idea.angle}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] font-mono">
                          <span className="text-stone-400">Angle {idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              onUseInContent({
                                topic: idea.title,
                                keyword: completedResult.keyword || undefined,
                                researchBrief: completedResult.synthesizedDossier,
                                outline: idea.takeaway,
                              });
                              onClose();
                            }}
                            className="inline-flex items-center gap-1 text-stone-900 font-medium hover:underline"
                          >
                            <span>Draft this Angle</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: OPPORTUNITIES */}
              {activeResultTab === "opportunities" && (
                <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-2xs space-y-3">
                  <h4 className="font-serif text-lg text-stone-900 mb-2">
                    Actionable Opportunities for {project.name}
                  </h4>
                  <div className="space-y-2">
                    {completedResult.opportunities?.map((opp, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 rounded-xl border border-stone-100 bg-stone-50 p-3 text-xs text-stone-700"
                      >
                        <Target className="h-4 w-4 text-stone-800 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{opp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
