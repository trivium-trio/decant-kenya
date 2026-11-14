"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

interface ScentVideoProps {
  videoUrl: string;
  poster?: string;
  productName: string;
}

export function ScentVideo({ videoUrl, poster, productName }: ScentVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const isYouTube =
    videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");

  if (isYouTube) {
    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) return null;

    return (
      <div className="mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Scent review
        </h2>
        <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-lg border border-border bg-card">
          {!playing ? (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="group relative flex h-full w-full items-center justify-center"
              aria-label={`Watch review of ${productName}`}
            >
              {poster ? (
                <Image
                  src={poster}
                  alt={`${productName} review thumbnail`}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <Image
                  src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                  alt={`${productName} review thumbnail`}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                  unoptimized
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition group-hover:bg-black/40">
                <div className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                  <Play className="size-6 translate-x-0.5" />
                </div>
              </div>
            </button>
          ) : (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
              title={`${productName} scent review`}
              allow="autoplay; encrypted-media"
              allowFullScreen
              loading="lazy"
              className="absolute inset-0 h-full w-full"
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Scent review
      </h2>
      <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-lg border border-border bg-card">
        {!playing ? (
          <button
            type="button"
            onClick={() => {
              setPlaying(true);
              videoRef.current?.play();
            }}
            className="group relative flex h-full w-full items-center justify-center"
            aria-label={`Watch review of ${productName}`}
          >
            {poster && (
              <Image
                src={poster}
                alt={`${productName} review thumbnail`}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition group-hover:bg-black/40">
              <div className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                <Play className="size-6 translate-x-0.5" />
              </div>
            </div>
          </button>
        ) : null}
        <video
          ref={videoRef}
          src={videoUrl}
          poster={poster}
          muted
          playsInline
          controls={playing}
          preload="none"
          className={`h-full w-full object-cover ${playing ? "" : "hidden"}`}
          aria-label={`${productName} scent review video`}
        />
      </div>
    </div>
  );
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}
