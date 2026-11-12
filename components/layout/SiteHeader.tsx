import Link from "next/link";
import { NAV_LINKS } from "@/lib/site";
import { Container } from "@/components/ui/Container";
import { BrandMark } from "@/components/ui/BrandMark";
import { MobileNav } from "@/components/layout/MobileNav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/75 bg-[#fbfbfa]/88 backdrop-blur-md">
      <Container className="relative flex h-16 items-center justify-between gap-6">
        <Link
          href="/"
          aria-label="Stak home"
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14181f] focus-visible:ring-offset-2"
        >
          <BrandMark />
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-8 md:flex"
        >
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-sm text-sm font-medium text-slate-600 transition-colors duration-150 hover:text-[#14181f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14181f] focus-visible:ring-offset-2"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/pricing"
            className="hidden rounded-lg bg-[#14181f] px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-[#232933] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14181f] focus-visible:ring-offset-2 md:inline-flex"
          >
            Start with Stak
          </Link>
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
