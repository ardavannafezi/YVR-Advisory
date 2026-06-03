import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://yvradvisory.ca";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Standard crawlers
      { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] },
      // Google AI (SGE, Bard context)
      { userAgent: "Google-Extended", allow: "/" },
      // OpenAI / ChatGPT
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      // Anthropic Claude
      { userAgent: "ClaudeBot", allow: "/" },
      // Perplexity
      { userAgent: "PerplexityBot", allow: "/" },
      // Meta / Llama
      { userAgent: "FacebookBot", allow: "/" },
      // Apple
      { userAgent: "Applebot-Extended", allow: "/" },
      // Common Crawl (training data)
      { userAgent: "CCBot", allow: "/" },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
