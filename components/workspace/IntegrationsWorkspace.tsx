"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FolderKanban,
  ChevronDown,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Lock,
  Key,
  ShieldCheck,
  RotateCw,
  Search,
  ExternalLink,
  Settings,
  Trash2,
  X,
  Plus,
  Globe,
  Database,
  Layers,
  FileCode,
  FileText,
  Boxes,
  Check,
  RefreshCw,
  Send,
  Sparkles,
  History,
  Radio,
  Eye,
  ArrowRight,
} from "lucide-react";
import { Project, SupportedIntegrationType, SUPPORTED_INTEGRATIONS, ArticlePublication } from "@/lib/db/schema";
import {
  SanitizedIntegration,
  INTEGRATION_DEFINITIONS,
  IntegrationDefinition,
} from "@/lib/db/integrations-service";
import { ArticleWithContext } from "@/lib/db/content-service";
import { PublishArticleModal } from "./PublishArticleModal";

interface IntegrationsWorkspaceProps {
  project: Project;
  projects: Project[];
  onSelectProject: (projectId: string) => void;
}

export function IntegrationsWorkspace({
  project,
  projects,
  onSelectProject,
}: IntegrationsWorkspaceProps) {
  // Navigation / View Tabs
  const [activeTab, setActiveTab] = useState<"connectors" | "history">("connectors");

  // Integrations state
  const [integrations, setIntegrations] = useState<SanitizedIntegration[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "connected" | "disconnected">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);

  // Connect / Configure Modal State
  const [activeModalType, setActiveModalType] = useState<SupportedIntegrationType | null>(null);
  const [modalConfigValues, setModalConfigValues] = useState<Record<string, string>>({});
  const [modalCredentialValues, setModalCredentialValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // In-modal connection test state
  const [isValidatingInModal, setIsValidatingInModal] = useState(false);
  const [validationFeedback, setValidationFeedback] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  // Testing connection from card state
  const [validatingCardType, setValidatingCardType] = useState<SupportedIntegrationType | null>(null);

  // Disconnect Confirmation Modal State
  const [confirmDisconnectType, setConfirmDisconnectType] = useState<SupportedIntegrationType | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Project Articles for Publishing
  const [projectArticles, setProjectArticles] = useState<ArticleWithContext[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);

  // Publish Article Modal State (using complete 5-step PublishArticleModal)
  const [showArticlePickerForType, setShowArticlePickerForType] = useState<SupportedIntegrationType | null>(null);
  const [selectedArticleForPicker, setSelectedArticleForPicker] = useState<string>("");
  const [publishingArticle, setPublishingArticle] = useState<ArticleWithContext | null>(null);
  const [publishingDefaultType, setPublishingDefaultType] = useState<SupportedIntegrationType | null>(null);

  // Project-wide Publication History State
  const [publications, setPublications] = useState<ArticlePublication[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyStatusFilter, setHistoryStatusFilter] = useState<"all" | "success" | "failed">("all");

  // Load integrations for active project
  const loadIntegrations = useCallback(async (projId: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/integrations?projectId=${projId}`);
      if (!res.ok) {
        throw new Error("Failed to load integrations");
      }
      const data = await res.json();
      setIntegrations(data.integrations || []);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to load publishing integrations");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load publications history for project
  const loadHistory = useCallback(async (projId: string) => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`/api/integrations/history?projectId=${projId}`);
      if (res.ok) {
        const data = await res.json();
        setPublications(data.history || []);
      }
    } catch (err) {
      console.error("Failed to load publication history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Load project articles for publishing selection
  const loadArticles = useCallback(async (projId: string) => {
    setIsLoadingArticles(true);
    try {
      const res = await fetch(`/api/articles?projectId=${projId}`);
      if (res.ok) {
        const data = await res.json();
        const arts: ArticleWithContext[] = data.articles || [];
        setProjectArticles(arts);
        if (arts.length > 0) {
          setSelectedArticleForPicker(arts[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load project articles:", err);
    } finally {
      setIsLoadingArticles(false);
    }
  }, []);

  useEffect(() => {
    loadIntegrations(project.id);
    loadHistory(project.id);
    loadArticles(project.id);
  }, [project.id, loadIntegrations, loadHistory, loadArticles]);

  // Open Configure / Connect Modal
  const handleOpenConfigure = (type: SupportedIntegrationType) => {
    const existing = integrations.find((i) => i.integrationType === type);
    const def = INTEGRATION_DEFINITIONS[type];

    const initialConfig: Record<string, string> = {};
    for (const f of def.configFields) {
      initialConfig[f.key] = existing?.configuration?.[f.key] || "";
    }

    const initialCreds: Record<string, string> = {};
    for (const f of def.credentialFields) {
      initialCreds[f.key] = "";
    }

    setModalConfigValues(initialConfig);
    setModalCredentialValues(initialCreds);
    setValidationFeedback(null);
    setActiveModalType(type);
  };

  // Test Connection inside Modal
  const handleTestConnectionInModal = async () => {
    if (!activeModalType) return;
    setIsValidatingInModal(true);
    setValidationFeedback(null);

    try {
      const res = await fetch("/api/integrations/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          integrationType: activeModalType,
          configuration: modalConfigValues,
          credentials: modalCredentialValues,
        }),
      });

      const data = await res.json();
      setValidationFeedback({
        valid: data.valid,
        message: data.message,
      });
    } catch (err: any) {
      setValidationFeedback({
        valid: false,
        message: `Validation request failed: ${err.message}`,
      });
    } finally {
      setIsValidatingInModal(false);
    }
  };

  // Test Connection directly from card
  const handleTestConnectionFromCard = async (type: SupportedIntegrationType) => {
    setValidatingCardType(type);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/integrations/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          integrationType: type,
        }),
      });

      const data = await res.json();
      if (data.valid) {
        setSuccessMessage(`Connection Verified: ${data.message}`);
      } else {
        setErrorMessage(`Connection Validation Failed: ${data.message}`);
      }
    } catch (err: any) {
      setErrorMessage(`Validation error: ${err.message}`);
    } finally {
      setValidatingCardType(null);
    }
  };

  // Submit Connection & Credentials
  const handleSubmitConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalType) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          integrationType: activeModalType,
          configuration: modalConfigValues,
          credentials: modalCredentialValues,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to connect integration");
      }

      const { integration } = await res.json();
      setIntegrations((prev) =>
        prev.map((i) => (i.integrationType === activeModalType ? integration : i))
      );
      setSuccessMessage(`Successfully connected ${INTEGRATION_DEFINITIONS[activeModalType].name}.`);
      setActiveModalType(null);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to save integration configuration");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm and Execute Disconnect
  const handleConfirmDisconnect = async () => {
    if (!confirmDisconnectType) return;

    setIsDisconnecting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/integrations/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          integrationType: confirmDisconnectType,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to disconnect integration");
      }

      const { integration } = await res.json();
      setIntegrations((prev) =>
        prev.map((i) => (i.integrationType === confirmDisconnectType ? integration : i))
      );
      setSuccessMessage(`Disconnected ${INTEGRATION_DEFINITIONS[confirmDisconnectType].name}. Server credentials purged.`);
      setConfirmDisconnectType(null);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to disconnect integration");
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Launch Publishing Workflow for an Integration
  const handleInitiatePublish = (type: SupportedIntegrationType) => {
    if (projectArticles.length === 0) {
      setErrorMessage("No articles found in this project. Create an article draft in the Content workspace first.");
      return;
    }

    if (projectArticles.length === 1) {
      // Single article: launch PublishArticleModal directly
      setPublishingArticle(projectArticles[0]);
      setPublishingDefaultType(type);
      return;
    }

    // Multiple articles: prompt user to pick which article to publish
    setShowArticlePickerForType(type);
    setSelectedArticleForPicker(projectArticles[0].id);
  };

  // Confirm Article Picker and Launch PublishArticleModal
  const handleConfirmArticlePick = () => {
    if (!showArticlePickerForType) return;
    const chosen = projectArticles.find((a) => a.id === selectedArticleForPicker) || projectArticles[0];
    if (chosen) {
      setPublishingArticle(chosen);
      setPublishingDefaultType(showArticlePickerForType);
    }
    setShowArticlePickerForType(null);
  };

  // Calculate connection counters
  const connectedCount = integrations.filter((i) => i.connectionStatus === "connected").length;
  const disconnectedCount = integrations.length - connectedCount;
  const successfulPubCount = publications.filter((p) => p.status === "success").length;
  const failedPubCount = publications.filter((p) => p.status === "failed").length;

  // Filtered Integrations
  const filteredIntegrations = integrations.filter((item) => {
    if (statusFilter === "connected" && item.connectionStatus !== "connected") return false;
    if (statusFilter === "disconnected" && item.connectionStatus !== "disconnected") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matches =
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      if (!matches) return false;
    }

    return true;
  });

  // Filtered Publications
  const filteredPublications = publications.filter((p) => {
    if (historyStatusFilter === "success") return p.status === "success";
    if (historyStatusFilter === "failed") return p.status === "failed";
    return true;
  });

  const getIntegrationIcon = (type: SupportedIntegrationType) => {
    switch (type) {
      case "github":
        return <GithubIcon className="h-5 w-5 text-stone-900" />;
      case "strapi":
        return <Layers className="h-5 w-5 text-indigo-600" />;
      case "wordpress":
        return <Globe className="h-5 w-5 text-sky-700" />;
      case "sanity":
        return <Database className="h-5 w-5 text-rose-600" />;
      case "contentful":
        return <Boxes className="h-5 w-5 text-blue-600" />;
      case "webflow":
        return <FileCode className="h-5 w-5 text-blue-500" />;
      case "ghost":
        return <FileText className="h-5 w-5 text-stone-900" />;
      case "contao":
        return <CpuIcon className="h-5 w-5 text-amber-600" />;
      default:
        return <Boxes className="h-5 w-5 text-stone-600" />;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#fbfbfa]">
      {/* 1. TOP HEADER */}
      <header className="h-16 shrink-0 border-b border-stone-200/80 bg-white/95 px-6 flex items-center justify-between backdrop-blur-xs">
        <div className="flex items-center gap-4">
          {/* Project Selection Dropdown */}
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

          {/* Section Indicator */}
          <div className="flex items-center gap-2 font-mono text-xs text-stone-700">
            <span className="font-semibold text-stone-900">Publishing Integrations</span>
            <span className="text-stone-400">•</span>
            <span className="text-stone-500">8 Supported Connectors</span>
          </div>
        </div>

        {/* View Switcher Tabs: Connectors vs Publication History */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl border border-stone-200 bg-stone-50 p-1 text-xs font-mono">
            <button
              type="button"
              onClick={() => setActiveTab("connectors")}
              className={`rounded-lg px-3 py-1.5 transition-colors ${
                activeTab === "connectors"
                  ? "bg-white text-stone-900 font-medium shadow-2xs"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              Connectors (8)
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("history");
                loadHistory(project.id);
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors ${
                activeTab === "history"
                  ? "bg-white text-stone-900 font-medium shadow-2xs"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <History className="h-3 w-3" />
              <span>Publication History</span>
              {publications.length > 0 && (
                <span className="rounded-full bg-stone-200/70 px-1.5 py-0.2 text-[10px] text-stone-700">
                  {publications.length}
                </span>
              )}
            </button>
          </div>

          {/* Security & Credentials Badge */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-mono text-stone-600">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>AES-256 GCM</span>
          </div>
        </div>
      </header>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="shrink-0 bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-900 p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="shrink-0 bg-rose-50 border-b border-rose-200 px-6 py-2.5 flex items-center justify-between text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-600 hover:text-rose-900 p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 2. MAIN WORKSPACE VIEW */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 sm:p-8 lg:p-10 max-w-6xl mx-auto space-y-6">
          {/* TAB 1: CONNECTORS GRID */}
          {activeTab === "connectors" && (
            <>
              {/* Overview Hero Card */}
              <div className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-7 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-xl font-normal text-[#14181f]">
                      Publishing Integrations
                    </h2>
                    <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
                      Publish Stak-generated articles directly to your CMS or Git repositories. Configure connection parameters, validate credentials live, and push articles straight to production.
                    </p>
                  </div>

                  {/* Status Counters */}
                  <div className="flex items-center gap-5 sm:border-l sm:border-stone-100 sm:pl-6 text-center font-mono">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-stone-400">
                        Supported
                      </div>
                      <div className="font-serif text-lg text-stone-800 mt-0.5">
                        8
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-stone-400">
                        Connected
                      </div>
                      <div className="font-serif text-lg text-emerald-800 font-medium mt-0.5">
                        {connectedCount}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-stone-400">
                        Disconnected
                      </div>
                      <div className="font-serif text-lg text-stone-400 mt-0.5">
                        {disconnectedCount}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filter Tabs & Search Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6 pt-5 border-t border-stone-100">
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    {(["all", "connected", "disconnected"] as const).map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setStatusFilter(filter)}
                        className={`rounded-lg px-3 py-1.5 capitalize transition-colors ${
                          statusFilter === filter
                            ? "bg-stone-900 text-white font-medium"
                            : "bg-stone-100 text-stone-600 hover:text-stone-900"
                        }`}
                      >
                        {filter === "all"
                          ? `All (8)`
                          : filter === "connected"
                          ? `Connected (${connectedCount})`
                          : `Disconnected (${disconnectedCount})`}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter integrations..."
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/70 pl-8 pr-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:border-stone-400 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Integrations Grid (Exactly the 8 supported integrations) */}
              {isLoading ? (
                <div className="p-16 text-center text-xs font-mono text-stone-400 space-y-2">
                  <RotateCw className="mx-auto h-5 w-5 animate-spin text-stone-400" />
                  <div>Loading publishing integrations from Neon...</div>
                </div>
              ) : filteredIntegrations.length === 0 ? (
                <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center space-y-2">
                  <Boxes className="mx-auto h-8 w-8 text-stone-300" />
                  <div className="font-serif text-base text-stone-800">
                    No Integrations Match
                  </div>
                  <p className="text-xs font-mono text-stone-400 max-w-sm mx-auto">
                    No integrations found matching your search. Reset filter to view all 8 supported integrations.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredIntegrations.map((item) => {
                    const isConnected = item.connectionStatus === "connected";
                    const isValidatingThis = validatingCardType === item.integrationType;

                    return (
                      <div
                        key={item.integrationType}
                        className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-2xs flex flex-col justify-between space-y-4 hover:border-stone-300 transition-colors"
                      >
                        <div className="space-y-3">
                          {/* Card Header: Icon, Name, Category & Connection Status */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="rounded-xl border border-stone-200 bg-stone-50 p-2.5 shadow-2xs">
                                {getIntegrationIcon(item.integrationType)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-serif text-lg font-normal text-stone-900">
                                    {item.name}
                                  </h3>
                                  <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-mono text-stone-600 border border-stone-200/70">
                                    {item.category}
                                  </span>
                                </div>
                                <div className="text-[11px] font-mono text-stone-400 mt-0.5">
                                  Auth: {item.authType}
                                </div>
                              </div>
                            </div>

                            {/* Connection State Badge */}
                            <div>
                              {isConnected ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-medium text-emerald-800 border border-emerald-200">
                                  <Check className="h-2.5 w-2.5" />
                                  <span>Connected</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-0.5 font-mono text-[10px] text-stone-600 border border-stone-200">
                                  <span>Disconnected</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-stone-600 font-sans leading-relaxed">
                            {item.description}
                          </p>

                          {/* Connection Details if Connected */}
                          {isConnected && (
                            <div className="rounded-xl border border-stone-100 bg-stone-50/60 p-3.5 space-y-2 font-mono text-xs">
                              <div className="text-[10px] uppercase tracking-wider text-stone-400">
                                Connected Configuration
                              </div>

                              <div className="space-y-1 text-[11px] text-stone-700">
                                {Object.entries(item.configuration).map(([k, v]) => (
                                  <div key={k} className="flex items-center justify-between">
                                    <span className="text-stone-400">{k}:</span>
                                    <span className="font-medium text-stone-800 truncate max-w-[220px]">
                                      {String(v)}
                                    </span>
                                  </div>
                                ))}

                                <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 text-[10px] text-stone-500">
                                  <span className="flex items-center gap-1">
                                    <Lock className="h-2.5 w-2.5 text-emerald-700" />
                                    <span>Credentials:</span>
                                  </span>
                                  <span className="text-emerald-700 font-medium">
                                    Encrypted & Stored Server-Side
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Card Actions: Connect/Configure, Test Connection, Publish Article & Disconnect */}
                        <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="text-[11px] font-mono text-stone-400">
                            {isConnected
                              ? `Updated ${new Date(item.updatedAt).toLocaleDateString()}`
                              : "Not configured"}
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {isConnected && (
                              <>
                                {/* Validate Connection */}
                                <button
                                  type="button"
                                  onClick={() => handleTestConnectionFromCard(item.integrationType)}
                                  disabled={isValidatingThis}
                                  className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 px-2.5 py-1.5 text-xs font-mono text-stone-700 transition-colors"
                                  title="Test live API connection"
                                >
                                  {isValidatingThis ? (
                                    <RotateCw className="h-3 w-3 animate-spin text-stone-500" />
                                  ) : (
                                    <RefreshCw className="h-3 w-3 text-stone-500" />
                                  )}
                                  <span>Test</span>
                                </button>

                                {/* Publish Article Button (Opens 5-step modal) */}
                                <button
                                  type="button"
                                  onClick={() => handleInitiatePublish(item.integrationType)}
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 px-3 py-1.5 text-xs font-mono text-emerald-800 transition-colors shadow-2xs font-medium"
                                  title="Publish a Stak article to this platform"
                                >
                                  <Send className="h-3 w-3 text-emerald-700" />
                                  <span>Publish Article</span>
                                </button>

                                {/* Disconnect */}
                                <button
                                  type="button"
                                  onClick={() => setConfirmDisconnectType(item.integrationType)}
                                  className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 px-2.5 py-1.5 text-xs font-mono text-rose-700 transition-colors"
                                  title="Disconnect integration and purge credentials"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </>
                            )}

                            {/* Connect / Configure */}
                            <button
                              type="button"
                              onClick={() => handleOpenConfigure(item.integrationType)}
                              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-colors shadow-2xs ${
                                isConnected
                                  ? "border border-stone-200 bg-white text-stone-800 hover:bg-stone-50"
                                  : "bg-stone-900 text-white hover:bg-stone-800"
                              }`}
                            >
                              {isConnected ? (
                                <>
                                  <Settings className="h-3 w-3" />
                                  <span>Configure</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="h-3 w-3" />
                                  <span>Connect</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* TAB 2: PROJECT PUBLICATION HISTORY */}
          {activeTab === "history" && (
            <div className="space-y-6">
              {/* Publication History Hero Card */}
              <div className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-7 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-xl font-normal text-[#14181f]">
                      Publication History
                    </h2>
                    <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
                      Comprehensive log of every article publishing run across connected CMS and Git repositories for <span className="font-medium text-stone-800">{project.name}</span>.
                    </p>
                  </div>

                  {/* Counters */}
                  <div className="flex items-center gap-5 sm:border-l sm:border-stone-100 sm:pl-6 text-center font-mono">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-stone-400">
                        Total
                      </div>
                      <div className="font-serif text-lg text-stone-800 mt-0.5">
                        {publications.length}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-stone-400">
                        Success
                      </div>
                      <div className="font-serif text-lg text-emerald-800 font-medium mt-0.5">
                        {successfulPubCount}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-stone-400">
                        Failed
                      </div>
                      <div className="font-serif text-lg text-rose-700 font-medium mt-0.5">
                        {failedPubCount}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filter & Refresh */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6 pt-5 border-t border-stone-100">
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    {(["all", "success", "failed"] as const).map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setHistoryStatusFilter(filter)}
                        className={`rounded-lg px-3 py-1.5 capitalize transition-colors ${
                          historyStatusFilter === filter
                            ? "bg-stone-900 text-white font-medium"
                            : "bg-stone-100 text-stone-600 hover:text-stone-900"
                        }`}
                      >
                        {filter === "all"
                          ? `All (${publications.length})`
                          : filter === "success"
                          ? `Success (${successfulPubCount})`
                          : `Failed (${failedPubCount})`}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => loadHistory(project.id)}
                    disabled={isLoadingHistory}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 px-3 py-1.5 text-xs font-mono text-stone-700 transition-colors"
                  >
                    <RefreshCw className={`h-3 w-3 ${isLoadingHistory ? "animate-spin" : ""}`} />
                    <span>Refresh Logs</span>
                  </button>
                </div>
              </div>

              {/* Publications Log Table */}
              {isLoadingHistory ? (
                <div className="p-16 text-center text-xs font-mono text-stone-400 space-y-2">
                  <RotateCw className="mx-auto h-5 w-5 animate-spin text-stone-400" />
                  <div>Loading publication history from Neon...</div>
                </div>
              ) : filteredPublications.length === 0 ? (
                <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center space-y-2">
                  <History className="mx-auto h-8 w-8 text-stone-300" />
                  <div className="font-serif text-base text-stone-800">
                    No Publications Yet
                  </div>
                  <p className="text-xs font-mono text-stone-400 max-w-sm mx-auto">
                    No publishing runs recorded for {project.name}. Choose an article from Content and publish it to any connected platform.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-2xs divide-y divide-stone-100">
                  {filteredPublications.map((pub) => {
                    const pubDate = pub.publishedAt ? new Date(pub.publishedAt).toLocaleString() : "Just now";
                    const isSuccess = pub.status === "success";
                    const targetDef = INTEGRATION_DEFINITIONS[pub.integrationType as SupportedIntegrationType];
                    const matchedArticle = projectArticles.find((a) => a.id === pub.articleId);

                    return (
                      <div key={pub.id} className="p-4 sm:p-5 hover:bg-stone-50/50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          {/* Platform & Article Header */}
                          <div className="flex items-start sm:items-center gap-3">
                            <div className="rounded-xl border border-stone-200 bg-stone-50 p-2 shrink-0">
                              {getIntegrationIcon(pub.integrationType as SupportedIntegrationType)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-stone-900 text-xs sm:text-sm">
                                  {matchedArticle ? matchedArticle.title : `Article #${pub.articleId}`}
                                </span>
                                <span className="rounded-md bg-stone-100 px-2 py-0.5 font-mono text-[10px] text-stone-600">
                                  {targetDef?.name || pub.integrationType}
                                </span>
                              </div>
                              <div className="font-mono text-[11px] text-stone-400 mt-0.5">
                                Published: {pubDate}
                              </div>
                            </div>
                          </div>

                          {/* Status Badge & Remote Link */}
                          <div className="flex items-center gap-3 self-end sm:self-center">
                            {isSuccess ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-mono font-medium text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                <span>Published</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-mono font-medium text-rose-800 border border-rose-200">
                                <AlertCircle className="h-3 w-3 text-rose-600" />
                                <span>Failed</span>
                              </span>
                            )}

                            {pub.publishedUrl && (
                              <a
                                href={pub.publishedUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 px-2.5 py-1 text-xs font-mono text-stone-700 transition-colors"
                              >
                                <span>View Live</span>
                                <ExternalLink className="h-3 w-3 text-stone-400" />
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Details: Remote ID or Error diagnostic */}
                        <div className="mt-3 pt-3 border-t border-stone-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                          {isSuccess ? (
                            <div className="text-stone-600 flex items-center gap-2">
                              <span className="text-stone-400">Remote Identifier / SHA:</span>
                              <span className="font-semibold text-stone-800">{pub.remoteId || "Created"}</span>
                            </div>
                          ) : (
                            <div className="text-rose-700 bg-rose-50/70 border border-rose-200/70 rounded-lg p-2.5 w-full">
                              <div className="font-semibold flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                <span>Publishing Error Diagnostic:</span>
                              </div>
                              <div className="font-mono text-[11px] mt-1 break-all">
                                {pub.errorMessage || "Unknown remote API error during publication"}
                              </div>
                            </div>
                          )}

                          {matchedArticle && (
                            <button
                              type="button"
                              onClick={() => {
                                setPublishingArticle(matchedArticle);
                                setPublishingDefaultType(pub.integrationType as SupportedIntegrationType);
                              }}
                              className="text-stone-600 hover:text-stone-900 text-[11px] underline self-end sm:self-auto shrink-0"
                            >
                              Re-publish / Manage
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. CONNECT / CONFIGURE MODAL */}
      {activeModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg border border-stone-200 bg-stone-50 p-2">
                  {getIntegrationIcon(activeModalType)}
                </div>
                <div>
                  <h3 className="font-serif text-lg font-medium text-[#14181f]">
                    Configure {INTEGRATION_DEFINITIONS[activeModalType].name}
                  </h3>
                  <p className="text-xs font-mono text-stone-500">
                    {INTEGRATION_DEFINITIONS[activeModalType].category}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalType(null)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Security Notice Banner */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 mb-4 flex items-start gap-2.5 text-xs text-emerald-900">
              <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
              <div className="font-sans leading-relaxed">
                <span className="font-semibold">Client-Safe Security:</span> Credentials are encrypted using AES-256-GCM and stored strictly server-side. Stak never returns raw API tokens or client secrets to the browser.
              </div>
            </div>

            {/* Validation Feedback Banner */}
            {validationFeedback && (
              <div
                className={`rounded-xl border p-3 mb-4 text-xs font-sans flex items-start gap-2 ${
                  validationFeedback.valid
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-rose-200 bg-rose-50 text-rose-900"
                }`}
              >
                {validationFeedback.valid ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{validationFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmitConnect} className="space-y-4">
              {/* Configuration Fields */}
              <div className="space-y-3">
                <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                  Target Configuration
                </div>

                {INTEGRATION_DEFINITIONS[activeModalType].configFields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-mono font-medium text-stone-700 mb-1">
                      {field.label} {field.required && <span className="text-rose-600">*</span>}
                    </label>
                    <input
                      type={field.type || "text"}
                      value={modalConfigValues[field.key] || ""}
                      onChange={(e) =>
                        setModalConfigValues((prev) => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                      placeholder={field.placeholder}
                      className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 font-sans focus:outline-hidden focus:border-stone-400"
                      required={field.required}
                    />
                    {field.helpText && (
                      <p className="text-[10px] font-mono text-stone-400 mt-1">
                        {field.helpText}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Sensitive Credentials Fields */}
              <div className="space-y-3 pt-3 border-t border-stone-100">
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-stone-400">
                  <Key className="h-3 w-3 text-stone-500" />
                  <span>Sensitive Credentials (Encrypted Server-Side)</span>
                </div>

                {INTEGRATION_DEFINITIONS[activeModalType].credentialFields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-mono font-medium text-stone-700 mb-1">
                      {field.label} {field.required && <span className="text-rose-600">*</span>}
                    </label>
                    <input
                      type="password"
                      value={modalCredentialValues[field.key] || ""}
                      onChange={(e) =>
                        setModalCredentialValues((prev) => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                      placeholder={field.placeholder}
                      className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 font-mono focus:outline-hidden focus:border-stone-400"
                      required={field.required}
                    />
                    {field.helpText && (
                      <p className="text-[10px] font-mono text-stone-400 mt-1">
                        {field.helpText}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Modal Buttons: Test Connection & Save */}
              <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={handleTestConnectionInModal}
                  disabled={isValidatingInModal}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 px-3 py-2 text-xs font-mono text-stone-700 transition-colors"
                >
                  {isValidatingInModal ? (
                    <>
                      <RotateCw className="h-3 w-3 animate-spin" />
                      <span>Validating API...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3" />
                      <span>Test Connection</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModalType(null)}
                    className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-mono text-stone-600 hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-medium text-white hover:bg-stone-800 disabled:opacity-50 shadow-2xs"
                  >
                    {isSubmitting ? (
                      <>
                        <RotateCw className="h-3 w-3 animate-spin" />
                        <span>Encrypting & Saving...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3 text-emerald-400" />
                        <span>Save & Connect</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. ARTICLE PICKER MODAL (When multiple articles exist) */}
      {showArticlePickerForType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg border border-stone-200 bg-stone-50 p-2">
                  {getIntegrationIcon(showArticlePickerForType)}
                </div>
                <div>
                  <h3 className="font-serif text-lg font-medium text-stone-900">
                    Publish to {INTEGRATION_DEFINITIONS[showArticlePickerForType].name}
                  </h3>
                  <p className="text-xs font-mono text-stone-400">
                    Select an article from {project.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowArticlePickerForType(null)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-mono font-medium text-stone-700">
                Choose Stak Article
              </label>
              <select
                value={selectedArticleForPicker}
                onChange={(e) => setSelectedArticleForPicker(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-xs font-mono text-stone-800 focus:outline-hidden focus:border-stone-400"
              >
                {projectArticles.map((art) => (
                  <option key={art.id} value={art.id}>
                    {art.title} ({art.wordCount || 0} words • {art.status})
                  </option>
                ))}
              </select>
            </div>

            <p className="text-xs text-stone-500 font-sans leading-relaxed">
              You will configure publishing parameters (draft/publish status, target slug, categories) and preview the final payload before transmitting.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowArticlePickerForType(null)}
                className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-mono text-stone-600 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmArticlePick}
                className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-medium text-white hover:bg-stone-800 shadow-2xs"
              >
                <span>Continue to Publishing</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. PUBLISH ARTICLE 5-STEP MODAL (Article -> Choose -> Configure -> Preview -> Publish -> Result) */}
      {publishingArticle && (
        <PublishArticleModal
          article={publishingArticle}
          project={project}
          defaultIntegrationType={publishingDefaultType}
          isOpen={!!publishingArticle}
          onClose={() => {
            setPublishingArticle(null);
            setPublishingDefaultType(null);
          }}
          onPublished={() => {
            loadIntegrations(project.id);
            loadHistory(project.id);
            loadArticles(project.id);
            setSuccessMessage(`Successfully published '${publishingArticle.title}'!`);
          }}
        />
      )}

      {/* 6. DISCONNECT CONFIRMATION MODAL */}
      {confirmDisconnectType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="h-6 w-6 shrink-0" />
              <h3 className="font-serif text-lg text-stone-900 font-medium">
                Disconnect {INTEGRATION_DEFINITIONS[confirmDisconnectType].name}?
              </h3>
            </div>
            <p className="text-xs text-stone-600 font-sans leading-relaxed">
              Are you sure you want to disconnect this publishing connector? All stored configuration and server-side encrypted credentials will be permanently purged.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDisconnectType(null)}
                className="rounded-xl border border-stone-200 px-3.5 py-1.5 text-xs font-mono text-stone-600 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDisconnect}
                disabled={isDisconnecting}
                className="inline-flex items-center gap-1 rounded-xl bg-rose-600 hover:bg-rose-700 px-3.5 py-1.5 text-xs font-medium text-white shadow-2xs disabled:opacity-50"
              >
                {isDisconnecting ? (
                  <>
                    <RotateCw className="h-3 w-3 animate-spin" />
                    <span>Disconnecting...</span>
                  </>
                ) : (
                  <span>Disconnect</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
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
