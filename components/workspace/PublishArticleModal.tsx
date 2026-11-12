"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RotateCw,
  Send,
  Eye,
  ArrowRight,
  ArrowLeft,
  History,
  Lock,
  Settings,
  Globe,
  Database,
  Layers,
  FileCode,
  FileText,
  Boxes,
  Check,
  Calendar,
  Clock,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { ArticleWithContext, ProjectWithStats } from "@/lib/db/content-service";
import {
  SanitizedIntegration,
  INTEGRATION_DEFINITIONS,
} from "@/lib/db/integrations-service";
import { SupportedIntegrationType, ArticlePublication } from "@/lib/db/schema";

interface PublishArticleModalProps {
  article: ArticleWithContext;
  project: ProjectWithStats | { id: string; name: string; domain?: string | null };
  isOpen: boolean;
  onClose: () => void;
  onPublished?: (updatedArticle: ArticleWithContext) => void;
  defaultIntegrationType?: SupportedIntegrationType | null;
}

type PublishStep = "choose" | "configure" | "preview" | "result" | "history";

export function PublishArticleModal({
  article,
  project,
  isOpen,
  onClose,
  onPublished,
  defaultIntegrationType,
}: PublishArticleModalProps) {
  const [step, setStep] = useState<PublishStep>("choose");
  const [integrations, setIntegrations] = useState<SanitizedIntegration[]>([]);
  const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(true);
  const [selectedIntegrationType, setSelectedIntegrationType] = useState<SupportedIntegrationType | null>(
    defaultIntegrationType || null
  );

  // Publishing Options State
  const [publishingOptions, setPublishingOptions] = useState<Record<string, string>>({
    publishStatus: "published",
    commitMessage: `feat(content): publish "${article.title}" via Stak`,
    branch: "main",
    contentPath: "content/articles",
    slug: article.slug || "",
    excerpt: (article.content || "").slice(0, 160).replace(/[#*`\n]/g, " ").trim(),
  });

  // Publishing Execution State
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{
    success: boolean;
    message: string;
    remoteId?: string;
    publishedUrl?: string;
  } | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Publication History State
  const [history, setHistory] = useState<ArticlePublication[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Load connected integrations for active project
  const loadConnectedIntegrations = useCallback(async () => {
    setIsLoadingIntegrations(true);
    try {
      const res = await fetch(`/api/integrations?projectId=${project.id}`);
      if (res.ok) {
        const data = await res.json();
        const connected = (data.integrations || []).filter(
          (i: SanitizedIntegration) => i.connectionStatus === "connected"
        );
        setIntegrations(connected);

        if (!selectedIntegrationType && connected.length > 0) {
          setSelectedIntegrationType(connected[0].integrationType);
        }
      }
    } catch (err) {
      console.error("Failed to load integrations for publish modal:", err);
    } finally {
      setIsLoadingIntegrations(false);
    }
  }, [project.id, selectedIntegrationType]);

  // Load publication history for this article
  const loadPublicationHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`/api/integrations/history?articleId=${article.id}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error("Failed to load publication history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [article.id]);

  useEffect(() => {
    if (isOpen) {
      loadConnectedIntegrations();
      loadPublicationHistory();
      setPublishResult(null);
      setPublishError(null);
      if (defaultIntegrationType) {
        setSelectedIntegrationType(defaultIntegrationType);
        setStep("configure");
      } else {
        setStep("choose");
      }
    }
  }, [isOpen, defaultIntegrationType, loadConnectedIntegrations, loadPublicationHistory]);

  if (!isOpen) return null;

  const selectedIntegration = integrations.find(
    (i) => i.integrationType === selectedIntegrationType
  );

  // Execute publication
  const handleExecutePublish = async () => {
    if (!selectedIntegrationType) return;

    setIsPublishing(true);
    setPublishError(null);

    try {
      const res = await fetch("/api/integrations/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          articleId: article.id,
          integrationType: selectedIntegrationType,
          publishingOptions,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPublishError(data.error || "Failed to publish article");
        setPublishResult({
          success: false,
          message: data.error || "Publication rejected by remote API",
        });
        setStep("result");
        loadPublicationHistory();
        return;
      }

      setPublishResult({
        success: true,
        message: data.result?.message || "Successfully published to platform",
        remoteId: data.result?.remoteId,
        publishedUrl: data.result?.publishedUrl,
      });
      setStep("result");

      // Notify parent about status change
      if (onPublished) {
        onPublished({
          ...article,
          status: "published",
        });
      }

      loadPublicationHistory();
    } catch (err: any) {
      setPublishError(err.message || "Network or connection error during publication");
      setPublishResult({
        success: false,
        message: err.message || "Failed to publish article",
      });
      setStep("result");
      loadPublicationHistory();
    } finally {
      setIsPublishing(false);
    }
  };

  const getIntegrationIcon = (type: SupportedIntegrationType) => {
    switch (type) {
      case "github":
        return <GithubIcon className="h-4 w-4 text-stone-900" />;
      case "strapi":
        return <Layers className="h-4 w-4 text-indigo-600" />;
      case "wordpress":
        return <Globe className="h-4 w-4 text-sky-700" />;
      case "sanity":
        return <Database className="h-4 w-4 text-rose-600" />;
      case "contentful":
        return <Boxes className="h-4 w-4 text-blue-600" />;
      case "webflow":
        return <FileCode className="h-4 w-4 text-blue-500" />;
      case "ghost":
        return <FileText className="h-4 w-4 text-stone-900" />;
      case "contao":
        return <CpuIcon className="h-4 w-4 text-amber-600" />;
      default:
        return <Boxes className="h-4 w-4 text-stone-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-2xl border border-stone-200 bg-white p-6 shadow-xl max-h-[92vh] flex flex-col justify-between overflow-hidden">
        {/* 1. MODAL HEADER & STEPPERS */}
        <div className="shrink-0 border-b border-stone-100 pb-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg border border-stone-200 bg-stone-50 p-2">
                <Send className="h-4 w-4 text-stone-700" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-medium text-[#14181f]">
                  Publish Article
                </h3>
                <p className="text-xs font-mono text-stone-500 truncate max-w-sm">
                  "{article.title}"
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(step === "history" ? "choose" : "history")}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-mono transition-colors ${
                  step === "history"
                    ? "border-stone-900 bg-stone-900 text-white"
                    : "border-stone-200 bg-stone-50 text-stone-600 hover:text-stone-900"
                }`}
                title="View publication history"
              >
                <History className="h-3 w-3" />
                <span>History ({history.length})</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Stepper Indicator (Article → Choose → Configure → Preview → Publish) */}
          {step !== "history" && (
            <div className="flex items-center justify-between gap-1.5 mt-3 pt-3 border-t border-stone-100 font-mono text-[11px]">
              <button
                type="button"
                onClick={() => setStep("choose")}
                className={`flex items-center gap-1 ${
                  step === "choose" ? "text-stone-900 font-semibold" : "text-stone-400 hover:text-stone-700"
                }`}
              >
                <span className="w-4 h-4 rounded-full flex items-center justify-center border text-[10px] bg-stone-100">1</span>
                <span>Choose</span>
              </button>

              <span className="text-stone-300">→</span>

              <button
                type="button"
                onClick={() => selectedIntegrationType && setStep("configure")}
                disabled={!selectedIntegrationType}
                className={`flex items-center gap-1 disabled:opacity-40 ${
                  step === "configure" ? "text-stone-900 font-semibold" : "text-stone-400 hover:text-stone-700"
                }`}
              >
                <span className="w-4 h-4 rounded-full flex items-center justify-center border text-[10px] bg-stone-100">2</span>
                <span>Configure</span>
              </button>

              <span className="text-stone-300">→</span>

              <button
                type="button"
                onClick={() => selectedIntegrationType && setStep("preview")}
                disabled={!selectedIntegrationType}
                className={`flex items-center gap-1 disabled:opacity-40 ${
                  step === "preview" ? "text-stone-900 font-semibold" : "text-stone-400 hover:text-stone-700"
                }`}
              >
                <span className="w-4 h-4 rounded-full flex items-center justify-center border text-[10px] bg-stone-100">3</span>
                <span>Preview</span>
              </button>

              <span className="text-stone-300">→</span>

              <span
                className={`flex items-center gap-1 ${
                  step === "result" ? "text-stone-900 font-semibold" : "text-stone-400"
                }`}
              >
                <span className="w-4 h-4 rounded-full flex items-center justify-center border text-[10px] bg-stone-100">4</span>
                <span>Result</span>
              </span>
            </div>
          )}
        </div>

        {/* 2. MODAL BODY (BY STEP) */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* ======================================================== */}
          {/* STEP 1: CHOOSE CONNECTED INTEGRATION                     */}
          {/* ======================================================== */}
          {step === "choose" && (
            <div className="space-y-4">
              <div className="text-xs font-mono text-stone-500">
                Select from the connected platforms configured for {project.name}:
              </div>

              {isLoadingIntegrations ? (
                <div className="p-8 text-center text-xs font-mono text-stone-400 space-y-2">
                  <RotateCw className="mx-auto h-4 w-4 animate-spin text-stone-400" />
                  <div>Loading connected integrations...</div>
                </div>
              ) : integrations.length === 0 ? (
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-6 text-center space-y-2">
                  <AlertCircle className="mx-auto h-6 w-6 text-stone-400" />
                  <div className="font-serif text-sm font-medium text-stone-800">
                    No Integrations Connected
                  </div>
                  <p className="text-xs font-mono text-stone-500 max-w-sm mx-auto">
                    Configure Strapi, GitHub, WordPress, Sanity, Contentful, Webflow, Ghost, or Contao in the Publishing Integrations workspace first.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {integrations.map((integ) => {
                    const isSelected = selectedIntegrationType === integ.integrationType;

                    return (
                      <div
                        key={integ.integrationType}
                        onClick={() => setSelectedIntegrationType(integ.integrationType)}
                        className={`rounded-xl border p-3.5 cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? "border-stone-900 bg-stone-50/80 shadow-2xs"
                            : "border-stone-200 hover:border-stone-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg border border-stone-200 bg-white p-2">
                            {getIntegrationIcon(integ.integrationType)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-serif text-sm font-medium text-stone-900">
                                {integ.name}
                              </span>
                              <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[9px] font-mono text-stone-600 border border-stone-200">
                                {integ.category}
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-stone-400 mt-0.5">
                              {integ.integrationType === "github" &&
                                `Repo: ${integ.configuration?.repo || "Not configured"}`}
                              {integ.integrationType === "strapi" &&
                                `URL: ${integ.configuration?.serverUrl || "Not configured"}`}
                              {integ.integrationType === "wordpress" &&
                                `Site: ${integ.configuration?.siteUrl || "Not configured"}`}
                              {integ.integrationType === "sanity" &&
                                `Project: ${integ.configuration?.projectId} (${integ.configuration?.dataset})`}
                              {integ.integrationType === "contentful" &&
                                `Space: ${integ.configuration?.spaceId}`}
                              {integ.integrationType === "webflow" &&
                                `Collection: ${integ.configuration?.collectionId}`}
                              {integ.integrationType === "ghost" &&
                                `Admin: ${integ.configuration?.adminApiUrl}`}
                              {integ.integrationType === "contao" &&
                                `Base: ${integ.configuration?.siteUrl}`}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[9px] font-medium text-emerald-800 border border-emerald-200">
                            <Check className="h-2 w-2" />
                            <span>Connected</span>
                          </span>
                          <span className="h-4 w-4 rounded-full border border-stone-300 flex items-center justify-center">
                            {isSelected && <span className="w-2 h-2 rounded-full bg-stone-900" />}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: CONFIGURE PUBLISHING OPTIONS                     */}
          {/* ======================================================== */}
          {step === "configure" && selectedIntegration && (
            <div className="space-y-4">
              <div className="rounded-xl border border-stone-100 bg-stone-50/60 p-3 flex items-center gap-2.5">
                {getIntegrationIcon(selectedIntegration.integrationType)}
                <div className="text-xs font-mono">
                  Target: <span className="font-semibold text-stone-900">{selectedIntegration.name}</span>{" "}
                  <span className="text-stone-400">({selectedIntegration.category})</span>
                </div>
              </div>

              {/* GitHub Specific Options */}
              {selectedIntegration.integrationType === "github" && (
                <div className="space-y-3 font-sans text-xs">
                  <div>
                    <label className="block font-mono font-medium text-stone-700 mb-1">
                      Commit Message
                    </label>
                    <input
                      type="text"
                      value={publishingOptions.commitMessage || ""}
                      onChange={(e) =>
                        setPublishingOptions((prev) => ({ ...prev, commitMessage: e.target.value }))
                      }
                      className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-mono text-stone-900"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-mono font-medium text-stone-700 mb-1">
                        Target Branch
                      </label>
                      <input
                        type="text"
                        value={publishingOptions.branch || selectedIntegration.configuration?.branch || "main"}
                        onChange={(e) =>
                          setPublishingOptions((prev) => ({ ...prev, branch: e.target.value }))
                        }
                        className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-mono text-stone-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-mono font-medium text-stone-700 mb-1">
                        Content Directory
                      </label>
                      <input
                        type="text"
                        value={publishingOptions.contentPath || selectedIntegration.configuration?.contentPath || "content/articles"}
                        onChange={(e) =>
                          setPublishingOptions((prev) => ({ ...prev, contentPath: e.target.value }))
                        }
                        className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-mono text-stone-900"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* WordPress / CMS Specific Options */}
              {(selectedIntegration.integrationType === "wordpress" ||
                selectedIntegration.integrationType === "ghost" ||
                selectedIntegration.integrationType === "strapi" ||
                selectedIntegration.integrationType === "webflow" ||
                selectedIntegration.integrationType === "sanity" ||
                selectedIntegration.integrationType === "contentful" ||
                selectedIntegration.integrationType === "contao") && (
                <div className="space-y-3 font-sans text-xs">
                  <div>
                    <label className="block font-mono font-medium text-stone-700 mb-1">
                      Publishing State
                    </label>
                    <select
                      value={publishingOptions.publishStatus || "published"}
                      onChange={(e) =>
                        setPublishingOptions((prev) => ({ ...prev, publishStatus: e.target.value }))
                      }
                      className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-mono text-stone-800"
                    >
                      <option value="published">Live / Published Immediately</option>
                      <option value="draft">Draft / Staged Entry</option>
                    </select>
                    <p className="text-[10px] font-mono text-stone-400 mt-1">
                      Choose whether to publish directly to readers or leave as a staged draft for final review.
                    </p>
                  </div>

                  <div>
                    <label className="block font-mono font-medium text-stone-700 mb-1">
                      Custom URL Slug
                    </label>
                    <input
                      type="text"
                      value={publishingOptions.slug || article.slug || ""}
                      onChange={(e) =>
                        setPublishingOptions((prev) => ({ ...prev, slug: e.target.value }))
                      }
                      placeholder="e.g. how-we-built-stak"
                      className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-mono text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block font-mono font-medium text-stone-700 mb-1">
                      Post Summary / Excerpt
                    </label>
                    <textarea
                      rows={3}
                      value={publishingOptions.excerpt || ""}
                      onChange={(e) =>
                        setPublishingOptions((prev) => ({ ...prev, excerpt: e.target.value }))
                      }
                      className="w-full rounded-xl border border-stone-200 p-2.5 text-xs text-stone-900 leading-relaxed font-sans"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 3: PREVIEW PAYLOAD BEFORE SUBMISSION                */}
          {/* ======================================================== */}
          {step === "preview" && selectedIntegration && (
            <div className="space-y-4">
              <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 space-y-3 font-mono text-xs">
                <div className="text-[10px] uppercase tracking-wider text-stone-400">
                  Target Destination Summary
                </div>

                <div className="flex items-center justify-between border-b border-stone-200/60 pb-2">
                  <span className="text-stone-500">Platform:</span>
                  <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                    {getIntegrationIcon(selectedIntegration.integrationType)}
                    <span>{selectedIntegration.name}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-stone-200/60 pb-2">
                  <span className="text-stone-500">Destination:</span>
                  <span className="font-medium text-stone-800 truncate max-w-xs">
                    {selectedIntegration.integrationType === "github" &&
                      `${selectedIntegration.configuration?.repo} (${publishingOptions.branch}/${publishingOptions.contentPath})`}
                    {selectedIntegration.integrationType === "wordpress" &&
                      `${selectedIntegration.configuration?.siteUrl}/wp-json/wp/v2/posts`}
                    {selectedIntegration.integrationType === "strapi" &&
                      `${selectedIntegration.configuration?.serverUrl}/api/${selectedIntegration.configuration?.contentType}`}
                    {selectedIntegration.integrationType === "sanity" &&
                      `Sanity Project: ${selectedIntegration.configuration?.projectId}`}
                    {selectedIntegration.integrationType === "contentful" &&
                      `Space: ${selectedIntegration.configuration?.spaceId}`}
                    {selectedIntegration.integrationType === "webflow" &&
                      `Collection: ${selectedIntegration.configuration?.collectionId}`}
                    {selectedIntegration.integrationType === "ghost" &&
                      `Ghost Admin: ${selectedIntegration.configuration?.adminApiUrl}`}
                    {selectedIntegration.integrationType === "contao" &&
                      `Contao: ${selectedIntegration.configuration?.siteUrl}`}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-stone-200/60 pb-2">
                  <span className="text-stone-500">Publishing State:</span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-800 border border-emerald-200 font-medium">
                    {publishingOptions.publishStatus === "draft" ? "STAGED DRAFT" : "LIVE PUBLISH"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Content Statistics:</span>
                  <span className="text-stone-800">
                    {article.wordCount} words • {article.content.length} characters
                  </span>
                </div>
              </div>

              {/* Payload Preview */}
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400 mb-1">
                  Transmitted Payload Preview
                </div>
                <div className="rounded-xl border border-stone-200 bg-stone-900 p-3.5 font-mono text-[11px] text-stone-200 max-h-40 overflow-y-auto leading-relaxed">
                  {selectedIntegration.integrationType === "github" ? (
                    <pre className="whitespace-pre-wrap">
{`---
title: "${article.title}"
slug: "${publishingOptions.slug || article.slug}"
date: "${new Date().toISOString()}"
wordCount: ${article.wordCount}
generator: "Stak (stak.co.in)"
---

${article.content.slice(0, 300)}...`}
                    </pre>
                  ) : (
                    <pre className="whitespace-pre-wrap">
{`{
  "title": "${article.title}",
  "slug": "${publishingOptions.slug || article.slug}",
  "status": "${publishingOptions.publishStatus || "published"}",
  "content": "${article.content.slice(0, 250).replace(/\n/g, " ")}..."
}`}
                    </pre>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-stone-100 bg-stone-50 p-3 flex items-center gap-2 text-xs text-stone-500 font-sans">
                <Lock className="h-3.5 w-3.5 text-stone-600 shrink-0" />
                <span>Publishing requires manual confirmation. No content is published automatically.</span>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 4: PUBLISHING RESULT (SUCCESS OR FAILED)            */}
          {/* ======================================================== */}
          {step === "result" && (
            <div className="space-y-4 py-2">
              {publishResult?.success ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-5 space-y-3 text-xs text-emerald-900">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span>Publication Succeeded!</span>
                  </div>

                  <p className="leading-relaxed">{publishResult.message}</p>

                  {publishResult.remoteId && (
                    <div className="font-mono text-[11px] text-emerald-800">
                      Remote ID / Commit SHA:{" "}
                      <span className="font-bold">{publishResult.remoteId}</span>
                    </div>
                  )}

                  {publishResult.publishedUrl && (
                    <div className="pt-2 border-t border-emerald-200">
                      <a
                        href={publishResult.publishedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 font-mono text-xs text-emerald-900 underline font-semibold hover:text-emerald-950"
                      >
                        <span>Open Live Content on {selectedIntegration?.name}</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-5 space-y-3 text-xs text-rose-900">
                  <div className="flex items-center gap-2 font-semibold text-sm text-rose-800">
                    <AlertCircle className="h-5 w-5 text-rose-600" />
                    <span>Publication Failed</span>
                  </div>

                  <p className="leading-relaxed font-sans">{publishResult?.message || publishError}</p>

                  <div className="rounded-lg border border-rose-200 bg-white p-3 font-mono text-[11px] text-rose-700">
                    Error Details: {publishError || "Remote platform API rejected the payload."}
                  </div>

                  <div className="text-[11px] font-mono text-stone-500 pt-1">
                    Check your integration credentials, network connectivity, or collection schemas.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* PUBLICATION HISTORY TAB                                  */}
          {/* ======================================================== */}
          {step === "history" && (
            <div className="space-y-4">
              <div className="text-xs font-mono text-stone-500">
                Publication logs and history for "{article.title}":
              </div>

              {isLoadingHistory ? (
                <div className="p-8 text-center text-xs font-mono text-stone-400 space-y-2">
                  <RotateCw className="mx-auto h-4 w-4 animate-spin text-stone-400" />
                  <div>Loading publication logs from Neon...</div>
                </div>
              ) : history.length === 0 ? (
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-8 text-center space-y-2">
                  <History className="mx-auto h-6 w-6 text-stone-400" />
                  <div className="font-serif text-sm font-medium text-stone-800">
                    No Publications Yet
                  </div>
                  <p className="text-xs font-mono text-stone-400 max-w-sm mx-auto">
                    This article has not been published to any platform yet. Choose a connected integration to initiate publishing.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => {
                    const isSuccess = item.status === "success";

                    return (
                      <div
                        key={item.id}
                        className="rounded-xl border border-stone-200 bg-white p-4 space-y-2.5 font-mono text-xs hover:border-stone-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getIntegrationIcon(item.integrationType as SupportedIntegrationType)}
                            <span className="font-serif font-semibold text-stone-900 text-sm capitalize">
                              {item.integrationType}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold border ${
                                isSuccess
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : "bg-rose-50 text-rose-800 border-rose-200"
                              }`}
                            >
                              {item.status.toUpperCase()}
                            </span>
                            <span className="text-[10px] text-stone-400">
                              {new Date(item.publishedAt).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {isSuccess ? (
                          <div className="space-y-1 text-[11px] text-stone-600">
                            {item.remoteId && (
                              <div>
                                <span className="text-stone-400">Remote ID / SHA:</span>{" "}
                                <span className="font-medium text-stone-800">{item.remoteId}</span>
                              </div>
                            )}
                            {item.publishedUrl && (
                              <div className="pt-1">
                                <a
                                  href={item.publishedUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-emerald-700 underline font-medium hover:text-emerald-900"
                                >
                                  <span>View Published Content</span>
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="rounded-lg bg-rose-50 border border-rose-100 p-2.5 text-[11px] text-rose-800 font-sans leading-relaxed">
                            <span className="font-semibold font-mono">Error:</span>{" "}
                            {item.errorMessage || "Remote API rejected publication"}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. MODAL FOOTER & ACTION BUTTONS */}
        <div className="shrink-0 pt-4 mt-3 border-t border-stone-100 flex items-center justify-between">
          <div>
            {step === "configure" && (
              <button
                type="button"
                onClick={() => setStep("choose")}
                className="inline-flex items-center gap-1 text-xs font-mono text-stone-500 hover:text-stone-900"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>Back</span>
              </button>
            )}

            {step === "preview" && (
              <button
                type="button"
                onClick={() => setStep("configure")}
                className="inline-flex items-center gap-1 text-xs font-mono text-stone-500 hover:text-stone-900"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>Options</span>
              </button>
            )}

            {step === "result" && (
              <button
                type="button"
                onClick={() => setStep("preview")}
                className="inline-flex items-center gap-1 text-xs font-mono text-stone-500 hover:text-stone-900"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>Review Payload</span>
              </button>
            )}

            {step === "history" && (
              <button
                type="button"
                onClick={() => setStep("choose")}
                className="inline-flex items-center gap-1 text-xs font-mono text-stone-500 hover:text-stone-900"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>Back to Publish</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-stone-200 px-3.5 py-1.5 text-xs font-mono text-stone-600 hover:bg-stone-50"
            >
              Close
            </button>

            {step === "choose" && (
              <button
                type="button"
                onClick={() => setStep("configure")}
                disabled={!selectedIntegrationType || integrations.length === 0}
                className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-stone-800 disabled:opacity-40 shadow-2xs"
              >
                <span>Configure Options</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            )}

            {step === "configure" && (
              <button
                type="button"
                onClick={() => setStep("preview")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-stone-800 shadow-2xs"
              >
                <Eye className="h-3 w-3" />
                <span>Preview</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            )}

            {step === "preview" && (
              <button
                type="button"
                onClick={handleExecutePublish}
                disabled={isPublishing}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 px-4 py-1.5 text-xs font-medium text-white disabled:opacity-50 shadow-2xs"
              >
                {isPublishing ? (
                  <>
                    <RotateCw className="h-3 w-3 animate-spin" />
                    <span>Publishing to Platform...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3 w-3" />
                    <span>Confirm & Publish</span>
                  </>
                )}
              </button>
            )}

            {step === "result" && !publishResult?.success && (
              <button
                type="button"
                onClick={handleExecutePublish}
                disabled={isPublishing}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-1.5 text-xs font-medium text-white shadow-2xs"
              >
                <span>Retry Publication</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function CpuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M15 2v2" />
      <path d="M15 20v2" />
      <path d="M2 15h2" />
      <path d="M2 9h2" />
      <path d="M20 15h2" />
      <path d="M20 9h2" />
      <path d="M9 2v2" />
      <path d="M9 20v2" />
    </svg>
  );
}

