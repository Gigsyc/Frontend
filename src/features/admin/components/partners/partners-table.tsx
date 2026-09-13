"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { CalendarRange, MoreHorizontal, ShieldOff } from "lucide-react";
import { EmployerMark } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EmployerVerifiedMark } from "@/components/ui/verified";
import { SECTORS } from "@/data/roles";
import type { Employer } from "@/types";
import type { PartnerRow } from "./use-partner-rows";

interface Props {
  rows: PartnerRow[];
  onRevoke: (partner: Employer) => void;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const rowIn = (i: number) => ({
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: EASE, delay: Math.min(i, 7) * 0.03 },
});

const eventsHref = (partner: Employer) => `/admin/events?q=${encodeURIComponent(partner.name)}`;

function RowMenu({ partner, onRevoke }: { partner: Employer; onRevoke: Props["onRevoke"] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${partner.name}`}><MoreHorizontal /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={eventsHref(partner)}><CalendarRange /> View events</Link>
        </DropdownMenuItem>
        {partner.verified ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onSelect={() => onRevoke(partner)}><ShieldOff /> Revoke verification</DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Mark({ partner }: { partner: Employer }) {
  return partner.verified ? <EmployerVerifiedMark /> : <Badge tone="warning">Pending</Badge>;
}

export function PartnersTable({ rows, onRevoke }: Props) {
  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium text-fg-muted">
              <th scope="col" className="px-5 py-3 font-medium">Partner</th>
              <th scope="col" className="px-5 py-3 font-medium">Sector</th>
              <th scope="col" className="px-5 py-3 font-medium">Base</th>
              <th scope="col" className="px-5 py-3 font-medium">Verification</th>
              <th scope="col" className="px-5 py-3 text-right font-medium">Events</th>
              <th scope="col" className="px-5 py-3 text-right font-medium">Shifts</th>
              <th scope="col" className="px-5 py-3 text-right font-medium">Fill rate</th>
              <th scope="col" className="px-5 py-3 text-right font-medium">Rating given</th>
              <th scope="col" className="px-3 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ partner, events, publishedEvents }, i) => (
              <motion.tr key={partner.id} {...rowIn(i)} className="border-b border-border last:border-0 hover:bg-ink-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <EmployerMark employer={partner} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-fg">{partner.name}</p>
                      <p className="truncate text-xs text-fg-muted">{partner.tagline}</p>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-fg-muted">{SECTORS[partner.sector].label}</td>
                <td className="whitespace-nowrap px-5 py-3 text-fg-muted">{partner.district}</td>
                <td className="px-5 py-3"><Mark partner={partner} /></td>
                <td className="whitespace-nowrap px-5 py-3 text-right tabular text-fg">
                  {events}
                  <span className="block text-xs text-fg-subtle">{publishedEvents} live</span>
                </td>
                <td className="px-5 py-3 text-right tabular text-fg-muted">{partner.stats.shiftsPosted}</td>
                <td className="px-5 py-3 text-right tabular text-fg-muted">{partner.stats.fillRate}%</td>
                <td className="px-5 py-3 text-right tabular text-fg-muted">{partner.stats.avgRatingGiven.toFixed(1)}</td>
                <td className="px-3 py-3 text-right"><RowMenu partner={partner} onRevoke={onRevoke} /></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-border lg:hidden">
        {rows.map(({ partner, events, publishedEvents }, i) => (
          <motion.li key={partner.id} {...rowIn(i)} className="flex items-start gap-3 p-4">
            <EmployerMark employer={partner} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium leading-5 text-fg">{partner.name}</p>
              <p className="mt-0.5 text-[13px] text-fg-muted">{SECTORS[partner.sector].label} · {partner.district}</p>
              <div className="mt-2"><Mark partner={partner} /></div>
              <p className="mt-2 text-xs text-fg-subtle">
                <span className="tabular">{events}</span> events (<span className="tabular">{publishedEvents}</span> live) ·{" "}
                <span className="tabular">{partner.stats.shiftsPosted}</span> shifts · <span className="tabular">{partner.stats.fillRate}%</span> fill ·{" "}
                <span className="tabular">{partner.stats.avgRatingGiven.toFixed(1)}</span> rating given
              </p>
            </div>
            <div className="flex size-11 shrink-0 items-center justify-center"><RowMenu partner={partner} onRevoke={onRevoke} /></div>
          </motion.li>
        ))}
      </ul>
    </>
  );
}
