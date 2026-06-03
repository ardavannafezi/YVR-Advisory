"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

interface Props {
  images: string[];
  alt: string;
  /** compact: card-size swiper. full: detail page hero. slider: in-body gallery section */
  variant?: "compact" | "full" | "slider";
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function EventGallery({
  images,
  alt,
  variant = "compact",
  autoPlay = true,
  autoPlayInterval = 3500,
}: Props) {
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const count = images.length;

  const go = useCallback(
    (idx: number) => setCurrent(((idx % count) + count) % count),
    [count],
  );

  // Auto-play
  useEffect(() => {
    if (!autoPlay || count <= 1) return;
    timerRef.current = setTimeout(() => go(current + 1), autoPlayInterval);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, autoPlay, autoPlayInterval, go, count]);

  // Touch / drag
  const touchStart = useRef<number | null>(null);
  function onTouchStart(e: React.TouchEvent) { touchStart.current = e.touches[0].clientX; }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStart.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 40) go(current + (dx < 0 ? 1 : -1));
    touchStart.current = null;
  }

  if (!count) return null;

  if (variant === "slider") {
    return <GallerySlider images={images} alt={alt} />;
  }

  if (count === 1) {
    return (
      <SingleImage src={images[0]} alt={alt} variant={variant} />
    );
  }

  const isCompact = variant === "compact";
  const aspectClass = isCompact ? "h-48" : "h-[70vh]";

  return (
    <div
      className={`relative w-full overflow-hidden select-none ${aspectClass} bg-white/5`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Slides — render adjacent for smooth transitions */}
      {images.map((src, i) => {
        const active = i === current;
        const shouldRender = Math.abs(i - current) <= 1 || i === 0;
        if (!shouldRender && !loaded[i]) return null;
        return (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-500 ${active ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          >
            {!loaded[i] && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                <CircleLoader />
              </div>
            )}
            <Image
              src={src}
              alt={`${alt} ${i + 1}`}
              fill
              className={`object-cover transition-transform duration-700 ${active ? "scale-100" : "scale-105"}`}
              sizes={isCompact ? "(max-width: 768px) 100vw, 33vw" : "100vw"}
              priority={i === 0}
              onLoad={() => setLoaded(prev => ({ ...prev, [i]: true }))}
            />
          </div>
        );
      })}

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => { if (timerRef.current) clearTimeout(timerRef.current); go(i); }}
            className={`rounded-full transition-all duration-300 ${
              i === current ? "w-4 h-1 bg-gold" : "w-1 h-1 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Image ${i + 1}`}
          />
        ))}
      </div>

      {/* Arrow buttons — full variant only */}
      {!isCompact && (
        <>
          <button
            onClick={() => { if (timerRef.current) clearTimeout(timerRef.current); go(current - 1); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center bg-black/40 border border-white/10 text-white hover:bg-black/60 transition-colors"
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            onClick={() => { if (timerRef.current) clearTimeout(timerRef.current); go(current + 1); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center bg-black/40 border border-white/10 text-white hover:bg-black/60 transition-colors"
            aria-label="Next"
          >
            ›
          </button>
          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 z-30 flex gap-1 p-2 bg-gradient-to-t from-black/60 to-transparent overflow-x-auto scrollbar-none">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => { if (timerRef.current) clearTimeout(timerRef.current); go(i); }}
                  className={`flex-shrink-0 w-14 h-10 overflow-hidden border transition-all duration-200 ${
                    i === current ? "border-gold" : "border-transparent opacity-50 hover:opacity-75"
                  }`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function GallerySlider({ images, alt }: { images: string[]; alt: string }) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const count = images.length;

  const go = useCallback((idx: number) => setCurrent(((idx % count) + count) % count), [count]);

  const touchStart = useRef<number | null>(null);
  function onTouchStart(e: React.TouchEvent) { touchStart.current = e.touches[0].clientX; }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStart.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 40) go(current + (dx < 0 ? 1 : -1));
    touchStart.current = null;
  }

  return (
    <>
      <div className="relative w-full overflow-hidden select-none bg-black/20" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {/* Main slide */}
        <div className="relative w-full h-[56vw] max-h-[520px] min-h-[220px]">
          {images.map((src, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-500 ${i === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
            >
              <Image
                src={src}
                alt={`${alt} ${i + 1}`}
                fill
                className="object-cover cursor-zoom-in"
                sizes="100vw"
                priority={i === 0}
                onClick={() => setLightbox(i)}
              />
            </div>
          ))}

          {/* Arrows */}
          {count > 1 && (
            <>
              <button
                onClick={() => go(current - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-black/50 border border-white/10 text-white text-xl hover:bg-black/70 transition-colors"
                aria-label="Previous"
              >‹</button>
              <button
                onClick={() => go(current + 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-black/50 border border-white/10 text-white text-xl hover:bg-black/70 transition-colors"
                aria-label="Next"
              >›</button>
            </>
          )}

          {/* Counter */}
          <div className="absolute bottom-3 right-3 z-20 text-[10px] uppercase tracking-widest text-white/60 bg-black/40 px-2 py-1">
            {current + 1} / {count}
          </div>
        </div>

        {/* Thumbnail strip */}
        {count > 1 && (
          <div className="flex gap-1.5 p-2 overflow-x-auto scrollbar-none bg-black/30">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className={`flex-shrink-0 w-16 h-12 overflow-hidden border-2 transition-all duration-200 ${
                  i === current ? "border-gold opacity-100" : "border-transparent opacity-40 hover:opacity-70"
                }`}
              >
                <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-4 right-5 text-white/60 hover:text-white text-3xl z-10" aria-label="Close">×</button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/50 border border-white/10 text-white text-2xl hover:bg-black/70"
            onClick={e => { e.stopPropagation(); setLightbox(((lightbox - 1 + count) % count)); }}
            aria-label="Previous"
          >‹</button>
          <div className="relative w-full max-w-4xl max-h-[85vh] mx-12" onClick={e => e.stopPropagation()}>
            <Image
              src={images[lightbox]}
              alt={`${alt} ${lightbox + 1}`}
              width={1200}
              height={800}
              className="object-contain w-full h-full max-h-[85vh]"
            />
          </div>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/50 border border-white/10 text-white text-2xl hover:bg-black/70"
            onClick={e => { e.stopPropagation(); setLightbox((lightbox + 1) % count); }}
            aria-label="Next"
          >›</button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs tracking-widest">
            {lightbox + 1} / {count}
          </div>
        </div>
      )}
    </>
  );
}

function SingleImage({ src, alt, variant }: { src: string; alt: string; variant: "compact" | "full" | "slider" }) {
  const [loaded, setLoaded] = useState(false);
  const aspectClass = variant === "compact" ? "h-48" : "h-[70vh]";
  return (
    <div className={`relative w-full overflow-hidden ${aspectClass} bg-white/5`}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <CircleLoader />
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes={variant === "compact" ? "(max-width: 768px) 100vw, 33vw" : "100vw"}
        priority
        onLoad={() => setLoaded(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
    </div>
  );
}

function CircleLoader() {
  return (
    <svg className="w-8 h-8 animate-spin text-gold/40" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}
