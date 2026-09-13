"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import { PLACES } from "@/data/events";
import type { RwandaPlace } from "@/types";
import { useSimulatedSave } from "./use-simulated-save";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Errors {
  name?: string;
  email?: string;
}

export function PlatformTab() {
  const { saving, save } = useSimulatedSave("Platform name, support address and default city updated.");
  const [name, setName] = useState("GigSyc");
  const [email, setEmail] = useState("support@gigsyc.rw");
  const [city, setCity] = useState<RwandaPlace>("Kigali");
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (values: { name: string; email: string }): Errors => ({
    name: values.name.trim() ? undefined : "The platform needs a name — customers see it on every page.",
    email: EMAIL_RE.test(values.email.trim()) ? undefined : "Enter an address people can actually reply to.",
  });

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    setSubmitted(true);
    const next = validate({ name, email });
    setErrors(next);
    if (next.name || next.email) return;
    save();
  };

  const recheck = (patch: { name?: string; email?: string }) => {
    if (!submitted) return;
    setErrors(validate({ name: patch.name ?? name, email: patch.email ?? email }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform</CardTitle>
        <CardDescription>How GigSyc names itself and where customer mail lands.</CardDescription>
      </CardHeader>
      <form onSubmit={submit} noValidate>
        <CardContent className="grid gap-5 pt-4 sm:grid-cols-2">
          <Field label="Platform name" required error={errors.name} hint="Used in page titles, emails and the footer.">
            {(p) => (
              <Input
                {...p}
                value={name}
                maxLength={40}
                onChange={(e) => { setName(e.target.value); recheck({ name: e.target.value }); }}
                onBlur={() => recheck({})}
              />
            )}
          </Field>
          <Field label="Support email" required error={errors.email} hint="Replies from customers and organisers go here.">
            {(p) => (
              <Input
                {...p}
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); recheck({ email: e.target.value }); }}
                onBlur={() => recheck({})}
              />
            )}
          </Field>
          <Field label="Default city" hint="Where /events opens before a customer picks a place.">
            {(p) => (
              <Select {...p} value={city} onChange={(e) => setCity(e.target.value as RwandaPlace)}>
                {PLACES.map((place) => <option key={place} value={place}>{place}</option>)}
              </Select>
            )}
          </Field>
          <Field label="Timezone" hint="Every event time on GigSyc is Rwandan local time.">
            {(p) => <Input {...p} value="Africa/Kigali" readOnly aria-readonly="true" className="bg-ink-50 text-fg-muted" />}
          </Field>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" loading={saving}>Save platform settings</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
