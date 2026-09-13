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
        tint={false}
        priority
        sizes="(min-width: 1024px) 52vw, 1px"
        className="absolute inset-0 size-full"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/35 to-navy-950/15" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-navy-950/55 to-transparent" aria-hidden />

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
