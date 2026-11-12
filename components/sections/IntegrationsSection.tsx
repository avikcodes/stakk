import Link from "next/link";
import { FileText, Globe, Layers, Sparkles } from "lucide-react";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export function IntegrationsSection() {
  const integrations = [
    {
      name: "Markdown & HTML Export",
      description: "Clean, portable markdown with frontmatter and rich HTML. Available now.",
      status: "Available",
      statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200/60",
      icon: FileText,
    },
    {
      name: "GitHub",
      description: "Commit markdown directly to repository content branches.",
      status: "Planned",
      statusColor: "text-stone-600 bg-stone-100 border-stone-200",
      icon: GithubIcon,
    },
    {
      name: "WordPress",
      description: "REST API drafts, custom post types, and taxonomy mapping.",
      status: "Planned",
      statusColor: "text-stone-600 bg-stone-100 border-stone-200",
      icon: Globe,
    },
    {
      name: "Webflow",
      description: "Push structured CMS drafts directly into Webflow collections.",
      status: "Planned",
      statusColor: "text-stone-600 bg-stone-100 border-stone-200",
      icon: Layers,
    },
    {
      name: "Ghost",
      description: "Admin API drafts and updates converted to Lexical format.",
      status: "Planned",
      statusColor: "text-stone-600 bg-stone-100 border-stone-200",
      icon: Globe,
    },
    {
      name: "Contentful",
      description: "Direct content synchronization for enterprise headless CMS setups.",
      status: "Planned",
      statusColor: "text-stone-600 bg-stone-100 border-stone-200",
      icon: Layers,
    },
    {
      name: "Sanity",
      description: "GROQ-friendly portable text mapping into your Sanity datasets.",
      status: "Planned",
      statusColor: "text-stone-600 bg-stone-100 border-stone-200",
      icon: Layers,
    },
    {
      name: "Strapi v5",
      description: "Collection field mapping and one-click draft synchronization.",
      status: "Planned",
      statusColor: "text-stone-600 bg-stone-100 border-stone-200",
      icon: Layers,
    },
  ];

  return (
    <div className="flex flex-col">
      <div className="-mx-6 h-px bg-stone-200/80" />
      <section
        aria-labelledby="landing-integrations-heading"
        className="py-14 sm:py-18"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-stone-500 font-medium">
          Integrations
        </p>
        <h2
          id="landing-integrations-heading"
          className="mt-3 font-serif text-3xl sm:text-4xl font-normal leading-[1.15] tracking-[-0.015em] text-[#14181f]"
        >
          Publish where your content already lives.
        </h2>
        <p className="mt-4 max-w-[560px] text-[14px] sm:text-[15px] leading-[1.7] text-stone-600 font-light">
          Stak outputs production-ready markdown today, while native CMS publishing connectors are being rolled out according to our roadmap.
        </p>

        {/* 2-column integration grid matching Gehirn */}
        <ul className="mt-10 overflow-hidden rounded-2xl border border-stone-200/90 bg-white/95 sm:grid sm:grid-cols-2 shadow-2xs">
          {integrations.map((item, idx) => {
            const Icon = item.icon;
            return (
              <li
                key={item.name}
                className="flex gap-4 border-b border-stone-200/70 p-5 last:border-b-0 sm:odd:border-r sm:[&:nth-last-child(-n+2)]:border-b-0 hover:bg-stone-50/50 transition-colors"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-700 border border-stone-200/60">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[14px] font-medium text-[#14181f]">
                      {item.name}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-medium border ${item.statusColor}`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] leading-[1.55] text-stone-600 font-light">
                    {item.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 text-right">
          <Link
            href="/integrations"
            className="text-xs font-mono text-stone-600 underline underline-offset-4 hover:text-[#14181f] transition-colors"
          >
            View all integration details →
          </Link>
        </div>
      </section>
    </div>
  );
}
