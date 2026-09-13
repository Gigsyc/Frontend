"use client";

import { ChevronRight, UserPlus } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GoogleMark } from "@/components/ui/google-button";
import { Spinner } from "@/components/ui/spinner";
import { GOOGLE_ACCOUNTS } from "@/data/mocks/accounts";
import { cn } from "@/lib/utils";
import type { GoogleAccount } from "../../auth-service";

interface GoogleSignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Row currently signing in. */
  pendingEmail: string | null;
  onChoose: (account: GoogleAccount) => void;
}

/**
 * A neutral account chooser, not a replica of Google's sign-in page.
 *
 * It asks for nothing: no password, no PIN, no recovery question. The person picks a
 * name and the prototype continues. The second line says so plainly, because a chooser
 * that looked like the real thing and asked for a credential would be a phishing pattern.
 */
export function GoogleSignInDialog({ open, onOpenChange, pendingEmail, onChoose }: GoogleSignInDialogProps) {
  const busy = pendingEmail !== null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* While a row is signing in the dialog is plainly locked: no close, no escape,
          no click-away — rather than a live-looking control that quietly does nothing. */}
      <DialogContent
        size="sm"
        hideClose={busy}
        onEscapeKeyDown={(event) => { if (busy) event.preventDefault(); }}
        onPointerDownOutside={(event) => { if (busy) event.preventDefault(); }}
      >
        <DialogHeader>
          <GoogleMark className="mb-2" />
          <DialogTitle>Choose an account</DialogTitle>
          <DialogDescription>
            Prototype simulation — no Google account is contacted and no password is requested.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="pt-4">
          <ul className="flex flex-col gap-1">
            {GOOGLE_ACCOUNTS.map((account) => (
              <li key={account.email}>
                <AccountRow
                  account={account}
                  pending={pendingEmail === account.email}
                  disabled={busy && pendingEmail !== account.email}
                  onChoose={onChoose}
                />
              </li>
            ))}
            <li>
              {/* A real disabled button, so a keyboard or screen-reader user meets the
                  option and hears why it is off instead of never finding it. */}
              <button
                type="button"
                disabled
                className="flex min-h-14 w-full items-center gap-3 rounded-md border border-dashed border-border px-3 py-2.5 text-left opacity-70 disabled:cursor-not-allowed"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ink-100 text-fg-subtle">
                  <UserPlus className="size-[18px]" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-fg-muted">Use another account</span>
                  <span className="block text-[13px] text-fg-subtle">Not available in the prototype.</span>
                </span>
              </button>
            </li>
          </ul>

          <p className="mt-4 text-[13px] leading-5 text-fg-subtle">
            Picking an account signs you in as that person. One of them already has a GigSyc
            account; the other is new and will be asked a few questions.
          </p>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

interface AccountRowProps {
  account: GoogleAccount;
  pending: boolean;
  disabled: boolean;
  onChoose: (account: GoogleAccount) => void;
}

/** The whole row is the control, so the tap target is the full 56px. */
function AccountRow({ account, pending, disabled, onChoose }: AccountRowProps) {
  return (
    <button
      type="button"
      onClick={() => onChoose(account)}
      disabled={disabled || pending}
      className={cn(
        "flex min-h-14 w-full items-center gap-3 rounded-md border border-transparent px-3 py-2.5 text-left transition-colors duration-150",
        "hover:border-border hover:bg-ink-50 focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed",
        disabled && "opacity-55",
      )}
    >
      <Avatar name={account.name} color={account.avatarColor} size="md" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-fg">{account.name}</span>
        <span className="block truncate text-[13px] text-fg-muted">{account.email}</span>
      </span>
      {pending ? (
        <Spinner label={`Signing in as ${account.name}`} />
      ) : (
        <ChevronRight className="size-4 shrink-0 text-fg-subtle" aria-hidden />
      )}
    </button>
  );
}
