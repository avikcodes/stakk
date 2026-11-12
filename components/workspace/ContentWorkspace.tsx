"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  PenLine,
  Search,
  BarChart3,
  Share2,
  Layers,
  Plus,
  FolderKanban,
  FileText,
  Clock,
  ArrowRight,
  ChevronDown,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  RotateCcw,
  Send,
  Volume2,
  Globe,
} from "lucide-react";
import type { ProjectWithStats, ArticleWithContext, BrandVoiceData } from "@/lib/db/content-service";
import { ArticleEditor } from "./ArticleEditor";
import { ArticleGenerationWorkflow } from "./ArticleGenerationWorkflow";
import { ResearchWorkspace } from "./ResearchWorkspace";
import { AnalyticsWorkspace } from "./AnalyticsWorkspace";
import { SocialWorkspace } from "./SocialWorkspace";
import { IntegrationsWorkspace } from "./IntegrationsWorkspace";
import { PublishArticleModal } from "./PublishArticleModal";
import { ProjectContextModal } from "./ProjectContextModal";
import { BrandVoiceModal } from "./BrandVoiceModal";

interface ContentWorkspaceProps {
  initialProjects: ProjectWithStats[];
  initialArticles: ArticleWithContext[];
  initialBrandVoice: BrandVoiceData | null;
}

