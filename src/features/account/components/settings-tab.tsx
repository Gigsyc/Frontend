"use client";

import { LogOut, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SwitchField } from "@/components/ui/checkbox";
import {
  Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import type { AuthUser } from "@/types";
import { useSignOut } from "../use-sign-out";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "rw", label: "Kinyarwanda" },
  { value: "fr", label: "Français" },
] as const;

type LanguageCode = (typeof LANGUAGES)[number]["value"];

/** The two preferences this tab holds. Lifted to `<AccountScreen>` so a tab switch keeps them. */
export interface AccountPrefs {
  emailUpdates: boolean;
  language: LanguageCode;
}

export const DEFAULT_ACCOUNT_PREFS: AccountPrefs = { emailUpdates: true, language: "en" };

const PROTOTYPE = "This is a prototype, so nothing changes outside this browser.";

function DeleteAccountDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="danger-soft" className="h-11"><Trash2 /> Delete account</Button>
      </DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Delete your account?</DialogTitle>
          <DialogDescription>This would remove your profile, your interests and everything you have saved.</DialogDescription>
        </DialogHeader>
        <DialogBody className="text-sm text-fg-muted">
          Deleting is permanent on the real platform. Nothing is deleted here — {PROTOTYPE.toLowerCase()}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline" className="h-11">Keep my account</Button></DialogClose>
          <Button
            variant="danger"
            className="h-11"
            onClick={() => {
              setOpen(false);
              // Nothing happened, so this is not a success — the plain toast says so.
              toast("Nothing was deleted", { description: "Account deletion is not wired up in the prototype." });
            }}
          >
            Delete account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface SettingsTabProps {
  user: AuthUser;
  prefs: AccountPrefs;
  onPrefsChange: (next: AccountPrefs) => void;
}

export function SettingsTab({ user, prefs, onPrefsChange }: SettingsTabProps) {
  const signOut = useSignOut();

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-5">
          <h2 className="text-base font-semibold">Account</h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <Field label="Account email" className="flex-1" hint="Used to sign in and for anything we send you.">
              {(p) => <Input {...p} value={user.email} readOnly autoComplete="email" className="bg-ink-50" />}
            </Field>
            <Button
              variant="outline"
              className="h-11 sm:h-10"
              onClick={() => toast("Email changes aren't in the prototype", { description: PROTOTYPE })}
            >
              Change
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="text-base font-semibold">Notifications</h2>
          <SwitchField
            className="mt-4 min-h-[44px]"
            label="Email me about events"
            description="Weekly picks near you, plus reminders for anything you've saved."
            checked={prefs.emailUpdates}
            onCheckedChange={(emailUpdates) => {
              onPrefsChange({ ...prefs, emailUpdates });
              toast(emailUpdates ? "Event emails on" : "Event emails off", { description: PROTOTYPE });
            }}
          />
          <p className="mt-2 text-[13px] text-fg-subtle">Nothing is emailed in the prototype.</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="text-base font-semibold">Language</h2>
          <Field label="Interface language" className="mt-4 max-w-xs" hint="Rwanda's three working languages.">
            {(p) => (
              <Select
                {...p}
                value={prefs.language}
                onChange={(e) => {
                  const language = e.target.value as LanguageCode;
                  onPrefsChange({ ...prefs, language });
                  // English is the one language the interface is already in, so it needs no warning.
                  const label = LANGUAGES.find((l) => l.value === language)?.label;
                  if (language === "en" || !label) return;
                  toast(`${label} isn't in the prototype yet`, { description: PROTOTYPE });
                }}
              >
                {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </Select>
            )}
          </Field>
        </CardContent>
      </Card>

      <Card className="bg-danger-50/40">
        <CardContent className="p-5">
          <h2 className="text-base font-semibold text-danger-700">Danger zone</h2>
          <p className="mt-1 text-sm text-fg-muted">Sign out of this browser, or close your account for good.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="outline" className="h-11" onClick={signOut}><LogOut /> Log out</Button>
            <DeleteAccountDialog />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
