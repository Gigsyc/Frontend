"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Dialog, DialogClose, SheetContent } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { DISTRICTS, LANGUAGES, ROLES } from "@/data/roles";
import { useUpdateWorker } from "@/features/workers";
import { formatRwf } from "@/lib/utils";
import type { KigaliDistrict, Language, Worker } from "@/types";

const HEADLINE_MAX = 80;
const BIO_MAX = 600;

interface FormState {
  headline: string;
  bio: string;
  district: KigaliDistrict;
  languages: Language[];
  minShiftPay: string;
  education: string;
}

type Errors = Partial<Record<keyof FormState, string>>;

function validate(f: FormState): Errors {
  const e: Errors = {};
  if (!f.headline.trim()) e.headline = "Add a short headline — it's the first line employers read.";
  else if (f.headline.length > HEADLINE_MAX) e.headline = `Keep it under ${HEADLINE_MAX} characters.`;
  if (f.bio.trim().length < 40) e.bio = "A few sentences (at least 40 characters) about the work you've done.";
  if (f.languages.length === 0) e.languages = "Pick at least one language.";
  if (f.minShiftPay.trim()) {
    const n = Number(f.minShiftPay);
    if (!Number.isFinite(n) || n < 5000 || n > 200000) e.minShiftPay = "Enter an amount between RWF 5,000 and RWF 200,000.";
  }
  return e;
}

function EditProfileForm({ worker, onDone }: { worker: Worker; onDone: () => void }) {
  const update = useUpdateWorker(worker.id);
  const [form, setForm] = useState<FormState>({
    headline: worker.headline,
    bio: worker.bio,
    district: worker.district,
    languages: worker.languages,
    minShiftPay: worker.minShiftPay ? String(worker.minShiftPay) : "",
    education: worker.education ?? "",
  });
  const [attempted, setAttempted] = useState(false);
  const errors = attempted ? validate(form) : {};
  const primary = worker.skills[0];
  const range = primary ? ROLES[primary].typicalPay : undefined;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));
  const toggleLanguage = (l: Language) => set("languages", form.languages.includes(l) ? form.languages.filter((x) => x !== l) : [...form.languages, l]);

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    setAttempted(true);
    if (Object.keys(validate(form)).length) return;
    update.mutate(
      {
        headline: form.headline.trim(),
        bio: form.bio.trim(),
        district: form.district,
        languages: form.languages,
        minShiftPay: form.minShiftPay.trim() ? Number(form.minShiftPay) : undefined,
        education: form.education.trim() || undefined,
      },
      {
        onSuccess: () => { toast.success("Profile updated"); onDone(); },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <form onSubmit={submit} noValidate className="flex min-h-full flex-col">
      <div className="flex flex-1 flex-col gap-5 p-5">
        <Field label="Headline" required error={errors.headline} hint={`${form.headline.length}/${HEADLINE_MAX} · e.g. "Banquet server · 3 yrs hotel experience"`}>
          {(p) => <Input {...p} value={form.headline} maxLength={HEADLINE_MAX} onChange={(e) => set("headline", e.target.value)} />}
        </Field>
        <Field label="About you" required error={errors.bio} hint={`${form.bio.length}/${BIO_MAX} · Where you've worked, what you're good at, what you're studying.`}>
          {(p) => <Textarea {...p} value={form.bio} maxLength={BIO_MAX} rows={5} onChange={(e) => set("bio", e.target.value)} />}
        </Field>
        <Field label="Home district" required>
          {(p) => (
            <Select {...p} value={form.district} onChange={(e) => set("district", e.target.value as KigaliDistrict)}>
              {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </Select>
          )}
        </Field>
        <fieldset className="flex flex-col gap-1.5">
          <legend className="text-sm font-medium text-fg">Languages you work in <span className="text-danger-500">*</span></legend>
          <div className="flex flex-wrap gap-2 pt-1">
            {LANGUAGES.map((l) => <Chip key={l} selected={form.languages.includes(l)} onClick={() => toggleLanguage(l)} className="h-11 sm:h-8">{l}</Chip>)}
          </div>
          {errors.languages ? <p role="alert" className="text-[13px] text-danger-600">{errors.languages}</p> : null}
        </fieldset>
        <Field label="Minimum pay per shift" optional error={errors.minShiftPay} hint={range ? `Typical for ${ROLES[primary].short.toLowerCase()} shifts: ${formatRwf(range[0])} – ${formatRwf(range[1])}. We won't show you shifts below your minimum.` : "We won't show you shifts below your minimum."}>
          {(p) => <Input {...p} type="number" inputMode="numeric" min={0} step={500} value={form.minShiftPay} leading={<span className="text-[13px] font-medium">RWF</span>} className="pl-13" onChange={(e) => set("minShiftPay", e.target.value)} />}
        </Field>
        <Field label="Education" optional hint="Degree or diploma, institution, year.">
          {(p) => <Input {...p} value={form.education} onChange={(e) => set("education", e.target.value)} placeholder="e.g. Diploma in Hospitality, IPRC Kigali (2025)" />}
        </Field>
      </div>
      <div className="sticky bottom-0 flex gap-2 border-t border-border bg-surface p-4">
        <DialogClose asChild><Button type="button" variant="outline" className="flex-1">Cancel</Button></DialogClose>
        <Button type="submit" className="flex-1" loading={update.isPending}>Save changes</Button>
      </div>
    </form>
  );
}

export function EditProfileSheet({ worker, open, onOpenChange }: { worker: Worker; open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <SheetContent title="Edit profile" description="Employers see this on your applications.">
        <EditProfileForm worker={worker} onDone={() => onOpenChange(false)} />
      </SheetContent>
    </Dialog>
  );
}
