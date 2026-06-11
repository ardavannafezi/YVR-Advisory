import type { BlogPost } from "@/types";
import { ORGANIZATION, SITE_URL } from "@/lib/site";

export function BlogJsonLd({ post }: { post: BlogPost }) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const organizationId = `${SITE_URL}#organization`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: post.title,
    description: post.summary,
    keywords: post.tags?.join(", "),
    about: { "@type": "Thing", name: "Vancouver Nightlife" },
    author: post.author
      ? { "@type": "Person", name: post.author }
      : { "@id": organizationId },
    datePublished: post.published_at,
    dateModified: post.updated_at,
    image: post.cover_image_url,
    url,
    publisher: {
      "@id": organizationId,
      "@type": "Organization",
      name: ORGANIZATION.name,
      url: SITE_URL,
      email: ORGANIZATION.email,
      sameAs: [ORGANIZATION.instagramUrl],
      logo: { "@type": "ImageObject", url: `${SITE_URL}/white.png` },
    },
    inLanguage: "en-CA",
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
