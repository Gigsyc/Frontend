"use client";

import { Check, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import type { Worker } from "@/types";
import { useToggleTalentPool } from "../queries";
import { RemoveFromPoolDialog } from "./remove-from-pool-dialog";

interface Props {
  employerId: string;
  worker: Pick<Worker, "id" | "firstName" | "lastName">;
  inPool: boolean;
  size?: ButtonProps["size"];
  className?: string;
  /** "long" for the profile page ("Add to talent pool"), "short" for cards ("Add to pool"). */
  labels?: "short" | "long";
}

/**
 * "Add to pool" / "In pool". Adding is one click; removing asks first because it also drops the note.
 * Each instance owns its mutation so pending state is per worker, not per page.
 */
export function PoolToggleButton({ employerId, worker, inPool, size = "sm", className, labels = "short" }: Props) {
  const toggle = useToggleTalentPool(employerId);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const add = () =>
    toggle.mutate(
      { workerId: worker.id },
      {
        onSuccess: (res) => {
          if (res.inPool) {
            toast.success(`${worker.firstName} added to your talent pool`, {
              description: "They’re confirmed automatically when they apply to your shifts.",
            });
          } else {
            toast.success(`${worker.firstName} removed from your talent pool`);
          }
        },
        onError: (e) => toast.error(e.message),
      },
    );

  const label = inPool
    ? labels === "long" ? "In your talent pool" : "In pool"
    : labels === "long" ? "Add to talent pool" : "Add to pool";

  return (
    <>
      <Button
        variant={inPool ? "secondary" : "outline"}
        size={size}
        className={className}
        loading={toggle.isPending}
        aria-pressed={inPool}
        onClick={() => (inPool ? setConfirmOpen(true) : add())}
      >
        {inPool ? <Check /> : <Star />} {label}
      </Button>
      <RemoveFromPoolDialog employerId={employerId} worker={worker} open={confirmOpen} onOpenChange={setConfirmOpen} />
    </>
  );
}
