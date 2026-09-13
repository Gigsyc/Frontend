"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useId, useMemo } from "react";
import { EventCard, EventCardSkeleton } from "@/components/common/event-card";
import { INTERESTS, categoriesForInterests } from "@/data/auth";
import { useAuth } from "@/features/auth";
import type { AuthUser, Event, RwandaPlace } from "@/types";
import { DEFAULT_EVENTS_STATE, serializeEventParams, useSavedEvents } from "../../hooks";
import { useEvents } from "../../queries";

const ROW_SIZE = 4;
const EASE = [0.22, 1, 0.36, 1] as const;

const LIST =
  "-mx-4 flex gap-4 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4";
const ITEM = "flex w-[76vw] max-w-[300px] shrink-0 sm:w-auto sm:max-w-none";

interface RowProps {
  title: string;
  reason: string;
  href: string;
  events: Event[];
  isSaved: (event: Event) => boolean;
  onToggleSave: (event: Event) => void;
}

function Row({ title, reason, href, events, isSaved, onToggleSave }: RowProps) {
  const headingId = useId();
  if (events.length === 0) return null;

  return (
    <section aria-labelledby={headingId} className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 id={headingId} className="truncate text-lg font-semibold">{title}</h2>
          <p className="mt-0.5 text-[13px] text-fg-muted">{reason}</p>
        </div>
        <Link
          href={href}
          className="-my-2 inline-flex min-h-11 shrink-0 items-center gap-1.5 py-2 text-sm font-medium text-navy-700 underline-offset-4 hover:underline [&_svg]:size-4"
        >
          See all <ArrowRight aria-hidden />
        </Link>
      </div>
      <ul className={LIST}>
        {events.map((event, i) => (
          <motion.li
            key={event.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE, delay: i * 0.03 }}
            className={ITEM}
          >
            <EventCard
              event={event}
              className="w-full"
              saved={isSaved(event)}
              onToggleSave={() => onToggleSave(event)}
            />
          </motion.li>
        ))}
      </ul>
    </section>
  );
}

function RowSkeleton() {
  return (
    <section className="space-y-3" aria-hidden>
      <div className="h-5 w-52 max-w-full skeleton" />
      <ul className={LIST}>
        {Array.from({ length: ROW_SIZE }, (_, i) => (
          <li key={i} className={ITEM}><EventCardSkeleton /></li>
        ))}
      </ul>
    </section>
  );
}

/** Both rows plus the line that says where they came from. Only mounted for an eligible customer. */
function Rows({ user, place }: { user: AuthUser; place: RwandaPlace }) {
  const categories = useMemo(() => categoriesForInterests(user.interests), [user.interests]);
  const near = useEvents({ places: [place] });
  const like = useEvents({ categories });
  const { savedIds, toggleSave } = useSavedEvents();

  const nearEvents = useMemo(() => near.data?.slice(0, ROW_SIZE) ?? [], [near.data]);
  // Row two is what else you might like, so it never repeats what row one already showed.
  const likeEvents = useMemo(() => {
    if (!like.data) return [];
    const shown = new Set(nearEvents.map((e) => e.id));
    return like.data.filter((e) => !shown.has(e.id)).slice(0, ROW_SIZE);
  }, [like.data, nearEvents]);

  if (near.isPending || like.isPending) {
    return <div className="space-y-8" aria-busy="true" aria-label="Loading your rows"><RowSkeleton /><RowSkeleton /></div>;
  }
  // A failed row is not worth an error panel — the full board underneath is the real answer.
  if (nearEvents.length === 0 && likeEvents.length === 0) return null;

  const isSaved = (event: Event) => savedIds.has(event.id);
  // Row two covers every category every interest pulls in, so it is only named after one
  // interest when there is only one. The lookup is defensive: an account stored by an earlier
  // build can carry an interest id this one no longer knows, and that must not take the board
  // down — `categoriesForInterests` already guards the same way.
  const only = user.interests.length === 1 ? INTERESTS[user.interests[0]]?.label.toLowerCase() : undefined;

  return (
    <div className="space-y-8">
      <Row
        title={`Events near ${place}`}
        reason={`You told us ${place} is home.`}
        href={`/events?${serializeEventParams({ ...DEFAULT_EVENTS_STATE, place }).toString()}`}
        events={nearEvents}
        isSaved={isSaved}
        onToggleSave={toggleSave}
      />
      <Row
        title={only ? `Because you like ${only}` : "Because of your interests"}
        reason="Categories matched to the interests on your profile."
        href={`/events?${serializeEventParams({ ...DEFAULT_EVENTS_STATE, categories }).toString()}`}
        events={likeEvents}
        isSaved={isSaved}
        onToggleSave={toggleSave}
      />
      <p className="text-[13px] text-fg-subtle">
        Based on the interests you picked. You can change them in{" "}
        <Link href="/account?tab=interests" className="rounded-sm font-medium text-navy-700 underline underline-offset-2">
          your profile
        </Link>.
      </p>
    </div>
  );
}

/**
 * Two short rows above the board for a signed-in customer who has finished onboarding.
 * Everyone else — signed out, mid-onboarding, or any other role — sees nothing at all.
 */
export function PersonalisedRows() {
  const { user } = useAuth();
  if (!user || user.role !== "customer" || !user.onboardingCompleted) return null;
  if (!user.location || user.interests.length === 0) return null;
  return <Rows user={user} place={user.location} />;
}
