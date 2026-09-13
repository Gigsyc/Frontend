"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItemDef {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Match nested routes too (default true). Set false for the index route. */
  nested?: boolean;
}

export function useIsActive(href: string, nested = true) {
  const pathname = usePathname();
  return nested ? pathname === href || pathname.startsWith(href + "/") : pathname === href;
}

/** Vertical sidebar item (employer portal, worker desktop rail). */
export function SidebarNavItem({ item, badge, onNavigate }: { item: NavItemDef; badge?: number; onNavigate?: () => void }) {
  const active = useIsActive(item.href, item.nested);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
        active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/[0.06] hover:text-white",
      )}
    >
      {active ? <span className="absolute left-0 top-2 h-6 w-0.5 rounded-r bg-amber-500" aria-hidden /> : null}
      <Icon className={cn("size-[18px] shrink-0", active ? "text-amber-400" : "text-white/60 group-hover:text-white/90")} aria-hidden />
      <span className="flex-1 truncate">{item.label}</span>
      {badge ? <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-navy-900 tabular">{badge}</span> : null}
    </Link>
  );
}

/** Bottom tab (worker mobile). */
export function TabNavItem({ item, badge }: { item: NavItemDef; badge?: number }) {
  const active = useIsActive(item.href, item.nested);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn("relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors", active ? "text-navy-900" : "text-fg-muted")}
    >
      <span className={cn("relative inline-flex h-7 w-12 items-center justify-center rounded-full transition-colors", active && "bg-navy-50")}>
        <Icon className="size-[20px]" strokeWidth={active ? 2.25 : 2} aria-hidden />
        {badge ? <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-amber-500 px-1 text-center text-[10px] font-semibold leading-4 text-navy-900 tabular">{badge}</span> : null}
      </span>
      <span className="truncate">{item.label}</span>
    </Link>
  );
}
