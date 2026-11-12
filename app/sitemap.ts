import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blog";
import { RESOURCE_GUIDES } from "@/lib/resources";
import { SITE_CONFIG } from "@/lib/site";

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: "weekly" | "monthly";
  priority: number;
}> = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/features", changeFrequency: "weekly", priority: 0.9 },
  { path: "/pricing", changeFrequency: "weekly", priority: 0.9 },
  { path: "/use-cases", changeFrequency: "weekly", priority: 0.8 },
  { path: "/integrations", changeFrequency: "weekly", priority: 0.8 },
  { path: "/alternatives", changeFrequency: "weekly", priority: 0.8 },
  { path: "/alternatives/gehirn", changeFrequency: "weekly", priority: 0.9 },
  { path: "/compare", changeFrequency: "weekly", priority: 0.8 },
  { path: "/compare/stak-vs-gehirn", changeFrequency: "weekly", priority: 0.9 },
  { path: "/resources", changeFrequency: "weekly", priority: 0.8 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/security", changeFrequency: "monthly", priority: 0.5 },
  { path: "/privacy", changeFrequency: "monthly", priority: 0.5 },
  { path: "/terms", changeFrequency: "monthly", priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const defaultLastModified = new Date("2026-11-11T00:00:00.000Z");

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_CONFIG.url}${route.path}`,
    lastModified: defaultLastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const resourceEntries: MetadataRoute.Sitemap = RESOURCE_GUIDES.map(
    (guide) => ({
      url: `${SITE_CONFIG.url}/resources/${guide.slug}`,
      lastModified: new Date(`${guide.updatedAt}T00:00:00.000Z`),
      changeFrequency: "monthly",
      priority: 0.7,
    })
  );

  const blogEntries: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${SITE_CONFIG.url}/blog/${post.slug}`,
    lastModified: new Date(`${post.updatedAt}T00:00:00.000Z`),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...resourceEntries, ...blogEntries];
}
