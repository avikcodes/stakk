import {
  Blocks,
  Code2,
  Database,
  FileCode2,
  GitBranch,
  Webhook,
} from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

const INTEGRATION_SLOTS = [
  {
    icon: Blocks,
    name: "Headless CMS",
    category: "Publishing",
    description:
      "Planned connectors to sync reviewed drafts and structured metadata directly to CMS collections.",
    status: "Planned",
  },
  {
    icon: GitBranch,
    name: "Git & Markdown Repos",
    category: "Developer Docs",
    description:
      "Future pull-request and Markdown export workflows for technical blogs and documentation sites.",
    status: "Planned",
  },
  {
    icon: Webhook,
    name: "Webhooks",
    category: "Automation",
    description:
      "Event notifications when research briefs finish or drafts pass editorial review.",
    status: "Planned",
  },
  {
    icon: Code2,
    name: "REST API",
    category: "Custom Pipelines",
    description:
      "Programmatic access for teams connecting Stak workflows into internal publishing tools.",
    status: "Planned",
  },
  {
    icon: Database,
    name: "Search & Analytics Feeds",
    category: "Measurement",
    description:
      "Future integration slots to connect search console and performance signals back into research.",
    status: "Planned",
  },
  {
    icon: FileCode2,
    name: "Clean HTML & Markdown Export",
    category: "Portable Output",
    description:
      "Copy or export structured HTML and Markdown so content works with any publishing stack.",
    status: "Core Output",
  },
] as const;

export function IntegrationsSection() {
  return (
    <Section id="integrations" labelledBy="integrations-heading">
      <SectionHeader
        headingId="integrations-heading"
        eyebrow="06 · Publishing & Integrations"
        title="Designed to fit into your publishing stack"
        description="Export clean structured content today, with modular integration slots planned for CMS platforms, Git repositories, webhooks, and custom publishing pipelines."
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {INTEGRATION_SLOTS.map((slot) => {
          const Icon = slot.icon;
          return (
            <article
              key={slot.name}
              className="flex flex-col justify-between rounded-xl border border-stone-200/90 bg-white p-6"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-[#fbfbfa] text-[#14181f]">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="rounded-full border border-stone-200 bg-[#fbfbfa] px-2.5 py-0.5 font-mono text-[11px] text-slate-600">
                    {slot.status}
                  </span>
                </div>

                <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-slate-500">
                  {slot.category}
                </p>
                <h3 className="mt-1 text-base font-semibold text-[#14181f]">
                  {slot.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {slot.description}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </Section>
  );
}

