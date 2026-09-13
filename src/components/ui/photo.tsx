import Image, { type ImageProps } from "next/image";
import { PHOTO_BLUR } from "@/data/images";
import { cn } from "@/lib/utils";

interface PhotoProps extends Omit<ImageProps, "alt" | "placeholder"> {
  alt: string;
  /** Subtle navy tint keeps disparate photos feeling like one set. */
  tint?: boolean;
  aspect?: "video" | "wide" | "square" | "portrait" | "auto";
  rounded?: boolean;
  /** Set false to skip the blur-up (e.g. a thumbnail that is already tiny). */
  blur?: boolean;
}

const ASPECT = {
  video: "aspect-video",
  wide: "aspect-[21/9]",
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  auto: "",
};

/**
 * Consistent photo treatment across the product: fixed crop, shared tint, blur-up on load.
 * Always pass a meaningful alt, or "" when the photo sits beside a title that already names it.
 */
export function Photo({
  className,
  tint = true,
  aspect = "video",
  rounded = true,
  blur = true,
  alt,
  src,
  sizes = "(max-width: 768px) 100vw, 50vw",
  ...props
}: PhotoProps) {
  const blurDataURL = blur && typeof src === "string" ? PHOTO_BLUR[src] : undefined;
  return (
    <div className={cn("relative overflow-hidden bg-ink-100", ASPECT[aspect], rounded && "rounded-lg", className)}>
      <Image
        alt={alt}
        src={src}
        fill
        sizes={sizes}
        className="object-cover"
        {...(blurDataURL ? { placeholder: "blur" as const, blurDataURL } : {})}
        {...props}
      />
      {tint ? <div className="pointer-events-none absolute inset-0 bg-navy-900/10 mix-blend-multiply" aria-hidden /> : null}
    </div>
  );
}
