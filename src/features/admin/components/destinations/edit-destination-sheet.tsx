"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, SheetContent } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { useUpdateDestination } from "@/features/admin";
import { errorMessage } from "@/lib/utils";
import type { Destination } from "@/types";

type UpdateMutation = ReturnType<typeof useUpdateDestination>;

interface Props {
  destination: Destination | null;
  onClose: () => void;
}

interface FormState {
  tagline: string;
  description: string;
  knownFor: string;
  travelFromKigali: string;
}

const toForm = (d: Destination): FormState => ({
  tagline: d.tagline,
  description: d.description,
  knownFor: d.knownFor.join(", "),
  travelFromKigali: d.travelFromKigali ?? "",
});

/** Keyed by destination id from the sheet, so opening a different place starts from its own copy. */
function EditDestinationForm({ destination, update, onClose }: { destination: Destination; update: UpdateMutation; onClose: () => void }) {
  const [form, setForm] = useState<FormState>(() => toForm(destination));
  const [error, setError] = useState<string | undefined>();

  const set = (patch: Partial<FormState>) => setForm({ ...form, ...patch });

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    const tagline = form.tagline.trim();
    if (!tagline) {
      setError("A place needs a one-line tagline.");
      return;
    }
    setError(undefined);
    update.mutate(
      {
        id: destination.id,
        patch: {
          tagline,
          description: form.description.trim(),
          knownFor: form.knownFor.split(",").map((s) => s.trim()).filter(Boolean),
          travelFromKigali: form.travelFromKigali.trim() || undefined,
        },
      },
      {
        onSuccess: (d) => {
          toast.success(`Saved. ${d.name} reads the new way on the public site.`);
          onClose();
        },
        onError: (err) => toast.error(errorMessage(err, "We couldn't save this place. Try again.")),
      },
    );
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5 px-5 py-5">
      <Field label="Tagline" required error={error} hint="One line, shown under the name on cards.">
        {(p) => <Input {...p} value={form.tagline} onChange={(e) => set({ tagline: e.target.value })} maxLength={90} />}
      </Field>
      <Field label="Description" hint="The paragraph on the place page.">
        {(p) => <Textarea {...p} rows={6} value={form.description} onChange={(e) => set({ description: e.target.value })} />}
      </Field>
      <Field label="Known for" hint="Comma separated, e.g. Canopy walkway, Chimpanzee tracking">
        {(p) => <Input {...p} value={form.knownFor} onChange={(e) => set({ knownFor: e.target.value })} />}
      </Field>
      <Field label="Travel from Kigali" optional hint="Leave blank for Kigali itself.">
        {(p) => <Input {...p} placeholder="2h 30m by road" value={form.travelFromKigali} onChange={(e) => set({ travelFromKigali: e.target.value })} />}
      </Field>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <DialogClose asChild><Button type="button" variant="ghost" disabled={update.isPending}>Cancel</Button></DialogClose>
        <Button type="submit" loading={update.isPending}>Save changes</Button>
      </div>
    </form>
  );
}

/** Copy the public destination page shows. Status lives on the row, not in here. */
export function EditDestinationSheet({ destination, onClose }: Props) {
  const update = useUpdateDestination();
  if (!destination) return null;

  return (
    <Dialog open onOpenChange={(o) => { if (!o && !update.isPending) onClose(); }}>
      <SheetContent title={`Edit ${destination.name}`} description={destination.region}>
        <EditDestinationForm key={destination.id} destination={destination} update={update} onClose={onClose} />
      </SheetContent>
    </Dialog>
  );
}
