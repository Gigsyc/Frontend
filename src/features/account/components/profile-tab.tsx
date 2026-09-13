"use client";

import Link from "next/link";
import { BadgeCheck, Pencil, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DataList } from "@/components/ui/data-list";
import { Button } from "@/components/ui/button";
import { INTERESTS, ROLE_LABEL } from "@/data/auth";
import { formatDate, pluralize } from "@/lib/utils";
import type { AuthUser } from "@/types";
import { EditProfileSheet } from "./edit-profile-sheet";

/** Cyan for a verified address, a plain link to /verify-email when it is still outstanding. */
function EmailState({ user }: { user: AuthUser }) {
  if (user.emailVerified) {
    return (
      <span className="inline-flex items-center gap-1 text-[13px] font-medium text-cyan-700" title="Email verified">
        <BadgeCheck className="size-4 fill-cyan-100" aria-hidden /> Email verified
      </span>
    );
  }
  return (
    <Link
      href="/verify-email"
      className="inline-flex min-h-[24px] items-center gap-1 rounded-sm text-[13px] font-medium text-warning-700 underline-offset-2 hover:underline"
    >
      <ShieldAlert className="size-4" aria-hidden /> Verify your email
    </Link>
  );
}

export function ProfileTab({ user }: { user: AuthUser }) {
  const [editing, setEditing] = useState(false);

  const isCustomer = user.role === "customer";
  // "Member since" is the header line's job, so it is not repeated here.
  const facts = [
    { label: "Based in", value: user.location ?? "Not set yet" },
    { label: "Signs in with", value: user.signInMethod === "google" ? "Google" : "Email and password" },
  ];
  // Interests only drive the customer's event rows, so they are only a fact on a customer profile.
  if (isCustomer) {
    const labels = user.interests.flatMap((i) => INTERESTS[i]?.label ?? []);
    facts.push({ label: "Interests", value: labels.length ? labels.join(", ") : "None picked yet" });
  }
  if (user.organization) facts.push({ label: "Organisation", value: user.organization.name });

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:gap-6">
          <Avatar name={user.name} color={user.avatarColor} size="lg" className="shrink-0" />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <h2 className="truncate font-display text-xl font-semibold text-navy-900">{user.name}</h2>
              <Badge tone="navy">{ROLE_LABEL[user.role]}</Badge>
            </div>
            <p className="mt-1 truncate text-sm text-fg-muted">{user.email}</p>
            <p className="mt-2.5"><EmailState user={user} /></p>
            <p className="mt-1 text-[13px] text-fg-subtle">
              Member since {formatDate(user.createdAt)}
              {isCustomer ? ` · ${pluralize(user.interests.length, "interest")}` : ""}
            </p>
          </div>

          <Button variant="outline" className="h-11 w-full shrink-0 sm:w-auto" onClick={() => setEditing(true)}>
            <Pencil /> Edit profile
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h3 className="text-base font-semibold">Your details</h3>
          <DataList items={facts} columns={2} className="mt-4" />
        </CardContent>
      </Card>

      <EditProfileSheet user={user} open={editing} onOpenChange={setEditing} />
    </div>
  );
}
