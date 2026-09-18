"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, Briefcase, CalendarPlus, CalendarRange, ChevronsUpDown, CreditCard, LayoutDashboard, LogOut, Menu, Plus, Settings, UserRound, Users } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Logo, LogoIcon } from "@/components/brand";
import { NotificationBell } from "@/components/common/notification-bell";
import { EmployerMark } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, SheetContent } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployerBookings } from "@/features/bookings";
import { useEmployer } from "@/features/employers";
import { useEmployerSession } from "@/features/session";
import { EMPLOYER_USERS } from "@/data/mocks/employers";
import { SidebarNavItem, type NavItemDef } from "./nav-item";

const NAV: NavItemDef[] = [
  { href: "/employer", label: "Overview", icon: LayoutDashboard, nested: false },
  { href: "/employer/events", label: "Events", icon: CalendarRange },
  { href: "/employer/jobs", label: "Jobs", icon: Briefcase },
  { href: "/employer/talent", label: "Talent", icon: Users },
  { href: "/employer/payments", label: "Payments", icon: CreditCard },
  { href: "/employer/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/employer/settings", label: "Settings", icon: Settings },
];

function Sidebar({ onNavigate, pendingCount }: { onNavigate?: () => void; pendingCount?: number }) {
  return (
    <div className="flex h-full flex-col bg-navy-900 text-white">
      <div className="flex h-16 items-center px-5">
        <Link href="/employer" onClick={onNavigate} aria-label="GigSyc for Business overview"><Logo variant="dark" size="md" /></Link>
      </div>
      <div className="flex flex-col gap-2 px-3 pb-2">
        <Button variant="accent" className="w-full justify-start" asChild>
          <Link href="/employer/events/new" onClick={onNavigate}><CalendarPlus /> Submit an event</Link>
        </Button>
        <Button variant="on-dark" className="w-full justify-start" asChild>
          <Link href="/employer/jobs/new" onClick={onNavigate}><Plus /> Post a shift</Link>
        </Button>
      </div>
      <nav aria-label="Employer" className="flex flex-1 flex-col gap-0.5 px-3 py-2">
        {NAV.map((item) => <SidebarNavItem key={item.href} item={item} onNavigate={onNavigate} badge={item.href === "/employer/jobs" ? pendingCount : undefined} />)}
      </nav>
      <div className="mx-3 mb-4 rounded-lg bg-white/[0.06] p-3 text-xs leading-5 text-white/70">
        <p className="font-medium text-white">Prototype workspace</p>
        <p>Data is simulated and resets daily. Nothing here is billed, sent to workers, or published without review.</p>
      </div>
    </div>
  );
}

function UserMenu() {
  const router = useRouter();
  const { employerId, signOut } = useEmployerSession();
  const { data: employer } = useEmployer(employerId);
  const user = EMPLOYER_USERS.find((u) => u.employerId === employerId);
  if (!employer) return <Skeleton className="h-9 w-40" />;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="flex h-10 items-center gap-2.5 rounded-md pl-1 pr-2 text-left transition-colors hover:bg-ink-100" aria-label="Account menu">
          <EmployerMark employer={employer} size="sm" />
          <span className="hidden min-w-0 flex-col sm:flex">
            <span className="truncate text-[13px] font-semibold leading-4 text-fg">{employer.name}</span>
            <span className="truncate text-xs leading-4 text-fg-muted">{user?.name}</span>
          </span>
          <ChevronsUpDown className="hidden size-4 text-fg-subtle sm:block" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-fg">{user?.name}</span>
          <span className="font-normal">{user?.role} · {employer.name}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><Link href="/employer/settings"><Settings /> Organisation settings</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/worker"><UserRound /> Switch to worker view</Link></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => { signOut(); router.push("/login"); }}><LogOut /> Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function EmployerShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { employerId } = useEmployerSession();
  const { data: bookings } = useEmployerBookings(employerId);
  const pending = bookings?.filter((b) => b.status === "applied").length || undefined;

  return (
    <div className="flex min-h-dvh bg-canvas">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 lg:block xl:w-64">
        <Sidebar pendingCount={pending} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 lg:hidden">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open navigation"><Menu /></Button>
              </DialogTrigger>
              <SheetContent side="left" title={<span className="sr-only">Navigation</span>} hideClose className="max-w-[280px] bg-navy-900 p-0 [&>div:first-child]:hidden">
                <Sidebar onNavigate={() => setOpen(false)} pendingCount={pending} />
              </SheetContent>
            </Dialog>
            <Link href="/employer" aria-label="Overview"><LogoIcon tone="navy" size={26} /></Link>
          </div>
          <div className="hidden text-sm text-fg-muted lg:block">Partner workspace</div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button size="sm" className="hidden sm:inline-flex lg:hidden" asChild><Link href="/employer/jobs/new"><Plus /> Post a shift</Link></Button>
            <NotificationBell recipientId={employerId} allHref="/employer/notifications" />
            <UserMenu />
          </div>
        </header>
        <main id="main" className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
