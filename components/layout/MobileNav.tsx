"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/site";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-white/90 text-slate-700 transition-colors hover:bg-white hover:text-[#14181f]"
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {open ? (
        <div
          id="mobile-navigation"
          className="absolute inset-x-0 top-full border-b border-stone-200 bg-[#fbfbfa]/98 px-4 py-4 backdrop-blur-md sm:px-6"
        >
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-stone-200/50 hover:text-[#14181f]"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-stone-200/80 pt-3">
              <Link
                href="/pricing"
                onClick={() => setOpen(false)}
                className="inline-flex w-full items-center justify-center rounded-lg bg-[#14181f] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#232933]"
              >
                Start with Stak
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
