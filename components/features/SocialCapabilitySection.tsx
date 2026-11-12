import { Link2, MessageCircle, Search, Workflow } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

const SOCIAL_CAPABILITIES = [
  {
    icon: Workflow,
    title: "Reddit workflows",
    description:
      "Structured end-to-end discovery, context-matching, and human review flows for community engagement on Reddit.",
  },
  {
    icon: Search,
    title: "Reddit research",
    description:
      "Identify active subreddit discussions, recurring user pain points, and category comparison threads worth addressing.",
  },
  {
    icon: MessageCircle,
    title: "Reddit comments",
    description:
      "Prepare helpful, transparent draft replies shaped by TONE.md and COMPANY.md for human review before posting.",
  },
  {
    icon: Link2,
    title: "Backlink workflows",
    description:
      "Track community mentions, resource lists, and editorial citation opportunities inside your ongoing search workflow.",
  },
] as const;

const SOCIAL_QUEUE = [
  {
    workflow: "Reddit research",
    item: "Active category & alternative evaluation thread",
    context: "Matched against COMPANY.md use cases",
    gate: "Queued for reply",
  },
  {
    workflow: "Reddit comments",
    item: "Technical explanation draft (non-promotional tone)",
    context: "TONE.md voice rules applied",
    gate: "Human Review",
  },
  {
    workflow: "Backlink workflows",
    item: "Resource directory & comparison citation target",
    context: "Linked to /features and /compare pages",
    gate: "Tracked",
  },
] as const;

export function SocialCapabilitySection() {
  return (
    <Section id="social" labelledBy="features-social-heading">
      <SectionHeader
        headingId="features-social-heading"
        eyebrow="04 · Social"
        title="Reddit workflows, Reddit comments, and backlink workflows"
        description="Community discussions and external citations shape how both people and AI search engines discover software. Stak keeps Reddit and backlink workflows organized under human review."
      />

      <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:items-start">
        {/* Product UI Mockup */}
        <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xs lg:col-span-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 bg-[#f8f8f6] px-5 py-3.5">
            <div>
              <h3 className="text-sm font-semibold text-[#14181f]">
                Reddit &amp; Backlink Workflow Queue
              </h3>
              <p className="font-mono text-[11px] text-slate-500">
                Illustrative social &amp; community review queue
              </p>
            </div>
            <span className="rounded-full border border-stone-200 bg-white px-2.5 py-0.5 font-mono text-[11px] text-slate-600">
              Human Review
            </span>
          </div>

          <div className="divide-y divide-stone-200/80">
            {SOCIAL_QUEUE.map((row) => (
              <div key={row.workflow} className="px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-mono text-xs font-semibold text-[#14181f]">
                    {row.workflow}
                  </p>
                  <span className="rounded border border-stone-200 bg-[#fbfbfa] px-2 py-0.5 font-mono text-[11px] text-slate-600">
                    {row.gate}
                  </span>
                </div>
                <p className="mt-1.5 text-sm font-medium text-[#14181f]">
                  {row.item}
                </p>
                <p className="mt-0.5 text-xs text-slate-600">{row.context}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Four social capabilities */}
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-6">
          {SOCIAL_CAPABILITIES.map((item) => {
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
      </div>
    </Section>
  );
}
