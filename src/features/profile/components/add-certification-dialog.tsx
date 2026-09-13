"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useUpdateWorker } from "@/features/workers";
import type { Worker } from "@/types";

function AddCertificationForm({ worker, onDone }: { worker: Worker; onDone: () => void }) {
  const update = useUpdateWorker(worker.id);
  const [name, setName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [attempted, setAttempted] = useState(false);
  const nameError = attempted && name.trim().length < 3 ? "Enter the certificate name." : undefined;
  const duplicate = attempted && worker.certifications.some((c) => c.toLowerCase().startsWith(name.trim().toLowerCase())) ? "You've already listed this one." : undefined;

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    setAttempted(true);
    if (name.trim().length < 3 || duplicate) return;
    const entry = issuer.trim() ? `${name.trim()} — ${issuer.trim()}` : name.trim();
    update.mutate({ certifications: [...worker.certifications, entry] }, {
      onSuccess: () => { toast.success("Certification added", { description: entry }); onDone(); },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <form onSubmit={submit} noValidate className="contents">
      <DialogBody className="flex flex-col gap-4">
        <Field label="Certificate" required error={nameError ?? duplicate}>
          {(p) => <Input {...p} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Food Safety Level 2" autoFocus />}
        </Field>
        <Field label="Issued by" optional hint="Training school, employer or programme.">
          {(p) => <Input {...p} value={issuer} onChange={(e) => setIssuer(e.target.value)} placeholder="e.g. Rwanda Polytechnic" />}
        </Field>
        <p className="text-[13px] text-fg-muted">Employers see the name and issuer. Bring the certificate to your first shift if a job asks for proof.</p>
      </DialogBody>
      <DialogFooter>
        <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
        <Button type="submit" loading={update.isPending}>Add certification</Button>
      </DialogFooter>
    </form>
  );
}

export function AddCertificationDialog({ worker, open, onOpenChange }: { worker: Worker; open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Add a certification</DialogTitle>
          <DialogDescription>Courses and licences that make you a safer bet for specialist shifts.</DialogDescription>
        </DialogHeader>
        <AddCertificationForm worker={worker} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
