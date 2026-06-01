"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  url: string;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export function EventVideo({ url }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const ytId = getYouTubeId(url);
  const isYoutube = !!ytId;

  return (
    <div ref={ref} className="relative w-full aspect-video bg-black overflow-hidden">
      {!visible ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white/5">
          <div className="w-1 h-1 rounded-full bg-gold/20" />
        </div>
      ) : isYoutube ? (
        playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
            title="Event video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        ) : (
          <YouTubePoster ytId={ytId} onPlay={() => setPlaying(true)} />
        )
      ) : (
        <video
          src={url}
          controls
          preload="metadata"
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
    </div>
  );
}

function YouTubePoster({ ytId, onPlay }: { ytId: string; onPlay: () => void }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const poster = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;

  return (
    <button
      onClick={onPlay}
      className="absolute inset-0 w-full h-full group flex items-center justify-center"
      aria-label="Play video"
    >
      {/* Poster image */}
      <img
        src={poster}
        alt="Video thumbnail"
        onLoad={() => setImgLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
      />
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />

      {/* Play button */}
      <div className="relative z-10 w-16 h-16 rounded-full border-2 border-gold/70 flex items-center justify-center bg-black/50 group-hover:border-gold group-hover:bg-black/60 transition-all duration-300 group-hover:scale-105">
        <svg className="w-6 h-6 text-gold ml-1" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </button>
  );
}
