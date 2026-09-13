"use client";

import { ChevronRight, EyeOff } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppleMark } from "@/components/ui/social-auth";
import { Spinner } from "@/components/ui/spinner";
import { APPLE_ACCOUNTS } from "@/data/mocks/accounts";
import { cn } from "@/lib/utils";
import type { AppleIdAccount } from "./use-apple-sign-in";

interface AppleSignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingEmail: string | null;
  onChoose: (account: AppleIdAccount) => void;
}

/**
 * A neutral Apple ID chooser, not a replica of Apple's sign-in sheet.
 *
 * It asks for nothing: no password, no two-factor code, no security question. The
 * person picks an Apple ID and the prototype continues. Anything that looked like
 * Apple's real sheet and asked for a credential would be a phishing pattern.
 */
export function AppleSignInDialog({ open, onOpenChange, pendingEmail, onChoose }: AppleSignInDialogProps) {
  const busy = pendingEmail !== null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="sm"
        hideClose={busy}
        onEscapeKeyDown={(event) => { if (busy) event.preventDefault(); }}
        onPointerDownOutside={(event) => { if (busy) event.preventDefault(); }}
      >
        <DialogHeader>
          <AppleMark className="mb-2 text-fg" />
          <DialogTitle>Choose an Apple ID</DialogTitle>
          <DialogDescription>
            Prototype simulation — no Apple ID is contacted and no password is requested.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="pt-4">
          <ul className="flex flex-col gap-1">
            {APPLE_ACCOUNTS.map((account) => (
              <li key={account.email}>
                <AccountRow
                  account={account}
                  pending={pendingEmail === account.email}
                  disabled={busy && pendingEmail !== account.email}
                  onChoose={onChoose}
                />
              </li>
            ))}
          </ul>

          <p className="mt-4 text-[13px] leading-5 text-fg-subtle">
            One of these already has a GigSyc account; the other is new and will be asked a
            few questions. Hide My Email shares a forwarding address instead of the real one.
          </p>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

interface AccountRowProps {
  account: AppleIdAccount;
  pending: boolean;
  disabled: boolean;
  onChoose: (account: AppleIdAccount) => void;
}

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
        {account.hideMyEmail ? (
          <span className="mt-0.5 inline-flex items-center gap-1 text-[12px] font-medium text-cyan-700">
            <EyeOff className="size-3" aria-hidden /> Hide My Email
          </span>
        ) : null}
      </span>
      {pending ? (
        <Spinner label={`Signing in as ${account.name}`} />
      ) : (
        <ChevronRight className="size-4 shrink-0 text-fg-subtle" aria-hidden />
      )}
    </button>
  );
}
