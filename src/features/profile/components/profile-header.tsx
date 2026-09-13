"use client";

import { format, parseISO } from "date-fns";
import { ArrowRight, CheckCircle2, MapPin, Pencil, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkerAvatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { VerifiedMark } from "@/components/ui/verified";
import type { Worker } from "@/types";
import { computeProfileStrength, type StrengthActionKind } from "../lib/profile-strength";

interface ProfileHeaderProps {
  worker: Worker;
  onEdit: () => void;
  onAction: (kind: StrengthActionKind) => void;
}

/** Reputation card: identity, the three numbers employers rank on, and one thing to do next. */
export function ProfileHeader({ worker, onEdit, onAction }: ProfileHeaderProps) {
  const strength = computeProfileStrength(worker);
  const complete = strength.percent === 100;

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start gap-3 sm:gap-4">
        <WorkerAvatar worker={worker} size="xl" className="size-16 text-xl sm:size-20 sm:text-2xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <h2 className="text-xl font-semibold leading-tight">{worker.firstName} {worker.lastName}</h2>
            <VerifiedMark verifications={worker.verifications} size="md" />
          </div>
          <p className="mt-0.5 text-sm text-fg-muted">{worker.headline}</p>
          <p className="mt-1.5 inline-flex items-center gap-1.5 text-[13px] text-fg-muted">
            <MapPin className="size-3.5 text-fg-subtle" aria-hidden />
            {worker.district} · {worker.languages.join(", ")}
          </p>
          <p className="text-[13px] text-fg-subtle">Member since {format(parseISO(worker.joinedAt), "MMMM yyyy")}</p>
        </div>
        <Button variant="outline" size="sm" onClick={onEdit} className="min-h-11 min-w-11 shrink-0 sm:min-h-8 sm:min-w-0" aria-label="Edit profile">
          <Pencil /> <span className="hidden sm:inline">Edit</span>
        </Button>
      </div>

      <dl className="mt-5 grid grid-cols-3 divide-x divide-border rounded-md bg-canvas">
        <div className="px-3 py-3 text-center">
          <dt className="text-xs font-medium text-fg-muted">Rating</dt>
          <dd className="mt-1 inline-flex items-baseline gap-1 font-display text-xl font-semibold text-navy-900 tabular">
            <Star className="size-4 translate-y-0.5 fill-amber-500 text-amber-500" aria-hidden />
            {worker.rating.toFixed(1)}
            <span className="text-xs font-normal text-fg-muted">({worker.ratingCount})</span>
          </dd>
        </div>
        <div className="px-3 py-3 text-center">
          <dt className="text-xs font-medium text-fg-muted">Reliability</dt>
          <dd className="mt-1 font-display text-xl font-semibold text-navy-900 tabular">{worker.reliability}%</dd>
        </div>
        <div className="px-3 py-3 text-center">
          <dt className="text-xs font-medium text-fg-muted">Shifts done</dt>
          <dd className="mt-1 font-display text-xl font-semibold text-navy-900 tabular">{worker.completedShifts}</dd>
        </div>
      </dl>

      <div className="mt-5">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-medium text-fg">Profile strength</span>
          <span className="font-semibold text-navy-900 tabular">{strength.percent}%</span>
        </div>
        <Progress value={strength.percent} tone={complete ? "success" : "navy"} className="mt-2" label="Profile strength" />
        {strength.next ? (
          <Button variant="secondary" onClick={() => onAction(strength.next!.action.kind)} className="mt-3 min-h-11 w-full justify-between px-3 text-sm">
            <span className="inline-flex min-w-0 items-center gap-2">
              <Sparkles className="text-amber-600" aria-hidden />
              <span className="truncate"><span className="font-normal text-fg-muted">Next:</span> {strength.next.action.label}</span>
            </span>
            <ArrowRight aria-hidden />
          </Button>
        ) : (
          <div className="mt-3 flex flex-col gap-2 text-[13px] sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <span className="inline-flex items-center gap-1.5 text-fg-muted">
              <CheckCircle2 className="size-4 shrink-0 text-success-600" aria-hidden />
              Complete. Employers see every trust signal you&rsquo;ve earned.
            </span>
            <Button variant="outline" size="sm" onClick={() => onAction("certification")} className="min-h-11 sm:min-h-8 sm:shrink-0">Add a certification</Button>
          </div>
        )}
      </div>
    </Card>
  );
}
