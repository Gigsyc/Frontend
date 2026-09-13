"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="container-x flex h-16 items-center">
        <Link href="/" aria-label="GigSyc home" className="rounded-sm"><Logo size="md" /></Link>
      </header>
      <main id="main" className="flex flex-1 items-center justify-center px-4 py-12">
        <div role="alert" className="w-full max-w-md text-center">
          <span className="inline-flex size-12 items-center justify-center rounded-lg bg-danger-50 text-danger-600">
            <AlertTriangle className="size-6" aria-hidden />
          </span>
          <h1 className="mt-6 text-2xl font-semibold sm:text-[28px]">Something went wrong</h1>
          <p className="mt-3 text-sm leading-6 text-fg-muted">We couldn’t reach GigSyc. Check your connection and try again. If it keeps happening, the prototype data may need a reset from Settings.</p>
          {error.digest ? <p className="mt-2 text-xs text-fg-subtle tabular">Reference {error.digest}</p> : null}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" onClick={reset}><RefreshCw /> Try again</Button>
            <Button size="lg" variant="outline" asChild><Link href="/">Back to GigSyc</Link></Button>
          </div>
        </div>
      </main>
    </div>
  );
}
