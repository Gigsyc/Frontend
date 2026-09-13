"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/input";
import type { Worker } from "@/types";

const MAX = 160;

interface Props {
  worker: Pick<Worker, "firstName" | "lastName">;
  note: string;
  open: boolean;
  /** True while the note mutation is in flight — locks the dialog and shows the spinner. */
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (note: string) => void;
}

/** Private team note about a pool member. Kept short on purpose — it's a reminder, not a review. */
export function PoolNoteDialog({ worker, note, open, saving, onOpenChange, onSave }: Props) {
  return (
    <Dialog open={open} onOpenChange={(o) => !saving && onOpenChange(o)}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Note about {worker.firstName}</DialogTitle>
          <DialogDescription>Private to your team. {worker.firstName} never sees it.</DialogDescription>
        </DialogHeader>
        {/* Form state lives below DialogContent so Radix resets it every time the dialog opens. */}
        <NoteForm note={note} saving={saving} onCancel={() => onOpenChange(false)} onSave={onSave} />
      </DialogContent>
    </Dialog>
  );
}

interface FormProps { note: string; saving: boolean; onCancel: () => void; onSave: (note: string) => void }

function NoteForm({ note, saving, onCancel, onSave }: FormProps) {
  const [value, setValue] = useState(note);
  const [error, setError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);

  const validate = (v: string) => {
    const trimmed = v.trim();
    if (!trimmed) return "Add a few words, or cancel to leave it empty.";
    if (trimmed.length > MAX) return `Keep it under ${MAX} characters.`;
    return undefined;
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setTouched(true);
    const err = validate(value);
    setError(err);
    if (err) return;
    onSave(value.trim());
  };

  return (
    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col" noValidate>
      <DialogBody>
        <Field label="Note" hint={`${value.trim().length}/${MAX}`} error={error}>
          {(p) => (
            <Textarea
              {...p}
              value={value}
              autoFocus
              disabled={saving}
              placeholder="e.g. Requested by name for VIP tables. Prefers evening shifts."
              onChange={(e) => {
                setValue(e.target.value);
                if (touched) setError(validate(e.target.value));
              }}
              onBlur={() => touched && setError(validate(value))}
            />
          )}
        </Field>
      </DialogBody>
      <DialogFooter>
        {note ? (
          <Button type="button" variant="danger-soft" className="sm:mr-auto" onClick={() => onSave("")} disabled={saving}>
            Delete note
          </Button>
        ) : null}
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" loading={saving}>Save note</Button>
      </DialogFooter>
    </form>
  );
}
