"use client";

import { motion } from "motion/react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { EmployerMark } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SECTORS } from "@/data/roles";
import { useStaggerOnce } from "@/lib/motion";
import { formatDate, pluralize } from "@/lib/utils";
import type { Employer } from "@/types";
import type { PartnerRow } from "./use-partner-rows";

interface Props {
  rows: PartnerRow[];
  onVerify: (partner: Employer) => void;
}

function decline(row: PartnerRow) {
  const who = row.contact?.name ?? row.partner.contact.name;
  toast(`Declined ${row.partner.name}`, {
    description: `${who} gets an email asking for the missing registration and bank documents.`,
  });
}

/** Leads the page: the partners waiting on a human decision. */
export function VerificationRequests({ rows, onVerify }: Props) {
  const stagger = useStaggerOnce(rows.length > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification requests</CardTitle>
        <CardDescription>
          {rows.length === 0
            ? "Every partner on the platform is verified."
            : `${pluralize(rows.length, "partner")} waiting on a decision before they can take payments.`}
        </CardDescription>
      </CardHeader>
      {rows.length === 0 ? (
        <EmptyState compact icon={ShieldCheck} title="Nothing waiting" description="New organisations show up here the day they apply." />
      ) : (
        <CardContent className="flex flex-col gap-4 pt-4">
          {rows.map((row, i) => {
            const { partner } = row;
            const contactName = row.contact?.name ?? partner.contact.name;
            return (
              <motion.div key={partner.id} {...stagger(i)} className="rounded-lg border border-border p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <EmployerMark employer={partner} size="md" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-fg">{partner.name}</p>
                        <Badge tone="warning">Pending</Badge>
                      </div>
                      <p className="mt-0.5 text-[13px] text-fg-muted">{partner.tagline}</p>
                      <dl className="mt-3 grid gap-x-6 gap-y-2 text-[13px] sm:grid-cols-2">
                        <div>
                          <dt className="text-xs text-fg-subtle">Contact</dt>
                          <dd className="text-fg">{contactName} · {row.contact?.email ?? partner.contact.email}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-fg-subtle">Member since</dt>
                          <dd className="text-fg tabular">{formatDate(partner.memberSince)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-fg-subtle">Submitted</dt>
                          <dd className="text-fg">
                            {pluralize(row.events, "event")} · {pluralize(partner.stats.shiftsPosted, "shift")} posted
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-fg-subtle">Sector &amp; base</dt>
                          <dd className="text-fg">{SECTORS[partner.sector].label} · {partner.district}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => decline(row)}>Decline</Button>
                    <Button className="flex-1 sm:flex-none" onClick={() => onVerify(partner)}><ShieldCheck /> Verify partner</Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      )}
    </Card>
  );
}
