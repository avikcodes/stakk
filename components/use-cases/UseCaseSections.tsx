import Link from "next/link";
import {
  Briefcase,
  Building2,
  Check,
  Layers,
  Newspaper,
  Rocket,
  Search,
  ShoppingBag,
} from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SITE_CONFIG } from "@/lib/site";

export interface UseCaseEntry {
  id: string;
  label: string;
  title: string;
  icon:
    | "saas"
    | "seo"
    | "marketing"
    | "content"
    | "founders"
    | "ecommerce"
    | "publishers";
  problem: string;
  workflow: string;
  features: readonly string[];
  outcome: string;
}

export const USE_CASE_ENTRIES: readonly UseCaseEntry[] = [
  {
    id: "saas-companies",
    label: "SaaS companies",
    title: "SaaS companies",
    icon: "saas",
    problem:
      "Product positioning, pricing details, and technical documentation change faster than generic content tools can track, leading to off-brand comparison pages and inconsistent AI search summaries.",
    workflow:
      "Store product scope and positioning in COMPANY.md and writing rules in TONE.md, run multi-agent keyword and competitor research, generate or rewrite feature and comparison pages, verify AI visibility via LLM tracking, and pass drafts through human review.",
    features: [
      "COMPANY.md & TONE.md brand context",
      "Competitor & keyword research",
      "AI article generation & content rewriting",
      "LLM tracking & brand interpretation",
      "Human review workflow",
    ],
    outcome:
      "Clearer product and comparison pages that stay aligned with actual SaaS capabilities across both traditional search and AI answer engines.",
  },
  {
    id: "seo-agencies",
    label: "SEO agencies",
    title: "SEO agencies",
    icon: "seo",
    problem:
      "Managing keyword research, competitor analysis, content briefs, Reddit mentions, backlink discovery, and AI visibility tracking across separate tools slows down delivery and inflates software overhead.",
    workflow:
      "Organize each client website into its own Content Project with domain sitemap and brand voice context, run multi-agent research and brainstorming, produce SEO/AEO/GEO drafts for client review, and track AI visibility alongside backlink and Reddit workflows.",
    features: [
      "Content projects per client domain",
      "Multi-agent research & brainstorming",
      "SEO, AEO & GEO content workflows",
      "Reddit workflows & backlink workflows",
      "LLM tracking & AI visibility",
    ],
    outcome:
      "Repeatable, client-ready research and editorial pipelines consolidated under one flat $129/month subscription.",
  },
  {
    id: "marketing-agencies",
    label: "Marketing agencies",
    title: "Marketing agencies",
    icon: "marketing",
    problem:
      "Client campaigns require distinct brand voices across long-form articles, landing page rewrites, and community discussions—making generic AI copy risky without explicit brand guardrails.",
    workflow:
      "Capture each client's positioning and writing style in COMPANY.md and TONE.md before drafting, use live web research and brainstorming for campaign topics, draft articles and Reddit comments under human review, and monitor brand interpretation.",
    features: [
      "Brand voice & brand interpretation",
      "Web research & brainstorming",
      "Content rewriting & generation",
      "Reddit research & comments",
      "Human review workflow",
    ],
    outcome:
      "Campaign content and community participation that match each client's voice and positioning without multi-tier tool sprawl.",
  },
  {
    id: "content-teams",
    label: "Content teams",
    title: "Content teams",
    icon: "content",
    problem:
      "Writers spend excessive time stitching together keyword notes, checking existing site pages to avoid overlap, and rewriting drafts that miss internal editorial standards.",
    workflow:
      "Ingest existing website structure and sitemap into Brand Context, generate research-backed outlines from multi-agent synthesis, draft or rewrite articles inside Content Projects, and finalize every piece through human-in-the-loop editing.",
    features: [
      "Website structure & sitemap awareness",
      "Content research before writing",
      "AI article generation & content rewriting",
      "Content projects",
      "Human review workflow & export",
    ],
    outcome:
      "Structured, publish-ready drafts that build cleanly on existing site coverage while keeping editors in control.",
  },
  {
    id: "founders",
    label: "Founders",
    title: "Founders",
    icon: "founders",
    problem:
      "Founders know their product and market better than anyone, but rarely have time to manage keyword research, write consistent guides, participate in Reddit threads, and check how AI models describe their startup.",
    workflow:
      "Document product facts and voice once in COMPANY.md and TONE.md, let research agents surface relevant keywords and Reddit discussions, review generated drafts and community replies quickly, and inspect LLM brand interpretation.",
    features: [
      "COMPANY.md & TONE.md setup",
      "Keyword & competitor research",
      "Reddit research & comment drafts",
      "Brand interpretation & LLM tracking",
      "One flat $129/month plan",
    ],
    outcome:
      "Consistent founder-accurate publishing and community presence without hiring a large stack of disconnected SEO tools.",
  },
  {
    id: "ecommerce-companies",
    label: "Ecommerce companies",
    title: "Ecommerce companies",
    icon: "ecommerce",
    problem:
      "Category guides, buying comparisons, and product education pages often lack factual differentiation, making it harder to stand out in search results and AI shopping recommendations.",
    workflow:
      "Connect catalog positioning and sitemap structure into Brand Context, research buyer comparison queries and live market trends, generate or rewrite category buying guides aligned with brand voice, and track AI visibility across product prompts.",
    features: [
      "Website/company context & sitemap",
      "Keyword & web research",
      "Article generation & rewriting",
      "AI visibility & LLM tracking",
      "CMS publishing workflows",
    ],
    outcome:
      "Better-structured category and buying guides that explain product differences clearly for shoppers, search engines, and AI assistants.",
  },
  {
    id: "publishers",
    label: "Publishers",
    title: "Publishers",
    icon: "publishers",
    problem:
      "Editorial teams covering fast-moving topics need live web research, trend discovery, structured multi-article projects, and strict human editorial oversight before anything goes live.",
    workflow:
      "Run live web research and multi-agent brainstorming on emerging topics, organize coverage into Content Projects, apply consistent house style via TONE.md, enforce human-in-the-loop review, and hand off clean HTML/Markdown exports.",
    features: [
      "Web research & trend discovery",
      "Multi-agent research & brainstorming",
      "TONE.md editorial style rules",
      "Content projects & human review",
      "Content export & publishing workflows",
    ],
    outcome:
      "Faster research synthesis and cleaner editorial handoffs while keeping human judgment at the center of publishing.",
  },
] as const;

