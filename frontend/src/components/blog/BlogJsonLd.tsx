import type { BlogPost } from "@/types";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://yvradvisory.ca";

export function BlogJsonLd({ post }: { post: BlogPost }) {
  const url = `${SITE}/blog/${post.slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: post.title,
    description: post.summary,
    keywords: post.tags?.join(", "),
    about: { "@type": "Thing", name: "Vancouver Nightlife" },
    author: post.author
      ? { "@type": "Person", name: post.author }
      : { "@type": "Organization", name: "YVR Advisory", url: SITE },
    datePublished: post.published_at,
    dateModified: post.updated_at,
    image: post.cover_image_url,
    url,
    publisher: {
      "@type": "Organization",
      name: "YVR Advisory",
      url: SITE,
      logo: { "@type": "ImageObject", url: `${SITE}/white.png` },
    },
    inLanguage: "en-CA",
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
