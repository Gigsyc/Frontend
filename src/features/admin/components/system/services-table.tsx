"use client";

import { motion } from "motion/react";
import { Progress } from "@/components/ui/progress";
import { ServiceStatusBadge } from "@/components/ui/status-badge";
import { useStaggerOnce } from "@/lib/motion";
import { formatTimeAgo } from "@/lib/utils";
import type { SystemService } from "@/types";

const uptimeTone = (v: number) => (v >= 99.9 ? "success" : v >= 99 ? "navy" : "amber");
const pct = (v: number) => `${v.toFixed(2)}%`;

function Uptime({ service }: { service: SystemService }) {
  return (
    <div className="flex items-center gap-3">
      <Progress value={service.uptime} tone={uptimeTone(service.uptime)} className="w-20" label={`${service.name} uptime`} />
      <span className="tabular text-[13px] text-fg">{pct(service.uptime)}</span>
    </div>
  );
}

function Note({ service }: { service: SystemService }) {
  if (!service.note && !service.lastIncidentAt) return null;
  return (
    <p className="mt-1.5 text-xs leading-5 text-fg-subtle">
      {service.note}
      {service.note && service.lastIncidentAt ? " " : null}
      {service.lastIncidentAt ? <span>Last incident {formatTimeAgo(service.lastIncidentAt)}.</span> : null}
    </p>
  );
}

export function ServicesTable({ services }: { services: SystemService[] }) {
  const stagger = useStaggerOnce(services.length > 0);

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium text-fg-muted">
              <th scope="col" className="px-5 py-3 font-medium">Service</th>
              <th scope="col" className="px-5 py-3 font-medium">Status</th>
              <th scope="col" className="px-5 py-3 font-medium">Uptime, 30 days</th>
              <th scope="col" className="px-5 py-3 text-right font-medium">Latency</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s, i) => (
              <motion.tr key={s.id} {...stagger(i)} className="border-b border-border last:border-0">
                <td className="px-5 py-3.5 align-top">
                  <p className="font-medium text-fg">{s.name}</p>
                  <p className="text-xs text-fg-muted">{s.description}</p>
                  <Note service={s} />
                </td>
                <td className="px-5 py-3.5 align-top"><ServiceStatusBadge status={s.status} /></td>
                <td className="px-5 py-3.5 align-top"><Uptime service={s} /></td>
                <td className="whitespace-nowrap px-5 py-3.5 text-right align-top tabular text-fg-muted">{s.latencyMs} ms</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-border md:hidden">
        {services.map((s, i) => (
          <motion.li key={s.id} {...stagger(i)} className="flex flex-col gap-2.5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium leading-5 text-fg">{s.name}</p>
                <p className="text-[13px] text-fg-muted">{s.description}</p>
              </div>
              <ServiceStatusBadge status={s.status} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <Uptime service={s} />
              <span className="tabular text-[13px] text-fg-muted">{s.latencyMs} ms</span>
            </div>
            <Note service={s} />
          </motion.li>
        ))}
      </ul>
    </>
  );
}
