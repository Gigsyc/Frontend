import { BadgeCheck, ShieldCheck } from "lucide-react";
import type { VerificationKey, Worker } from "@/types";
import { cn } from "@/lib/utils";

export const VERIFICATION_LABELS: Record<VerificationKey, { label: string; description: string }> = {
  identity: { label: "National ID", description: "Government ID checked against the registered name." },
  phone: { label: "Phone", description: "Mobile number confirmed by one-time code." },
  photo: { label: "Photo", description: "Profile photo matched to ID." },
  references: { label: "References", description: "At least one previous employer contacted." },
  skills: { label: "Skills", description: "Completed a GigSyc skills assessment for their primary role." },
};

export function isFullyVerified(v: Worker["verifications"]) {
  return Object.values(v).every(Boolean);
}

/** Inline "Verified" mark next to a name. */
export function VerifiedMark({ verifications, className, size = "sm" }: { verifications: Worker["verifications"]; className?: string; size?: "sm" | "md" }) {
  const full = isFullyVerified(verifications);
  if (!verifications.identity) return null;
  return (
    <span
      className={cn("inline-flex items-center gap-1 font-medium", full ? "text-cyan-700" : "text-fg-muted", size === "sm" ? "text-xs" : "text-sm", className)}
      title={full ? "Fully verified" : "ID verified"}
    >
      <BadgeCheck className={cn(size === "sm" ? "size-3.5" : "size-4", full ? "fill-cyan-100" : "")} aria-hidden />
      {full ? "Verified" : "ID verified"}
    </span>
  );
}

export function EmployerVerifiedMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium text-cyan-700", className)} title="Verified employer">
      <ShieldCheck className="size-3.5" aria-hidden /> Verified employer
    </span>
  );
}
