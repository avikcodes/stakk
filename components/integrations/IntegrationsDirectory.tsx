"use client";

import { useState } from "react";
import { Blocks, GitBranch, Search } from "lucide-react";

type IntegrationCategory = "CMS" | "Developer / publishing";

interface IntegrationItem {
  name: string;
  category: IntegrationCategory;
  status: "Planned";
  summary: string;
  workflowRole: string;
}

const INTEGRATIONS: readonly IntegrationItem[] = [
  {
    name: "WordPress",
    category: "CMS",
    status: "Planned",
    summary:
      "Planned connector to send reviewed articles, headings, and metadata directly to WordPress drafts.",
    workflowRole: "CMS publishing",
  },
  {
    name: "Webflow",
    category: "CMS",
    status: "Planned",
    summary:
      "Planned Webflow CMS collection sync for structured articles, summaries, and SEO fields.",
    workflowRole: "CMS publishing",
  },
  {
    name: "Ghost",
    category: "CMS",
    status: "Planned",
    summary:
      "Planned Ghost Admin API integration for editorial posts and clean HTML/Markdown handoff.",
    workflowRole: "CMS publishing",
  },
  {
    name: "Contentful",
    category: "CMS",
    status: "Planned",
    summary:
      "Planned Contentful entry mapping for headless content projects and structured fields.",
    workflowRole: "CMS publishing",
  },
  {
    name: "Sanity",
    category: "CMS",
    status: "Planned",
    summary:
      "Planned Sanity Studio dataset integration for structured Portable Text and metadata.",
    workflowRole: "CMS publishing",
  },
  {
    name: "Strapi",
    category: "CMS",
    status: "Planned",
    summary:
      "Planned Strapi REST/GraphQL collection connector for self-hosted headless publishing.",
    workflowRole: "CMS publishing",
  },
  {
    name: "Contao",
    category: "CMS",
    status: "Planned",
    summary:
      "Planned Contao CMS integration for structured web content and multilingual publishing.",
    workflowRole: "CMS publishing",
  },
  {
    name: "GitHub",
    category: "Developer / publishing",
    status: "Planned",
    summary:
      "Planned GitHub publishing integration to open pull requests with reviewed Markdown or MDX files.",
    workflowRole: "GitHub publishing",
  },
] as const;

const FILTER_OPTIONS = ["All", "CMS", "Developer / publishing"] as const;

export function IntegrationsDirectory() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof FILTER_OPTIONS)[number]>("All");

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = INTEGRATIONS.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesQuery =
      normalizedQuery === "" ||
      item.name.toLowerCase().includes(normalizedQuery) ||
      item.summary.toLowerCase().includes(normalizedQuery) ||
      item.category.toLowerCase().includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });

  const categoriesToRender: IntegrationCategory[] =
    selectedCategory === "All"
      ? ["CMS", "Developer / publishing"]
      : [selectedCategory];

  return (
    <div className="space-y-8">
      {/* Search & Filter Controls */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-stone-200/90 bg-white p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="relative flex-1 sm:max-w-sm">
          <label htmlFor="integration-search" className="sr-only">
            Search integrations
          </label>
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            id="integration-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search integrations (e.g. WordPress, GitHub)..."
            className="w-full rounded-lg border border-stone-200 bg-[#fbfbfa] py-2 pr-3 pl-10 text-sm text-[#14181f] placeholder:text-slate-400 focus:border-[#14181f] focus:bg-white focus:outline-none"
          />
        </div>

        <div
          role="group"
          aria-label="Filter integrations by category"
          className="flex flex-wrap gap-2"
        >
          {FILTER_OPTIONS.map((option) => {
            const active = selectedCategory === option;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedCategory(option)}
                className={`rounded-lg px-3.5 py-2 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14181f] focus-visible:ring-offset-2 ${
                  active
                    ? "bg-[#14181f] text-white"
                    : "border border-stone-200 bg-[#fbfbfa] text-slate-700 hover:border-stone-300 hover:bg-white"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {/* Directory Groups */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-stone-200/90 bg-white p-8 text-center">
          <p className="text-sm font-medium text-[#14181f]">
            No integrations match &ldquo;{query}&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSelectedCategory("All");
            }}
            className="mt-4 rounded-lg border border-stone-300 bg-[#fbfbfa] px-4 py-2 text-xs font-medium text-[#14181f] hover:bg-white"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {categoriesToRender.map((category) => {
            const items = filtered.filter((item) => item.category === category);
            if (items.length === 0) return null;
            const CategoryIcon = category === "CMS" ? Blocks : GitBranch;

            return (
              <div key={category}>
                <div className="mb-4 flex items-center justify-between border-b border-stone-200/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <CategoryIcon
                      className="h-4 w-4 text-[#14181f]"
                      aria-hidden="true"
                    />
                    <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[#14181f]">
                      {category}
                    </h3>
                  </div>
                  <span className="font-mono text-xs text-slate-500">
                    {items.length} {items.length === 1 ? "integration" : "integrations"}
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <article
                      key={item.name}
                      className="flex flex-col justify-between rounded-xl border border-stone-200/90 bg-white p-6 transition-colors hover:border-stone-300"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-base font-semibold text-[#14181f]">
                            {item.name}
                          </h4>
                          <span className="rounded-full border border-stone-200 bg-[#fbfbfa] px-2.5 py-0.5 font-mono text-[11px] text-slate-600">
                            {item.status}
                          </span>
                        </div>
                        <p className="mt-2.5 text-sm leading-6 text-slate-600">
                          {item.summary}
                        </p>
                      </div>

                      <p className="mt-5 border-t border-stone-200/70 pt-3 font-mono text-[11px] text-slate-500">
                        {item.category} · {item.workflowRole}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