const ICON_MAP = {
  saas: Rocket,
  seo: Search,
  marketing: Briefcase,
  content: Layers,
  founders: Building2,
  ecommerce: ShoppingBag,
  publishers: Newspaper,
} as const;

export function UseCaseSections() {
  return (
    <>
      {USE_CASE_ENTRIES.map((uc, index) => {
        const Icon = ICON_MAP[uc.icon];
        const isMuted = index % 2 === 0;
        const headingId = `${uc.id}-heading`;

        return (
          <Section
            key={uc.id}
            id={uc.id}
            labelledBy={headingId}
            muted={isMuted}
          >
            <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
              {/* Left identity & CTA column */}
              <div className="lg:col-span-4">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 bg-white text-[#14181f]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="mt-4 font-mono text-xs uppercase tracking-wider text-slate-500">
                  Use Case {String(index + 1).padStart(2, "0")}
                </p>
                <h2
                  id={headingId}
                  className="mt-1 font-serif text-3xl font-normal tracking-tight text-[#14181f]"
                >
                  {uc.title}
                </h2>

                <div className="mt-6 flex flex-col gap-2.5 sm:flex-row lg:flex-col">
                  <Link
                    href="/pricing"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#14181f] px-5 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:bg-[#232933] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14181f] focus-visible:ring-offset-2"
                  >
                    <span>Start with Stak</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                  <Link
                    href="/features"
                    className="inline-flex items-center justify-center rounded-lg border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-[#14181f] transition-colors hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14181f] focus-visible:ring-offset-2"
                  >
                    Explore Features
                  </Link>
                </div>
              </div>

              {/* Right structured workflow breakdown */}
              <div className="grid gap-5 sm:grid-cols-2 lg:col-span-8">
                <article className="rounded-2xl border border-stone-200/90 bg-white p-6">
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Problem
                  </h3>
                  <p className="mt-2.5 text-sm leading-6 text-slate-600">
                    {uc.problem}
                  </p>
                </article>

                <article className="rounded-2xl border border-stone-200/90 bg-white p-6">
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Stak Workflow
                  </h3>
                  <p className="mt-2.5 text-sm leading-6 text-slate-600">
                    {uc.workflow}
                  </p>
                </article>

                <article className="rounded-2xl border border-stone-200/90 bg-white p-6">
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Relevant Features
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {uc.features.map((feat) => (
                      <li
                        key={feat}
                        className="flex items-start gap-2 text-sm text-slate-700"
                      >
                        <Check
                          className="mt-1 h-3.5 w-3.5 shrink-0 text-[#14181f]"
                          aria-hidden="true"
                        />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </article>

                <article className="flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-[#f8f8f6] p-6">
                  <div>
                    <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Expected Workflow Outcome
                    </h3>
                    <p className="mt-2.5 text-sm leading-6 text-[#14181f]">
                      {uc.outcome}
                    </p>
                  </div>

                  <p className="mt-4 border-t border-stone-200/80 pt-3 font-mono text-[11px] text-slate-500">
                    Included in {SITE_CONFIG.name} {SITE_CONFIG.priceMonthly}
                    {SITE_CONFIG.priceUnit}
                  </p>
                </article>
              </div>
            </div>
          </Section>
        );
      })}
    </>
  );
}

