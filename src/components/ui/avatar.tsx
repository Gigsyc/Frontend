import { cn, initials } from "@/lib/utils";
import type { Employer, Worker } from "@/types";

const SIZES = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-lg",
  xl: "size-20 text-2xl",
} as const;

interface AvatarProps {
  name: string;
  /** Second word used for the second initial if provided */
  secondary?: string;
  color?: string;
  size?: keyof typeof SIZES;
  shape?: "circle" | "square";
  className?: string;
}

/**
 * Initials avatar. We deliberately avoid stock face photos in the prototype:
 * they read as fake and can't represent real Rwandan workers honestly.
 */
export function Avatar({ name, secondary, color = "#001b56", size = "md", shape = "circle", className }: AvatarProps) {
  const [first, last] = secondary ? [name, secondary] : name.split(" ");
  return (
    <span
      role="img"
      aria-label={secondary ? `${name} ${secondary}` : name}
      style={{ backgroundColor: color }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-display font-semibold text-white tracking-wide select-none",
        shape === "circle" ? "rounded-full" : "rounded-md",
        SIZES[size],
        className,
      )}
    >
      {initials(first, last)}
    </span>
  );
}

export function WorkerAvatar({ worker, size, className }: { worker: Pick<Worker, "firstName" | "lastName" | "avatarColor">; size?: keyof typeof SIZES; className?: string }) {
  return <Avatar name={worker.firstName} secondary={worker.lastName} color={worker.avatarColor} size={size} className={className} />;
}

export function EmployerMark({ employer, size, className }: { employer: Pick<Employer, "name" | "markColor">; size?: keyof typeof SIZES; className?: string }) {
  const words = employer.name.split(" ");
  return <Avatar name={words[0]} secondary={words[1]} color={employer.markColor} size={size} shape="square" className={className} />;
}

/** Overlapping stack, e.g. "confirmed workers" preview. */
export function AvatarStack({ workers, max = 4, size = "sm" }: { workers: Array<Pick<Worker, "firstName" | "lastName" | "avatarColor">>; max?: number; size?: "xs" | "sm" }) {
  const shown = workers.slice(0, max);
  const rest = workers.length - shown.length;
  return (
    <span className="inline-flex items-center">
      {shown.map((w, i) => (
        <WorkerAvatar key={`${w.firstName}${w.lastName}${i}`} worker={w} size={size} className={cn("ring-2 ring-surface", i > 0 && "-ml-2")} />
      ))}
      {rest > 0 ? (
        <span className={cn("-ml-2 inline-flex items-center justify-center rounded-full bg-ink-100 font-medium text-ink-600 ring-2 ring-surface", SIZES[size])}>+{rest}</span>
      ) : null}
    </span>
  );
}
