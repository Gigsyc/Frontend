"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase, CalendarDays, Compass, LogOut, Settings, UserRound, Wallet } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand";
import { NotificationBell } from "@/components/common/notification-bell";
import { WorkerAvatar } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkerBookings } from "@/features/bookings";
import { useWorkerSession } from "@/features/session";
import { useWorker } from "@/features/workers";
import { SidebarNavItem, TabNavItem, type NavItemDef } from "./nav-item";

const NAV: NavItemDef[] = [
  { href: "/worker", label: "Discover", icon: Compass, nested: false },
  { href: "/worker/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/worker/earnings", label: "Earnings", icon: Wallet },
  { href: "/worker/profile", label: "Profile", icon: UserRound },
];

function WorkerMenu() {
  const router = useRouter();
  const { workerId, signOut } = useWorkerSession();
  const { data: worker } = useWorker(workerId);
  if (!worker) return <Skeleton className="size-9 rounded-full" />;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="rounded-full ring-offset-2 transition-shadow hover:ring-2 hover:ring-navy-100" aria-label="Account menu">
          <WorkerAvatar worker={worker} size="sm" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-fg">{worker.firstName} {worker.lastName}</span>
          <span className="font-normal">{worker.headline}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><Link href="/worker/profile"><UserRound /> My profile</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/worker/profile/settings"><Settings /> Settings</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/employer"><Briefcase /> Switch to business view</Link></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => { signOut(); router.push("/login"); }}><LogOut /> Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Mobile-first: top bar + bottom tabs. On large screens the tabs move to a navy rail and
 * content stays in a comfortable reading width — the worker app is a phone product first.
 */
export function WorkerShell({ children }: { children: ReactNode }) {
  const { workerId } = useWorkerSession();
  const { data: bookings } = useWorkerBookings(workerId);
  const invites = bookings?.filter((b) => b.status === "invited").length || undefined;

  return (
    <div className="flex min-h-dvh bg-canvas">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col bg-navy-900 text-white lg:flex">
        <div className="flex h-16 items-center px-5"><Link href="/worker" aria-label="Discover shifts"><Logo variant="dark" /></Link></div>
        <nav aria-label="Worker" className="flex flex-1 flex-col gap-0.5 px-3 py-2">
          {NAV.map((item) => <SidebarNavItem key={item.href} item={item} badge={item.href === "/worker/schedule" ? invites : undefined} />)}
        </nav>
        <div className="mx-3 mb-4 rounded-lg bg-white/[0.06] p-3 text-xs leading-5 text-white/70">
          <p className="font-medium text-white">Prototype</p>
          <p>Shifts, payments and messages are simulated.</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-surface/95 px-4 backdrop-blur sm:px-6 lg:h-16 lg:px-8">
          <Link href="/worker" className="lg:hidden" aria-label="Discover shifts"><Logo size="sm" /></Link>
          <div className="hidden text-sm text-fg-muted lg:block">GigSyc for Workers</div>
          <div className="flex items-center gap-1">
            <NotificationBell recipientId={workerId} allHref="/worker/notifications" />
            <WorkerMenu />
          </div>
        </header>
        <main id="main" className="flex-1 px-4 pb-[calc(76px+env(safe-area-inset-bottom))] pt-4 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
          <div className="mx-auto w-full max-w-3xl">{children}</div>
        </main>
        <nav aria-label="Worker" className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
          {NAV.map((item) => <TabNavItem key={item.href} item={item} badge={item.href === "/worker/schedule" ? invites : undefined} />)}
        </nav>
      </div>
    </div>
  );
}

