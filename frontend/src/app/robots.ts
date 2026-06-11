import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://yvradvisory.ca";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Standard search crawlers
      { userAgent: "*",                allow: "/", disallow: ["/admin/", "/api/"] },
      // Google (incl. AI Overviews / SGE)
      { userAgent: "Googlebot",        allow: "/" },
      { userAgent: "Google-Extended",  allow: "/" },
      // OpenAI / ChatGPT
      { userAgent: "GPTBot",           allow: ["/", "/llms.txt", "/llms-full.txt"] },
      { userAgent: "ChatGPT-User",     allow: ["/", "/llms.txt", "/llms-full.txt"] },
      // Anthropic Claude
      { userAgent: "ClaudeBot",        allow: ["/", "/llms.txt", "/llms-full.txt"] },
      // Perplexity
      { userAgent: "PerplexityBot",    allow: ["/", "/llms.txt", "/llms-full.txt"] },
      // Meta
      { userAgent: "FacebookBot",      allow: "/" },
      // Apple
      { userAgent: "Applebot",         allow: "/" },
      { userAgent: "Applebot-Extended",allow: "/" },
      // Common Crawl
      { userAgent: "CCBot",            allow: "/" },
      // Amazon
      { userAgent: "Amazonbot",        allow: "/" },
    ],
    sitemap: [
      `${SITE}/sitemap.xml`,
    ],
    host: SITE,
  };
}
