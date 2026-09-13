"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Star } from "lucide-react";
import { WorkerAvatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Rating } from "@/components/ui/rating";
import { formatDate } from "@/lib/utils";
import type { EngagedWorker } from "./use-analytics-view";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const stagger = (i: number) => ({ initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, ease: EASE, delay: Math.min(i, 7) * 0.03 } });

export function EngagedWorkersTable({ rows }: { rows: EngagedWorker[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Most engaged workers</CardTitle>
        <CardDescription>Ranked by the ratings you gave, then shifts completed</CardDescription>
      </CardHeader>
      {rows.length === 0 ? (
        <EmptyState compact icon={Star} title="No completed shifts yet" description="Approve and rate a completed shift and the people you work with most appear here." />
      ) : (
        <>
          <div className="mt-3 hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead className="text-left text-xs font-medium text-fg-muted">
                <tr className="border-b border-border [&>th]:px-5 [&>th]:pb-2">
                  <th scope="col">Worker</th>
                  <th scope="col" className="text-right">Shifts</th>
                  <th scope="col" className="text-right">Avg rating</th>
                  <th scope="col" className="text-right">Reliability</th>
                  <th scope="col">Last worked</th>
                  <th scope="col"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <motion.tr key={r.worker.id} {...stagger(i)} className="border-b border-border last:border-0 [&>td]:px-5 [&>td]:py-3">
                    <td>
                      <span className="flex items-center gap-3">
                        <WorkerAvatar worker={r.worker} size="sm" />
                        <span className="min-w-0">
                          <span className="flex items-center gap-2">
                            <Link href={`/employer/talent/${r.worker.id}`} className="truncate font-medium text-fg hover:text-navy-800">{r.worker.firstName} {r.worker.lastName}</Link>
                            {r.inPool ? <Badge tone="amber"><Star className="fill-current" /> Pool</Badge> : null}
                          </span>
                          <span className="block truncate text-xs text-fg-muted">{r.worker.headline}</span>
                        </span>
                      </span>
                    </td>
                    <td className="text-right tabular">{r.shifts}</td>
                    <td className="text-right"><Rating value={r.avgRating} className="justify-end" /></td>
                    <td className="text-right tabular">{r.worker.reliability}%</td>
                    <td className="whitespace-nowrap text-fg-muted">{r.lastWorked ? formatDate(r.lastWorked) : "—"}</td>
                    <td className="text-right"><Button variant="ghost" size="sm" asChild><Link href={`/employer/talent/${r.worker.id}`}>View profile</Link></Button></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="mt-3 divide-y divide-border md:hidden">
            {rows.map((r, i) => (
              <motion.li key={r.worker.id} {...stagger(i)} className="flex items-center gap-3 px-4 py-3">
                <WorkerAvatar worker={r.worker} size="md" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-fg">{r.worker.firstName} {r.worker.lastName}</span>
                    {r.inPool ? <Badge tone="amber"><Star className="fill-current" /> Pool</Badge> : null}
                  </span>
                  <span className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-fg-muted">
                    <span className="tabular">{r.shifts} shifts</span>
                    <Rating value={r.avgRating} />
                    <span className="tabular">{r.worker.reliability}% reliable</span>
                  </span>
                </span>
                <Button variant="outline" size="sm" asChild><Link href={`/employer/talent/${r.worker.id}`}>Profile</Link></Button>
              </motion.li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
