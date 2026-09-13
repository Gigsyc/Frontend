"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, SheetContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { SiteAccountMenu } from "./site-account-menu";

const NAV = [
  { href: "/events", label: "Events" },
  { href: "/business", label: "For business" },
  { href: "/workers", label: "For workers" },
  { href: "/how-it-works", label: "How it works" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  // The menu is "open" only for the path it was opened on, so navigating closes it without an effect.
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const setOpen = (next: boolean) => setOpenPath(next ? pathname : null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={cn("sticky top-0 z-40 bg-surface/90 backdrop-blur transition-shadow", scrolled ? "shadow-[0_1px_0_0_var(--color-border)]" : "")}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-navy-900 focus:px-3 focus:py-2 focus:text-sm focus:text-white">Skip to content</a>
      <div className="container-x flex h-16 items-center justify-between gap-6">
        <Link href="/" className="rounded-sm" aria-label="GigSyc home">
          <Logo size="md" />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => {
            const active = pathname === n.href || pathname.startsWith(n.href + "/");
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={cn("rounded-md px-3 py-2 text-sm font-medium transition-colors", active ? "text-navy-900" : "text-fg-muted hover:text-fg hover:bg-ink-50")}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <SiteAccountMenu />
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu"><Menu /></Button>
          </DialogTrigger>
          <SheetContent side="right" title={<Logo size="sm" />} className="max-w-xs">
            <nav aria-label="Mobile" className="flex flex-col p-3">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="rounded-md px-3 py-3 text-base font-medium text-fg hover:bg-ink-50">{n.label}</Link>
              ))}
            </nav>
            <div className="mt-2 flex flex-col gap-2 border-t border-border p-4">
              <Button size="lg" asChild><Link href="/events">Browse events</Link></Button>
              <Button size="lg" variant="outline" asChild><Link href="/login?as=employer">Post a shift</Link></Button>
              <Button variant="ghost" asChild><Link href="/login">Log in</Link></Button>
            </div>
          </SheetContent>
        </Dialog>
      </div>
    </header>
  );
}
