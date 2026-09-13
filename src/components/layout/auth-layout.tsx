import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand";
import { Photo } from "@/components/ui/photo";
import { IMAGES } from "@/data/images";
import { cn } from "@/lib/utils";

export interface AuthPanel {
  image: string;
  /** One line of copy over the photograph. Keep it to about twelve words. */
  quote: string;
  attribution: string;
}

/** Panels are named so every auth page picks a mood rather than a file path. */
export const AUTH_PANELS = {
  signIn: {
    image: IMAGES.concertStage,
    quote: "Six hundred people in a Camp Kigali courtyard, and four bands still to play.",
    attribution: "Jazz Junction, Kigali",
  },
  signUp: {
    image: IMAGES.festivalCrowd,
    quote: "The best nights in Rwanda are not advertised. They are passed around.",
    attribution: "Ubumuntu Arts Festival",
  },
  recover: {
    image: IMAGES.greenHills,
    quote: "Volcano country at first light, two hours from the capital.",
    attribution: "Kinigi, Musanze",
  },
  verify: {
    image: IMAGES.lakeKivu,
    quote: "One more step, and the whole calendar opens up.",
    attribution: "Lake Kivu, Rubavu",
  },
} as const satisfies Record<string, AuthPanel>;

interface AuthLayoutProps {
  panel: AuthPanel;
  children: ReactNode;
  /** Shown at the top of the form column. Defaults to the public site. */
  backHref?: string;
  backLabel?: string;
  className?: string;
}

/**
 * Shared shell for sign in, sign up, password recovery and verification.
 *
 * Photograph on the left from lg up, form on the right. Below lg the photograph is
 * dropped entirely rather than stacked, so the form is the first thing on a phone.
 */
export function AuthLayout({ panel, children, backHref = "/", backLabel = "Back to the website", className }: AuthLayoutProps) {
  return (
    <div className="flex min-h-dvh bg-surface">
      <aside className="relative hidden lg:block lg:w-[52%]">
        <Photo src={panel.image} alt="" aspect="auto" rounded={false} tint={false} priority className="absolute inset-0 h-full" sizes="52vw" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-navy-950/70 to-transparent" aria-hidden />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-navy-950/85 via-navy-950/40 to-transparent" aria-hidden />
        <div className="relative flex h-full flex-col justify-between p-10 xl:p-12">
          <Link href="/" className="w-fit rounded-sm" aria-label="GigSyc home"><Logo variant="dark" size="md" /></Link>
          <figure className="max-w-md">
            <blockquote className="font-display text-2xl font-medium leading-snug text-white xl:text-[26px]">{panel.quote}</blockquote>
            <figcaption className="mt-3 text-sm text-white/70">— {panel.attribution}</figcaption>
          </figure>
        </div>
      </aside>

      <div className={cn("flex min-h-dvh w-full flex-col lg:w-[48%]", className)}>
        <div className="flex items-center justify-between gap-4 px-6 pt-6 sm:px-10">
          <Link href="/" className="lg:hidden" aria-label="GigSyc home"><Logo size="sm" /></Link>
          <Link
            href={backHref}
            className="ml-auto inline-flex items-center gap-1.5 rounded-sm text-[13px] font-medium text-fg-muted transition-colors hover:text-fg"
          >
            <ArrowLeft className="size-4" aria-hidden />
            {backLabel}
          </Link>
        </div>
        <main id="main" className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-[400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}

/** Standard heading block inside an auth panel. */
export function AuthHeading({ title, description, className }: { title: ReactNode; description?: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-7", className)}>
      <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-navy-900">{title}</h1>
      {description ? <p className="mt-2 text-sm leading-6 text-fg-muted">{description}</p> : null}
    </div>
  );
}
