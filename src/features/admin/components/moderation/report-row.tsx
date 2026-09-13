"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReportStatusBadge, SeverityBadge } from "@/components/ui/status-badge";
import { formatDate, formatTimeAgo } from "@/lib/utils";
import type { Report, ReportKind } from "@/types";
import type { Outcome } from "./resolve-report-dialog";

interface Props {
  report: Report;
  index: number;
  onAct: (report: Report, outcome: Outcome) => void;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const KIND_LABEL: Record<ReportKind, string> = {
  event: "Event",
  organizer: "Organiser",
  review: "Review",
  profile: "Profile",
};

/** Only event and profile reports point at a record an operator can open from here. */
function targetHref(report: Report): string | undefined {
  if (report.kind === "event") return `/admin/events/${report.targetId}`;
  if (report.kind === "profile") return "/admin/users";
  return undefined;
}

export function ReportRow({ report, index, onAct }: Props) {
  const href = targetHref(report);
  const open = report.status === "open";

  return (
    <motion.li
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE, delay: Math.min(index, 7) * 0.03 }}
      className="p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <SeverityBadge severity={report.severity} />
        <Badge tone="outline">{KIND_LABEL[report.kind]}</Badge>
        {href ? (
          <Link href={href} className="inline-flex items-center gap-1 text-[13px] font-medium text-navy-700 hover:underline [&_svg]:size-3.5">
            {report.targetLabel} <ArrowUpRight aria-hidden />
          </Link>
        ) : (
          <span className="text-[13px] font-medium text-fg-muted">{report.targetLabel}</span>
        )}
        <ReportStatusBadge status={report.status} className="ml-auto" />
      </div>

      <h3 className="mt-3 text-[15px] font-semibold text-fg">{report.reason}</h3>
      <p className="mt-1 text-sm leading-6 text-fg-muted">{report.detail}</p>
      <p className="mt-2 text-xs text-fg-subtle">Reported by {report.reportedByName} · {formatTimeAgo(report.createdAt)}</p>

      {open ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => onAct(report, "resolved")}>Resolve…</Button>
          <Button size="sm" variant="outline" onClick={() => onAct(report, "dismissed")}>Dismiss…</Button>
        </div>
      ) : report.resolution ? (
        <div className="mt-4 rounded-md bg-ink-50 px-3 py-2.5">
          <p className="text-[13px] leading-6 text-fg">{report.resolution}</p>
          {report.resolvedAt ? (
            <p className="mt-0.5 text-xs text-fg-subtle">
              {report.status === "dismissed" ? "Dismissed" : "Resolved"} {formatDate(report.resolvedAt)} · {formatTimeAgo(report.resolvedAt)}
            </p>
          ) : null}
        </div>
      ) : null}
    </motion.li>
  );
}
