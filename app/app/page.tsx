import type { Metadata } from "next";
import { getProjects, getArticles, getBrandVoice } from "@/lib/db/content-service";
import { ContentWorkspace } from "@/components/workspace/ContentWorkspace";

export const metadata: Metadata = {
  title: "Content Workspace | Stak",
  description: "Create and edit research-grounded articles with brand context.",
  alternates: {
    canonical: "/app",
  },
};

export default async function AppPage() {
  const projects = await getProjects();
  const defaultProject = projects[0];
  const articles = defaultProject ? await getArticles(defaultProject.id) : [];
  const brandVoice = defaultProject ? await getBrandVoice(defaultProject.id) : null;

  return (
    <ContentWorkspace
      initialProjects={projects}
      initialArticles={articles}
      initialBrandVoice={brandVoice}
    />
  );
}
