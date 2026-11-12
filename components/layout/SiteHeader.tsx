"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="border-b border-stone-200/80 px-6 py-4">
      <div className="flex w-full items-center justify-between gap-4">
        {/* Left: Brand logo */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="shrink-0 font-serif text-xl tracking-[-0.02em] text-[#14181f] font-normal hover:opacity-90 transition-opacity"
            aria-label="Stak home"
          >
            STAK
          </Link>
          <span className="hidden sm:inline-block rounded-full bg-stone-100 px-2 py-0.5 font-mono text-[10px] text-stone-600 border border-stone-200">
            $129/mo
          </span>
        </div>

        {/* Center / Right: Nav links */}
        <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium text-stone-600">
          <Link
            href="/features"
            className="hover:text-[#14181f] transition-colors"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="hover:text-[#14181f] transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/integrations"
            className="hover:text-[#14181f] transition-colors"
          >
            Integrations
          </Link>
          <Link
            href="/compare/stak-vs-gehirn"
            className="hover:text-[#14181f] transition-colors"
          >
            Stak vs Gehirn
          </Link>
          <Link
            href="/about"
            className="hover:text-[#14181f] transition-colors"
          >
            About
          </Link>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/app"
            className="hidden sm:inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#14181f] px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-stone-800"
          >
            <span>Start with Stak</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex md:hidden p-1.5 rounded-lg text-stone-600 hover:text-[#14181f] hover:bg-stone-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="mt-4 pt-4 border-t border-stone-200 md:hidden flex flex-col gap-3 text-sm">
          <Link
            href="/features"
            onClick={() => setMobileOpen(false)}
            className="text-stone-700 hover:text-black py-1"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            onClick={() => setMobileOpen(false)}
            className="text-stone-700 hover:text-black py-1"
          >
            Pricing
          </Link>
          <Link
            href="/integrations"
            onClick={() => setMobileOpen(false)}
            className="text-stone-700 hover:text-black py-1"
          >
            Integrations
          </Link>
          <Link
            href="/compare/stak-vs-gehirn"
            onClick={() => setMobileOpen(false)}
            className="text-stone-700 hover:text-black py-1"
          >
            Stak vs Gehirn
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileOpen(false)}
            className="text-stone-700 hover:text-black py-1"
          >
            About
          </Link>
          <Link
            href="/app"
            onClick={() => setMobileOpen(false)}
            className="mt-2 inline-flex items-center justify-center rounded-lg bg-[#14181f] px-4 py-2.5 text-sm font-medium text-white"
          >
            Start with Stak
          </Link>
        </div>
      )}
    </header>
  );
}
