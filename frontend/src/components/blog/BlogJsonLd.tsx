import type { BlogPost } from "@/types";

export function BlogJsonLd({ post }: { post: BlogPost }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.summary,
    author: post.author ? { "@type": "Person", name: post.author } : undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    image: post.cover_image_url,
    publisher: { "@type": "Organization", name: "YVR Advisory", url: process.env.NEXT_PUBLIC_SITE_URL },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
