"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, Briefcase, LayoutDashboard, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HOME_FOR_ROLE, useSession } from "@/features/session";
import { PLATFORM_USERS } from "@/data/mocks/platform";
import { EMPLOYER_USERS } from "@/data/mocks/employers";
import { WORKERS } from "@/data/mocks/workers";

const ROLE_LABEL = {
  customer: "Explorer",
  employer: "Partner",
  worker: "Professional",
  admin: "Platform admin",
} as const;

const ROLE_ICON = {
  customer: UserRound,
  employer: Briefcase,
  worker: UserRound,
  admin: ShieldCheck,
} as const;

/** Resolves the display name for whichever persona is signed in. */
function useAccount() {
  const { persona } = useSession();
  if (!persona) return null;
  if (persona.role === "worker") {
    const w = WORKERS.find((x) => x.id === persona.userId);
    return w ? { name: `${w.firstName} ${w.lastName}`, color: w.avatarColor, role: persona.role } : null;
  }
  if (persona.role === "employer") {
    const u = EMPLOYER_USERS.find((x) => x.id === persona.userId);
    return u ? { name: u.name, color: "#001b56", role: persona.role } : null;
  }
  const u = PLATFORM_USERS.find((x) => x.id === persona.userId);
  return u ? { name: u.name, color: u.avatarColor, role: persona.role } : null;
}

/** Right-hand side of the public header: sign-in buttons, or the account menu once signed in. */
export function SiteAccountMenu() {
  const router = useRouter();
  const { persona, ready, signOut } = useSession();
  const account = useAccount();

  // Render the signed-out state during hydration so the header never flickers between states.
  if (!ready || !persona || !account) {
    return (
      <>
        <Button variant="ghost" asChild><Link href="/login">Log in</Link></Button>
        <Button asChild><Link href="/events">Browse events</Link></Button>
      </>
    );
  }

  const Icon = ROLE_ICON[account.role];
  const home = HOME_FOR_ROLE[account.role];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="flex h-10 items-center gap-2 rounded-full pl-1 pr-2.5 transition-colors hover:bg-ink-100" aria-label="Account menu">
          <Avatar name={account.name} color={account.color} size="sm" />
          <span className="hidden text-sm font-medium text-fg sm:block">{account.name.split(" ")[0]}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-fg">{account.name}</span>
          <span className="font-normal">{ROLE_LABEL[account.role]}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {account.role === "customer" ? (
          <DropdownMenuItem asChild><Link href="/events?view=saved"><Bookmark /> Saved events</Link></DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild><Link href={home}><LayoutDashboard /> {account.role === "admin" ? "Admin console" : "Dashboard"}</Link></DropdownMenuItem>
        )}
        <DropdownMenuItem asChild><Link href="/events"><Icon /> Browse events</Link></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => { signOut(); router.push("/login"); }}><LogOut /> Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
