"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Volume2,
  Sparkles,
  RotateCw,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Plus,
  Trash2,
  BookOpen,
  SlidersHorizontal,
  Target,
  FileCode,
  ShieldCheck,
  Save,
} from "lucide-react";
import { ProjectWithStats } from "@/lib/db/content-service";
import { BrandVoiceData, TerminologyDefinition } from "@/lib/db/brand-voice-service";

interface BrandVoiceModalProps {
  project: ProjectWithStats;
  isOpen: boolean;
  onClose: () => void;
  onVoiceUpdated?: (updated: BrandVoiceData) => void;
}

export function BrandVoiceModal({
  project,
  isOpen,
  onClose,
  onVoiceUpdated,
}: BrandVoiceModalProps) {
  const [brandVoice, setBrandVoice] = useState<BrandVoiceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"style" | "vocabulary" | "positioning" | "tonemd">("style");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedMd, setCopiedMd] = useState(false);

  // Editable Form State
  const [writingStyle, setWritingStyle] = useState("");
  const [tone, setTone] = useState("");
  const [sentenceStyle, setSentenceStyle] = useState("");
  const [brandPositioning, setBrandPositioning] = useState("");
  const [productLanguage, setProductLanguage] = useState("");
  const [audienceLanguage, setAudienceLanguage] = useState("");
  const [preferredVocabularyStr, setPreferredVocabularyStr] = useState("");
  const [bannedPhrases, setBannedPhrases] = useState("");
  const [styleRules, setStyleRules] = useState("");
  const [terminologyList, setTerminologyList] = useState<TerminologyDefinition[]>([]);
  const [toneGuidelines, setToneGuidelines] = useState("");

  // New terminology input state
  const [newTerm, setNewTerm] = useState("");
  const [newDefinition, setNewDefinition] = useState("");
  const [newExample, setNewExample] = useState("");

  const loadBrandVoice = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/brand-voice?projectId=${project.id}`);
      const data = await res.json();
      if (data.brandVoice) {
        populateFormState(data.brandVoice);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to load project brand voice context.");
    } finally {
      setIsLoading(false);
    }
  };

  const populateFormState = (bv: BrandVoiceData) => {
    setBrandVoice(bv);
    setWritingStyle(bv.writingStyle || "");
    setTone(bv.tone || "");
    setSentenceStyle(bv.sentenceStyle || "");
    setBrandPositioning(bv.brandPositioning || "");
    setProductLanguage(bv.productLanguage || "");
    setAudienceLanguage(bv.audienceLanguage || "");
    setPreferredVocabularyStr(
      Array.isArray(bv.preferredVocabulary)
        ? bv.preferredVocabulary.join(", ")
        : String(bv.preferredVocabulary || "")
    );
    setBannedPhrases(bv.bannedPhrases || "");
    setStyleRules(bv.styleRules || "");
    setTerminologyList(bv.terminology || []);
    setToneGuidelines(bv.toneGuidelines || "");
  };

  useEffect(() => {
    if (isOpen) {
      loadBrandVoice();
    }
  }, [isOpen, project.id]);

  // Analyze from Website and Existing Content using OpenRouter
  const handleAnalyzeFromSources = async () => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/brand-voice/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      populateFormState(data.brandVoice);
      setSuccessMsg("Brand Voice extracted from website and existing content using OpenRouter!");
      if (onVoiceUpdated) {
        onVoiceUpdated(data.brandVoice);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to analyze brand voice.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save & Approve Brand Voice to Neon
  const handleSaveAndApprove = async () => {
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const parsedPreferredVocab = preferredVocabularyStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/brand-voice", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          writingStyle,
          tone,
          sentenceStyle,
          brandPositioning,
          productLanguage,
          audienceLanguage,
          preferredVocabulary: parsedPreferredVocab,
          bannedPhrases,
          styleRules,
          terminology: terminologyList,
          status: "approved",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save brand voice");
      }

      populateFormState(data.brandVoice);
      setSuccessMsg("Brand Voice approved and saved to Neon. Content generation will now follow this context.");
      if (onVoiceUpdated) {
        onVoiceUpdated(data.brandVoice);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to save brand voice.");
    } finally {
      setIsSaving(false);
    }
  };

  // Add new terminology item
  const handleAddTerminology = () => {
    if (!newTerm.trim() || !newDefinition.trim()) return;
    setTerminologyList([
      ...terminologyList,
      {
        term: newTerm.trim(),
        definition: newDefinition.trim(),
        example: newExample.trim() || undefined,
      },
    ]);
    setNewTerm("");
    setNewDefinition("");
    setNewExample("");
  };

  // Remove terminology item
  const handleRemoveTerminology = (idx: number) => {
    setTerminologyList(terminologyList.filter((_, i) => i !== idx));
  };

  const handleCopyMarkdown = () => {
    if (!toneGuidelines) return;
    navigator.clipboard.writeText(toneGuidelines);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-4xl rounded-2xl border border-stone-200 bg-white shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-stone-200 bg-white p-2 text-stone-800 shadow-2xs">
              <Volume2 className="h-5 w-5 text-stone-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-medium text-stone-900">
                  {project.name} • Brand Voice & TONE.md
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-mono text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  <span>Approved Neon Context</span>
                </span>
              </div>
              <p className="text-xs font-mono text-stone-500 mt-0.5">
                Extracted from website & existing articles to govern writing style, vocabulary & cadence
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Notifications */}
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

        {/* Tabs & AI Analyze Action */}
        <div className="px-6 pt-3 border-b border-stone-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("style")}
              className={`pb-2.5 px-1 border-b-2 font-medium transition-colors ${
                activeTab === "style"
                  ? "border-stone-900 text-stone-900"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              Style & Tone (3)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("vocabulary")}
              className={`pb-2.5 px-1 border-b-2 font-medium transition-colors ${
                activeTab === "vocabulary"
                  ? "border-stone-900 text-stone-900"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              Vocabulary & Clichés (2)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("positioning")}
              className={`pb-2.5 px-1 border-b-2 font-medium transition-colors ${
                activeTab === "positioning"
                  ? "border-stone-900 text-stone-900"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              Positioning & Language (3)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("tonemd")}
              className={`pb-2.5 px-1 border-b-2 font-medium transition-colors ${
                activeTab === "tonemd"
                  ? "border-stone-900 text-stone-900"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              TONE.md Specification
            </button>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <button
              type="button"
              onClick={handleAnalyzeFromSources}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 px-3 py-1.5 text-xs font-mono text-stone-700 transition-colors disabled:opacity-50"
              title="Analyze website content & published articles using OpenRouter"
            >
              {isAnalyzing ? (
                <>
                  <RotateCw className="h-3 w-3 animate-spin text-stone-500" />
                  <span>Analyzing with OpenRouter...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3 text-stone-500" />
                  <span>Analyze from Website & Articles</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#fcfcfa]">
          {isLoading ? (
            <div className="p-16 text-center text-xs font-mono text-stone-400 space-y-2">
              <RotateCw className="mx-auto h-5 w-5 animate-spin text-stone-400" />
              <div>Loading brand voice context from Neon...</div>
            </div>
          ) : (
            <>
              {/* TAB 1: STYLE, TONE & SENTENCE CADENCE */}
              {activeTab === "style" && (
                <div className="space-y-4">
                  {/* Writing Style */}
                  <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs space-y-2">
                    <label className="block text-xs font-mono font-medium text-stone-900">
                      1. Writing Style
                    </label>
                    <textarea
                      value={writingStyle}
                      onChange={(e) => setWritingStyle(e.target.value)}
                      placeholder="e.g. Technical, expository, direct, and zero promotional hype."
                      rows={2}
                      className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-800 font-sans focus:outline-hidden focus:border-stone-400 resize-none"
                    />
                    <p className="text-[10px] font-mono text-stone-400">
                      Guides overall prose texture, narrative structure, and exposition format.
                    </p>
                  </div>

                  {/* Core Tone */}
                  <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs space-y-2">
                    <label className="block text-xs font-mono font-medium text-stone-900">
                      2. Core Tone
                    </label>
                    <textarea
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      placeholder="e.g. Pragmatic, peer-to-peer, confident, objective, and respectful of the reader's time."
                      rows={2}
                      className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-800 font-sans focus:outline-hidden focus:border-stone-400 resize-none"
                    />
                    <p className="text-[10px] font-mono text-stone-400">
                      Defines editorial attitude, degree of formality, and emotional resonance.
                    </p>
                  </div>

                  {/* Sentence Style & Cadence */}
                  <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs space-y-2">
                    <label className="block text-xs font-mono font-medium text-stone-900">
                      3. Sentence Style & Cadence
                    </label>
                    <textarea
                      value={sentenceStyle}
                      onChange={(e) => setSentenceStyle(e.target.value)}
                      placeholder="e.g. Crisp declarative sentences averaging 14-18 words, short paragraphs, active verbs."
                      rows={2}
                      className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-800 font-sans focus:outline-hidden focus:border-stone-400 resize-none"
                    />
                    <p className="text-[10px] font-mono text-stone-400">
                      Specifies average sentence length, paragraph break density, and rhythmic flow.
                    </p>
                  </div>

                  {/* Concrete Style Rules */}
                  <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs space-y-2">
                    <label className="block text-xs font-mono font-medium text-stone-900">
                      Concrete Style Rules (Markdown)
                    </label>
                    <textarea
                      value={styleRules}
                      onChange={(e) => setStyleRules(e.target.value)}
                      placeholder="- Use active voice&#10;- Cite verified data&#10;- Use tables for comparisons"
                      rows={3}
                      className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-800 font-mono focus:outline-hidden focus:border-stone-400 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: VOCABULARY, TERMINOLOGY & BANNED CLICHES */}
              {activeTab === "vocabulary" && (
                <div className="space-y-4">
                  {/* Preferred Vocabulary */}
                  <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs space-y-2">
                    <label className="block text-xs font-mono font-medium text-stone-900">
                      Preferred Brand Vocabulary (Comma-Separated)
                    </label>
                    <input
                      type="text"
                      value={preferredVocabularyStr}
                      onChange={(e) => setPreferredVocabularyStr(e.target.value)}
                      placeholder="architected, deterministic, reproducible, latency, throughput"
                      className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-800 font-mono focus:outline-hidden focus:border-stone-400"
                    />
                    <p className="text-[10px] font-mono text-stone-400">
                      Keywords and technical power verbs the AI should naturally integrate into section drafts.
                    </p>
                  </div>

                  {/* Banned Clichés */}
                  <div className="rounded-xl border border-rose-200/80 bg-rose-50/30 p-4 shadow-2xs space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-rose-900">
                      <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                      <span>Banned Marketing Clichés & Filler (Strictly Prohibited)</span>
                    </div>
                    <textarea
                      value={bannedPhrases}
                      onChange={(e) => setBannedPhrases(e.target.value)}
                      placeholder="delve into, revolutionize, game changer, seamlessly, unlock, in today's fast-paced world, power of, cutting-edge"
                      rows={2}
                      className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs text-rose-900 font-mono focus:outline-hidden focus:border-rose-400 resize-none"
                    />
                    <p className="text-[10px] font-mono text-rose-700">
                      The AI humanizer and validator will aggressively purge these phrases during article generation passes.
                    </p>
                  </div>

                  {/* Domain Terminology & Glossary */}
                  <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-stone-900">
                        <BookOpen className="h-3.5 w-3.5 text-stone-600" />
                        <span>Domain Terminology ({terminologyList.length})</span>
                      </div>
                    </div>

                    {/* Existing Terminology List */}
                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      {terminologyList.map((term, i) => (
                        <div
                          key={i}
                          className="flex items-start justify-between rounded-lg border border-stone-100 bg-stone-50/70 p-2.5 text-xs font-mono"
                        >
                          <div className="space-y-0.5">
                            <span className="font-semibold text-stone-900">{term.term}</span>
                            <div className="text-[11px] text-stone-600 font-sans">
                              {term.definition}
                            </div>
                            {term.example && (
                              <div className="text-[10px] text-stone-400 italic font-sans">
                                Example: "{term.example}"
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveTerminology(i)}
                            className="text-stone-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Term Form */}
                    <div className="pt-2 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={newTerm}
                        onChange={(e) => setNewTerm(e.target.value)}
                        placeholder="Term (e.g. COMPANY.md)"
                        className="rounded-xl border border-stone-200 px-2.5 py-1.5 text-xs font-mono text-stone-800"
                      />
                      <input
                        type="text"
                        value={newDefinition}
                        onChange={(e) => setNewDefinition(e.target.value)}
                        placeholder="Definition / meaning"
                        className="rounded-xl border border-stone-200 px-2.5 py-1.5 text-xs font-sans text-stone-800"
                      />
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={newExample}
                          onChange={(e) => setNewExample(e.target.value)}
                          placeholder="Example usage"
                          className="w-full rounded-xl border border-stone-200 px-2.5 py-1.5 text-xs font-sans text-stone-800"
                        />
                        <button
                          type="button"
                          onClick={handleAddTerminology}
                          disabled={!newTerm.trim() || !newDefinition.trim()}
                          className="rounded-xl bg-stone-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-stone-800 disabled:opacity-40 shrink-0"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: POSITIONING, PRODUCT LANGUAGE & AUDIENCE LANGUAGE */}
              {activeTab === "positioning" && (
                <div className="space-y-4">
                  {/* Brand Positioning */}
                  <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-stone-900">
                      <Target className="h-3.5 w-3.5 text-stone-600" />
                      <span>Brand Positioning</span>
                    </div>
                    <textarea
                      value={brandPositioning}
                      onChange={(e) => setBrandPositioning(e.target.value)}
                      placeholder="How the brand frames its value vs legacy/alternative solutions."
                      rows={2}
                      className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-800 font-sans focus:outline-hidden focus:border-stone-400 resize-none"
                    />
                    <p className="text-[10px] font-mono text-stone-400">
                      Prevents the model from producing generic advice that could apply to any competitor.
                    </p>
                  </div>

                  {/* Product Language */}
                  <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs space-y-2">
                    <label className="block text-xs font-mono font-medium text-stone-900">
                      Product Language & Technical Framing
                    </label>
                    <textarea
                      value={productLanguage}
                      onChange={(e) => setProductLanguage(e.target.value)}
                      placeholder="How features, capabilities, and product tiers are described."
                      rows={2}
                      className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-800 font-sans focus:outline-hidden focus:border-stone-400 resize-none"
                    />
                    <p className="text-[10px] font-mono text-stone-400">
                      Ensures features are framed with concrete operational mechanics rather than superficial hype.
                    </p>
                  </div>

                  {/* Audience Language */}
                  <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs space-y-2">
                    <label className="block text-xs font-mono font-medium text-stone-900">
                      Audience Language & Perspective
                    </label>
                    <textarea
                      value={audienceLanguage}
                      onChange={(e) => setAudienceLanguage(e.target.value)}
                      placeholder="How the copy speaks to its target audience persona."
                      rows={2}
                      className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-800 font-sans focus:outline-hidden focus:border-stone-400 resize-none"
                    />
                    <p className="text-[10px] font-mono text-stone-400">
                      Speaks to readers as technical peers, avoiding patronizing introductions.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 4: TONE.MD SOURCE CODE */}
              {activeTab === "tonemd" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-stone-500 font-mono">
                      Persistent TONE.md file generated from the 8 dimensions and stored in Neon.
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyMarkdown}
                      className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-mono text-stone-700 hover:bg-stone-50"
                    >
                      {copiedMd ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 text-stone-400" />
                          <span>Copy TONE.md</span>
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    value={toneGuidelines}
                    onChange={(e) => setToneGuidelines(e.target.value)}
                    rows={16}
                    className="w-full rounded-xl border border-stone-200 bg-white p-4 font-mono text-xs text-stone-800 leading-relaxed focus:outline-hidden focus:border-stone-400"
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-100 flex items-center justify-between bg-white shrink-0">
          <div className="text-[11px] font-mono text-stone-400">
            {brandVoice ? `Analyzed from ${brandVoice.analyzedSourcesCount} sources` : ""}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-mono text-stone-600 hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAndApprove}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-medium text-white hover:bg-stone-800 disabled:opacity-50 shadow-2xs"
            >
              {isSaving ? (
                <>
                  <RotateCw className="h-3 w-3 animate-spin" />
                  <span>Saving to Neon...</span>
                </>
              ) : (
                <>
                  <Save className="h-3 w-3 text-emerald-400" />
                  <span>Save & Approve Brand Voice</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

