"use client";

import { ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { Avatar, EmployerMark } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useEmployer } from "@/features/employers/queries";
import { useStaggerOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { DEMO_ACCOUNTS, type DemoAccount } from "../accounts";

interface DemoAccountListProps {
  /** Id of the visible label above the list — "Or continue as". */
  labelledBy: string;
  /** Row highlighted by `?as=`, or the one the visitor just picked. */
  selectedId: string | null;
  /** Control currently signing in — an account id, or "form". */
  pendingId: string | null;
  busy: boolean;
  onChoose: (account: DemoAccount) => void;
  className?: string;
}

export function DemoAccountList({ labelledBy, selectedId, pendingId, busy, onChoose, className }: DemoAccountListProps) {
  const stagger = useStaggerOnce(true);
  return (
    <ul className={cn("flex flex-col gap-2", className)} aria-labelledby={labelledBy}>
      {DEMO_ACCOUNTS.map((account, i) => (
        <motion.li key={account.id} {...stagger(i)}>
          <AccountRow
            account={account}
            selected={selectedId === account.id}
            pending={pendingId === account.id}
            disabled={busy && pendingId !== account.id}
            onChoose={onChoose}
          />
        </motion.li>
      ))}
    </ul>
  );
}

interface AccountRowProps {
  account: DemoAccount;
  selected: boolean;
  pending: boolean;
  disabled: boolean;
  onChoose: (account: DemoAccount) => void;
}

/** One line plus a sub-line. The whole row is the control, so the tap target is 60px tall. */
function AccountRow({ account, selected, pending, disabled, onChoose }: AccountRowProps) {
  return (
    <button
      type="button"
      onClick={() => onChoose(account)}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-3 rounded-md border p-2.5 text-left transition-[border-color,background-color,box-shadow] duration-150 disabled:opacity-55",
        selected
          ? "border-navy-900 bg-navy-50 shadow-card"
          : "border-border bg-surface hover:border-ink-400 hover:bg-ink-50",
      )}
    >
      <AccountMark account={account} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-fg">{account.name}</span>
        <span className="block truncate text-[13px] text-fg-muted">{account.role}</span>
      </span>
      {pending ? (
        <Spinner className="mr-1" label={`Signing in as ${account.name}`} />
      ) : (
        <ChevronRight className="mr-1 size-4 shrink-0 text-fg-subtle" aria-hidden />
      )}
    </button>
  );
}

/**
 * Organisation accounts get their employer mark — a square lock-up that reads as a company
 * next to the round personal avatars. If that record is slow or unavailable the row still
 * renders with the person's own initials rather than blocking the way in.
 */
function AccountMark({ account }: { account: DemoAccount }) {
  const employer = useEmployer(account.employerId);
  if (!account.employerId) return <Avatar name={account.name} color={account.avatarColor} size="md" />;
  if (employer.data) return <EmployerMark employer={employer.data} size="md" />;
  if (employer.isPending) return <Skeleton className="size-10 rounded-md" />;
  return <Avatar name={account.name} color={account.avatarColor} size="md" shape="square" />;
}
