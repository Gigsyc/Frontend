"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SwitchField } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/input";
import { APP_LANGUAGES, DEFAULT_NOTIFICATION_PREFS, NOTIFICATION_PREFS, type NotificationPrefs } from "../../lib/settings-options";

export function NotificationsCard() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_NOTIFICATION_PREFS);

  const toggle = (key: keyof NotificationPrefs, on: boolean) => {
    setPrefs((p) => ({ ...p, [key]: on }));
    const label = NOTIFICATION_PREFS.find((n) => n.key === key)!.label;
    toast.success(on ? `${label} on` : `${label} off`);
  };

  return (
    <Card>
      <CardHeader className="px-4 sm:px-5">
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Push and SMS. Shift confirmations always come through — you can&rsquo;t switch those off.</CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-2 pt-3 sm:px-5">
        <ul className="divide-y divide-border">
          {NOTIFICATION_PREFS.map((n) => (
            <li key={n.key} className="py-3">
              <SwitchField label={n.label} description={n.description} checked={prefs[n.key]} onCheckedChange={(on) => toggle(n.key, on)} className="min-h-11" />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function LanguageCard() {
  const [lang, setLang] = useState<(typeof APP_LANGUAGES)[number]["value"]>("en");

  return (
    <Card>
      <CardHeader className="px-4 sm:px-5">
        <CardTitle>Language</CardTitle>
        <CardDescription>The language GigSyc uses for menus, reminders and SMS.</CardDescription>
      </CardHeader>
      <CardContent className="px-4 pt-3 sm:px-5">
        <Field label="App language" className="max-w-xs">
          {(p) => (
            <Select
              {...p}
              value={lang}
              onChange={(e) => {
                const next = e.target.value as typeof lang;
                setLang(next);
                if (next !== "en") toast.info("Language switching isn't in the prototype", { description: `${APP_LANGUAGES.find((l) => l.value === next)!.label} is planned for launch.` });
              }}
            >
              {APP_LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </Select>
          )}
        </Field>
      </CardContent>
    </Card>
  );
}

export function PrivacyCard() {
  const [discoverable, setDiscoverable] = useState(true);

  return (
    <Card>
      <CardHeader className="px-4 sm:px-5">
        <CardTitle>Privacy</CardTitle>
        <CardDescription>Employers you&rsquo;ve worked with can always see your profile and history.</CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-2 pt-3 sm:px-5">
        <SwitchField
          label="Show my profile to employers I haven't worked with"
          description={discoverable ? "You appear in talent searches across Kigali." : "Only employers who have booked you before can find you. You can still apply to open shifts."}
          checked={discoverable}
          onCheckedChange={(on) => {
            setDiscoverable(on);
            toast.success(on ? "You're visible in talent searches" : "Hidden from new employers", { description: on ? undefined : "Applications you send still show your full profile." });
          }}
          className="min-h-11 py-3"
        />
      </CardContent>
    </Card>
  );
}
