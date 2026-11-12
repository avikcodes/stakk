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
  FolderKanban,
  ChevronDown,
  X,
  ExternalLink,
  Search,
  Globe,
  Users,
  Share2,
  ArrowRight,
  Send,
  MessageSquare,
  MessageCircle,
  Copy,
  CheckCheck,
  Check,
  Tag,
  Link as LinkIcon,
  ShieldCheck,
  Edit3,
  Flame,
  RefreshCw,
  Clock,
  History,
  Calendar,
  Filter,
} from "lucide-react";
import {
  Project,
  BacklinkOpportunity,
  BacklinkCommunityMember,
  BacklinkCollaboration,
  RedditComment,
} from "@/lib/db/schema";
import { RedditUsageStats } from "@/lib/db/reddit-service";

interface SocialWorkspaceProps {
  project: Project;
  projects: Project[];
  onSelectProject: (projectId: string) => void;
}

export function SocialWorkspace({
  project,
  projects,
  onSelectProject,
}: SocialWorkspaceProps) {
  // Navigation: strictly contains ONLY "backlinks" (Backlinks / Backlink Community) and "reddit" (Reddit outreach/comments)
  const [socialNav, setSocialNav] = useState<"backlinks" | "reddit">("backlinks");

  // Sub-tabs for Backlinks / Backlink Community
  const [backlinkSubTab, setBacklinkSubTab] = useState<"opportunities" | "community" | "activity">("opportunities");

  // ==========================================
  // REDDIT OUTREACH / COMMENTS STATE
  // ==========================================
  const [redditComments, setRedditComments] = useState<RedditComment[]>([]);
  const [redditStatusFilter, setRedditStatusFilter] = useState<string>("all");
  const [redditSearchQuery, setRedditSearchQuery] = useState("");
  const [redditTopicInput, setRedditTopicInput] = useState("");
  const [isResearchingReddit, setIsResearchingReddit] = useState(false);
  const [lastRedditTopicSearched, setLastRedditTopicSearched] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingDraftText, setEditingDraftText] = useState("");
  const [refiningCommentId, setRefiningCommentId] = useState<string | null>(null);
  const [refinementInput, setRefinementInput] = useState("");
  const [showRefineModalFor, setShowRefineModalFor] = useState<RedditComment | null>(null);
  const [redditUsage, setRedditUsage] = useState<RedditUsageStats | null>(null);
  const [copiedCommentId, setCopiedCommentId] = useState<string | null>(null);

  // Reddit Confirmation Modals
  const [confirmDeleteRedditId, setConfirmDeleteRedditId] = useState<string | null>(null);
  const [confirmMarkPostedId, setConfirmMarkPostedId] = useState<string | null>(null);

  // ==========================================
  // BACKLINKS & COMMUNITY STATE
  // ==========================================
  const [opportunities, setOpportunities] = useState<BacklinkOpportunity[]>([]);
  const [oppStatusFilter, setOppStatusFilter] = useState<string>("all");
  const [oppSearchQuery, setOppSearchQuery] = useState("");
  const [discoveryQuery, setDiscoveryQuery] = useState("");
  const [lastDiscoveryQuery, setLastDiscoveryQuery] = useState("");
  const [isDiscoveringOpp, setIsDiscoveringOpp] = useState(false);

  const [communityMembers, setCommunityMembers] = useState<BacklinkCommunityMember[]>([]);
  const [communitySearchQuery, setCommunitySearchQuery] = useState("");
  const [collaborations, setCollaborations] = useState<Array<BacklinkCollaboration & { communityMember?: BacklinkCommunityMember }>>([]);
  const [selectedCommunityMember, setSelectedCommunityMember] = useState<BacklinkCommunityMember | null>(null);

  // Backlink Modals
  const [confirmDeleteOppId, setConfirmDeleteOppId] = useState<string | null>(null);
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [collabProposedUrl, setCollabProposedUrl] = useState("");
  const [collabType, setCollabType] = useState("Contextual Link Exchange");
  const [collabPitch, setCollabPitch] = useState("");
  const [isSubmittingCollab, setIsSubmittingCollab] = useState(false);

  // Global Workspace states
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);

  // 1. Load Reddit Comments & Usage
  const loadRedditData = useCallback(async (projId: string) => {
    try {
      const [commRes, usageRes] = await Promise.all([
        fetch(`/api/social/reddit/comments?projectId=${projId}`),
        fetch(`/api/social/reddit/usage?projectId=${projId}`),
      ]);
      if (commRes.ok) {
        const commData = await commRes.json();
        setRedditComments(commData.comments || []);
      }
      if (usageRes.ok) {
        const usageData = await usageRes.json();
        setRedditUsage(usageData.usage || null);
      }
    } catch (e) {
      console.warn("Error loading Reddit data:", e);
    }
  }, []);

  // 2. Load Backlinks & Community Data
  const loadBacklinkData = useCallback(async (projId: string) => {
    try {
      const [oppRes, commRes, collabRes] = await Promise.all([
        fetch(`/api/social/backlinks/opportunities?projectId=${projId}`),
        fetch("/api/social/backlinks/community"),
        fetch(`/api/social/backlinks/collaborations?projectId=${projId}`),
      ]);
      if (oppRes.ok) {
        const oppData = await oppRes.json();
        setOpportunities(oppData.opportunities || []);
      }
      if (commRes.ok) {
        const commData = await commRes.json();
        setCommunityMembers(commData.members || []);
      }
      if (collabRes.ok) {
        const collabData = await collabRes.json();
        setCollaborations(collabData.collaborations || []);
      }
    } catch (e) {
      console.warn("Error loading backlink data:", e);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setErrorMessage(null);
    Promise.all([
      loadRedditData(project.id),
      loadBacklinkData(project.id),
    ]).finally(() => {
      setIsLoading(false);
    });
  }, [project.id, loadRedditData, loadBacklinkData]);

  // ==========================================
  // REDDIT OUTREACH HANDLERS
  // ==========================================

  // Research discussions via Firecrawl & OpenRouter
  const handleResearchReddit = async (e?: React.FormEvent, customTopic?: string) => {
    if (e) e.preventDefault();
    const queryToUse = customTopic || redditTopicInput;
    if (!queryToUse.trim()) return;

    setIsResearchingReddit(true);
    setErrorMessage(null);
    setLastRedditTopicSearched(queryToUse.trim());

    try {
      const res = await fetch("/api/social/reddit/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          topic: queryToUse.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to research discussions");
      }

      const data = await res.json();
      const newItems: RedditComment[] = data.comments || [];
      setRedditComments((prev) => [...newItems, ...prev]);
      if (!customTopic) setRedditTopicInput("");
      loadRedditData(project.id);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to research Reddit discussions. Click retry to try again.");
    } finally {
      setIsResearchingReddit(false);
    }
  };

  // Start editing comment draft
  const handleStartEditing = (comment: RedditComment) => {
    setEditingCommentId(comment.id);
    setEditingDraftText(comment.commentDraft);
  };

  // Save comment draft edit
  const handleSaveDraftEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/social/reddit/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentDraft: editingDraftText }),
      });

      if (!res.ok) throw new Error("Failed to save draft edit");
      const { comment } = await res.json();

      setRedditComments((prev) => prev.map((c) => (c.id === id ? comment : c)));
      setEditingCommentId(null);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save comment edit");
    }
  };

  // Human Approval before posting (Enforces 60 comments/mo limit)
  const handleApproveComment = async (id: string) => {
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/social/reddit/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to approve comment");
      }

      const { comment } = await res.json();
      setRedditComments((prev) => prev.map((c) => (c.id === id ? comment : c)));
      loadRedditData(project.id);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to approve comment");
    }
  };

  // Mark as posted by human (with confirmation modal)
  const handleConfirmMarkAsPosted = async () => {
    if (!confirmMarkPostedId) return;
    const id = confirmMarkPostedId;
    try {
      const res = await fetch(`/api/social/reddit/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "posted" }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      const { comment } = await res.json();
      setRedditComments((prev) => prev.map((c) => (c.id === id ? comment : c)));
      loadRedditData(project.id);
      setConfirmMarkPostedId(null);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to mark as posted");
    }
  };

  // Delete comment (with confirmation modal)
  const handleConfirmDeleteComment = async () => {
    if (!confirmDeleteRedditId) return;
    const id = confirmDeleteRedditId;
    try {
      await fetch(`/api/social/reddit/comments/${id}`, { method: "DELETE" });
      setRedditComments((prev) => prev.filter((c) => c.id !== id));
      loadRedditData(project.id);
      setConfirmDeleteRedditId(null);
    } catch (e) {
      console.error(e);
      setErrorMessage("Failed to delete Reddit discussion");
    }
  };

  // Refine with AI
  const handleRefineComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRefineModalFor) return;

    setRefiningCommentId(showRefineModalFor.id);
    try {
      const res = await fetch(`/api/social/reddit/comments/${showRefineModalFor.id}/refine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructions: refinementInput.trim() }),
      });

      if (!res.ok) throw new Error("Refinement failed");
      const { comment } = await res.json();
      setRedditComments((prev) => prev.map((c) => (c.id === comment.id ? comment : c)));
      setShowRefineModalFor(null);
      setRefinementInput("");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to refine comment");
    } finally {
      setRefiningCommentId(null);
    }
  };

  const handleCopyComment = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommentId(id);
    setTimeout(() => setCopiedCommentId(null), 2000);
  };

  // Filtered Reddit Comments
  const filteredRedditComments = redditComments.filter((c) => {
    const matchesSearch =
      redditSearchQuery === "" ||
      c.threadTitle.toLowerCase().includes(redditSearchQuery.toLowerCase()) ||
      c.subreddit.toLowerCase().includes(redditSearchQuery.toLowerCase()) ||
      c.commentDraft.toLowerCase().includes(redditSearchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (redditStatusFilter !== "all" && c.status !== redditStatusFilter) return false;
    return true;
  });

  // ==========================================
  // BACKLINKS & COMMUNITY HANDLERS
  // ==========================================
  const handleDiscoverOpp = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const queryToUse = customQuery || discoveryQuery;
    if (!queryToUse.trim()) return;

    setIsDiscoveringOpp(true);
    setErrorMessage(null);
    setLastDiscoveryQuery(queryToUse.trim());

    try {
      const res = await fetch("/api/social/backlinks/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          query: queryToUse.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Discovery failed");
      }

      const data = await res.json();
      const newItems: BacklinkOpportunity[] = data.opportunities || [];
      setOpportunities((prev) => [...newItems, ...prev]);
      if (!customQuery) setDiscoveryQuery("");
      setBacklinkSubTab("opportunities");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to discover opportunities. Click retry to try again.");
    } finally {
      setIsDiscoveringOpp(false);
    }
  };

  const handleUpdateOppStatus = async (
    id: string,
    newStatus: "discovered" | "contacted" | "linked" | "archived"
  ) => {
    try {
      await fetch(`/api/social/backlinks/opportunities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setOpportunities((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: newStatus, updatedAt: new Date() } : o))
      );
    } catch (e) {
      console.error(e);
      setErrorMessage("Failed to update opportunity status");
    }
  };

  const handleConfirmDeleteOpp = async () => {
    if (!confirmDeleteOppId) return;
    const id = confirmDeleteOppId;
    try {
      await fetch(`/api/social/backlinks/opportunities/${id}`, { method: "DELETE" });
      setOpportunities((prev) => prev.filter((o) => o.id !== id));
      setConfirmDeleteOppId(null);
    } catch (e) {
      console.error(e);
      setErrorMessage("Failed to delete backlink opportunity");
    }
  };

  const handleOpenCollaboration = (member: BacklinkCommunityMember) => {
    setSelectedCommunityMember(member);
    setCollabProposedUrl(project.domain ? `https://${project.domain}` : "https://stak.co.in");
    setCollabType(member.collaborationType);
    setCollabPitch(
      `Hi ${member.name} editorial team,\n\nI’ve been reading your recent publications on ${member.domain} regarding ${member.niche}.\n\nAt ${project.name}, we publish verified technical guides and editorial blueprints. In accordance with your ${member.collaborationType} guidelines, I’d love to propose an editorial exchange or reference.\n\nLooking forward to collaborating!\n\nBest,\nEditorial Team at ${project.name}`
    );
    setShowCollabModal(true);
  };

  const handleSubmitCollaboration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommunityMember) return;

    setIsSubmittingCollab(true);
    try {
      const res = await fetch("/api/social/backlinks/collaborations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          communityMemberId: selectedCommunityMember.id,
          proposedUrl: collabProposedUrl.trim(),
          collaborationType: collabType,
          pitchMessage: collabPitch.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to send collaboration proposal");
      const { collaboration } = await res.json();

      setCollaborations((prev) => [
        { ...collaboration, communityMember: selectedCommunityMember },
        ...prev,
      ]);
      setShowCollabModal(false);
      setBacklinkSubTab("activity");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to submit collaboration proposal");
    } finally {
      setIsSubmittingCollab(false);
    }
  };

  const filteredOpportunities = opportunities.filter((o) => {
    const matchesSearch =
      oppSearchQuery === "" ||
      o.pageTitle.toLowerCase().includes(oppSearchQuery.toLowerCase()) ||
      o.targetDomain.toLowerCase().includes(oppSearchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (oppStatusFilter !== "all" && o.status !== oppStatusFilter) return false;
    return true;
  });

  const filteredCommunityMembers = communityMembers.filter((m) => {
    if (!communitySearchQuery.trim()) return true;
    const q = communitySearchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.domain.toLowerCase().includes(q) ||
      m.niche.toLowerCase().includes(q) ||
      m.collaborationType.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#fbfbfa]">
      {/* 1. TOP HEADER & NAVIGATION */}
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

          {/* EXACT SCOPE: Social workspace navigation strictly contains ONLY the two approved capabilities */}
          <nav className="flex items-center gap-1.5 rounded-xl bg-stone-100 p-1 border border-stone-200/60 font-mono text-xs">
            <button
              type="button"
              onClick={() => setSocialNav("backlinks")}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 transition-colors ${
                socialNav === "backlinks"
                  ? "bg-stone-900 text-white font-medium shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Backlinks / Backlink Community</span>
            </button>

            <button
              type="button"
              onClick={() => setSocialNav("reddit")}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 transition-colors ${
                socialNav === "reddit"
                  ? "bg-stone-900 text-white font-medium shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>Reddit outreach/comments</span>
            </button>
          </nav>
        </div>

        {/* LOCKED USAGE METER: 60 Reddit comments/month and the current usage */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 rounded-xl border border-stone-200 bg-stone-50/90 px-3.5 py-1.5 shadow-2xs">
            <MessageSquare className="h-3.5 w-3.5 text-stone-600 shrink-0" />
            <div className="font-mono text-xs">
              <span className="font-semibold text-stone-900">
                {redditUsage?.monthlyUsage ?? 0}
              </span>{" "}
              <span className="text-stone-500">/ 60 comments this month</span>
            </div>
            <div className="hidden sm:block w-12 h-1.5 rounded-full bg-stone-200 overflow-hidden ml-1">
              <div
                className={`h-full rounded-full transition-all ${
                  (redditUsage?.monthlyUsage ?? 0) >= 55 ? "bg-amber-600" : "bg-stone-800"
                }`}
                style={{
                  width: `${Math.min(100, (((redditUsage?.monthlyUsage ?? 0) / 60) * 100))}%`,
                }}
              />
            </div>
            <span className="hidden md:inline rounded-md bg-stone-200/80 px-2 py-0.5 text-[10px] font-mono text-stone-600">
              60 Reddit comments/month
            </span>
          </div>
        </div>
      </header>

      {/* Error Alert Banner with Retry Option */}
      {errorMessage && (
        <div className="shrink-0 bg-rose-50 border-b border-rose-200 px-6 py-2.5 flex items-center justify-between text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <div className="flex items-center gap-2">
            {socialNav === "reddit" && lastRedditTopicSearched && (
              <button
                type="button"
                onClick={() => handleResearchReddit(undefined, lastRedditTopicSearched)}
                className="inline-flex items-center gap-1 rounded-md bg-rose-100 hover:bg-rose-200 px-2 py-1 text-[11px] font-mono text-rose-800 transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Retry Reddit Research</span>
              </button>
            )}
            {socialNav === "backlinks" && lastDiscoveryQuery && (
              <button
                type="button"
                onClick={() => handleDiscoverOpp(undefined, lastDiscoveryQuery)}
                className="inline-flex items-center gap-1 rounded-md bg-rose-100 hover:bg-rose-200 px-2 py-1 text-[11px] font-mono text-rose-800 transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Retry Opportunity Discovery</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-600 hover:text-rose-900 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. MAIN WORKSPACE VIEW */}
      <div className="flex-1 overflow-y-auto">
        {/* ======================================================== */}
        {/* CAPABILITY 1: BACKLINKS / BACKLINK COMMUNITY             */}
        {/* ======================================================== */}
        {socialNav === "backlinks" && (
          <div className="p-6 sm:p-8 lg:p-10 max-w-6xl mx-auto space-y-6">
            {/* Header & Overview */}
            <div className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-7 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-stone-800" />
                    <h2 className="font-serif text-xl font-normal text-[#14181f]">
                      Backlinks / Backlink Community
                    </h2>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-medium text-emerald-800 border border-emerald-200">
                      Verified Ecosystem
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
                    Discover editorial backlink opportunities via Firecrawl live web research, connect with verified publisher partners, and collaborate on contextual citations for {project.name}.
                  </p>
                </div>

                {/* Summary Metrics */}
                <div className="flex items-center gap-5 sm:border-l sm:border-stone-100 sm:pl-6 text-center font-mono">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-stone-400">
                      Saved Opportunities
                    </div>
                    <div className="font-serif text-lg text-stone-800 mt-0.5">
                      {opportunities.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-stone-400">
                      Community Partners
                    </div>
                    <div className="font-serif text-lg text-emerald-800 font-medium mt-0.5">
                      {communityMembers.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-stone-400">
                      Active Collaborations
                    </div>
                    <div className="font-serif text-lg text-stone-800 mt-0.5">
                      {collaborations.length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-Tabs: Saved Opportunities | Backlink Community | Activity / History */}
              <div className="flex items-center gap-2 mt-6 pt-5 border-t border-stone-100 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setBacklinkSubTab("opportunities")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors ${
                    backlinkSubTab === "opportunities"
                      ? "bg-stone-900 text-white font-medium"
                      : "bg-stone-100 text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Saved Opportunities ({opportunities.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBacklinkSubTab("community")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors ${
                    backlinkSubTab === "community"
                      ? "bg-stone-900 text-white font-medium"
                      : "bg-stone-100 text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Verified Community ({communityMembers.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBacklinkSubTab("activity")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors ${
                    backlinkSubTab === "activity"
                      ? "bg-stone-900 text-white font-medium"
                      : "bg-stone-100 text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <History className="h-3.5 w-3.5" />
                  <span>Activity & History ({collaborations.length})</span>
                </button>
              </div>
            </div>

            {/* TAB 1: SAVED OPPORTUNITIES & DISCOVERY */}
            {backlinkSubTab === "opportunities" && (
              <div className="space-y-6">
                {/* Live Web Research / Discovery Bar */}
                <div className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-2xs space-y-4">
                  <div>
                    <h3 className="font-serif text-base font-normal text-stone-900">
                      Discover Live Backlink Opportunities
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Search relevant blogs, technical guides, and industry publications matching {project.name}'s niche using Firecrawl live web research.
                    </p>
                  </div>

                  <form onSubmit={handleDiscoverOpp} className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                      <input
                        type="text"
                        value={discoveryQuery}
                        onChange={(e) => setDiscoveryQuery(e.target.value)}
                        placeholder="Enter topic or niche (e.g. developer-first content tools, markdown documentation, LLM optimization)..."
                        className="w-full rounded-xl border border-stone-200 bg-stone-50/70 pl-10 pr-4 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:border-stone-400 font-sans"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isDiscoveringOpp}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-stone-900 px-5 py-2.5 text-xs font-medium text-white hover:bg-stone-800 disabled:opacity-50 transition-colors shrink-0 shadow-xs"
                    >
                      {isDiscoveringOpp ? (
                        <>
                          <RotateCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Searching Live Web (Firecrawl)...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5 text-stone-300" />
                          <span>Discover Opportunities</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Sample Query Suggestions */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                      Try Niches:
                    </span>
                    {[
                      "markdown blogging developer tools",
                      "engineering content platforms",
                      "B2B SaaS documentation workflows",
                    ].map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleDiscoverOpp(undefined, sample)}
                        className="rounded-lg bg-stone-100 hover:bg-stone-200/80 px-2 py-0.5 text-[11px] font-mono text-stone-700 transition-colors"
                      >
                        "{sample}"
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    {["all", "discovered", "contacted", "linked", "archived"].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setOppStatusFilter(st)}
                        className={`rounded-lg px-3 py-1.5 capitalize transition-colors ${
                          oppStatusFilter === st
                            ? "bg-stone-900 text-white font-medium"
                            : "bg-white text-stone-600 border border-stone-200/80 hover:bg-stone-50"
                        }`}
                      >
                        {st === "all" ? `All (${opportunities.length})` : st}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
                    <input
                      type="text"
                      value={oppSearchQuery}
                      onChange={(e) => setOppSearchQuery(e.target.value)}
                      placeholder="Search saved opportunities..."
                      className="w-full rounded-xl border border-stone-200 bg-white pl-8 pr-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:border-stone-400 font-mono"
                    />
                  </div>
                </div>

                {/* Opportunities List */}
                {isLoading ? (
                  <div className="p-16 text-center text-xs font-mono text-stone-400 space-y-2">
                    <RotateCw className="mx-auto h-5 w-5 animate-spin text-stone-400" />
                    <div>Loading backlink opportunities from Neon...</div>
                  </div>
                ) : filteredOpportunities.length === 0 ? (
                  <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center space-y-2">
                    <LinkIcon className="mx-auto h-8 w-8 text-stone-300" />
                    <div className="font-serif text-base text-stone-800">
                      No Backlink Opportunities Found
                    </div>
                    <p className="text-xs font-mono text-stone-400 max-w-sm mx-auto">
                      {oppSearchQuery || oppStatusFilter !== "all"
                        ? "No opportunities match your current filter. Try resetting filters."
                        : "Use the live discovery search above to scan the web via Firecrawl for high-relevance backlink opportunities."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOpportunities.map((opp) => (
                      <div
                        key={opp.id}
                        className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-2xs hover:border-stone-300 transition-colors space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-mono text-stone-600 border border-stone-200">
                                {opp.niche}
                              </span>
                              <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 font-mono text-[10px] font-medium">
                                {opp.relevanceScore.toUpperCase()} RELEVANCE
                              </span>
                              <span className="font-mono text-[10px] text-stone-400">
                                Domain: {opp.targetDomain}
                              </span>
                            </div>

                            <h3 className="mt-1.5 font-serif text-lg font-normal text-stone-900">
                              {opp.pageTitle}
                            </h3>

                            <a
                              href={opp.targetUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-0.5 inline-flex items-center gap-1 font-mono text-xs text-stone-500 hover:text-stone-900 transition-colors"
                            >
                              <span>{opp.targetUrl}</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={opp.status}
                              onChange={(e) => handleUpdateOppStatus(opp.id, e.target.value as any)}
                              className="rounded-xl px-2.5 py-1.5 font-mono text-xs border border-stone-200 bg-stone-50 font-medium text-stone-800"
                            >
                              <option value="discovered">Discovered</option>
                              <option value="contacted">Contacted</option>
                              <option value="linked">Linked</option>
                              <option value="archived">Archived</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => setConfirmDeleteOppId(opp.id)}
                              className="p-1.5 text-stone-300 hover:text-rose-600 transition-colors"
                              title="Delete opportunity"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-stone-100 bg-stone-50/50 p-4">
                          <div>
                            <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                              Recommended Anchor Text
                            </div>
                            <div className="mt-1 font-mono text-xs font-medium text-stone-800">
                              "{opp.recommendedAnchor || project.name}"
                            </div>
                            {opp.suggestedContext && (
                              <p className="mt-1 text-xs text-stone-600 font-sans leading-relaxed">
                                {opp.suggestedContext}
                              </p>
                            )}
                          </div>

                          <div>
                            <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                              Matched Project Content
                            </div>
                            <div className="mt-1 font-serif text-xs text-stone-800">
                              {opp.matchedArticleTitle || "Product Architecture & Guide"}
                            </div>
                            {opp.liveResearchSnippet && (
                              <p className="mt-1 text-[11px] font-mono text-stone-500 italic line-clamp-2">
                                "{opp.liveResearchSnippet}"
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: VERIFIED BACKLINK COMMUNITY */}
            {backlinkSubTab === "community" && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-base font-normal text-stone-900">
                      Verified Community Directory
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Connect directly with technical blogs, publication founders, and engineering teams that actively participate in mutual citations.
                    </p>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
                    <input
                      type="text"
                      value={communitySearchQuery}
                      onChange={(e) => setCommunitySearchQuery(e.target.value)}
                      placeholder="Search publisher or niche..."
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/70 pl-8 pr-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:border-stone-400 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredCommunityMembers.map((member) => (
                    <div
                      key={member.id}
                      className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-2xs flex flex-col justify-between space-y-4 hover:border-stone-300 transition-colors"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-serif text-base font-normal text-stone-900">
                              {member.name}
                            </h4>
                            <a
                              href={`https://${member.domain}`}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-0.5 inline-flex items-center gap-1 font-mono text-xs text-stone-400 hover:text-stone-700 transition-colors"
                            >
                              <span>{member.domain}</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>

                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-medium text-emerald-800 border border-emerald-200">
                            <Check className="h-2.5 w-2.5" />
                            <span>Verified</span>
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                            Niche & Format
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-mono text-stone-700">
                              {member.niche}
                            </span>
                            <span className="rounded-md bg-stone-50 px-2 py-0.5 text-[11px] font-mono text-stone-600 border border-stone-200/70">
                              {member.collaborationType}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                            Editorial Guidelines
                          </div>
                          <p className="text-xs text-stone-600 font-sans leading-relaxed line-clamp-3">
                            {member.editorialGuidelines}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Open for Collab</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => handleOpenCollaboration(member)}
                          className="inline-flex items-center gap-1 rounded-xl bg-stone-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-stone-800 transition-colors shadow-2xs"
                        >
                          <span>Propose</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: COLLABORATION ACTIVITY & HISTORY */}
            {backlinkSubTab === "activity" && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-2xs flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-base font-normal text-stone-900">
                      Collaboration Activity & Outreach History
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Track sent collaboration proposals, editorial pitches, and backlink placement status.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setBacklinkSubTab("community")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-1.5 text-xs font-mono text-stone-700 hover:bg-stone-100 shadow-2xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>New Proposal</span>
                  </button>
                </div>

                {collaborations.length === 0 ? (
                  <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center space-y-2">
                    <History className="mx-auto h-8 w-8 text-stone-300" />
                    <div className="font-serif text-base text-stone-800">
                      No Collaboration History Yet
                    </div>
                    <p className="text-xs font-mono text-stone-400 max-w-sm mx-auto">
                      Propose an editorial link exchange or resource inclusion from the Verified Community tab to start tracking partnerships.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {collaborations.map((collab) => (
                      <div
                        key={collab.id}
                        className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-2xs space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-serif text-base text-stone-900 font-medium">
                                {collab.communityMember?.name || "Community Partner"}
                              </span>
                              {collab.communityMember?.domain && (
                                <a
                                  href={`https://${collab.communityMember.domain}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs font-mono text-stone-400 hover:text-stone-700"
                                >
                                  ({collab.communityMember.domain})
                                </a>
                              )}
                            </div>
                            <div className="mt-0.5 flex items-center gap-3 text-xs font-mono text-stone-400">
                              <span>Format: {collab.collaborationType}</span>
                              <span>•</span>
                              <span>
                                Sent: {new Date(collab.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <span
                            className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-medium border ${
                              collab.status === "completed"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : collab.status === "accepted"
                                ? "bg-blue-50 text-blue-800 border-blue-200"
                                : "bg-stone-100 text-stone-700 border-stone-200"
                            }`}
                          >
                            {collab.status.toUpperCase()}
                          </span>
                        </div>

                        <div>
                          <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400 mb-1">
                            Pitch Message & Resource Link
                          </div>
                          <div className="rounded-xl border border-stone-100 bg-stone-50/50 p-4 font-sans text-xs text-stone-800 leading-relaxed whitespace-pre-line">
                            {collab.pitchMessage}
                          </div>
                        </div>

                        {collab.proposedUrl && (
                          <div className="flex items-center gap-2 text-xs font-mono text-stone-500 pt-1">
                            <span className="text-stone-400">Proposed Resource:</span>
                            <a
                              href={collab.proposedUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-stone-800 hover:underline flex items-center gap-1"
                            >
                              <span>{collab.proposedUrl}</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* CAPABILITY 2: REDDIT OUTREACH / COMMENTS                  */}
        {/* ======================================================== */}
        {socialNav === "reddit" && (
          <div className="p-6 sm:p-8 lg:p-10 max-w-6xl mx-auto space-y-6">
            {/* Header & Locked Quota Overview */}
            <div className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-7 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-stone-800" />
                    <h2 className="font-serif text-xl font-normal text-[#14181f]">
                      Reddit outreach/comments
                    </h2>
                    <span className="rounded-full bg-stone-100 px-2.5 py-0.5 font-mono text-[10px] text-stone-600 border border-stone-200">
                      Human in the Loop
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
                    Research relevant developer discussions on Reddit via Firecrawl, draft authentic value-add responses with OpenRouter, and review before approving.
                  </p>
                </div>

                {/* Quota Tracking Counters: Displaying 60 Reddit comments/month */}
                <div className="flex items-center gap-5 sm:border-l sm:border-stone-100 sm:pl-6 text-center font-mono">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-stone-400">
                      Monthly Usage
                    </div>
                    <div className="font-serif text-lg text-stone-900 font-semibold mt-0.5">
                      {redditUsage?.monthlyUsage ?? 0} <span className="text-xs text-stone-400 font-normal">/ 60</span>
                    </div>
                    <div className="text-[10px] text-stone-400">
                      60 Reddit comments/month
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-stone-400">
                      Drafted
                    </div>
                    <div className="font-serif text-lg text-stone-800 mt-0.5">
                      {redditUsage?.totalDrafted ?? 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-stone-400">
                      Approved
                    </div>
                    <div className="font-serif text-lg text-emerald-800 font-medium mt-0.5">
                      {redditUsage?.totalApproved ?? 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-stone-400">
                      Posted
                    </div>
                    <div className="font-serif text-lg text-stone-800 mt-0.5">
                      {redditUsage?.totalPosted ?? 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Research Input Bar */}
            <div className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-2xs space-y-4">
              <div>
                <h3 className="font-serif text-base font-normal text-stone-900">
                  Research Relevant Reddit Discussions
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Scan subreddits like r/webdev, r/SaaS, r/devops, and r/technicalwriting for active threads matching {project.name}.
                </p>
              </div>

              <form onSubmit={handleResearchReddit} className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    value={redditTopicInput}
                    onChange={(e) => setRedditTopicInput(e.target.value)}
                    placeholder="Enter discussion topic (e.g. markdown content tools, preventing AI hallucinations, developer docs)..."
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/70 pl-10 pr-4 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:border-stone-400 font-sans"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isResearchingReddit}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-stone-900 px-5 py-2.5 text-xs font-medium text-white hover:bg-stone-800 disabled:opacity-50 transition-colors shrink-0 shadow-xs"
                >
                  {isResearchingReddit ? (
                    <>
                      <RotateCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Scanning Reddit (Firecrawl)...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-stone-300" />
                      <span>Research Discussions</span>
                    </>
                  )}
                </button>
              </form>

              {/* Sample Topic Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                  Try Topics:
                </span>
                {[
                  "handling content without AI fluff",
                  "best alternative to Gehirn",
                  "writing technical articles engineers read",
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleResearchReddit(undefined, sample)}
                    className="rounded-lg bg-stone-100 hover:bg-stone-200/80 px-2 py-0.5 text-[11px] font-mono text-stone-700 transition-colors"
                  >
                    "{sample}"
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-1.5 font-mono text-xs">
                {["all", "drafted", "approved", "posted"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setRedditStatusFilter(st)}
                    className={`rounded-lg px-3 py-1.5 capitalize transition-colors ${
                      redditStatusFilter === st
                        ? "bg-stone-900 text-white font-medium"
                        : "bg-white text-stone-600 border border-stone-200/80 hover:bg-stone-50"
                    }`}
                  >
                    {st === "all" ? `All (${redditComments.length})` : st}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
                <input
                  type="text"
                  value={redditSearchQuery}
                  onChange={(e) => setRedditSearchQuery(e.target.value)}
                  placeholder="Search discussions or subreddits..."
                  className="w-full rounded-xl border border-stone-200 bg-white pl-8 pr-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:border-stone-400 font-mono"
                />
              </div>
            </div>

            {/* Reddit Discussion History List */}
            {isLoading ? (
              <div className="p-16 text-center text-xs font-mono text-stone-400 space-y-2">
                <RotateCw className="mx-auto h-5 w-5 animate-spin text-stone-400" />
                <div>Loading Reddit discussions from Neon...</div>
              </div>
            ) : filteredRedditComments.length === 0 ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center space-y-2">
                <MessageCircle className="mx-auto h-8 w-8 text-stone-300" />
                <div className="font-serif text-base text-stone-800">
                  No Reddit Discussions Found
                </div>
                <p className="text-xs font-mono text-stone-400 max-w-sm mx-auto">
                  {redditSearchQuery || redditStatusFilter !== "all"
                    ? "No discussions match your filter. Try clearing your search query."
                    : "Research your first discussion using the search bar above to generate authentic, helpful comment drafts."}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredRedditComments.map((comm) => {
                  const isEditing = editingCommentId === comm.id;
                  const wordCount = comm.commentDraft.trim().split(/\s+/).filter(Boolean).length;

                  return (
                    <div
                      key={comm.id}
                      className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-2xs space-y-4 hover:border-stone-300 transition-colors"
                    >
                      {/* Thread Title & Subreddit Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-stone-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-mono text-stone-700 font-medium border border-stone-200">
                              {comm.subreddit}
                            </span>
                            {comm.authorUsername && (
                              <span className="text-[11px] font-mono text-stone-400">
                                by {comm.authorUsername}
                              </span>
                            )}
                          </div>

                          <h3 className="mt-1 font-serif text-lg font-normal text-stone-900">
                            {comm.threadTitle}
                          </h3>

                          <a
                            href={comm.threadUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-0.5 inline-flex items-center gap-1 font-mono text-xs text-stone-400 hover:text-stone-700 transition-colors"
                          >
                            <span>Open thread on Reddit</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>

                        {/* Workflow Status Badge & Delete */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-medium border ${
                              comm.status === "posted"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : comm.status === "approved"
                                ? "bg-blue-50 text-blue-800 border-blue-200"
                                : "bg-amber-50 text-amber-800 border-amber-200"
                            }`}
                          >
                            {comm.status === "posted" && <Check className="h-2.5 w-2.5" />}
                            {comm.status === "approved" && <ShieldCheck className="h-2.5 w-2.5" />}
                            <span>{comm.status.toUpperCase()}</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => setConfirmDeleteRedditId(comm.id)}
                            className="p-1 text-stone-300 hover:text-rose-600 transition-colors"
                            title="Delete discussion"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Discussion Context (OP's question/pain point) */}
                      {comm.threadSnippet && (
                        <div className="rounded-xl border border-stone-100 bg-stone-50/50 p-3.5 space-y-1">
                          <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                            Discussion Context (OP)
                          </div>
                          <p className="text-xs text-stone-600 font-sans leading-relaxed italic">
                            "{comm.threadSnippet}"
                          </p>
                        </div>
                      )}

                      {/* Comment Draft (View vs In-line Edit) */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                              Comment Draft (OpenRouter)
                            </span>
                            <span className="font-mono text-[10px] text-stone-400">
                              • {wordCount} words
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {!isEditing && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setShowRefineModalFor(comm)}
                                  className="inline-flex items-center gap-1 font-mono text-[11px] text-stone-500 hover:text-stone-900"
                                >
                                  <Sparkles className="h-3 w-3" />
                                  <span>Refine with AI</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleStartEditing(comm)}
                                  className="inline-flex items-center gap-1 font-mono text-[11px] text-stone-500 hover:text-stone-900"
                                >
                                  <Edit3 className="h-3 w-3" />
                                  <span>Edit Draft</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleCopyComment(comm.id, comm.commentDraft)}
                                  className="inline-flex items-center gap-1 font-mono text-[11px] text-stone-500 hover:text-stone-900"
                                >
                                  {copiedCommentId === comm.id ? (
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
                              </>
                            )}
                          </div>
                        </div>

                        {isEditing ? (
                          <div className="space-y-2">
                            <textarea
                              rows={8}
                              value={editingDraftText}
                              onChange={(e) => setEditingDraftText(e.target.value)}
                              className="w-full rounded-xl border border-stone-300 p-4 text-xs font-sans text-stone-800 leading-relaxed focus:outline-hidden focus:border-stone-500"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingCommentId(null)}
                                className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-mono text-stone-600 hover:bg-stone-50"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveDraftEdit(comm.id)}
                                className="rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-stone-800"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-stone-200 bg-stone-50/30 p-4 font-sans text-xs text-stone-800 leading-relaxed whitespace-pre-line select-text">
                            {comm.commentDraft}
                          </div>
                        )}
                      </div>

                      {/* Workflow Actions & Human Approval */}
                      <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-[11px] font-mono text-stone-400">
                          {comm.status === "drafted" && "Awaiting human review and approval"}
                          {comm.status === "approved" && "Approved by human editor — ready to post"}
                          {comm.status === "posted" && `Marked as posted on ${new Date(comm.updatedAt).toLocaleDateString()}`}
                        </div>

                        <div className="flex items-center gap-2">
                          {comm.status === "drafted" && (
                            <button
                              type="button"
                              onClick={() => handleApproveComment(comm.id)}
                              disabled={(redditUsage?.remainingThisMonth ?? 60) <= 0}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-medium text-white hover:bg-stone-800 disabled:opacity-40 transition-colors shadow-2xs"
                              title={
                                (redditUsage?.remainingThisMonth ?? 60) <= 0
                                  ? "Monthly limit of 60 comments reached"
                                  : "Approve comment (human-in-the-loop)"
                              }
                            >
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                              <span>Approve Comment</span>
                            </button>
                          )}

                          {comm.status === "approved" && (
                            <div className="flex items-center gap-2">
                              <a
                                href={comm.threadUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => handleCopyComment(comm.id, comm.commentDraft)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-mono text-stone-800 hover:bg-stone-100 transition-colors"
                              >
                                <ExternalLink className="h-3 w-3" />
                                <span>Copy & Open Thread</span>
                              </a>

                              <button
                                type="button"
                                onClick={() => setConfirmMarkPostedId(comm.id)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-800 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-900 transition-colors shadow-2xs"
                              >
                                <Check className="h-3 w-3" />
                                <span>Mark as Posted</span>
                              </button>
                            </div>
                          )}

                          {comm.status === "posted" && (
                            <a
                              href={comm.threadUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 font-mono text-xs text-stone-500 hover:text-stone-900"
                            >
                              <span>View Thread on Reddit</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. PROPOSE COLLABORATION MODAL */}
      {showCollabModal && selectedCommunityMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
              <div>
                <h3 className="font-serif text-lg font-medium text-[#14181f]">
                  Propose Editorial Collaboration
                </h3>
                <p className="text-xs font-mono text-stone-500 mt-0.5">
                  To: {selectedCommunityMember.name} ({selectedCommunityMember.domain})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCollabModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitCollaboration} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-medium text-stone-700 mb-1">
                  Proposed Article / Resource URL
                </label>
                <input
                  type="text"
                  value={collabProposedUrl}
                  onChange={(e) => setCollabProposedUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 font-sans"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-stone-700 mb-1">
                  Collaboration Format
                </label>
                <select
                  value={collabType}
                  onChange={(e) => setCollabType(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-mono text-stone-800"
                >
                  <option value="Contextual Link Exchange">Contextual Link Exchange</option>
                  <option value="Editorial Co-citation">Editorial Co-citation</option>
                  <option value="Resource Guide Inclusion">Resource Guide Inclusion</option>
                  <option value="Guest Opinion Piece">Guest Opinion Piece</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-stone-700 mb-1">
                  Collaboration Pitch & Value Proposition
                </label>
                <textarea
                  rows={5}
                  value={collabPitch}
                  onChange={(e) => setCollabPitch(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 p-3 text-xs text-stone-900 font-sans leading-relaxed focus:outline-hidden focus:border-stone-400"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowCollabModal(false)}
                  className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-mono text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCollab}
                  className="flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-medium text-white hover:bg-stone-800 disabled:opacity-50 shadow-2xs"
                >
                  {isSubmittingCollab ? (
                    <>
                      <RotateCw className="h-3 w-3 animate-spin" />
                      <span>Sending Proposal...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Submit Collaboration</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. REFINE COMMENT WITH AI MODAL */}
      {showRefineModalFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
              <div>
                <h3 className="font-serif text-lg font-medium text-[#14181f]">
                  Refine Comment with AI
                </h3>
                <p className="text-xs font-mono text-stone-500 mt-0.5">
                  Target: {showRefineModalFor.subreddit} • "{showRefineModalFor.threadTitle.slice(0, 45)}..."
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRefineModalFor(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRefineComment} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-medium text-stone-700 mb-1">
                  Custom Refinement Instructions
                </label>
                <textarea
                  rows={3}
                  value={refinementInput}
                  onChange={(e) => setRefinementInput(e.target.value)}
                  placeholder="e.g. Make it more concise, emphasize real performance trade-offs, add a code example, or soften the tone..."
                  className="w-full rounded-xl border border-stone-200 p-3 text-xs text-stone-900 font-sans focus:outline-hidden focus:border-stone-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowRefineModalFor(null)}
                  className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-mono text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={refiningCommentId === showRefineModalFor.id}
                  className="flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-medium text-white hover:bg-stone-800 disabled:opacity-50 shadow-2xs"
                >
                  {refiningCommentId === showRefineModalFor.id ? (
                    <>
                      <RotateCw className="h-3 w-3 animate-spin" />
                      <span>Refining with OpenRouter...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-stone-300" />
                      <span>Refine Comment</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. CONFIRMATION MODAL: DELETE REDDIT DISCUSSION */}
      {confirmDeleteRedditId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="h-6 w-6 shrink-0" />
              <h3 className="font-serif text-lg text-stone-900 font-medium">
                Delete Discussion Draft?
              </h3>
            </div>
            <p className="text-xs text-stone-600 font-sans leading-relaxed">
              Are you sure you want to remove this Reddit discussion and comment draft? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteRedditId(null)}
                className="rounded-xl border border-stone-200 px-3.5 py-1.5 text-xs font-mono text-stone-600 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteComment}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 px-3.5 py-1.5 text-xs font-medium text-white shadow-2xs"
              >
                Delete Discussion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. CONFIRMATION MODAL: MARK AS POSTED */}
      {confirmMarkPostedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-emerald-600">
              <CheckCircle2 className="h-6 w-6 shrink-0" />
              <h3 className="font-serif text-lg text-stone-900 font-medium">
                Confirm Mark as Posted?
              </h3>
            </div>
            <p className="text-xs text-stone-600 font-sans leading-relaxed">
              Confirm that you have reviewed and manually posted this comment to Reddit. This will record the post in your monthly activity log.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmMarkPostedId(null)}
                className="rounded-xl border border-stone-200 px-3.5 py-1.5 text-xs font-mono text-stone-600 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmMarkAsPosted}
                className="rounded-xl bg-emerald-800 hover:bg-emerald-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-2xs"
              >
                Confirm Posted
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. CONFIRMATION MODAL: DELETE BACKLINK OPPORTUNITY */}
      {confirmDeleteOppId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="h-6 w-6 shrink-0" />
              <h3 className="font-serif text-lg text-stone-900 font-medium">
                Remove Opportunity?
              </h3>
            </div>
            <p className="text-xs text-stone-600 font-sans leading-relaxed">
              Are you sure you want to delete this saved backlink opportunity from {project.name}'s workspace?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteOppId(null)}
                className="rounded-xl border border-stone-200 px-3.5 py-1.5 text-xs font-mono text-stone-600 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteOpp}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 px-3.5 py-1.5 text-xs font-medium text-white shadow-2xs"
              >
                Delete Opportunity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
