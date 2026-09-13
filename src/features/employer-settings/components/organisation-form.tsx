"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { DISTRICTS, SECTORS } from "@/data/roles";
import type { Employer, KigaliDistrict, Sector } from "@/types";
import { EMAIL_RE } from "../team";

interface FormState {
  name: string;
  sector: Sector;
  district: KigaliDistrict;
  about: string;
  contactName: string;
  contactRole: string;
  email: string;
  phone: string;
}
type Errors = Partial<Record<keyof FormState, string>>;

const ABOUT_MAX = 600;

function validate(f: FormState): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = "Give your organisation a name workers will recognise.";
  if (f.about.length > ABOUT_MAX) e.about = `Keep it under ${ABOUT_MAX} characters.`;
  if (f.contactName.trim().length < 2) e.contactName = "Who should workers ask for on site?";
  if (!EMAIL_RE.test(f.email.trim())) e.email = "Enter a valid email, e.g. events@yourcompany.rw";
  if (!/^\+?[\d\s]{9,16}$/.test(f.phone.trim())) e.phone = "Enter a Rwandan mobile number, e.g. +250 788 000 000";
  return e;
}

/** Mounted only once the employer has loaded, so initial state can come straight from props. */
export function OrganisationForm({ employer }: { employer: Employer }) {
  const [form, setForm] = useState<FormState>({
    name: employer.name,
    sector: employer.sector,
    district: employer.district,
    about: employer.about,
    contactName: employer.contact.name,
    contactRole: employer.contact.role,
    email: employer.contact.email,
    phone: employer.contact.phone,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof FormState>(key: K) => (value: FormState[K]) => {
    const next = { ...form, [key]: value };
    setForm(next);
    if (submitted) setErrors(validate(next));
  };
  const onBlur = () => { if (submitted) setErrors(validate(form)); };

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    setSubmitted(true);
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    // Prototype: the organisation profile is read-only in the mock store, so we simulate the round-trip.
    window.setTimeout(() => {
      setSaving(false);
      toast.success("Organisation details saved", { description: "Workers see the new details on your next posting." });
    }, 600);
  };

  return (
    <Card>
      <form onSubmit={onSubmit} noValidate>
        <CardHeader>
          <CardTitle>Organisation</CardTitle>
          <CardDescription>What workers see on your shift postings and profile.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <Field label="Organisation name" required error={errors.name}>
            {(p) => <Input {...p} value={form.name} onChange={(e) => set("name")(e.target.value)} onBlur={onBlur} autoComplete="organization" />}
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Sector" hint="Sets the default roles when you post.">
              {(p) => (
                <Select {...p} value={form.sector} onChange={(e) => set("sector")(e.target.value as Sector)}>
                  {(Object.keys(SECTORS) as Sector[]).map((s) => <option key={s} value={s}>{SECTORS[s].label}</option>)}
                </Select>
              )}
            </Field>
            <Field label="District" hint="Where your main venue is.">
              {(p) => (
                <Select {...p} value={form.district} onChange={(e) => set("district")(e.target.value as KigaliDistrict)}>
                  {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </Select>
              )}
            </Field>
          </div>
          <Field label="About" hint={`${form.about.length}/${ABOUT_MAX} · Two or three sentences on what you do and what shifts are like.`} error={errors.about}>
            {(p) => <Textarea {...p} value={form.about} onChange={(e) => set("about")(e.target.value)} onBlur={onBlur} rows={4} />}
          </Field>

          <fieldset className="flex flex-col gap-5 border-t border-border pt-5">
            <legend className="float-left mb-1 w-full text-sm font-semibold text-fg">Main contact</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Name" required error={errors.contactName}>
                {(p) => <Input {...p} value={form.contactName} onChange={(e) => set("contactName")(e.target.value)} onBlur={onBlur} autoComplete="name" />}
              </Field>
              <Field label="Job title" optional>
                {(p) => <Input {...p} value={form.contactRole} onChange={(e) => set("contactRole")(e.target.value)} autoComplete="organization-title" />}
              </Field>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Email" required error={errors.email} hint="Invoices and applicant alerts go here.">
                {(p) => <Input {...p} type="email" inputMode="email" value={form.email} onChange={(e) => set("email")(e.target.value)} onBlur={onBlur} autoComplete="email" />}
              </Field>
              <Field label="Phone" required error={errors.phone} hint="Shown to confirmed workers on shift day.">
                {(p) => <Input {...p} type="tel" inputMode="tel" value={form.phone} onChange={(e) => set("phone")(e.target.value)} onBlur={onBlur} autoComplete="tel" />}
              </Field>
            </div>
          </fieldset>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" loading={saving}>{saving ? "Saving" : "Save changes"}</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
