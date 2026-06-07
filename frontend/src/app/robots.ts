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
      { userAgent: "GPTBot",           allow: "/" },
      { userAgent: "ChatGPT-User",     allow: "/" },
      // Anthropic Claude
      { userAgent: "ClaudeBot",        allow: "/" },
      // Perplexity
      { userAgent: "PerplexityBot",    allow: "/" },
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
