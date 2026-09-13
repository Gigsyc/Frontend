import Link from "next/link";
import { Logo } from "@/components/brand";
import { Photo } from "@/components/ui/photo";
import { IMAGES } from "@/data/images";

/**
 * Left half of the split screen: one photograph, the logo at the top, one line near the
 * bottom. Hidden under lg — the brief prioritises the form on small screens over a
 * decorative band of image.
 */
export function LoginAside() {
  return (
    <aside className="relative hidden lg:block lg:w-[52%]">
      <Photo
        src={IMAGES.concertStage}
        alt=""
        aspect="auto"
        rounded={false}
        priority
        sizes="(min-width: 1024px) 52vw, 1px"
        className="absolute inset-0 size-full"
      />
      {/* The one sanctioned scrim, carrying the quote. The top of the frame is already dark. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-navy-950/70 to-transparent" aria-hidden />

      <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
        <Link href="/" aria-label="GigSyc home" className="self-start rounded-sm">
          <Logo variant="dark" size="md" />
        </Link>

        <figure className="max-w-md">
          <blockquote className="font-display text-[26px] font-semibold leading-9 tracking-tight text-white xl:text-[30px] xl:leading-[2.6rem]">
            Six hundred people in a Camp Kigali courtyard, and four bands still to play.
          </blockquote>
          <figcaption className="mt-4 text-sm text-white/70">— Jazz Junction, Kigali</figcaption>
        </figure>
      </div>
    </aside>
  );
}
