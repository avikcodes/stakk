import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ChevronRight } from "lucide-react";
import {
  BLOG_POSTS,
  getBlogPostBySlug,
  getRelatedBlogPosts,
} from "@/lib/blog";
import { SITE_CONFIG } from "@/lib/site";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PageCtaSection } from "@/components/ui/PageCtaSection";
import { JsonLd } from "@/components/seo/JsonLd";

interface BlogArticlePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return {};

  const canonicalPath = `/blog/${post.slug}`;
  const fullUrl = `${SITE_CONFIG.url}${canonicalPath}`;

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: "article",
      url: fullUrl,
      siteName: SITE_CONFIG.name,
      title: `${post.title} | ${SITE_CONFIG.name}`,
      description: post.description,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      images: [
        {
          url: `${SITE_CONFIG.url}${post.featuredImage.src}`,
          width: post.featuredImage.width,
          height: post.featuredImage.height,
          alt: post.featuredImage.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | ${SITE_CONFIG.name}`,
      description: post.description,
      images: [`${SITE_CONFIG.url}${post.featuredImage.src}`],
    },
  };
}

export default async function BlogArticlePage({
  params,
}: BlogArticlePageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedBlogPosts(post);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: `${SITE_CONFIG.url}${post.featuredImage.src}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Organization",
      name: post.author.name,
      url: SITE_CONFIG.url,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
    mainEntityOfPage: `${SITE_CONFIG.url}/blog/${post.slug}`,
  };

  return (
    <PageShell
      breadcrumbs={[
        { name: "Blog", url: `${SITE_CONFIG.url}/blog` },
        { name: post.title, url: `${SITE_CONFIG.url}/blog/${post.slug}` },
      ]}
    >
      <JsonLd data={articleJsonLd} />

      <section
        aria-labelledby="article-title"
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
            <Link href="/blog" className="font-mono hover:text-[#14181f]">
              Blog
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <span className="font-mono text-[#14181f]">{post.category}</span>
          </nav>

          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-slate-600">
              <span className="rounded-full border border-stone-200 bg-white px-3 py-0.5 font-medium text-[#14181f]">
                {post.category}
              </span>
              <span>{post.readingTime}</span>
              <span>
                Published{" "}
                <time dateTime={post.publishedAt}>{post.publishedAt}</time>
              </span>
              <span>
                Updated <time dateTime={post.updatedAt}>{post.updatedAt}</time>
              </span>
            </div>

            <h1
              id="article-title"
              className="mt-5 font-serif text-4xl font-normal tracking-[-0.025em] text-balance text-[#14181f] sm:text-5xl sm:leading-[1.08]"
            >
              {post.title}
            </h1>

            <p className="mt-5 text-base leading-7 text-pretty text-slate-600 sm:text-lg sm:leading-8">
              {post.description}
            </p>
          </div>

          {/* Featured Image */}
          <div className="mt-10 overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xs">
            <Image
              src={post.featuredImage.src}
              alt={post.featuredImage.alt}
              width={post.featuredImage.width}
              height={post.featuredImage.height}
              priority
              className="aspect-[1200/630] w-full object-cover"
            />
          </div>
        </Container>
      </section>

      <Section labelledBy="article-body-heading" muted>
        <div className="grid gap-10 lg:grid-cols-12">
          <article
            id="article-body-heading"
            className="space-y-8 rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-10 lg:col-span-8"
          >
            {post.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-serif text-2xl font-normal tracking-tight text-[#14181f]">
                  {section.heading}
                </h2>
                <div className="mt-3 space-y-4">
                  {section.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-base leading-7 text-slate-600"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
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

            {/* Article-specific CTA */}
            <div className="rounded-xl border border-stone-200/80 bg-[#f8f8f6] p-6">
              <h2 className="text-base font-semibold text-[#14181f]">
                {post.cta.title}
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-slate-600">
                {post.cta.description}
              </p>
              <Link
                href={post.cta.href}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#14181f] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#232933]"
              >
                <span>{post.cta.label}</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>

          {/* Author Bio, Internal Links & Related Articles */}
          <aside className="space-y-6 lg:col-span-4">
            <div className="rounded-2xl border border-stone-200/90 bg-white p-6">
              <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-500">
                Author
              </h2>
              <p className="mt-3 text-base font-semibold text-[#14181f]">
                {post.author.name}
              </p>
              <p className="font-mono text-xs text-slate-500">
                {post.author.role}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {post.author.bio}
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200/90 bg-white p-6">
              <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-500">
                Internal Links
              </h2>
              <ul className="mt-4 space-y-2.5">
                {post.internalLinks.map((link) => (
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
                Related Articles
              </h2>
              <ul className="mt-4 space-y-3">
                {relatedPosts.map((related) => (
                  <li key={related.slug}>
                    <Link
                      href={`/blog/${related.slug}`}
                      className="block rounded-lg border border-stone-200/80 bg-[#fbfbfa] p-3.5 transition-colors hover:border-stone-300 hover:bg-white"
                    >
                      <span className="block font-mono text-[11px] text-slate-500">
                        {related.category} · {related.readingTime}
                      </span>
                      <span className="mt-1 block text-sm font-semibold text-[#14181f]">
                        {related.title}
                      </span>
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

