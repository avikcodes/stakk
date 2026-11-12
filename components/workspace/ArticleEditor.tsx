"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import {
  ArrowLeft,
  Save,
  Check,
  Sparkles,
  FileText,
  SlidersHorizontal,
  Heading2,
  Heading3,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RotateCcw,
  AlertTriangle,
  Plus,
  Trash2,
  Send,
  ExternalLink,
  Lock,
  X,
  Edit3,
} from "lucide-react";
import type { ArticleWithContext, ProjectWithStats, BrandVoiceData } from "@/lib/db/content-service";
import { PublishArticleModal } from "./PublishArticleModal";
import { BrandVoiceModal } from "./BrandVoiceModal";

interface ArticleEditorProps {
  article: ArticleWithContext;
  project: ProjectWithStats;
  brandVoice: BrandVoiceData | null;
  onBack: () => void;
  onUpdate: (updated: ArticleWithContext) => void;
  onDelete?: (id: string) => void;
}

export type SaveStatus = "saved" | "saving" | "unsaved" | "error";

export function ArticleEditor({
  article,
  project,
  brandVoice,
  onBack,
  onUpdate,
  onDelete,
}: ArticleEditorProps) {
  const [title, setTitle] = useState(article.title);
  const [status, setStatus] = useState<"draft" | "in_review" | "published">(article.status);
  const [targetKeywords, setTargetKeywords] = useState(article.targetKeywords || "");
  const [researchBrief, setResearchBrief] = useState(article.researchBrief || "");
  const [outline, setOutline] = useState(article.outline || "");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [lastSaved, setLastSaved] = useState<Date | null>(new Date(article.updatedAt));
  const [showDrawer, setShowDrawer] = useState(true);
  const [activeTab, setActiveTab] = useState<"brand" | "research" | "company">("brand");
  const [recoveredBackup, setRecoveredBackup] = useState<boolean>(false);
  const [bannedPhrasesFound, setBannedPhrasesFound] = useState<{ phrase: string; count: number }[]>([]);
  const [multiAgentDossiers, setMultiAgentDossiers] = useState<any[]>([]);
  const [showBrandVoiceModal, setShowBrandVoiceModal] = useState(false);
  const [currentVoice, setCurrentVoice] = useState<BrandVoiceData | null>(brandVoice);

  useEffect(() => {
    if (brandVoice) {
      setCurrentVoice(brandVoice);
    }
  }, [brandVoice]);

  // Publishing Integrations State
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [availableIntegrations, setAvailableIntegrations] = useState<any[]>([]);
  const [selectedPublishType, setSelectedPublishType] = useState<string>("");
  const [isPublishingArticle, setIsPublishingArticle] = useState(false);
  const [publishFeedback, setPublishFeedback] = useState<{
    publishedUrl?: string;
    remoteId?: string;
    message: string;
  } | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Load connected integrations when opening publish modal
  const handleOpenPublishModal = async () => {
    setShowPublishModal(true);
    setPublishFeedback(null);
    setPublishError(null);
    try {
      const res = await fetch(`/api/integrations?projectId=${project.id}`);
      if (res.ok) {
        const data = await res.json();
        const connected = (data.integrations || []).filter((i: any) => i.connectionStatus === "connected");
        setAvailableIntegrations(connected);
        if (connected.length > 0) {
          setSelectedPublishType(connected[0].integrationType);
        }
      }
    } catch {
      // Ignore
    }
  };

  const handleExecutePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPublishType) return;
    setIsPublishingArticle(true);
    setPublishError(null);
    setPublishFeedback(null);

    try {
      const res = await fetch("/api/integrations/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          articleId: article.id,
          integrationType: selectedPublishType,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to publish article");
      }

      const data = await res.json();
      setPublishFeedback(data.result);
      setStatus("published");
      onUpdate({ ...article, status: "published" });
    } catch (err: any) {
      setPublishError(err.message || "Failed to publish article");
    } finally {
      setIsPublishingArticle(false);
    }
  };

  // Load project multi-agent research dossiers
  useEffect(() => {
    if (!project?.id) return;
    fetch(`/api/research/multi-agent?projectId=${project.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.researchList) setMultiAgentDossiers(data.researchList);
      })
      .catch(() => {});
  }, [project?.id]);

  // Calculate words
  const countWords = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  const [wordCount, setWordCount] = useState(article.wordCount);

  // Parse workflow outputs if available
  const parsedWorkflowData = (() => {
    if (!article.workflowData) return null;
    try {
      return JSON.parse(article.workflowData);
    } catch {
      return null;
    }
  })();

  // Initialize TipTap
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      LinkExtension.configure({
        openOnClick: false,
      }),
    ],
    content: article.content.startsWith("<")
      ? article.content
      : article.content
          .split("\n\n")
          .map((p) => {
            if (p.startsWith("## ")) return `<h2>${p.replace("## ", "")}</h2>`;
            if (p.startsWith("### ")) return `<h3>${p.replace("### ", "")}</h3>`;
            if (p.startsWith("# ")) return `<h2>${p.replace("# ", "")}</h2>`;
            return `<p>${p}</p>`;
          })
          .join(""),
    editorProps: {
      attributes: {
        class:
          "prose prose-stone max-w-none focus:outline-none min-h-[520px] text-[15px] sm:text-[16px] leading-[1.8] text-stone-800 font-light",
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      setWordCount(countWords(text));
      setSaveStatus("unsaved");
      triggerBackup();
      scanBannedPhrases(text);
    },
    immediatelyRender: false,
  });

  // Local storage backup key
  const backupKey = `stak_draft_backup_${article.id}`;

  // Trigger local storage backup
  const triggerBackup = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const content = editor ? editor.getHTML() : article.content;
      localStorage.setItem(
        backupKey,
        JSON.stringify({
          title,
          content,
          targetKeywords,
          researchBrief,
          outline,
          status,
          savedAt: Date.now(),
        })
      );
    } catch (e) {
      console.warn("LocalStorage backup failed", e);
    }
  }, [backupKey, editor, title, targetKeywords, researchBrief, outline, status, article.content]);

  // Scan text for banned clichés from brand voice
  const scanBannedPhrases = useCallback(
    (textToScan: string) => {
      const rawPhrases = currentVoice?.bannedPhrases || brandVoice?.bannedPhrases || "delve into, revolutionize, game changer, seamlessly, unlock";
      const phrases = rawPhrases
        .split(",")
        .map((p) => p.trim().toLowerCase())
        .filter(Boolean);

      const combined = `${title} ${textToScan}`.toLowerCase();
      const matches: { phrase: string; count: number }[] = [];

      for (const phrase of phrases) {
        if (!phrase) continue;
        const regex = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
        const found = combined.match(regex);
        if (found && found.length > 0) {
          matches.push({ phrase, count: found.length });
        }
      }
      setBannedPhrasesFound(matches);
    },
    [currentVoice?.bannedPhrases, brandVoice?.bannedPhrases, title]
  );

  // Check for recovered draft on mount
  useEffect(() => {
    if (typeof window === "undefined" || !editor) return;

    try {
      const raw = localStorage.getItem(backupKey);
      if (raw) {
        const backup = JSON.parse(raw);
        const serverTime = new Date(article.updatedAt).getTime();
        // If backup is newer by more than 2 seconds and differs in content or title
        if (
          backup.savedAt > serverTime + 2000 &&
          (backup.title !== article.title || backup.content !== article.content)
        ) {
          setRecoveredBackup(true);
        }
      }
    } catch (e) {
      console.warn("Could not inspect local backup", e);
    }
  }, [backupKey, article.updatedAt, article.title, article.content, editor]);

  // Restore local draft
  const handleRestoreBackup = () => {
    try {
      const raw = localStorage.getItem(backupKey);
      if (raw && editor) {
        const backup = JSON.parse(raw);
        if (backup.title) setTitle(backup.title);
        if (backup.content) editor.commands.setContent(backup.content);
        if (backup.targetKeywords) setTargetKeywords(backup.targetKeywords);
        if (backup.researchBrief) setResearchBrief(backup.researchBrief);
        if (backup.outline) setOutline(backup.outline);
        if (backup.status) setStatus(backup.status);
        setRecoveredBackup(false);
        setSaveStatus("unsaved");
      }
    } catch (e) {
      console.error("Failed to restore backup", e);
    }
  };

  const handleDiscardBackup = () => {
    try {
      localStorage.removeItem(backupKey);
      setRecoveredBackup(false);
    } catch (e) {
      console.error(e);
    }
  };

  // Manual save handler
  const handleSave = async (explicitStatus?: "draft" | "in_review" | "published") => {
    setSaveStatus("saving");
    const content = editor ? editor.getHTML() : article.content;
    const finalStatus = explicitStatus || status;

    try {
      const res = await fetch(`/api/articles/${article.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || article.title,
          status: finalStatus,
          content,
          targetKeywords,
          researchBrief,
          outline,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLastSaved(new Date());
        setSaveStatus("saved");
        onUpdate(data.article);
        // Clear local storage backup since server is now up-to-date
        try {
          localStorage.removeItem(backupKey);
        } catch {}
      } else {
        setSaveStatus("error");
      }
    } catch (e) {
      console.error("Save failed", e);
      setSaveStatus("error");
    }
  };

  // Debounced Autosave (1500ms after changes)
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (saveStatus !== "unsaved") return;

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(() => {
      handleSave();
    }, 1500);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [saveStatus, title, targetKeywords, researchBrief, outline, status]);

  // Window beforeunload warning when changes are unsaved
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === "unsaved" || saveStatus === "saving") {
        e.preventDefault();
        e.returnValue = "You have unsaved changes in your article draft.";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveStatus]);

  // Cmd+S / Ctrl+S keyboard shortcut for manual save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [title, status, targetKeywords, researchBrief, outline]);

  // Insert text into editor at current cursor
  const handleInsertText = (textToInsert: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent(`<p>${textToInsert}</p>`).run();
    setSaveStatus("unsaved");
  };

  // Status badge styling helper
  const getStatusBadge = (s: "draft" | "in_review" | "published") => {
    switch (s) {
      case "published":
        return "bg-emerald-50 text-emerald-800 border-emerald-300";
      case "in_review":
        return "bg-amber-50 text-amber-800 border-amber-300";
      case "draft":
      default:
        return "bg-stone-100 text-stone-700 border-stone-200";
    }
  };

  return (
    <div className="flex h-screen flex-col bg-[#fbfbfa] text-[#14181f]">
      {/* 1. EDITOR TOP BAR */}
      <header className="border-b border-stone-200/80 bg-white/95 px-6 py-3 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Back button & Project Info */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs font-mono text-stone-600 hover:text-stone-900 hover:border-stone-300 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Articles</span>
            </button>
            <span className="h-4 w-px bg-stone-200" />
            <span className="text-xs font-mono text-stone-500">
              Project: <span className="text-stone-900 font-medium">{project.name}</span>
            </span>
          </div>

          {/* Autosave state & Controls */}
          <div className="flex items-center gap-3">
            {/* Save Status Indicator */}
            <div className="text-xs font-mono">
              {saveStatus === "saving" && (
                <span className="inline-flex items-center gap-1.5 text-stone-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-stone-700" />
                  <span>Saving...</span>
                </span>
              )}
              {saveStatus === "saved" && (
                <span className="inline-flex items-center gap-1.5 text-emerald-700">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>
                    Saved{" "}
                    {lastSaved
                      ? lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                      : ""}
                  </span>
                </span>
              )}
              {saveStatus === "unsaved" && (
                <span className="inline-flex items-center gap-1.5 text-amber-700">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>Unsaved changes</span>
                </span>
              )}
              {saveStatus === "error" && (
                <button
                  type="button"
                  onClick={() => handleSave()}
                  className="inline-flex items-center gap-1.5 text-rose-600 hover:underline"
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Save failed (Retry)</span>
                </button>
              )}
            </div>

            <span className="h-3.5 w-px bg-stone-200" />

            <span className="text-xs font-mono text-stone-500">
              {wordCount} words
            </span>

            <span className="h-3.5 w-px bg-stone-200" />

            {/* Status selector (Draft / In Review / Completed) */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="article-status" className="text-[11px] font-mono text-stone-400">
                Status:
              </label>
              <select
                id="article-status"
                value={status}
                onChange={(e) => {
                  const newStatus = e.target.value as "draft" | "in_review" | "published";
                  setStatus(newStatus);
                  setSaveStatus("unsaved");
                  handleSave(newStatus);
                }}
                className={`rounded-lg border px-2.5 py-1 text-xs font-mono font-medium focus:outline-none transition-colors ${getStatusBadge(
                  status
                )}`}
              >
                <option value="draft">Draft</option>
                <option value="in_review">In Review</option>
                <option value="published">Completed</option>
              </select>
            </div>

            {/* Context Drawer Toggle */}
            <button
              type="button"
              onClick={() => setShowDrawer(!showDrawer)}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-mono transition-colors ${
                showDrawer
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-200 bg-stone-50 text-stone-600 hover:text-stone-900 hover:border-stone-300"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Context & Findings</span>
            </button>

            {/* Manual Save Button */}
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saveStatus === "saving"}
              className="flex items-center gap-1.5 rounded-lg bg-[#14181f] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-stone-800 disabled:opacity-50 transition-colors shadow-2xs"
              title="Manual Save (Cmd+S / Ctrl+S)"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save</span>
            </button>

            {/* Publish to CMS / Git Platform */}
            <button
              type="button"
              onClick={handleOpenPublishModal}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100 px-3 py-1.5 text-xs font-mono text-emerald-800 transition-colors shadow-2xs font-medium"
              title="Publish to connected CMS or Git repository"
            >
              <Send className="h-3.5 w-3.5 text-emerald-700" />
              <span>Publish</span>
            </button>

            {/* Delete Article */}
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm("Permanently delete this article?")) {
                    onDelete(article.id);
                  }
                }}
                className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-100 transition-colors"
                title="Delete Article"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Workflow Progress Stepper (if generated or multi-stage) */}
        <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] font-mono text-stone-500 overflow-x-auto">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-stone-400">Workflow:</span>
            {[
              { id: "research", label: "Research" },
              { id: "structure", label: "Structure" },
              { id: "draft", label: "Draft" },
              { id: "fact_check", label: "Fact-check" },
              { id: "write", label: "Write" },
              { id: "polish", label: "Polish" },
              { id: "humanize", label: "Humanize" },
              { id: "validate", label: "Validate" },
            ].map((st, i) => {
              const isCompleted =
                article.workflowStage === "validate" ||
                Boolean(parsedWorkflowData && parsedWorkflowData[st.id]);
              return (
                <span key={st.id} className="inline-flex items-center gap-1">
                  {i > 0 && <span className="text-stone-300">→</span>}
                  <span
                    className={`px-1.5 py-0.5 rounded ${
                      isCompleted
                        ? "bg-stone-100 text-stone-900 font-medium"
                        : "text-stone-400"
                    }`}
                  >
                    {st.label} {isCompleted && "✓"}
                  </span>
                </span>
              );
            })}
          </div>

          {/* Banned Clichés Live Counter Pill */}
          <div className="shrink-0 pl-4">
            {bannedPhrasesFound.length === 0 ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                TONE.md Cliché Free
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                <AlertCircle className="h-3 w-3 text-rose-600" />
                {bannedPhrasesFound.reduce((sum, item) => sum + item.count, 0)} Banned Clichés Detected
              </span>
            )}
          </div>
        </div>
      </header>

      {/* 2. RECOVERED DRAFT BANNER (IF UNSAVED BACKUP FOUND ON REFRESH) */}
      {recoveredBackup && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              <strong>Draft preserved from refresh:</strong> A newer unsaved version of this article was recovered from your local backup.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestoreBackup}
              className="rounded-lg bg-amber-800 px-3 py-1 font-mono text-[11px] text-white hover:bg-amber-900 transition-colors"
            >
              Restore Draft
            </button>
            <button
              type="button"
              onClick={handleDiscardBackup}
              className="rounded-lg border border-amber-300 bg-white px-2.5 py-1 font-mono text-[11px] text-amber-800 hover:bg-amber-100 transition-colors"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* 3. MAIN SPLIT BODY: EDITOR CANVAS + CONTEXT DRAWER */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor Main Canvas */}
        <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-12 lg:px-16">
          <div className="mx-auto max-w-3xl">
            {/* Title Input */}
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setSaveStatus("unsaved");
                triggerBackup();
              }}
              placeholder="Article Title..."
              className="w-full bg-transparent font-serif text-3xl sm:text-4xl font-normal leading-[1.15] text-[#14181f] placeholder:text-stone-300 focus:outline-none mb-6"
            />

            {/* TipTap Formatting Toolbar */}
            {editor && (
              <div className="mb-6 flex flex-wrap items-center gap-1 rounded-xl border border-stone-200/80 bg-white/90 p-1.5 shadow-2xs sticky top-2 z-10 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={`rounded-md p-1.5 text-xs font-mono transition-colors ${
                    editor.isActive("heading", { level: 2 })
                      ? "bg-stone-900 text-white"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  }`}
                  title="Heading 2"
                >
                  <Heading2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                  className={`rounded-md p-1.5 text-xs font-mono transition-colors ${
                    editor.isActive("heading", { level: 3 })
                      ? "bg-stone-900 text-white"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  }`}
                  title="Heading 3"
                >
                  <Heading3 className="h-4 w-4" />
                </button>
                <span className="mx-1 h-4 w-px bg-stone-200" />
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`rounded-md p-1.5 text-xs transition-colors ${
                    editor.isActive("bold")
                      ? "bg-stone-900 text-white"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  }`}
                  title="Bold"
                >
                  <Bold className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`rounded-md p-1.5 text-xs transition-colors ${
                    editor.isActive("italic")
                      ? "bg-stone-900 text-white"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  }`}
                  title="Italic"
                >
                  <Italic className="h-4 w-4" />
                </button>
                <span className="mx-1 h-4 w-px bg-stone-200" />
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={`rounded-md p-1.5 text-xs transition-colors ${
                    editor.isActive("bulletList")
                      ? "bg-stone-900 text-white"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  }`}
                  title="Bullet List"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  className={`rounded-md p-1.5 text-xs transition-colors ${
                    editor.isActive("orderedList")
                      ? "bg-stone-900 text-white"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  }`}
                  title="Numbered List"
                >
                  <ListOrdered className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  className={`rounded-md p-1.5 text-xs transition-colors ${
                    editor.isActive("blockquote")
                      ? "bg-stone-900 text-white"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  }`}
                  title="Quote"
                >
                  <Quote className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                  className={`rounded-md p-1.5 text-xs transition-colors ${
                    editor.isActive("codeBlock")
                      ? "bg-stone-900 text-white"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  }`}
                  title="Code Block"
                >
                  <Code className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* TipTap Rich Text Container */}
            <div className="min-h-[520px] rounded-2xl border border-stone-200/80 bg-white p-8 sm:p-10 shadow-2xs">
              <EditorContent editor={editor} />
            </div>

            {/* Bottom Word & Save metadata */}
            <div className="mt-4 flex items-center justify-between text-xs font-mono text-stone-400">
              <span>{wordCount} words · Autosave active (1.5s)</span>
              {lastSaved && (
                <span>
                  Last saved {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Attached Drawer: Brand Voice, Research Findings, Company Specs */}
        {showDrawer && (
          <aside className="w-80 lg:w-96 border-l border-stone-200/80 bg-stone-50/70 flex flex-col h-full overflow-hidden">
            {/* Drawer Tabs */}
            <div className="flex border-b border-stone-200 bg-white shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("brand")}
                className={`flex-1 py-3 text-xs font-mono uppercase tracking-wider text-center transition-colors border-b-2 ${
                  activeTab === "brand"
                    ? "border-stone-900 font-semibold text-stone-900 bg-stone-50/50"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                Brand Voice
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("research")}
                className={`flex-1 py-3 text-xs font-mono uppercase tracking-wider text-center transition-colors border-b-2 ${
                  activeTab === "research"
                    ? "border-stone-900 font-semibold text-stone-900 bg-stone-50/50"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                Research
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("company")}
                className={`flex-1 py-3 text-xs font-mono uppercase tracking-wider text-center transition-colors border-b-2 ${
                  activeTab === "company"
                    ? "border-stone-900 font-semibold text-stone-900 bg-stone-50/50"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                Company
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              {/* TAB 1: BRAND VOICE (TONE.md + BANNED CLICHES SCANNER) */}
              {activeTab === "brand" && (
                <div className="space-y-4">
                  {/* Action to open Brand Voice Modal */}
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <div>
                      <span className="font-mono text-[10px] uppercase font-semibold text-stone-600 block">
                        Project Brand Voice
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {currentVoice?.status === "approved" ? "Approved & Active" : "Draft / Unreviewed"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowBrandVoiceModal(true)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium font-mono text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-md transition-colors shadow-2xs"
                    >
                      <Sparkles className="h-3 w-3 text-stone-700" />
                      Edit Brand Voice
                    </button>
                  </div>

                  {/* Banned Clichés Scanner Output */}
                  <div className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[11px] font-semibold uppercase text-stone-800 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 text-stone-600" />
                        Live Cliché Scanner
                      </span>
                      <span
                        className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${
                          bannedPhrasesFound.length === 0
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700 font-medium"
                        }`}
                      >
                        {bannedPhrasesFound.length === 0
                          ? "0 Detected"
                          : `${bannedPhrasesFound.length} Found`}
                      </span>
                    </div>

                    {bannedPhrasesFound.length === 0 ? (
                      <p className="text-[11px] text-stone-500">
                        Zero banned clichés detected. Your draft complies with project TONE.md requirements.
                      </p>
                    ) : (
                      <div className="space-y-1.5 mt-2">
                        <p className="text-[11px] text-rose-700 font-medium">
                          Found prohibited phrases in your text:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {bannedPhrasesFound.map((item) => (
                            <span
                              key={item.phrase}
                              className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 font-mono text-[10px] text-rose-800 border border-rose-200"
                            >
                              "{item.phrase}" ({item.count})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* TONE.md Guidelines */}
                  <div>
                    <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase text-stone-800 mb-2">
                      <Sparkles className="h-3.5 w-3.5 text-stone-700" />
                      TONE.md Guidelines
                    </div>
                    <pre className="rounded-xl border border-stone-200 bg-white p-3 font-mono text-[11px] text-stone-700 whitespace-pre-wrap leading-relaxed shadow-2xs max-h-48 overflow-y-auto">
                      {currentVoice?.toneGuidelines || "No custom voice guidelines set for this project."}
                    </pre>
                  </div>

                  {/* Banned Vocabulary List */}
                  <div>
                    <div className="font-mono text-[11px] font-semibold uppercase text-stone-800 mb-1.5">
                      Banned Vocabulary
                    </div>
                    <p className="rounded-xl border border-stone-200 bg-white p-3 font-mono text-[11px] text-stone-600 leading-relaxed shadow-2xs">
                      {currentVoice?.bannedPhrases || "delve into, revolutionize, game changer, seamlessly, unlock"}
                    </p>
                  </div>

                  {/* Style Rules */}
                  <div>
                    <div className="font-mono text-[11px] font-semibold uppercase text-stone-800 mb-1.5">
                      Style Rules
                    </div>
                    <p className="rounded-xl border border-stone-200 bg-white p-3 text-stone-600 leading-relaxed shadow-2xs">
                      {currentVoice?.styleRules || "Declarative prose. Short paragraphs. Primary technical facts."}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: RESEARCH CONTEXT & FINDINGS USAGE */}
              {activeTab === "research" && (
                <div className="space-y-4">
                  {/* Target Keywords */}
                  <div>
                    <label className="block font-mono text-[11px] font-semibold uppercase text-stone-800 mb-1.5">
                      Target Keywords
                    </label>
                    <input
                      type="text"
                      value={targetKeywords}
                      onChange={(e) => {
                        setTargetKeywords(e.target.value);
                        setSaveStatus("unsaved");
                        triggerBackup();
                      }}
                      placeholder="e.g. multi-agent research, brand voice"
                      className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-stone-900 shadow-2xs"
                    />
                  </div>

                  {/* Multi-Agent Research Dossier Importer */}
                  {multiAgentDossiers.length > 0 && (
                    <div className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-semibold uppercase text-stone-800 flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-stone-700" />
                          Multi-Agent Research Dossiers
                        </span>
                        <span className="font-mono text-[10px] text-stone-400">
                          {multiAgentDossiers.length} available
                        </span>
                      </div>
                      <div className="space-y-1.5 max-h-44 overflow-y-auto">
                        {multiAgentDossiers.map((dos) => (
                          <div
                            key={dos.id}
                            className="rounded-lg border border-stone-100 bg-stone-50 p-2 text-xs space-y-1"
                          >
                            <div className="font-medium text-stone-900 text-[11px] truncate">
                              {dos.topic}
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span className="text-stone-400">
                                {dos.facts?.length || 0} facts
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setResearchBrief(dos.synthesizedDossier);
                                  setSaveStatus("unsaved");
                                  triggerBackup();
                                }}
                                className="text-stone-800 hover:text-black underline font-semibold"
                              >
                                Attach as Brief
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Research Findings with Direct "Insert into Draft" Actions */}
                  {parsedWorkflowData && parsedWorkflowData.research && (
                    <div className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-semibold uppercase text-stone-800">
                          Workflow Research Findings
                        </span>
                        <span className="font-mono text-[10px] text-stone-400">Multi-agent stage 1</span>
                      </div>
                      <p className="text-[11px] text-stone-600 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto rounded-lg bg-stone-50 p-2 border border-stone-100 font-mono">
                        {parsedWorkflowData.research}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleInsertText(parsedWorkflowData.research)}
                        className="flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-mono text-stone-700 hover:bg-stone-50 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Insert Findings into Draft</span>
                      </button>
                    </div>
                  )}

                  {/* Fact-check Notes if available */}
                  {parsedWorkflowData && parsedWorkflowData.fact_check && (
                    <div className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-semibold uppercase text-stone-800">
                          Fact-Check Audit Notes
                        </span>
                        <span className="font-mono text-[10px] text-stone-400">Multi-agent stage 4</span>
                      </div>
                      <p className="text-[11px] text-stone-600 leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto rounded-lg bg-stone-50 p-2 border border-stone-100 font-mono">
                        {parsedWorkflowData.fact_check}
                      </p>
                    </div>
                  )}

                  {/* Research Brief & Notes */}
                  <div>
                    <label className="block font-mono text-[11px] font-semibold uppercase text-stone-800 mb-1.5">
                      Research Brief & Notes
                    </label>
                    <textarea
                      rows={5}
                      value={researchBrief}
                      onChange={(e) => {
                        setResearchBrief(e.target.value);
                        setSaveStatus("unsaved");
                        triggerBackup();
                      }}
                      placeholder="Synthesized research insights, competitor gaps, and source references..."
                      className="w-full rounded-xl border border-stone-200 bg-white p-3 text-xs text-stone-800 focus:outline-none focus:border-stone-900 shadow-2xs leading-relaxed"
                    />
                  </div>

                  {/* Editorial Outline */}
                  <div>
                    <label className="block font-mono text-[11px] font-semibold uppercase text-stone-800 mb-1.5">
                      Editorial Outline
                    </label>
                    <textarea
                      rows={4}
                      value={outline}
                      onChange={(e) => {
                        setOutline(e.target.value);
                        setSaveStatus("unsaved");
                        triggerBackup();
                      }}
                      placeholder="Approved section structure..."
                      className="w-full rounded-xl border border-stone-200 bg-white p-3 text-xs text-stone-800 focus:outline-none focus:border-stone-900 shadow-2xs leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: COMPANY CONTEXT (COMPANY.md) */}
              {activeTab === "company" && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase text-stone-800 mb-2">
                      <FileText className="h-3.5 w-3.5 text-stone-700" />
                      COMPANY.md Specifications
                    </div>
                    <pre className="rounded-xl border border-stone-200 bg-white p-3 font-mono text-[11px] text-stone-700 whitespace-pre-wrap leading-relaxed shadow-2xs">
                      {project.companyContext || `# COMPANY.md: ${project.name}\nDomain: ${project.domain || "N/A"}`}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* 5-STEP PUBLISHING WORKFLOW MODAL */}
      <PublishArticleModal
        article={{
          ...article,
          title,
          content: editor ? editor.getHTML() : article.content,
          wordCount,
          status,
        }}
        project={project}
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onPublished={(updated) => {
          setStatus("published");
          onUpdate(updated);
        }}
      />

      {/* BRAND VOICE & TONE.md REVIEW/EDIT MODAL */}
      <BrandVoiceModal
        isOpen={showBrandVoiceModal}
        onClose={() => setShowBrandVoiceModal(false)}
        project={project}
        onVoiceUpdated={(updated) => {
          setCurrentVoice(updated as any);
        }}
      />
    </div>
  );
}
