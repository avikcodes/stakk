import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { buildPageMetadata } from "@/lib/metadata";
import { BLOG_POSTS } from "@/lib/blog";
import { SITE_CONFIG } from "@/lib/site";
import { PageShell } from "@/components/layout/PageShell";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PageCtaSection } from "@/components/ui/PageCtaSection";

export const metadata = buildPageMetadata({
  title: "Blog",
  description:
    "Articles and editorial guides from Stak on GEO, AI visibility, brand context (COMPANY.md and TONE.md), and multi-agent research workflows.",
  path: "/blog",
});

export default function BlogPage() {
  return (
    <PageShell breadcrumbs={[{ name: "Blog", url: `${SITE_CONFIG.url}/blog` }]}>
      <PageHero
        eyebrow="Blog"
        title="Editorial essays on AI search, GEO, and content systems."
        description="Articles on brand-aligned AI content, SEO/AEO/GEO structure, multi-agent research, and human-in-the-loop workflows."
        breadcrumbLabel="Blog"
        primaryCta={{ label: "Explore Resources", href: "/resources" }}
        secondaryCta={{ label: "Start with Stak", href: "/pricing" }}
      />

      <Section labelledBy="blog-index-heading" muted>
        <SectionHeader
          headingId="blog-index-heading"
          eyebrow="Published Articles"
          title="Latest from Stak Editorial"
          description="Each article includes author attribution, publication and updated dates, category metadata, internal links, and related reading."
        />

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          {BLOG_POSTS.map((post) => (
            <article
              key={post.slug}
              className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-xs"
            >
              <Link
                href={`/blog/${post.slug}`}
                className="block border-b border-stone-200/80 bg-[#f8f8f6]"
              >
                <Image
                  src={post.featuredImage.src}
                  alt={post.featuredImage.alt}
                  width={post.featuredImage.width}
                  height={post.featuredImage.height}
                  className="aspect-[1200/630] w-full object-cover"
                />
              </Link>

              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-slate-500">
                    <span className="rounded-full border border-stone-200 bg-[#fbfbfa] px-2.5 py-0.5 font-medium text-[#14181f]">
                      {post.category}
                    </span>
                    <span>{post.readingTime}</span>
                  </div>

                  <h3 className="mt-4 font-serif text-2xl font-normal tracking-tight text-[#14181f]">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-start gap-1.5 hover:underline decoration-stone-300 underline-offset-4"
                    >
                      <span>{post.title}</span>
                      <ArrowUpRight
                        className="mt-1.5 h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        aria-hidden="true"
                      />
                    </Link>
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {post.description}
                  </p>
                </div>

                <div className="mt-6 border-t border-stone-200/80 pt-4">
                  <p className="text-xs font-medium text-[#14181f]">
                    {post.author.name} ·{" "}
                    <span className="font-normal text-slate-500">
                      {post.author.role}
                    </span>
                  </p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-slate-500">
                    <span>
                      Published{" "}
                      <time dateTime={post.publishedAt}>{post.publishedAt}</time>
                    </span>
                    <span>
                      Updated{" "}
                      <time dateTime={post.updatedAt}>{post.updatedAt}</time>
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-6 text-sm">
          <Link
            href="/resources"
            className="font-medium text-[#14181f] underline decoration-stone-300 underline-offset-4 hover:decoration-[#14181f]"
          >
            Browse GEO &amp; AI Visibility guides on /resources
          </Link>
          <Link
            href="/features"
            className="font-medium text-[#14181f] underline decoration-stone-300 underline-offset-4 hover:decoration-[#14181f]"
          >
            Explore Stak Features
          </Link>
        </div>
      </Section>

      <PageCtaSection muted={false} />
    </PageShell>
  );
}
