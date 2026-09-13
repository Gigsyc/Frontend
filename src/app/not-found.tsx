import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="container-x flex h-16 items-center">
        <Link href="/" aria-label="GigSyc home" className="rounded-sm"><Logo size="md" /></Link>
      </header>
      <main id="main" className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <span className="inline-flex size-12 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
            <Compass className="size-6" aria-hidden />
          </span>
          <p className="mt-6 font-display text-sm font-semibold text-fg-muted tabular">404</p>
          <h1 className="mt-1 text-2xl font-semibold sm:text-[28px]">We couldn’t find that page</h1>
          <p className="mt-3 text-sm leading-6 text-fg-muted">The link may be out of date, or the shift it pointed to may have been removed. Prototype data resets daily, so older links to specific shifts can expire.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild><Link href="/"><ArrowLeft /> Back to GigSyc</Link></Button>
            <Button size="lg" variant="outline" asChild><Link href="/login">Open the prototype</Link></Button>
          </div>
        </div>
      </main>
    </div>
  );
}
