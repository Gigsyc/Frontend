import { Photo } from "@/components/ui/photo";
import { cn } from "@/lib/utils";

/**
 * 40px square cover, the only photography the admin console allows. Decorative: the event
 * title always sits beside it, so the alt stays empty.
 */
export function EventThumb({ src, className }: { src: string; className?: string }) {
  return (
    <Photo
      src={src}
      alt=""
      aspect="square"
      rounded={false}
      blur={false}
      tint={false}
      sizes="40px"
      className={cn("size-10 shrink-0 rounded-md", className)}
    />
  );
}
