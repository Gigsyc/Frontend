"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity, BarChart3, CalendarRange, ChevronsUpDown, Flag, Handshake, LayoutDashboard, LogOut,
  Map, Menu, Settings, Users,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Logo, LogoIcon } from "@/components/brand";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, SheetContent } from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminEvents, useReports, useSystemServices } from "@/features/admin";
import { useAdminSession } from "@/features/session";
import { PLATFORM_USERS } from "@/data/mocks/platform";
import { cn } from "@/lib/utils";
import { AdminNavItem, type AdminNavDef } from "./admin-nav-item";

const NAV: AdminNavDef[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, nested: false },
  { href: "/admin/events", label: "Events", icon: CalendarRange },
  { href: "/admin/destinations", label: "Destinations", icon: Map },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/partners", label: "Partners", icon: Handshake },
  { href: "/admin/moderation", label: "Moderation", icon: Flag },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/system", label: "System", icon: Activity },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

/** Counts that drive the sidebar badges — the same numbers the Overview page leads with. */
export function useAdminAttention() {
  const events = useAdminEvents({});
  const reports = useReports();
  const services = useSystemServices();
  const pendingEvents = events.data?.filter((e) => e.status === "pending_review").length ?? 0;
  const openReports = reports.data?.filter((r) => r.status === "open").length ?? 0;
  const degraded = services.data?.filter((s) => s.status !== "operational").length ?? 0;
  return { pendingEvents, openReports, degraded };
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { pendingEvents, openReports, degraded } = useAdminAttention();
  return (
    <div className="flex h-full flex-col border-r border-border bg-surface">
      <div className="flex h-16 shrink-0 items-center gap-2.5 px-5">
        <Link href="/admin" onClick={onNavigate} aria-label="Admin overview"><Logo size="sm" /></Link>
        <span className="rounded-sm bg-navy-900 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">Admin</span>
      </div>
      <nav aria-label="Admin" className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-2">
        {NAV.map((item) => (
          <AdminNavItem
            key={item.href}
            item={item}
            onNavigate={onNavigate}
            tone={item.href === "/admin/events" || item.href === "/admin/moderation" || item.href === "/admin/system" ? "attention" : "neutral"}
            badge={
              item.href === "/admin/events" ? pendingEvents || undefined
                : item.href === "/admin/moderation" ? openReports || undefined
                : item.href === "/admin/system" ? degraded || undefined
                : undefined
            }
          />
        ))}
      </nav>
      <div className="border-t border-border p-3">
        <Link href="/events" onClick={onNavigate} className="flex items-center gap-2 rounded-md px-2.5 py-2 text-xs text-ink-500 transition-colors hover:bg-ink-100 hover:text-fg">
          <LogoIcon tone="navy" size={14} />
          View the public site
        </Link>
      </div>
    </div>
  );
}

function AdminUserMenu() {
  const router = useRouter();
  const { userId, signOut } = useAdminSession();
  const user = PLATFORM_USERS.find((u) => u.id === userId) ?? PLATFORM_USERS.find((u) => u.role === "admin")!;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="flex h-10 items-center gap-2.5 rounded-md pl-1 pr-2 transition-colors hover:bg-ink-100" aria-label="Account menu">
          <Avatar name={user.name} color={user.avatarColor} size="sm" />
          <span className="hidden min-w-0 flex-col text-left sm:flex">
            <span className="truncate text-[13px] font-semibold leading-4 text-fg">{user.name}</span>
            <span className="truncate text-xs leading-4 text-fg-muted">Platform operations</span>
          </span>
          <ChevronsUpDown className="hidden size-4 text-fg-subtle sm:block" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-fg">{user.name}</span>
          <span className="font-normal">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><Link href="/admin/settings"><Settings /> Console settings</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/events"><CalendarRange /> Public site</Link></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => { signOut(); router.push("/login"); }}><LogOut /> Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-dvh bg-canvas">
      <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 lg:block xl:w-60">
        <Sidebar />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 lg:hidden">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open navigation"><Menu /></Button>
              </DialogTrigger>
              <SheetContent side="left" title={<span className="sr-only">Admin navigation</span>} hideClose className="max-w-[260px] p-0 [&>div:first-child]:hidden">
                <Sidebar onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Dialog>
            <Link href="/admin" aria-label="Admin overview"><LogoIcon tone="navy" size={24} /></Link>
          </div>
          <p className="hidden text-sm text-fg-muted lg:block">GigSyc Operations</p>
          <div className="flex items-center gap-2"><AdminUserMenu /></div>
        </header>

        <main id="main" className={cn("flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8")}>
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
