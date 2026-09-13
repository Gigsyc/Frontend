"use client";

import { useState } from "react";
import { toast } from "sonner";
import { RoleIcon } from "@/components/common/role-icon";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Dialog, DialogClose, SheetContent } from "@/components/ui/dialog";
import { ROLE_LIST, SECTORS } from "@/data/roles";
import { useUpdateWorker } from "@/features/workers";
import type { RoleCategory, Sector, Worker } from "@/types";

const MAX_SKILLS = 6;
const SECTOR_ORDER = Object.keys(SECTORS) as Sector[];

function EditSkillsForm({ worker, onDone }: { worker: Worker; onDone: () => void }) {
  const update = useUpdateWorker(worker.id);
  const [skills, setSkills] = useState<RoleCategory[]>(worker.skills);
  const [attempted, setAttempted] = useState(false);
  const error = attempted && skills.length === 0 ? "Pick at least one role." : undefined;
  const full = skills.length >= MAX_SKILLS;

  const toggle = (r: RoleCategory) => setSkills((s) => (s.includes(r) ? s.filter((x) => x !== r) : full ? s : [...s, r]));

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    setAttempted(true);
    if (skills.length === 0) return;
    update.mutate({ skills }, {
      onSuccess: () => { toast.success("Skills updated", { description: `${skills.length} role${skills.length === 1 ? "" : "s"} on your profile. The first one is your primary.` }); onDone(); },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <form onSubmit={submit} noValidate className="flex min-h-full flex-col">
      <div className="flex flex-1 flex-col gap-5 p-5">
        <p className="text-sm text-fg-muted">Choose up to {MAX_SKILLS}. Order matters: the first is what we match you on most. <span className="font-medium tabular text-fg">{skills.length}/{MAX_SKILLS}</span></p>
        {full ? <p role="status" className="-mt-3 text-[13px] text-fg-muted">You&rsquo;ve picked {MAX_SKILLS}. Remove a role to add another.</p> : null}
        {skills.length ? (
          <ol className="flex flex-wrap gap-2" aria-label="Selected roles in order">
            {skills.map((r, i) => {
              const role = ROLE_LIST.find((x) => x.id === r)!;
              return <li key={r} className="inline-flex items-center gap-1.5 rounded-full bg-navy-50 py-1 pl-1 pr-3 text-[13px] font-medium text-navy-900"><RoleIcon role={r} size="sm" className="size-6 rounded-full [&_svg]:size-3.5" />{i === 0 ? `${role.short} · primary` : role.short}</li>;
            })}
          </ol>
        ) : null}
        {SECTOR_ORDER.map((sector) => (
          <fieldset key={sector} className="flex flex-col gap-2">
            <legend className="text-[13px] font-medium text-fg-muted">{SECTORS[sector].label}</legend>
            <div className="flex flex-wrap gap-2 pt-1">
              {ROLE_LIST.filter((r) => r.sector === sector).map((r) => {
                const selected = skills.includes(r.id);
                return (
                  <Chip
                    key={r.id}
                    selected={selected}
                    disabled={!selected && full}
                    onClick={() => toggle(r.id)}
                    className="h-11 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border-strong disabled:hover:bg-surface sm:h-8"
                  >
                    {r.label}
                  </Chip>
                );
              })}
            </div>
          </fieldset>
        ))}
        {error ? <p role="alert" className="text-[13px] text-danger-600">{error}</p> : null}
      </div>
      <div className="sticky bottom-0 flex gap-2 border-t border-border bg-surface p-4">
        <DialogClose asChild><Button type="button" variant="outline" className="flex-1">Cancel</Button></DialogClose>
        <Button type="submit" className="flex-1" loading={update.isPending}>Save skills</Button>
      </div>
    </form>
  );
}

export function EditSkillsSheet({ worker, open, onOpenChange }: { worker: Worker; open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <SheetContent title="Edit skills" description="Roles you're ready to be booked for.">
        <EditSkillsForm worker={worker} onDone={() => onOpenChange(false)} />
      </SheetContent>
    </Dialog>
  );
}