export function ContentWorkspace({
  initialProjects,
  initialArticles,
  initialBrandVoice,
}: ContentWorkspaceProps) {
  // Navigation & selection state
  const [navSection, setNavSection] = useState<"writing" | "research" | "analytics" | "social" | "integrations">("writing");
  const [projects, setProjects] = useState<ProjectWithStats[]>(initialProjects);
  const [activeProjectId, setActiveProjectId] = useState<string>(initialProjects[0]?.id || "proj-1");
  const [articles, setArticles] = useState<ArticleWithContext[]>(initialArticles);
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "in_review" | "published">("all");
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [brandVoice, setBrandVoice] = useState<BrandVoiceData | null>(initialBrandVoice);

  // Loading & error states
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);
  const [articlesError, setArticlesError] = useState<string | null>(null);

  // Modals state
  const [showGenerationWorkflow, setShowGenerationWorkflow] = useState(false);
  const [showNewArticleModal, setShowNewArticleModal] = useState(false);
  const [publishingArticle, setPublishingArticle] = useState<ArticleWithContext | null>(null);
  const [newArticleTitle, setNewArticleTitle] = useState("");
  const [newArticleKeywords, setNewArticleKeywords] = useState("");
  const [newArticleResearchBrief, setNewArticleResearchBrief] = useState("");
  const [articleError, setArticleError] = useState("");
  const [isSubmittingArticle, setIsSubmittingArticle] = useState(false);

  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showProjectContextModal, setShowProjectContextModal] = useState(false);
  const [showBrandVoiceModal, setShowBrandVoiceModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDomain, setNewProjectDomain] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectIndustry, setNewProjectIndustry] = useState("");
  const [newProjectAudience, setNewProjectAudience] = useState("");
  const [newProjectProducts, setNewProjectProducts] = useState("");
  const [projectError, setProjectError] = useState("");
  const [isSubmittingProject, setIsSubmittingProject] = useState(false);

  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);

  // Active project
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  // URL state synchronization on mount: reads ?project=[id]&article=[id]
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const urlProj = params.get("project");
    const urlArt = params.get("article");

    if (urlProj && projects.some((p) => p.id === urlProj)) {
      setActiveProjectId(urlProj);
    }
    if (urlArt) {
      setEditingArticleId(urlArt);
    }
  }, [projects]);

  // Sync active project and article to URL
  const updateUrlParams = useCallback((projId: string, artId: string | null) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("project", projId);
    if (artId) {
      url.searchParams.set("article", artId);
    } else {
      url.searchParams.delete("article");
    }
    window.history.replaceState(null, "", url.toString());
  }, []);

  // Fetch articles & brand voice when active project changes
  const loadProjectData = useCallback(async (projId: string) => {
    setIsLoadingArticles(true);
    setArticlesError(null);
    try {
      const [artRes, bvRes] = await Promise.all([
        fetch(`/api/articles?projectId=${projId}`),
        fetch(`/api/brand-voice?projectId=${projId}`),
      ]);

      if (!artRes.ok) throw new Error("Failed to load articles");
      const artData = await artRes.json();
      if (artData.articles) setArticles(artData.articles);

      if (bvRes.ok) {
        const bvData = await bvRes.json();
        if (bvData.brandVoice) setBrandVoice(bvData.brandVoice);
      }
    } catch (err: any) {
      console.error(err);
      setArticlesError(err.message || "Failed to load project articles");
    } finally {
      setIsLoadingArticles(false);
    }
  }, []);

  useEffect(() => {
    if (!activeProjectId) return;
    loadProjectData(activeProjectId);
  }, [activeProjectId, loadProjectData]);

  // Handle article creation
  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setArticleError("");

    if (!newArticleTitle.trim()) {
      setArticleError("Please provide an article title.");
      return;
    }

    if (activeProject && activeProject.articlesThisMonth >= activeProject.monthlyArticleLimit) {
      setArticleError(`Monthly limit of ${activeProject.monthlyArticleLimit} articles reached for this project.`);
      return;
    }

    setIsSubmittingArticle(true);
    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: activeProjectId,
          title: newArticleTitle.trim(),
          targetKeywords: newArticleKeywords.trim(),
          researchBrief: newArticleResearchBrief.trim() || undefined,
          content: newArticleResearchBrief.trim()
            ? `## Overview\n\nDraft content informed by multi-agent research:\n\n${newArticleResearchBrief.slice(0, 450)}...\n\n## Key Findings & Architecture\n\nEnter draft content here...`
            : `## Introduction\n\nEnter draft content here...`,
          status: "draft",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setArticleError(data.error || "Failed to create article");
        return;
      }

      setArticles([data.article, ...articles]);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === activeProjectId
            ? { ...p, articlesThisMonth: p.articlesThisMonth + 1 }
            : p
        )
      );
      setShowNewArticleModal(false);
      setNewArticleTitle("");
      setNewArticleKeywords("");
      setNewArticleResearchBrief("");
      // Open editor directly and update URL
      setEditingArticleId(data.article.id);
      updateUrlParams(activeProjectId, data.article.id);
    } catch (err) {
      setArticleError("Failed to create article.");
    } finally {
      setIsSubmittingArticle(false);
    }
  };

  // Handle project creation (20 projects max)
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setProjectError("");

    if (!newProjectName.trim()) {
      setProjectError("Company / Project name is required.");
      return;
    }

    if (!newProjectDomain.trim()) {
      setProjectError("Website URL is required.");
      return;
    }

    if (projects.length >= 20) {
      setProjectError("Maximum limit of 20 projects reached. Plan includes up to 20 projects.");
      return;
    }

    setIsSubmittingProject(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProjectName.trim(),
          domain: newProjectDomain.trim(),
          description: newProjectDescription.trim() || undefined,
          industry: newProjectIndustry.trim() || undefined,
          targetAudience: newProjectAudience.trim() || undefined,
          productsServices: newProjectProducts.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setProjectError(data.error || "Failed to create project");
        return;
      }

      setProjects([data.project, ...projects]);
      setActiveProjectId(data.project.id);
      updateUrlParams(data.project.id, null);
      setShowNewProjectModal(false);
      setNewProjectName("");
      setNewProjectDomain("");
      setNewProjectDescription("");
      setNewProjectIndustry("");
      setNewProjectAudience("");
      setNewProjectProducts("");
      setIsProjectDropdownOpen(false);
    } catch (err) {
      setProjectError("Failed to create project.");
    } finally {
      setIsSubmittingProject(false);
    }
  };

  // Handle article deletion
  const handleDeleteArticle = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Permanently delete this article draft?")) return;

    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== id));
        if (editingArticleId === id) {
          setEditingArticleId(null);
          updateUrlParams(activeProjectId, null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Active article being edited
  const currentEditingArticle = articles.find((a) => a.id === editingArticleId);

  // Filtered articles list
  const filteredArticles = articles.filter((a) => {
    if (statusFilter === "all") return true;
    return a.status === statusFilter;
  });

  // If in editor view, render ArticleEditor
  if (editingArticleId && currentEditingArticle && activeProject) {
    return (
      <ArticleEditor
        article={currentEditingArticle}
        project={activeProject}
        brandVoice={brandVoice}
        onBack={() => {
          setEditingArticleId(null);
          updateUrlParams(activeProjectId, null);
        }}
        onUpdate={(updated) => {
          setArticles((prev) =>
            prev.map((a) => (a.id === updated.id ? updated : a))
          );
        }}
        onDelete={async (id) => {
          try {
            await fetch(`/api/articles/${id}`, { method: "DELETE" });
            setArticles((prev) => prev.filter((a) => a.id !== id));
            setEditingArticleId(null);
            updateUrlParams(activeProjectId, null);
          } catch (e) {
            console.error(e);
          }
        }}
      />
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#fbfbfa] text-[#14181f]">
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      <aside className="w-64 shrink-0 border-r border-stone-200/80 bg-white/95 flex flex-col justify-between">
        <div>
          {/* Brand Wordmark & Plan Indicator */}
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 font-serif text-xl tracking-[-0.02em] text-[#14181f] font-normal"
            >
              <span>STAK</span>
              <span className="rounded-full bg-stone-100 px-2 py-0.5 font-mono text-[10px] text-stone-600 border border-stone-200">
                $129/mo
              </span>
            </Link>
          </div>

          {/* Core Feature Nav Items */}
          <nav className="p-3 space-y-1">
            <button
              type="button"
              onClick={() => setNavSection("writing")}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-mono transition-colors ${
                navSection === "writing"
                  ? "bg-stone-900 text-white font-medium"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <PenLine className="h-4 w-4" />
                <span>Writing</span>
              </div>
              <span className="text-[10px] opacity-70">
                {activeProject?.articlesThisMonth || 0}/250
              </span>
            </button>

            <button
              type="button"
              onClick={() => setNavSection("research")}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-mono transition-colors ${
                navSection === "research"
                  ? "bg-stone-900 text-white font-medium"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Search className="h-4 w-4" />
                <span>Research</span>
              </div>
              <span className="text-[10px] text-stone-400">100 KW</span>
            </button>

            <button
              type="button"
              onClick={() => setNavSection("analytics")}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-mono transition-colors ${
                navSection === "analytics"
                  ? "bg-stone-900 text-white font-medium"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </div>
              <span className="text-[10px] text-stone-400">LLM</span>
            </button>

            <button
              type="button"
              onClick={() => setNavSection("social")}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-mono transition-colors ${
                navSection === "social"
                  ? "bg-stone-900 text-white font-medium"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Share2 className="h-4 w-4" />
                <span>Social</span>
              </div>
              <span className="text-[10px] text-stone-400">Backlinks</span>
            </button>

            <button
              type="button"
              onClick={() => setNavSection("integrations")}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-mono transition-colors ${
                navSection === "integrations"
                  ? "bg-stone-900 text-white font-medium"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="h-4 w-4" />
                <span>Integrations</span>
              </div>
              <span className="text-[10px] text-stone-400">Export</span>
            </button>
          </nav>
        </div>

        {/* Quota & Capacity Meters - EXACT SPECIFICATION: Projects X/20, Articles X/250 this month */}
        <div className="p-4 border-t border-stone-100 bg-stone-50/50 space-y-3.5">
          <div className="rounded-xl border border-stone-200/80 bg-white p-3.5 shadow-2xs space-y-3">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
                Projects
              </div>
              <div className="mt-0.5 flex items-baseline justify-between">
                <span className="font-serif text-xl font-normal text-stone-900">
                  {projects.length}
                </span>
                <span className="font-mono text-xs text-stone-400">
                  / 20
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full bg-stone-800 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (projects.length / 20) * 100)}%` }}
                />
              </div>
            </div>

            <div className="h-px bg-stone-100" />

            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
                Articles
              </div>
              <div className="mt-0.5 flex items-baseline justify-between">
                <span className="font-serif text-xl font-normal text-stone-900">
                  {activeProject?.articlesThisMonth || 0}
                </span>
                <span className="font-mono text-xs text-stone-400">
                  / 250 this month
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full bg-stone-800 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      (((activeProject?.articlesThisMonth || 0) / 250) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <p className="text-[10px] font-mono text-stone-400 text-center">
            Single Flat Plan · All Features
          </p>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {navSection === "research" && activeProject ? (
          <ResearchWorkspace
            project={activeProject}
            projects={projects}
            onSelectProject={(id) => {
              setActiveProjectId(id);
              updateUrlParams(id, null);
            }}
            onDraftArticle={(topic, keyword, researchBrief) => {
              setNewArticleTitle(topic);
              setNewArticleKeywords(keyword || "");
              setNewArticleResearchBrief(researchBrief || "");
              setNavSection("writing");
              setShowNewArticleModal(true);
            }}
          />
        ) : navSection === "analytics" && activeProject ? (
          <AnalyticsWorkspace
            project={activeProject}
            projects={projects}
            onSelectProject={(id) => {
              setActiveProjectId(id);
              updateUrlParams(id, null);
            }}
          />
        ) : navSection === "social" && activeProject ? (
          <SocialWorkspace
            project={activeProject}
            projects={projects}
            onSelectProject={(id) => {
              setActiveProjectId(id);
              updateUrlParams(id, null);
            }}
          />
        ) : navSection === "integrations" && activeProject ? (
          <IntegrationsWorkspace
            project={activeProject}
            projects={projects}
            onSelectProject={(id) => {
              setActiveProjectId(id);
              updateUrlParams(id, null);
            }}
          />
        ) : (
          <>
            {/* Top Bar with Project Selector */}
            <header className="h-16 shrink-0 border-b border-stone-200/80 bg-white/90 px-6 flex items-center justify-between backdrop-blur-sm">
          {/* Project Dropdown & Brand Context */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50/80 px-3 py-2 text-xs font-mono text-stone-900 hover:border-stone-300 transition-colors"
              >
                <FolderKanban className="h-3.5 w-3.5 text-stone-600" />
                <span className="font-medium">{activeProject?.name || "Select Project"}</span>
                {activeProject?.domain && (
                  <span className="text-stone-400 hidden sm:inline">({activeProject.domain})</span>
                )}
                <ChevronDown className="h-3 w-3 text-stone-400 ml-1" />
              </button>

              {/* Dropdown Menu */}
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
                          setActiveProjectId(proj.id);
                          updateUrlParams(proj.id, null);
                          setIsProjectDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-mono text-left transition-colors ${
                          proj.id === activeProjectId
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
                        <span className="text-[10px] text-stone-400 shrink-0">
                          {proj.articlesThisMonth}/250
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-2 pt-2 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProjectDropdownOpen(false);
                        setShowNewProjectModal(true);
                      }}
                      disabled={projects.length >= 20}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-stone-300 py-1.5 text-xs font-mono text-stone-600 hover:text-stone-900 hover:border-stone-400 disabled:opacity-40 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      <span>New Project (Max 20)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Shared Website & Brand Context Inspector Trigger */}
            {activeProject && (
              <button
                type="button"
                onClick={() => setShowProjectContextModal(true)}
                className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50/80 px-2.5 py-2 text-xs font-mono text-stone-700 hover:border-stone-300 hover:bg-stone-100 transition-colors"
                title="Inspect connected website, crawl status, sitemap structure, and company context"
              >
                <Globe className="h-3.5 w-3.5 text-stone-600" />
                <span className="hidden sm:inline">Website Context</span>
              </button>
            )}

            {/* Shared Brand Voice & TONE.md Trigger */}
            {activeProject && (
              <button
                type="button"
                onClick={() => setShowBrandVoiceModal(true)}
                className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50/80 px-2.5 py-2 text-xs font-mono text-stone-700 hover:border-stone-300 hover:bg-stone-100 transition-colors"
                title="Review and edit the project's Brand Voice and TONE.md specification"
              >
                <Volume2 className="h-3.5 w-3.5 text-stone-500" />
                <span className="hidden sm:inline">Brand Voice</span>
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowGenerationWorkflow(true)}
              disabled={activeProject && activeProject.articlesThisMonth >= activeProject.monthlyArticleLimit}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 px-3.5 py-2 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity shadow-xs"
              title={
                activeProject && activeProject.articlesThisMonth >= activeProject.monthlyArticleLimit
                  ? "Monthly limit of 250 articles reached"
                  : "Generate article using multi-stage research workflow"
              }
            >
              <Sparkles className="h-3.5 w-3.5 text-stone-300" />
              <span>Generate Article</span>
            </button>
            <button
              type="button"
              onClick={() => setShowNewArticleModal(true)}
              disabled={activeProject && activeProject.articlesThisMonth >= activeProject.monthlyArticleLimit}
              className="hidden sm:flex items-center gap-1 rounded-xl border border-stone-200 bg-stone-50/80 px-3 py-2 text-xs font-mono text-stone-700 hover:bg-stone-100 disabled:opacity-50 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Blank Draft</span>
            </button>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10">
          {navSection === "writing" ? (
            <div className="mx-auto max-w-5xl">
              {/* Content Header & Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-6 mb-8">
                <div>
                  <h1 className="font-serif text-3xl font-normal text-[#14181f]">
                    Articles
                  </h1>
                  <p className="mt-1 text-xs font-mono text-stone-500">
                    Draft, research, and edit articles for {activeProject?.name}.
                  </p>
                </div>

                {/* Status Tabs */}
                <div className="flex items-center rounded-xl border border-stone-200 bg-white p-1 text-xs font-mono shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setStatusFilter("all")}
                    className={`rounded-lg px-3 py-1.5 transition-colors ${
                      statusFilter === "all"
                        ? "bg-stone-900 text-white font-medium"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    All ({articles.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("draft")}
                    className={`rounded-lg px-3 py-1.5 transition-colors ${
                      statusFilter === "draft"
                        ? "bg-stone-900 text-white font-medium"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    Drafts ({articles.filter((a) => a.status === "draft").length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("in_review")}
                    className={`rounded-lg px-3 py-1.5 transition-colors ${
                      statusFilter === "in_review"
                        ? "bg-stone-900 text-white font-medium"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    In Review ({articles.filter((a) => a.status === "in_review").length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("published")}
                    className={`rounded-lg px-3 py-1.5 transition-colors ${
                      statusFilter === "published"
                        ? "bg-stone-900 text-white font-medium"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    Completed ({articles.filter((a) => a.status === "published").length})
                  </button>
                </div>
              </div>

              {/* Error State Banner */}
              {articlesError && (
                <div className="mb-6 rounded-xl bg-rose-50 border border-rose-200 p-4 flex items-center justify-between text-xs text-rose-800">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                    <span>{articlesError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => loadProjectData(activeProjectId)}
                    className="flex items-center gap-1 font-mono text-[11px] underline hover:no-underline"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Retry</span>
                  </button>
                </div>
              )}

              {/* Loading State Spinner */}
              {isLoadingArticles ? (
                <div className="py-20 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-stone-400 mx-auto mb-2" />
                  <p className="font-mono text-xs text-stone-500">Loading articles...</p>
                </div>
              ) : filteredArticles.length === 0 ? (
                /* Empty State */
                <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center shadow-2xs">
                  <FileText className="h-8 w-8 text-stone-400 mx-auto mb-3" />
                  <h3 className="font-serif text-lg text-stone-800">
                    No articles found in this view
                  </h3>
                  <p className="mt-1 text-xs text-stone-500 max-w-sm mx-auto">
                    Start a new draft backed by multi-agent research and brand voice.
                  </p>
                  <div className="mt-5 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowGenerationWorkflow(true)}
                      disabled={activeProject && activeProject.articlesThisMonth >= activeProject.monthlyArticleLimit}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#14181f] px-4 py-2 text-xs font-medium text-white hover:bg-stone-800 disabled:opacity-50 transition-colors shadow-2xs"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Generate with AI Workflow</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewArticleModal(true)}
                      disabled={activeProject && activeProject.articlesThisMonth >= activeProject.monthlyArticleLimit}
                      className="inline-flex items-center gap-1 rounded-xl border border-stone-200 px-3.5 py-2 text-xs font-mono text-stone-600 hover:bg-stone-50 disabled:opacity-50 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Blank Draft</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Articles Table with Workflow Progress and Status */
                <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-100 bg-stone-50/70 text-stone-500 font-mono text-[11px] uppercase tracking-wider">
                        <th className="py-3.5 px-6">Title</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Workflow Progress</th>
                        <th className="py-3.5 px-4">Words</th>
                        <th className="py-3.5 px-4">Updated</th>
                        <th className="py-3.5 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredArticles.map((article) => {
                        return (
                          <tr
                            key={article.id}
                            onClick={() => {
                              setEditingArticleId(article.id);
                              updateUrlParams(activeProjectId, article.id);
                            }}
                            className="group cursor-pointer hover:bg-stone-50/80 transition-colors"
                          >
                            <td className="py-4 px-6">
                              <div className="font-medium text-[#14181f] text-sm group-hover:text-black">
                                {article.title}
                              </div>
                              {article.targetKeywords && (
                                <div className="mt-1 text-[11px] font-mono text-stone-400">
                                  Keywords: {article.targetKeywords}
                                </div>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-medium border ${
                                  article.status === "published"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                                    : article.status === "in_review"
                                    ? "bg-amber-50 text-amber-700 border-amber-200/60"
                                    : "bg-stone-100 text-stone-600 border-stone-200"
                                }`}
                              >
                                {article.status === "published"
                                  ? "Completed"
                                  : article.status === "in_review"
                                  ? "In Review"
                                  : "Draft"}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-mono text-[11px]">
                              <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5 text-stone-700">
                                Stage: {article.workflowStage || "validate"} ✓
                              </span>
                            </td>
                            <td className="py-4 px-4 font-mono text-stone-500">
                              {article.wordCount}
                            </td>
                            <td className="py-4 px-4 font-mono text-stone-400">
                              {new Date(article.updatedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPublishingArticle(article);
                                  }}
                                  className="p-1 text-stone-400 hover:text-emerald-700 transition-colors"
                                  title="Publish article to CMS or Git"
                                >
                                  <Send className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteArticle(article.id, e)}
                                  className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                                  title="Delete article"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                                <span className="inline-flex items-center text-xs font-mono text-stone-500 group-hover:text-stone-900">
                                  Edit →
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* Other Navigation Sections placeholders */
            <div className="mx-auto max-w-4xl py-12 text-center">
              <div className="rounded-2xl border border-stone-200 bg-white p-12 shadow-2xs">
                <span className="font-mono text-xs uppercase tracking-widest text-stone-400">
                  {navSection.toUpperCase()} WORKSPACE
                </span>
                <h2 className="mt-3 font-serif text-2xl text-[#14181f]">
                  {navSection === "research"
                    ? "Multi-Agent Research & Keyword Vault"
                    : navSection === "analytics"
                    ? "LLM Tracking & Brand Interpretation"
                    : navSection === "social"
                    ? "Community & Reddit Workflows"
                    : "Publishing & Export Integrations"}
                </h2>
                <p className="mt-3 text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                  Feature 1 focuses strictly on the approved Content Foundation (250 articles/month, 20 projects, articles, drafts, editor, brand voice).
                </p>
                <button
                  type="button"
                  onClick={() => setNavSection("writing")}
                  className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-[#14181f] px-4 py-2 text-xs font-medium text-white"
                >
                  Return to Writing
                </button>
              </div>
            </div>
          )}
        </main>
      </>
    )}
  </div>

      {/* 3. NEW ARTICLE MODAL */}
      {showNewArticleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
              <h3 className="font-serif text-lg font-medium text-[#14181f]">
                Create New Article
              </h3>
              <button
                type="button"
                onClick={() => setShowNewArticleModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {articleError && (
              <div className="mb-4 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
                {articleError}
              </div>
            )}

            <form onSubmit={handleCreateArticle} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-medium text-stone-700 mb-1">
                  Article Title
                </label>
                <input
                  type="text"
                  value={newArticleTitle}
                  onChange={(e) => setNewArticleTitle(e.target.value)}
                  placeholder="e.g. Scaling Database Connection Pools"
                  className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-stone-900 shadow-2xs"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-stone-700 mb-1">
                  Target Keywords (Optional)
                </label>
                <input
                  type="text"
                  value={newArticleKeywords}
                  onChange={(e) => setNewArticleKeywords(e.target.value)}
                  placeholder="e.g. postgres scaling, connection pooler"
                  className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-stone-900 shadow-2xs"
                />
              </div>

              {newArticleResearchBrief && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs text-emerald-900 flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono text-[11px] font-semibold uppercase block">
                      Attached Multi-Agent Research Dossier
                    </span>
                    <p className="text-[11px] text-emerald-700 mt-0.5 line-clamp-2">
                      Research brief will be attached to article context and inform the editor draft.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowNewArticleModal(false)}
                  className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-mono text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingArticle}
                  className="rounded-xl bg-[#14181f] px-4 py-2 text-xs font-medium text-white hover:bg-stone-800 disabled:opacity-50"
                >
                  {isSubmittingArticle ? "Creating..." : "Create Draft"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. NEW PROJECT MODAL WITH FIRECRAWL WEBSITE EXTRACTION */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl border border-stone-200 bg-white p-6 shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg font-medium text-[#14181f]">
                    Create Project & Crawl Context
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-mono text-emerald-800 border border-emerald-200">
                    <Sparkles className="h-2.5 w-2.5" />
                    <span>Firecrawl Powered</span>
                  </span>
                </div>
                <p className="text-[11px] font-mono text-stone-400 mt-0.5">
                  {projects.length} of 20 projects active • Shared brand context
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewProjectModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {projectError && (
              <div className="mb-4 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
                {projectError}
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-medium text-stone-700 mb-1">
                    Company Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="e.g. Acme Cloud"
                    className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-stone-900 shadow-2xs font-sans"
                    autoFocus
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-stone-700 mb-1">
                    Website URL <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={newProjectDomain}
                    onChange={(e) => setNewProjectDomain(e.target.value)}
                    placeholder="https://acme.com"
                    className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-stone-900 shadow-2xs font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-stone-700 mb-1">
                  Company Description
                </label>
                <textarea
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="What does the company do and what is its primary value proposition?"
                  rows={2}
                  className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-stone-900 shadow-2xs font-sans resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-medium text-stone-700 mb-1">
                    Industry / Sector
                  </label>
                  <input
                    type="text"
                    value={newProjectIndustry}
                    onChange={(e) => setNewProjectIndustry(e.target.value)}
                    placeholder="e.g. Developer Tools, Cloud Infrastructure"
                    className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-stone-900 shadow-2xs font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-stone-700 mb-1">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    value={newProjectAudience}
                    onChange={(e) => setNewProjectAudience(e.target.value)}
                    placeholder="e.g. Engineering leaders, backend developers"
                    className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-stone-900 shadow-2xs font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-stone-700 mb-1">
                  Products & Services
                </label>
                <input
                  type="text"
                  value={newProjectProducts}
                  onChange={(e) => setNewProjectProducts(e.target.value)}
                  placeholder="e.g. Managed Postgres, Instant Branching, Edge Pooling"
                  className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-stone-900 shadow-2xs font-sans"
                />
              </div>

              {/* Firecrawl Context Notice */}
              <div className="rounded-xl border border-stone-100 bg-stone-50/80 p-3 flex items-start gap-2.5 text-xs text-stone-600 font-sans leading-relaxed">
                <Sparkles className="h-4 w-4 text-stone-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-stone-800">Firecrawl Web Extraction:</span> Stak will crawl your website to extract company information, products/services, important pages, terminology, and market positioning into shared project context.
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-mono text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProject}
                  className="flex items-center gap-1.5 rounded-xl bg-[#14181f] px-4 py-2 text-xs font-medium text-white hover:bg-stone-800 disabled:opacity-50 shadow-2xs"
                >
                  {isSubmittingProject ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Crawling Website & Creating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3" />
                      <span>Create Project & Crawl</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MULTI-STAGE ARTICLE GENERATION WORKFLOW (HUMAN-IN-THE-LOOP) */}
      {showGenerationWorkflow && activeProject && (
        <ArticleGenerationWorkflow
          project={activeProject}
          brandVoice={brandVoice}
          onClose={() => setShowGenerationWorkflow(false)}
          onComplete={(newArticle) => {
            setArticles((prev) => [newArticle, ...prev.filter((a) => a.id !== newArticle.id)]);
            setProjects((prev) =>
              prev.map((p) =>
                p.id === activeProjectId
                  ? { ...p, articlesThisMonth: p.articlesThisMonth + 1 }
                  : p
              )
            );
            setEditingArticleId(newArticle.id);
            updateUrlParams(activeProjectId, newArticle.id);
            setShowGenerationWorkflow(false);
          }}
        />
      )}

      {/* 6. PUBLISH ARTICLE MODAL */}
      {publishingArticle && activeProject && (
        <PublishArticleModal
          article={publishingArticle}
          project={activeProject}
          isOpen={!!publishingArticle}
          onClose={() => setPublishingArticle(null)}
          onPublished={(updated) => {
            setArticles((prev) =>
              prev.map((a) => (a.id === updated.id ? { ...a, status: "published" } : a))
            );
            setPublishingArticle(null);
          }}
        />
      )}

      {/* 7. SHARED PROJECT BRAND CONTEXT MODAL */}
      {showProjectContextModal && activeProject && (
        <ProjectContextModal
          project={activeProject}
          isOpen={showProjectContextModal}
          onClose={() => setShowProjectContextModal(false)}
          onOpenBrandVoice={() => setShowBrandVoiceModal(true)}
          onContextUpdated={(updated) => {
            setProjects((prev) =>
              prev.map((p) =>
                p.id === activeProject.id
                  ? {
                      ...p,
                      companyContext: updated.companyContextMarkdown,
                      description: updated.companyDescription || p.description,
                      industry: updated.industry || p.industry,
                      targetAudience: updated.targetAudience || p.targetAudience,
                    }
                  : p
              )
            );
          }}
        />
      )}

      {/* 8. SHARED BRAND VOICE & TONE.MD MODAL */}
      {showBrandVoiceModal && activeProject && (
        <BrandVoiceModal
          project={activeProject}
          isOpen={showBrandVoiceModal}
          onClose={() => setShowBrandVoiceModal(false)}
          onVoiceUpdated={(updated) => {
            setBrandVoice(updated as any);
          }}
        />
      )}
    </div>
  );
}
