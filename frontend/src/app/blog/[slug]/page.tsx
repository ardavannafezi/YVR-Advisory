import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { BlogJsonLd } from "@/components/blog/BlogJsonLd";
import type { BlogPost } from "@/types";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const post = await api.get<BlogPost>(`/api/blog/${params.slug}`);
    return {
      title: post.title,
      description: post.summary || post.title,
      alternates: { canonical: `/blog/${post.slug}` },
      openGraph: {
        title: post.title,
        description: post.summary || "",
        images: post.cover_image_url ? [{ url: post.cover_image_url }] : [],
        url: `/blog/${post.slug}`,
        type: "article",
      },
    };
  } catch {
    return { title: "Article Not Found" };
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  let post: BlogPost;
  try {
    post = await api.get<BlogPost>(`/api/blog/${params.slug}`);
  } catch {
    notFound();
  }

  return (
    <>
      <BlogJsonLd post={post} />
      <article className="pt-28 pb-24">
        {post.cover_image_url && (
          <div className="relative h-[50vh] mb-12">
            <Image src={post.cover_image_url} alt={post.title} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          </div>
        )}
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex gap-2 flex-wrap mb-4">
            {post.music_type && <Badge label={post.music_type} variant="gold" />}
            {post.tags.map((t) => <Badge key={t} label={t} />)}
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-text-primary mb-4 leading-tight">{post.title}</h1>
          <p className="text-text-dim text-xs uppercase tracking-widest mb-10">
            {post.author && `By ${post.author} · `}
            {post.published_at && format(new Date(post.published_at), "MMMM d, yyyy")}
          </p>
          <div
            className="prose prose-invert prose-gold max-w-none prose-headings:font-serif prose-headings:text-text-primary prose-p:text-text-muted prose-p:leading-relaxed prose-a:text-gold"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />
        </div>
      </article>
    </>
  );
}
