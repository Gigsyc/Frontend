"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Photo } from "@/components/ui/photo";

interface GalleryProps {
  title: string;
  images: string[];
}

/**
 * Three photos, then a lightbox. Deliberately not a carousel: a strip that opens one
 * large image with arrow keys is the whole job, and it costs no library.
 */
export function EventGallery({ title, images }: GalleryProps) {
  const shown = images.slice(0, 3);
  const [index, setIndex] = useState<number | null>(null);
  const open = index !== null;
  const count = shown.length;

  const step = (delta: number) => setIndex((i) => (i === null ? i : (i + delta + count) % count));

  // Arrow keys move between photos while the lightbox is open; Escape is Radix's job.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (delta === 0) return;
      e.preventDefault();
      setIndex((i) => (i === null ? i : (i + delta + count) % count));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, count]);

  if (count === 0) return null;

  return (
    <section aria-labelledby="gallery-heading" className="space-y-4">
      <h2 id="gallery-heading" className="text-lg font-semibold">Gallery</h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {shown.map((src, i) => (
          <li key={src} className={count === 3 && i === 2 ? "col-span-2 sm:col-span-1" : undefined}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Open photo ${i + 1} of ${count} from ${title}`}
              className="group block w-full overflow-hidden rounded-lg focus-visible:outline-none focus-visible:shadow-focus"
            >
              <Photo
                src={src}
                alt=""
                aspect="video"
                rounded={false}
                sizes="(max-width: 640px) 50vw, 260px"
                className="transition-transform duration-300 ease-out-soft group-hover:scale-[1.03]"
              />
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={open} onOpenChange={(next) => setIndex(next ? 0 : null)}>
        <DialogContent size="lg" className="gap-0 p-0 sm:max-w-3xl">
          <DialogHeader className="px-5 pb-3 pr-12 pt-5">
            <DialogTitle className="text-base">{title}</DialogTitle>
            <DialogDescription className="text-[13px] tabular">Photo {(index ?? 0) + 1} of {count}</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Photo
              src={shown[index ?? 0]}
              alt={`${title} — photo ${(index ?? 0) + 1}`}
              aspect="video"
              rounded={false}
              sizes="(max-width: 768px) 100vw, 768px"
            />
            {count > 1 ? (
              <>
                <GalleryArrow side="left" onClick={() => step(-1)} />
                <GalleryArrow side="right" onClick={() => step(1)} />
              </>
            ) : null}
          </div>
          <p className="px-5 py-3 text-xs text-fg-subtle">Use the arrow keys to move between photos.</p>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function GalleryArrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous photo" : "Next photo"}
      className={`absolute top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-navy-950/55 text-white backdrop-blur-sm transition-colors hover:bg-navy-950/75 ${side === "left" ? "left-3" : "right-3"}`}
    >
      <Icon className="size-5" aria-hidden />
    </button>
  );
}
