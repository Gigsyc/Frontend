"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { normaliseRwMobile, RW_MOBILE_RE } from "@/lib/utils";

interface RefereeForm { name: string; organisation: string; phone: string }
type Errors = Partial<Record<keyof RefereeForm, string>>;

function validate(f: RefereeForm): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 3) e.name = "Enter your referee's full name.";
  if (f.organisation.trim().length < 2) e.organisation = "Where did you work with them?";
  if (!RW_MOBILE_RE.test(normaliseRwMobile(f.phone))) e.phone = "Enter a Rwandan mobile number, e.g. 788 123 456.";
  return e;
}

function AddRefereeForm({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState<RefereeForm>({ name: "", organisation: "", phone: "" });
  const [attempted, setAttempted] = useState(false);
  const [pending, setPending] = useState(false);
  const errors = attempted ? validate(form) : {};
  const set = (key: keyof RefereeForm, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    setAttempted(true);
    if (Object.keys(validate(form)).length) return;
    setPending(true);
    // Prototype: referees are not stored. The real product queues a call from the trust team.
    window.setTimeout(() => {
      setPending(false);
      toast.success(`Referee added: ${form.name.trim()}`, { description: "We'll contact them within 2 days and let you know." });
      onDone();
    }, 600);
  };

  return (
    <form onSubmit={submit} noValidate className="contents">
      <DialogBody className="flex flex-col gap-4">
        <Field label="Referee's name" required error={errors.name}>
          {(p) => <Input {...p} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Diane Mukamana" autoFocus />}
        </Field>
        <Field label="Organisation" required error={errors.organisation} hint="The venue, agency or employer where they supervised you.">
          {(p) => <Input {...p} value={form.organisation} onChange={(e) => set("organisation", e.target.value)} placeholder="e.g. Ikaze Hospitality Group" />}
        </Field>
        <Field label="Phone" required error={errors.phone}>
          {(p) => <Input {...p} type="tel" inputMode="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} leading={<span className="text-[13px] font-medium">+250</span>} className="pl-14" placeholder="788 123 456" />}
        </Field>
        <p className="text-[13px] text-fg-muted">We only ask referees to confirm you worked with them and how it went. Their number stays with GigSyc.</p>
      </DialogBody>
      <DialogFooter>
        <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
        <Button type="submit" loading={pending}>Add referee</Button>
      </DialogFooter>
    </form>
  );
}

export function AddRefereeDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Add a referee</DialogTitle>
          <DialogDescription>Someone who supervised you on a shift or job.</DialogDescription>
        </DialogHeader>
        <AddRefereeForm onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
