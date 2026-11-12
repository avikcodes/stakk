import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ChevronRight } from "lucide-react";
import { buildPageMetadata } from "@/lib/metadata";
import { RESOURCE_GUIDES, getResourceBySlug } from "@/lib/resources";
import { SITE_CONFIG } from "@/lib/site";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PageCtaSection } from "@/components/ui/PageCtaSection";

interface ResourcePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return RESOURCE_GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: ResourcePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getResourceBySlug(slug);
  if (!guide) return {};

  return buildPageMetadata({
    title: guide.title,
    description: guide.description,
    path: `/resources/${guide.slug}`,
  });
}

export default async function ResourceGuidePage({ params }: ResourcePageProps) {
  const { slug } = await params;
  const guide = getResourceBySlug(slug);

  if (!guide) {
    notFound();
  }

  const otherGuides = RESOURCE_GUIDES.filter((item) => item.slug !== guide.slug).slice(
    0,
    3
  );

  return (
    <PageShell
      breadcrumbs={[
        { name: "Resources", url: `${SITE_CONFIG.url}/resources` },
        {
          name: guide.title,
          url: `${SITE_CONFIG.url}/resources/${guide.slug}`,
        },
      ]}
    >
      <section
        aria-labelledby="resource-title"
        className="cloud-atmosphere border-b border-stone-200/80 pt-12 pb-14 sm:pt-16 sm:pb-18"
      >
        <Container>
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-slate-500"
          >
            <Link href="/" className="font-mono hover:text-[#14181f]">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <Link href="/resources" className="font-mono hover:text-[#14181f]">
              Resources
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <span className="font-mono text-[#14181f]">{guide.category}</span>
          </nav>

          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-slate-600">
              <span className="rounded-full border border-stone-200 bg-white px-3 py-0.5 font-medium text-[#14181f]">
                {guide.category}
              </span>
              <span>{guide.readingTime}</span>
              <span>Updated {guide.updatedAt}</span>
            </div>

            <h1
              id="resource-title"
              className="mt-5 font-serif text-4xl font-normal tracking-[-0.025em] text-balance text-[#14181f] sm:text-5xl sm:leading-[1.08]"
            >
              {guide.title}
            </h1>

            <p className="mt-5 text-base leading-7 text-pretty text-slate-600 sm:text-lg sm:leading-8">
              {guide.description}
            </p>
          </div>
        </Container>
      </section>

      <Section labelledBy="resource-content-heading" muted>
        <div className="grid gap-10 lg:grid-cols-12">
          <article
            id="resource-content-heading"
            className="space-y-8 rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-10 lg:col-span-8"
          >
            {guide.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-serif text-2xl font-normal tracking-tight text-[#14181f]">
                  {section.heading}
                </h2>
                <p className="mt-3 text-base leading-7 text-slate-600">
                  {section.body}
                </p>
                {section.bullets ? (
                  <ul className="mt-4 space-y-2.5">
                    {section.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-start gap-2.5 text-sm leading-6 text-slate-700"
                      >
                        <Check
                          className="mt-1 h-4 w-4 shrink-0 text-[#14181f]"
                          aria-hidden="true"
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </article>

          <aside className="space-y-6 lg:col-span-4">
            <div className="rounded-2xl border border-stone-200/90 bg-white p-6">
              <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-500">
                Internal Links
              </h2>
              <ul className="mt-4 space-y-2.5">
                {guide.internalLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-[#14181f] underline decoration-stone-300 underline-offset-4 hover:decoration-[#14181f]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-stone-200/90 bg-white p-6">
              <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-500">
                More Guides
              </h2>
              <ul className="mt-4 space-y-3">
                {otherGuides.map((other) => (
                  <li key={other.slug}>
                    <Link
                      href={`/resources/${other.slug}`}
                      className="block rounded-lg border border-stone-200/75 bg-[#fbfbfa] p-3 text-sm font-medium text-[#14181f] transition-colors hover:border-stone-300 hover:bg-white"
                    >
                      <span className="block font-mono text-[11px] text-slate-500">
                        {other.category}
                      </span>
                      <span className="mt-0.5 block">{other.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </Section>

      <PageCtaSection muted={false} />
    </PageShell>
  );
}
