"use client";

import { motion } from "motion/react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch, SwitchField } from "@/components/ui/checkbox";
import { Photo } from "@/components/ui/photo";
import { useStaggerOnce } from "@/lib/motion";
import { pluralize } from "@/lib/utils";
import type { Destination } from "@/types";

export type DestinationFlag = "featured" | "published";

interface Props {
  destinations: Destination[];
  publishedEvents: Record<string, number>;
  /** True when the events query failed: show "unknown", never an invented zero. */
  countsUnavailable?: boolean;
  pendingKey: string | null;
  onToggle: (destination: Destination, flag: DestinationFlag, value: boolean) => void;
  onEdit: (destination: Destination) => void;
}

/** Nothing on the public site reads `featured` yet, so the description says what it really is. */
const FEATURED_HINT = "An internal mark. The public places row is ordered by how many events are on.";

function Thumb({ destination }: { destination: Destination }) {
  return <Photo src={destination.heroImage} alt="" aspect="square" tint={false} sizes="40px" className="size-10 shrink-0 rounded-md" />;
}

function EventsCount({ count, unavailable }: { count: number; unavailable?: boolean }) {
  if (unavailable) {
    return <span className="text-fg-subtle">—<span className="sr-only">live event count unavailable</span></span>;
  }
  return <>{count === 0 ? "None live" : pluralize(count, "event")}</>;
}

export function DestinationsTable({ destinations, publishedEvents, countsUnavailable, pendingKey, onToggle, onEdit }: Props) {
  const stagger = useStaggerOnce(destinations.length > 0);

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium text-fg-muted">
              <th scope="col" className="px-5 py-3 font-medium">Place</th>
              <th scope="col" className="px-5 py-3 font-medium">Region</th>
              <th scope="col" className="px-5 py-3 font-medium">Live events</th>
              <th scope="col" className="px-5 py-3 font-medium">Featured</th>
              <th scope="col" className="px-5 py-3 font-medium">Published</th>
              <th scope="col" className="px-5 py-3"><span className="sr-only">Edit</span></th>
            </tr>
          </thead>
          <tbody>
            {destinations.map((d, i) => (
              <motion.tr key={d.id} {...stagger(i)} className="border-b border-border last:border-0 hover:bg-ink-50">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Thumb destination={d} />
                    <div className="min-w-0">
                      <p className="font-medium text-fg">{d.name}</p>
                      <p className="truncate text-xs text-fg-muted">{d.tagline}</p>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-fg-muted">
                  {d.region}
                  {d.travelFromKigali ? <span className="block text-xs text-fg-subtle">{d.travelFromKigali}</span> : null}
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 tabular text-fg">
                  <EventsCount count={publishedEvents[d.name] ?? 0} unavailable={countsUnavailable} />
                </td>
                <td className="px-5 py-3.5">
                  <Switch
                    checked={d.featured}
                    disabled={pendingKey === `${d.id}:featured`}
                    onCheckedChange={(v) => onToggle(d, "featured", v)}
                    aria-label={`Mark ${d.name} as featured`}
                  />
                </td>
                <td className="px-5 py-3.5">
                  <Switch
                    checked={d.published}
                    disabled={pendingKey === `${d.id}:published`}
                    onCheckedChange={(v) => onToggle(d, "published", v)}
                    aria-label={`Publish ${d.name} on the public site`}
                  />
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Button variant="outline" size="sm" onClick={() => onEdit(d)}><Pencil /> Edit</Button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-border md:hidden">
        {destinations.map((d, i) => (
          <motion.li key={d.id} {...stagger(i)} className="flex flex-col gap-3 p-4">
            <div className="flex items-start gap-3">
              <Thumb destination={d} />
              <div className="min-w-0 flex-1">
                <p className="font-medium leading-5 text-fg">{d.name}</p>
                <p className="mt-0.5 text-[13px] text-fg-muted">{d.tagline}</p>
                <p className="mt-1 text-xs text-fg-subtle">
                  {d.region} · <EventsCount count={publishedEvents[d.name] ?? 0} unavailable={countsUnavailable} />
                </p>
              </div>
            </div>
            <SwitchField
              label="Featured"
              description={FEATURED_HINT}
              checked={d.featured}
              disabled={pendingKey === `${d.id}:featured`}
              onCheckedChange={(v) => onToggle(d, "featured", v)}
              className="min-h-11"
            />
            <SwitchField
              label="Published"
              description="Visible in “Browse by place”."
              checked={d.published}
              disabled={pendingKey === `${d.id}:published`}
              onCheckedChange={(v) => onToggle(d, "published", v)}
              className="min-h-11"
            />
            <Button variant="outline" size="md" className="w-full" onClick={() => onEdit(d)}><Pencil /> Edit copy</Button>
          </motion.li>
        ))}
      </ul>
    </>
  );
}
