"use client";

import { Check } from "lucide-react";
import { Photo } from "@/components/ui";
import { cn } from "@/lib/utils";
import { COVER_CHOICES } from "./build-event";
import { GALLERY_MAX } from "./validation";

interface CoverPickerProps {
  cover: string;
  gallery: string[];
  onChange: (patch: { coverImage?: string; gallery?: string[] }) => void;
  error?: string;
}

/** Cover first, then up to three more for the gallery — all from the same twelve photos. */
export function CoverPicker({ cover, gallery, onChange, error }: CoverPickerProps) {
  const pickCover = (src: string) => onChange({ coverImage: src, gallery: gallery.filter((g) => g !== src) });
  const toggleGallery = (src: string) => {
    if (gallery.includes(src)) onChange({ gallery: gallery.filter((g) => g !== src) });
    else if (gallery.length < GALLERY_MAX) onChange({ gallery: [...gallery, src] });
  };

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="text-sm font-medium text-fg">
          Cover photo <span className="text-danger-500">*</span>
        </legend>
        <p className="mt-0.5 text-[13px] text-fg-muted">The first thing guests see, on the card and at the top of the page.</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {COVER_CHOICES.map((c) => {
            const active = cover === c.src;
            return (
              <button
                key={c.src}
                type="button"
                aria-pressed={active}
                aria-label={`${c.label} as cover`}
                onClick={() => pickCover(c.src)}
                className={cn(
                  "group relative overflow-hidden rounded-lg transition-[box-shadow,transform] duration-150 focus-visible:outline-none focus-visible:shadow-focus",
                  active ? "ring-[3px] ring-amber-500 ring-offset-2 ring-offset-surface" : "hover:-translate-y-px hover:shadow-raised",
                )}
              >
                <Photo src={c.src} alt="" aspect="video" rounded={false} tint={!active} sizes="(max-width: 640px) 50vw, 200px" className="transition-transform duration-300 ease-out-soft group-hover:scale-[1.03]" />
                {active ? (
                  <span className="absolute right-2 top-2 inline-flex size-6 items-center justify-center rounded-full bg-amber-500 text-navy-900 shadow-card">
                    <Check className="size-3.5" strokeWidth={3} aria-hidden />
                  </span>
                ) : null}
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/70 to-transparent px-2 pb-1.5 pt-6 text-left text-[11px] font-medium text-white">{c.label}</span>
              </button>
            );
          })}
        </div>
        {error ? <p role="alert" className="mt-2 text-[13px] text-danger-600">{error}</p> : null}
      </fieldset>

      <fieldset>
        <legend className="flex w-full items-baseline justify-between text-sm font-medium text-fg">
          <span>Gallery</span>
          <span className="text-xs font-normal text-fg-subtle">Optional · {gallery.length}/{GALLERY_MAX}</span>
        </legend>
        <p className="mt-0.5 text-[13px] text-fg-muted">Up to three more, shown under the description. Tap to add or remove.</p>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {COVER_CHOICES.filter((c) => c.src !== cover).map((c) => {
            const on = gallery.includes(c.src);
            const full = !on && gallery.length >= GALLERY_MAX;
            return (
              <button
                key={c.src}
                type="button"
                aria-pressed={on}
                aria-label={`${c.label} in gallery`}
                disabled={full}
                onClick={() => toggleGallery(c.src)}
                className={cn(
                  "relative min-h-11 overflow-hidden rounded-md transition-[box-shadow,opacity] duration-150 focus-visible:outline-none focus-visible:shadow-focus",
                  on ? "ring-2 ring-navy-900 ring-offset-2 ring-offset-surface" : "hover:shadow-raised",
                  full && "opacity-40",
                )}
              >
                <Photo src={c.src} alt="" aspect="square" rounded={false} tint={!on} blur={false} sizes="120px" />
                {on ? (
                  <span className="absolute right-1 top-1 inline-flex size-5 items-center justify-center rounded-full bg-navy-900 text-white">
                    <Check className="size-3" strokeWidth={3} aria-hidden />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
