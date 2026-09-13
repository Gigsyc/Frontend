"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, SheetContent } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import { PLACES } from "@/data/events";
import { useAuth } from "@/features/auth";
import { errorMessage } from "@/lib/utils";
import type { AuthUser, RwandaPlace } from "@/types";

const NAME_MAX = 60;

interface FormState {
  name: string;
  /** Empty until a place has actually been picked — a blank profile must not inherit Kigali. */
  location: RwandaPlace | "";
}

type Errors = Partial<Record<keyof FormState, string>>;

function validate(f: FormState): Errors {
  const e: Errors = {};
  const name = f.name.trim();
  if (!name) e.name = "Tell us what to call you.";
  else if (name.length < 2) e.name = "That looks too short to be a name.";
  else if (name.length > NAME_MAX) e.name = `Keep it under ${NAME_MAX} characters.`;
  return e;
}

function EditProfileForm({ user, onDone }: { user: AuthUser; onDone: () => void }) {
  const { updateUser } = useAuth();
  const [form, setForm] = useState<FormState>({ name: user.name, location: user.location ?? "" });
  const [errors, setErrors] = useState<Errors>({});
  const [attempted, setAttempted] = useState(false);
  const [saving, setSaving] = useState(false);

  // Validation runs on submit, then again when a field is left — never on every keystroke.
  const recheck = () => { if (attempted) setErrors(validate(form)); };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setAttempted(true);
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    const name = form.name.trim();
    try {
      // Only send a place the person actually chose: "Events near Kigali" and the homepage
      // heading both quote this back to them as something they told us.
      await updateUser(form.location ? { name, location: form.location } : { name });
      toast.success("Profile updated", {
        description: form.location ? `You're ${name}, based in ${form.location}.` : `You're ${name}.`,
      });
      onDone();
    } catch (err) {
      toast.error(errorMessage(err, "We couldn't save your profile. Try again."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex min-h-full flex-col">
      <div className="flex flex-1 flex-col gap-5 p-5">
        <Field label="Name" required error={errors.name} hint="Shown on your profile and to organisers you book with.">
          {(p) => (
            <Input
              {...p}
              value={form.name}
              maxLength={NAME_MAX}
              autoComplete="name"
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              onBlur={recheck}
            />
          )}
        </Field>

        <Field label="Where you're based" hint="We lead with what's on near you. Change it any time.">
          {(p) => (
            <Select
              {...p}
              value={form.location}
              autoComplete="address-level2"
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value as RwandaPlace }))}
            >
              <option value="" disabled>Choose a place</option>
              {PLACES.map((place) => <option key={place} value={place}>{place}</option>)}
            </Select>
          )}
        </Field>
      </div>

      <div className="sticky bottom-0 flex gap-2 border-t border-border bg-surface p-4">
        <DialogClose asChild><Button type="button" variant="outline" className="h-11 flex-1">Cancel</Button></DialogClose>
        <Button type="submit" className="h-11 flex-1" loading={saving}>Save changes</Button>
      </div>
    </form>
  );
}

export function EditProfileSheet({ user, open, onOpenChange }: {
  user: AuthUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <SheetContent title="Edit profile" description="Your name and where you're based.">
        <EditProfileForm user={user} onDone={() => onOpenChange(false)} />
      </SheetContent>
    </Dialog>
  );
}
