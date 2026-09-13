import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DistributionBar } from "@/components/ui/chart";
import { EmptyState } from "@/components/ui/empty-state";
import { ROLES } from "@/data/roles";
import { Users } from "lucide-react";
import type { EmployerSummary } from "../compute";

const PALETTE = ["bg-navy-900", "bg-navy-500", "bg-amber-500", "bg-cyan-500", "bg-ink-400", "bg-navy-200"];

export function RoleMix({ mix }: { mix: EmployerSummary["roleMix"] }) {
  const withWorkers = mix.filter((r) => r.workers > 0).slice(0, 6);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Role mix</CardTitle>
        <CardDescription>Workers confirmed per role, all shifts</CardDescription>
      </CardHeader>
      <CardContent>
        {withWorkers.length === 0 ? (
          <EmptyState compact icon={Users} title="No confirmed workers yet" description="Role mix fills in once workers are confirmed on your shifts." />
        ) : (
          <DistributionBar segments={withWorkers.map((r, i) => ({ label: ROLES[r.role].short, value: r.workers, className: PALETTE[i % PALETTE.length] }))} />
        )}
      </CardContent>
    </Card>
  );
}
