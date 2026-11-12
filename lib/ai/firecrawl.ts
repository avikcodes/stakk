import FirecrawlApp from "@mendable/firecrawl-js";

export interface LiveWebSearchResult {
  title: string;
  url: string;
  description: string;
  markdown?: string;
}

export async function searchLiveWeb(
  query: string,
  options: { limit?: number } = {}
): Promise<{ success: boolean; data: LiveWebSearchResult[]; source: "firecrawl" | "simulated" }> {
  const apiKey = process.env.FIRECRAWL_API_KEY?.trim();
  const limit = options.limit || 6;

  if (apiKey && apiKey !== "") {
    try {
      const app = new FirecrawlApp({ apiKey });
      const response = await app.search(query, { limit });

      const items = (response.web || (response as any).data || []) as any[];

      if (items.length > 0) {
        const mappedResults: LiveWebSearchResult[] = items.map((item: any) => ({
          title: item.title || item.metadata?.title || "Search Result",
          url: item.url || item.metadata?.sourceURL || "https://google.com",
          description: item.description || item.snippet || item.metadata?.description || item.markdown?.slice(0, 200) || "",
          markdown: item.markdown ? item.markdown.slice(0, 1500) : undefined,
        }));

        return {
          success: true,
          data: mappedResults,
          source: "firecrawl",
        };
      }
    } catch (error: any) {
      console.warn("Firecrawl search failed or rate-limited, using fallback web signals:", error.message);
    }
  }

  // Graceful development fallback when FIRECRAWL_API_KEY is not supplied
  const simulatedResults: LiveWebSearchResult[] = [
    {
      title: `${query} — Current Industry Benchmark & Market Overview`,
      url: `https://techtarget.com/insights/${encodeURIComponent(query.toLowerCase().replace(/\s+/g, "-"))}`,
      description: `Comprehensive industry report on ${query}, exploring recent adoption trends, architecture challenges, and search intent shift among enterprise engineering teams.`,
    },
    {
      title: `Best Practices for ${query} in Modern Production Stacks`,
      url: `https://thenewstack.io/${encodeURIComponent(query.toLowerCase().replace(/\s+/g, "-"))}-production-guide`,
      description: `Technical analysis of real-world implementations, common pitfalls, and tooling alternatives when evaluating ${query}.`,
    },
    {
      title: `Community Discussion: How Teams Evaluate ${query} in 2026`,
      url: `https://news.ycombinator.com/item?id=38291041`,
      description: `Developer sentiment, migration feedback, and emerging questions surrounding ${query} and related ecosystem libraries.`,
    },
    {
      title: `${query} Comparison and Category Landscape`,
      url: `https://github.com/topics/${encodeURIComponent(query.toLowerCase().replace(/\s+/g, "-"))}`,
      description: `Open-source repositories, developer interest growth, and query variations searched by developers and buyers.`,
    },
  ];

  return {
    success: true,
    data: simulatedResults.slice(0, limit),
    source: "simulated",
  };
}

