"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Globe,
  Sparkles,
  ExternalLink,
  RotateCw,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Building,
  Target,
  Layers,
  FileText,
  BookOpen,
  Volume2,
  Copy,
  Check,
  FolderTree,
  Clock,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { ProjectWithStats } from "@/lib/db/content-service";
import { ProjectBrandContextData } from "@/lib/db/brand-context-service";
import { BrandVoiceData } from "@/lib/db/brand-voice-service";

interface ProjectContextModalProps {
  project: ProjectWithStats;
  isOpen: boolean;
  onClose: () => void;
  onContextUpdated?: (updated: ProjectBrandContextData) => void;
  onOpenBrandVoice?: () => void;
}

export function ProjectContextModal({
  project,
  isOpen,
  onClose,
  onContextUpdated,
  onOpenBrandVoice,
}: ProjectContextModalProps) {
  const [context, setContext] = useState<ProjectBrandContextData | null>(null);
  const [brandVoice, setBrandVoice] = useState<BrandVoiceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReCrawling, setIsReCrawling] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "company" | "pages" | "structure" | "brand" | "companymd"
  >("company");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedMd, setCopiedMd] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);
    setErrorMsg(null);

    fetch(`/api/projects/context?projectId=${project.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          if (data.context) {
            setContext(data.context);
          }
          if (data.brandVoice) {
            setBrandVoice(data.brandVoice);
          }
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to load project brand context:", err);
          setErrorMsg("Could not load website context from database.");
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, project.id]);

  const handleReCrawl = async () => {
    setIsReCrawling(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/projects/context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          websiteUrl: context?.websiteUrl || project.domain || "https://example.com",
          companyName: project.name,
          reCrawl: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to crawl website");
      }

      setContext(data.context);
      if (data.brandVoice) {
        setBrandVoice(data.brandVoice);
      }
      setSuccessMsg("Successfully crawled website with Firecrawl, mapped site structure, and refreshed brand context!");

      if (onContextUpdated) {
        onContextUpdated(data.context);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to crawl website context.");
    } finally {
      setIsReCrawling(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (!context?.companyContextMarkdown) return;
    navigator.clipboard.writeText(context.companyContextMarkdown);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  if (!isOpen) return null;

  const siteStructure = context?.siteStructure || [];
  const uniqueSections = Array.from(new Set(siteStructure.map((s) => s.section)));
  const filteredStructure =
    selectedSection === "all"
      ? siteStructure
      : siteStructure.filter((s) => s.section === selectedSection);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-4xl rounded-2xl border border-stone-200 bg-white shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-stone-200 bg-white p-2.5 text-stone-800 shadow-2xs">
              <Globe className="h-5 w-5 text-stone-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-medium text-stone-900">
                  {project.name} • Website & Brand Context
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-mono text-emerald-800 border border-emerald-200">
                  <Sparkles className="h-2.5 w-2.5" />
                  <span>Firecrawl v2 Engine</span>
                </span>
                {context && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono border ${
                      context.crawlStatus === "completed"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : context.crawlStatus === "crawling"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    <span className="capitalize">{context.crawlStatus}</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs font-mono text-stone-500 mt-1">
                <a
                  href={context?.websiteUrl || `https://${project.domain || "example.com"}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-stone-700 underline hover:text-stone-950"
                >
                  <span>{context?.websiteUrl || project.domain}</span>
                  <ExternalLink className="h-3 w-3 text-stone-400" />
                </a>
                <span>•</span>
                <span className="flex items-center gap-1 text-stone-400">
                  <Clock className="h-3 w-3" />
                  {context?.crawledAt
                    ? `Last updated: ${new Date(context.crawledAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`
                    : "Not crawled yet"}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Status Messages */}
        {successMsg && (
          <div className="bg-emerald-50 px-6 py-2 border-b border-emerald-200 flex items-center justify-between text-xs text-emerald-800 font-mono">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button type="button" onClick={() => setSuccessMsg(null)}>
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-50 px-6 py-2 border-b border-rose-200 flex items-center justify-between text-xs text-rose-800 font-mono">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button type="button" onClick={() => setErrorMsg(null)}>
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* View Switcher Tabs & Refresh Action */}
        <div className="px-6 pt-3 border-b border-stone-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2 font-mono text-xs overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("company")}
              className={`pb-2.5 px-1 border-b-2 font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === "company"
                  ? "border-stone-900 text-stone-900"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              <Building className="h-3.5 w-3.5" />
              <span>Company Context</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("pages")}
              className={`pb-2.5 px-1 border-b-2 font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === "pages"
                  ? "border-stone-900 text-stone-900"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Important Pages ({context?.importantPages?.length || 0})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("structure")}
              className={`pb-2.5 px-1 border-b-2 font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === "structure"
                  ? "border-stone-900 text-stone-900"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              <FolderTree className="h-3.5 w-3.5" />
              <span>Site Structure & Sitemap ({siteStructure.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("brand")}
              className={`pb-2.5 px-1 border-b-2 font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === "brand"
                  ? "border-stone-900 text-stone-900"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              <Volume2 className="h-3.5 w-3.5" />
              <span>Brand Voice Context</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("companymd")}
              className={`pb-2.5 px-1 border-b-2 font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === "companymd"
                  ? "border-stone-900 text-stone-900"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>COMPANY.md</span>
            </button>
          </div>

          {/* Refresh Website Context Button */}
          <button
            type="button"
            onClick={handleReCrawl}
            disabled={isReCrawling}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 px-3 py-1.5 text-xs font-mono text-stone-800 transition-colors mb-2 disabled:opacity-50 shrink-0 shadow-2xs"
            title="Re-crawl connected website with Firecrawl, discover pages, map site structure, and refresh brand voice in Neon"
          >
            {isReCrawling ? (
              <>
                <RotateCw className="h-3 w-3 animate-spin text-stone-600" />
                <span>Crawling Website...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3 text-stone-600" />
                <span>Refresh Website Context</span>
              </>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#fcfcfa]">
          {isLoading ? (
            <div className="p-16 text-center text-xs font-mono text-stone-400 space-y-2">
              <RotateCw className="mx-auto h-5 w-5 animate-spin text-stone-400" />
              <div>Loading brand & website context from Neon...</div>
            </div>
          ) : !context ? (
            <div className="p-12 text-center text-xs font-mono text-stone-500 space-y-3">
              <AlertCircle className="mx-auto h-7 w-7 text-stone-400" />
              <div className="font-semibold text-stone-800">No website context found for this project.</div>
              <p className="text-stone-500 max-w-sm mx-auto">
                Connect and crawl your website to build the shared context powering Content, Research, LLM Tracking, and Brand Interpretation.
              </p>
              <button
                type="button"
                onClick={handleReCrawl}
                disabled={isReCrawling}
                className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-mono text-white hover:bg-stone-800"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Crawl Website Now</span>
              </button>
            </div>
          ) : (
            <>
              {/* TAB 1: COMPANY CONTEXT & PRODUCTS */}
              {activeTab === "company" && (
                <div className="space-y-4">
                  {/* Website & Metadata Card */}
                  <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                          Connected Website
                        </div>
                        <a
                          href={context.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-xs text-stone-900 underline hover:text-black mt-0.5 font-medium"
                        >
                          <span>{context.websiteUrl}</span>
                          <ExternalLink className="h-3 w-3 text-stone-400" />
                        </a>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                          Industry & Domain
                        </div>
                        <div className="text-xs font-medium text-stone-800 font-sans mt-0.5">
                          {context.industry}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                        Target Audience
                      </div>
                      <p className="text-xs text-stone-700 font-sans mt-0.5">
                        {context.targetAudience}
                      </p>
                    </div>

                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                        Company Overview & Mission
                      </div>
                      <p className="text-xs text-stone-800 font-sans mt-0.5 leading-relaxed">
                        {context.companyDescription}
                      </p>
                      {context.companyInformation &&
                        context.companyInformation !== context.companyDescription && (
                          <p className="text-xs text-stone-600 font-sans mt-1.5 leading-relaxed">
                            {context.companyInformation}
                          </p>
                        )}
                    </div>
                  </div>

                  {/* Market Positioning */}
                  <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-stone-400">
                      <Target className="h-3 w-3 text-stone-500" />
                      <span>Market Positioning & Strategic Stance</span>
                    </div>
                    <p className="text-xs text-stone-800 font-sans leading-relaxed">
                      {context.positioning}
                    </p>
                  </div>

                  {/* Products & Services Catalog */}
                  <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-stone-400">
                        <Layers className="h-3 w-3 text-stone-500" />
                        <span>Products & Services ({context.productsServices?.length || 0})</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {context.productsServices?.map((item, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-mono text-stone-800"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: IMPORTANT PAGES & CONTENT */}
              {activeTab === "pages" && (
                <div className="space-y-4">
                  {/* Important Pages Discovered */}
                  <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                        Important Pages Discovered ({context.importantPages?.length || 0})
                      </span>
                      <span className="text-[11px] font-mono text-stone-400">
                        Crawled with Firecrawl
                      </span>
                    </div>
                    <div className="space-y-2">
                      {context.importantPages?.map((page, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-lg border border-stone-100 bg-stone-50/70 p-3 text-xs font-mono"
                        >
                          <div className="space-y-0.5">
                            <span className="font-semibold text-stone-900">{page.title}</span>
                            <div className="text-[11px] text-stone-600 font-sans">
                              {page.purpose}
                            </div>
                          </div>
                          <a
                            href={page.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-stone-700 underline hover:text-stone-950 font-medium ml-4 shrink-0"
                          >
                            <span>Open</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Website Content Summary */}
                  <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs space-y-2">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                      Extracted Website Content Summary
                    </div>
                    <p className="text-xs text-stone-700 font-sans leading-relaxed whitespace-pre-line">
                      {context.websiteContent}
                    </p>
                  </div>

                  {/* Domain Terminology & Glossary */}
                  <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs space-y-2.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-stone-400">
                      <BookOpen className="h-3 w-3 text-stone-500" />
                      <span>Domain Terminology & Brand Glossary ({context.terminology?.length || 0})</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {context.terminology?.map((term, i) => (
                        <div
                          key={i}
                          className="rounded-lg border border-stone-100 bg-stone-50/70 p-3 space-y-1 font-mono text-xs"
                        >
                          <div className="font-semibold text-stone-900">{term.term}</div>
                          <div className="text-[11px] text-stone-600 font-sans leading-relaxed">
                            {term.definition}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Existing Content Themes */}
                  {context.existingContent?.length > 0 && (
                    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs space-y-2">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                        Existing Content Pillars Found on Site
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {context.existingContent.map((theme, i) => (
                          <span
                            key={i}
                            className="rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-mono text-stone-700"
                          >
                            • {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SITE STRUCTURE & SITEMAP */}
              {activeTab === "structure" && (
                <div className="space-y-4">
                  {/* Summary Banner */}
                  <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-stone-900 font-mono">
                        Site Structure & Sitemap Hierarchy
                      </div>
                      <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                        {siteStructure.length} routes mapped across {uniqueSections.length} functional sections.
                      </p>
                    </div>
                    <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                      Sitemap Indexed
                    </span>
                  </div>

                  {/* Section Filters */}
                  {uniqueSections.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedSection("all")}
                        className={`rounded-lg px-2.5 py-1 text-xs font-mono transition-colors ${
                          selectedSection === "all"
                            ? "bg-stone-900 text-white"
                            : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
                        }`}
                      >
                        All ({siteStructure.length})
                      </button>
                      {uniqueSections.map((sec) => {
                        const count = siteStructure.filter((s) => s.section === sec).length;
                        return (
                          <button
                            key={sec}
                            type="button"
                            onClick={() => setSelectedSection(sec)}
                            className={`rounded-lg px-2.5 py-1 text-xs font-mono transition-colors ${
                              selectedSection === sec
                                ? "bg-stone-900 text-white"
                                : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
                            }`}
                          >
                            {sec} ({count})
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Hierarchical Structure List */}
                  <div className="rounded-xl border border-stone-200 bg-white shadow-2xs divide-y divide-stone-100 overflow-hidden">
                    {filteredStructure.map((node, i) => (
                      <div
                        key={i}
                        className="p-3 hover:bg-stone-50/70 transition-colors flex items-center justify-between text-xs font-mono"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                              node.section === "Core"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : node.section === "Product"
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : node.section === "Documentation"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : node.section === "Resources"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : node.section === "Company"
                                ? "bg-stone-100 text-stone-700 border border-stone-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {node.section}
                          </span>
                          <div>
                            <span className="font-semibold text-stone-900">{node.path}</span>
                            <span className="text-stone-400 ml-2 font-sans font-normal">
                              ({node.title})
                            </span>
                            <div className="text-[11px] text-stone-500 font-sans mt-0.5">
                              {node.purpose}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] text-stone-400 shrink-0 ml-3">
                          Depth {node.depth}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: BRAND VOICE CONTEXT */}
              {activeTab === "brand" && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                          Active Brand Voice Status
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-semibold text-stone-900 font-mono">
                            {brandVoice ? "Calibrated from Website & Articles" : "Default Project Voice"}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                              brandVoice?.status === "approved"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {brandVoice?.status === "approved" ? "Approved & Active" : "Draft / In Review"}
                          </span>
                        </div>
                      </div>

                      {onOpenBrandVoice && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenBrandVoice();
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-lg transition-colors"
                        >
                          <Volume2 className="h-3 w-3" />
                          <span>Open Voice Editor</span>
                        </button>
                      )}
                    </div>

                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                        Writing Style
                      </div>
                      <p className="text-xs text-stone-800 font-sans mt-0.5 leading-relaxed">
                        {brandVoice?.writingStyle ||
                          "Technical, expository, and declarative. Focuses on architecture trade-offs with zero generic filler."}
                      </p>
                    </div>

                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                        Tone & Cadence
                      </div>
                      <p className="text-xs text-stone-800 font-sans mt-0.5 leading-relaxed">
                        {brandVoice?.tone ||
                          "Pragmatic, peer-to-peer, authoritative, and concise engineering cadence."}
                      </p>
                    </div>

                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                        Sentence Rhythm & Structure
                      </div>
                      <p className="text-xs text-stone-800 font-sans mt-0.5 leading-relaxed">
                        {brandVoice?.sentenceStyle ||
                          "Declarative sentences. Varied length with punchy takeaways. Avoid passive voice."}
                      </p>
                    </div>

                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                        Banned Vocabulary & Marketing Clichés
                      </div>
                      <p className="text-xs text-stone-600 font-mono mt-0.5 bg-stone-50 border border-stone-200 p-2.5 rounded-lg leading-relaxed">
                        {brandVoice?.bannedPhrases ||
                          "delve into, revolutionize, game changer, seamlessly, unlock"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: COMPANY.MD SOURCE */}
              {activeTab === "companymd" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-stone-500 font-mono">
                      Authoritative COMPANY.md document generated from website crawl and stored in Neon.
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyMarkdown}
                      className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-mono text-stone-700 hover:bg-stone-50 shadow-2xs"
                    >
                      {copiedMd ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 text-stone-400" />
                          <span>Copy COMPANY.md</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="rounded-xl border border-stone-200 bg-white p-4 font-mono text-xs text-stone-800 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-96">
                    {context.companyContextMarkdown}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 flex items-center justify-between bg-white shrink-0">
          <div className="text-[11px] font-mono text-stone-400">
            {context
              ? `Crawled ${new Date(context.crawledAt).toLocaleDateString()} • Synced to Content, Research, LLM Tracking & Brand Interpretation`
              : ""}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-medium text-white hover:bg-stone-800 transition-colors shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
