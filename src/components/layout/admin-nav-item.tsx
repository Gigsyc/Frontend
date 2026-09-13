"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsActive } from "./nav-item";

export interface AdminNavDef {
  href: string;
  label: string;
  icon: LucideIcon;
  nested?: boolean;
}

/**
 * Admin sidebar item. Deliberately light where the employer portal is navy — the console
 * should feel like a quiet back office, not a second version of the customer product.
 */
export function AdminNavItem({ item, badge, tone = "neutral", onNavigate }: {
  item: AdminNavDef;
  badge?: number;
  tone?: "neutral" | "attention";
  onNavigate?: () => void;
}) {
  const active = useIsActive(item.href, item.nested);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors",
        active ? "bg-navy-50 font-medium text-navy-900" : "text-ink-600 hover:bg-ink-100 hover:text-fg",
      )}
    >
      {active ? <span className="absolute left-0 top-1.5 h-6 w-0.5 rounded-r bg-amber-500" aria-hidden /> : null}
      <Icon className={cn("size-4 shrink-0", active ? "text-navy-700" : "text-ink-400 group-hover:text-ink-600")} aria-hidden />
      <span className="flex-1 truncate">{item.label}</span>
      {badge ? (
        <span className={cn(
          "rounded-full px-1.5 py-0.5 text-[11px] font-semibold leading-none tabular",
          tone === "attention" ? "bg-amber-500 text-navy-900" : "bg-ink-200 text-ink-700",
        )}>
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
