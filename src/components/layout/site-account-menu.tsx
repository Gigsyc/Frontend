"use client";

import Link from "next/link";
import {
  Bookmark, CalendarCheck, LayoutDashboard, LogOut, Settings, ShieldCheck, UserRound,
  type LucideIcon,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSignOut } from "@/features/account/use-sign-out";
import { useAuth } from "@/features/auth";
import type { UserRole } from "@/types";

interface MenuLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

const PROFILE: MenuLink = { href: "/account", label: "Profile", icon: UserRound };
const SETTINGS: MenuLink = { href: "/account?tab=settings", label: "Account settings", icon: Settings };

/**
 * Each role's menu leads with the thing that role came for: a customer with their own
 * profile, everyone else with the workspace they work in.
 */
const LINKS: Record<UserRole, MenuLink[]> = {
  customer: [
    PROFILE,
    { href: "/events?view=saved", label: "Saved", icon: Bookmark },
    SETTINGS,
  ],
  partner: [
    { href: "/partner", label: "Partner dashboard", icon: LayoutDashboard },
    PROFILE,
    SETTINGS,
  ],
  worker: [
    { href: "/worker", label: "My shifts", icon: CalendarCheck },
    PROFILE,
  ],
  admin: [
    { href: "/admin", label: "Admin console", icon: ShieldCheck },
    PROFILE,
  ],
};

/** One signed-out offer, in one order: Log in then Sign up, ghost then primary. */
function SignedOut({ size }: { size?: "lg" }) {
  return (
    <>
      <Button variant="ghost" size={size} asChild><Link href="/login">Log in</Link></Button>
      <Button size={size} asChild><Link href="/signup">Sign up</Link></Button>
    </>
  );
}

/** Right-hand side of the public header: sign-in buttons, or the account menu once signed in. */
export function SiteAccountMenu() {
  const { user, ready } = useAuth();
  const signOut = useSignOut();

  // Render the signed-out state until localStorage has been read, so the header never
  // flickers between two states on a reload.
  if (!ready || !user) return <SignedOut />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-11 items-center gap-2 rounded-full pl-1 pr-2.5 transition-colors hover:bg-ink-100 focus-visible:outline-none focus-visible:shadow-focus"
          // The visible label is the first name, so the accessible name opens with it and only
          // then says what the button does — voice control can still say what it reads.
          aria-label={`${user.name.split(" ")[0]} — account menu`}
        >
          <Avatar name={user.name} color={user.avatarColor} size="sm" />
          <span className="hidden text-sm font-medium text-fg sm:block">{user.name.split(" ")[0]}</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate text-sm font-semibold text-fg">{user.name}</span>
          <span className="truncate font-normal">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LINKS[user.role].map(({ href, label, icon: Icon }) => (
          <DropdownMenuItem key={label} asChild>
            <Link href={href}><Icon /> {label}</Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={signOut}><LogOut /> Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * The same account for the mobile sheet, where a dropdown inside a sheet has nowhere to
 * go. The rows render inline instead, but they read the one `LINKS` map above, so the
 * two menus cannot drift. The sheet closes itself on navigation, so no handler is needed.
 */
export function SiteAccountMobileActions() {
  const { user, ready } = useAuth();
  const signOut = useSignOut();

  // Same rule as the desktop menu: show the signed-out actions until the session has
  // been read, rather than flickering from one state to the other on reload.
  if (!ready || !user) return <SignedOut size="lg" />;

  return (
    <>
      <div className="flex items-center gap-3 pb-1">
        <Avatar name={user.name} color={user.avatarColor} size="sm" />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-fg">{user.name}</span>
          <span className="block truncate text-[13px] text-fg-muted">{user.email}</span>
        </span>
      </div>
      {LINKS[user.role].map(({ href, label, icon: Icon }) => (
        <Link
          key={label}
          href={href}
          className="flex min-h-11 items-center gap-2.5 rounded-md px-3 text-sm font-medium text-fg hover:bg-ink-50"
        >
          <Icon className="size-[18px] text-fg-muted" aria-hidden /> {label}
        </Link>
      ))}
      <button
        type="button"
        onClick={signOut}
        className="flex min-h-11 items-center gap-2.5 rounded-md px-3 text-left text-sm font-medium text-fg hover:bg-ink-50 focus-visible:outline-none focus-visible:shadow-focus"
      >
        <LogOut className="size-[18px] text-fg-muted" aria-hidden /> Log out
      </button>
    </>
  );
}
