"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fadeUp } from "@/styles/animations";
import { Badge } from "@/components/ui/Badge";
import type { BlogPost } from "@/types";

export function BlogCard({ post, index = 0 }: { post: BlogPost; index?: number }) {
  return (
    <motion.div variants={fadeUp} custom={index} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
      <Link href={`/blog/${post.slug}`} className="group block card-surface overflow-hidden hover:border-gold/40 transition-colors duration-300">
        <div className="relative h-48 overflow-hidden bg-white/5">
          {post.cover_image_url ? (
            <Image src={post.cover_image_url} alt={post.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent" />
          )}
        </div>
        <div className="p-5">
          <div className="flex gap-2 flex-wrap mb-2">
            {post.music_type && <Badge label={post.music_type} variant="gold" />}
            {post.tags.slice(0, 2).map((t) => <Badge key={t} label={t} />)}
          </div>
          <h3 className="font-serif text-xl text-text-primary group-hover:text-gold transition-colors line-clamp-2">{post.title}</h3>
          {post.summary && <p className="mt-2 text-text-muted text-sm line-clamp-2 leading-relaxed">{post.summary}</p>}
          {post.published_at && (
            <p className="mt-3 text-text-dim text-[10px] uppercase tracking-widest">{format(new Date(post.published_at), "MMM d, yyyy")}</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
