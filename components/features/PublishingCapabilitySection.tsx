import Link from "next/link";
import { Blocks, Check, FileCode2, GitBranch, Workflow } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

const PUBLISHING_PILLARS = [
  {
    icon: FileCode2,
    title: "Content export",
    description:
      "Clean, structured Markdown and semantic HTML exports ready immediately after human review.",
  },
  {
    icon: Workflow,
    title: "Publishing workflows",
    description:
      "Track each project from Review to Publish with metadata, canonical URLs, and heading hierarchy preserved.",
  },
  {
    icon: Blocks,
    title: "CMS publishing",
    description:
      "Structured handoff built to integrate with headless and traditional CMS platforms on the connector roadmap.",
  },
  {
    icon: GitBranch,
    title: "Supported integrations & roadmap",
    description:
      "Portable exports work with any stack today, alongside planned native connectors for GitHub and major CMS systems.",
  },
] as const;

const INTEGRATIONS_LIST = [
  { name: "Markdown & HTML Export", status: "Core Export" },
  { name: "GitHub publishing", status: "Planned connector" },
  { name: "WordPress", status: "Planned connector" },
  { name: "Strapi", status: "Planned connector" },
  { name: "Sanity", status: "Planned connector" },
  { name: "Contentful", status: "Planned connector" },
  { name: "Webflow", status: "Planned connector" },
  { name: "Ghost", status: "Planned connector" },
  { name: "Contao", status: "Planned connector" },
] as const;

export function PublishingCapabilitySection() {
  return (
    <Section id="publishing" labelledBy="features-publishing-heading">
      <SectionHeader
        headingId="features-publishing-heading"
        eyebrow="06 · Publishing"
        title="Content export, CMS publishing, and publishing workflows"
        description="Once human review is complete, move approved content cleanly into your publishing stack via structured exports and planned CMS or GitHub connectors."
      />

      <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:items-start">
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-6">
          {PUBLISHING_PILLARS.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="rounded-xl border border-stone-200/90 bg-white p-5"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 bg-[#fbfbfa] text-[#14181f]">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <h3 className="mt-3.5 text-sm font-semibold text-[#14181f]">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-600">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>

        {/* Product UI Mockup: Publishing & Integration Status */}
        <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xs lg:col-span-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 bg-[#f8f8f6] px-5 py-3.5">
            <div>
              <h3 className="text-sm font-semibold text-[#14181f]">
                Publishing Destinations &amp; Integrations
              </h3>
              <p className="font-mono text-[11px] text-slate-500">
                Export workflows and target CMS connectors
              </p>
            </div>
            <Link
              href="/integrations"
              className="font-mono text-xs font-medium text-[#14181f] underline decoration-stone-300 underline-offset-4 hover:decoration-[#14181f]"
            >
              View /integrations
            </Link>
          </div>

          <ul className="divide-y divide-stone-200/75">
            {INTEGRATIONS_LIST.map((item) => (
              <li
                key={item.name}
                className="flex items-center justify-between gap-4 px-5 py-3 text-sm"
              >
                <span className="flex items-center gap-2.5 font-medium text-[#14181f]">
                  <Check
                    className="h-3.5 w-3.5 shrink-0 text-[#14181f]"
                    aria-hidden="true"
                  />
                  <span>{item.name}</span>
                </span>
                <span className="rounded-md border border-stone-200 bg-[#fbfbfa] px-2.5 py-0.5 font-mono text-[11px] text-slate-600">
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-6 text-sm">
        <Link
          href="/integrations"
          className="font-medium text-[#14181f] underline decoration-stone-300 underline-offset-4 hover:decoration-[#14181f]"
        >
          Explore full Integrations overview
        </Link>
        <Link
          href="/use-cases"
          className="font-medium text-[#14181f] underline decoration-stone-300 underline-offset-4 hover:decoration-[#14181f]"
        >
          See team Use Cases
        </Link>
        <Link
          href="/pricing"
          className="font-medium text-[#14181f] underline decoration-stone-300 underline-offset-4 hover:decoration-[#14181f]"
        >
          Review $129/month Pricing
        </Link>
      </div>
    </Section>
  );
}
