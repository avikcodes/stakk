import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const RELATED_PAGES = [
  {
    href: "/alternatives",
    label: "All Alternatives",
    description: "What to look for in an AI search & content platform alternative.",
  },
  {
    href: "/alternatives/gehirn",
    label: "Gehirn.md Alternative",
    description: "Complete breakdown of Stak as a $129/month Gehirn.md alternative.",
  },
  {
    href: "/compare",
    label: "Comparison Hub",
    description: "Framework and index for comparing AI search platforms.",
  },
  {
    href: "/compare/stak-vs-gehirn",
    label: "Stak vs Gehirn.md",
    description: "Honest side-by-side comparison table and workflow review.",
  },
] as const;

interface CompareCrossLinksProps {
  currentPath: string;
}

export function CompareCrossLinks({ currentPath }: CompareCrossLinksProps) {
  const items = RELATED_PAGES.filter((page) => page.href !== currentPath);

  return (
    <div className="mt-10 rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-8">
      <p className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-500">
        Related Comparison &amp; Alternative Pages
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-xl border border-stone-200/80 bg-[#fbfbfa] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-stone-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14181f] focus-visible:ring-offset-2"
          >
            <p className="flex items-center justify-between gap-2 text-sm font-semibold text-[#14181f]">
              <span>{item.label}</span>
              <ArrowUpRight
                className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </p>
            <p className="mt-1.5 text-xs leading-5 text-slate-600">
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

