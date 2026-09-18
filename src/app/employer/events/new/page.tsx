import type { Metadata } from "next";
import { SubmitEventScreen } from "@/features/events/components/organizer/submit";

export const metadata: Metadata = { title: "Submit an event" };

/** Thin server shell: read `?edit=` and hand the id to the client wizard. */
export default async function NewEventPage({ searchParams }: PageProps<"/employer/events/new">) {
  const { edit } = await searchParams;
  return <SubmitEventScreen editId={typeof edit === "string" && edit ? edit : undefined} />;
}
