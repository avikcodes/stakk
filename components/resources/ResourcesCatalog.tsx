"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import {
  RESOURCE_CATEGORIES,
  RESOURCE_GUIDES,
  type ResourceCategory,
} from "@/lib/resources";

const FILTER_OPTIONS = ["All", ...RESOURCE_CATEGORIES] as const;

export function ResourcesCatalog() {
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof FILTER_OPTIONS)[number]>("All");

  const visibleGuides =
    selectedCategory === "All"
      ? RESOURCE_GUIDES
      : RESOURCE_GUIDES.filter((guide) => guide.category === selectedCategory);

  return (
    <div className="space-y-8">
      {/* Category filter bar */}
      <div
        role="group"
        aria-label="Filter resources by category"
        className="flex flex-wrap gap-2"
      >
        {FILTER_OPTIONS.map((category) => {
          const active = selectedCategory === category;
          return (
            <button
              key={category}
              type="button"
              aria-pressed={active}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-lg px-3.5 py-2 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14181f] focus-visible:ring-offset-2 ${
                active
                  ? "bg-[#14181f] text-white"
                  : "border border-stone-200 bg-white text-slate-700 hover:border-stone-300 hover:bg-[#fbfbfa]"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Resource Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visibleGuides.map((guide) => (
          <Link
            key={guide.slug}
            id={guide.anchorId}
            href={`/resources/${guide.slug}`}
            className="group scroll-mt-24 flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14181f] focus-visible:ring-offset-2"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full border border-stone-200 bg-[#fbfbfa] px-2.5 py-0.5 font-mono text-[11px] font-medium text-[#14181f]">
                  {guide.category}
                </span>
                <span className="font-mono text-[11px] text-slate-500">
                  {guide.readingTime}
                </span>
              </div>

              <h3 className="mt-4 flex items-start justify-between gap-2 text-lg font-semibold tracking-tight text-[#14181f]">
                <span>{guide.title}</span>
                <ArrowUpRight
                  className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {guide.description}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-stone-200/75 pt-4 font-mono text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Read guide</span>
              </span>
              <span>/resources/{guide.slug}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function ResourceCategoriesIndex() {
  const counts = RESOURCE_CATEGORIES.map((category) => ({
    category,
    count: RESOURCE_GUIDES.filter(
      (guide) => guide.category === (category as ResourceCategory)
    ).length,
  }));

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {counts.map((item) => (
        <div
          key={item.category}
          className="rounded-xl border border-stone-200/90 bg-white p-5"
        >
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-[#14181f]">
            {item.category}
          </p>
          <p className="mt-1.5 text-xs text-slate-600">
            {item.count} {item.count === 1 ? "published guide" : "published guides"}
          </p>
        </div>
      ))}
    </div>
  );
}

