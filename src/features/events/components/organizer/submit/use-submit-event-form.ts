"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useReducer, useState } from "react";
import { toast } from "sonner";
import { useEmployer } from "@/features/employers";
import { useCreateOrganizerEvent, useOrganizerEvent, useSubmitOrganizerEvent, useUpdateOrganizerEvent } from "@/features/events";
import { useEmployerSession } from "@/features/session";
import { errorMessage, isNotFoundError } from "@/lib/utils";
import type { Event, EventStatus } from "@/types";
import { buildEventInput, changedFields } from "./build-event";
import { clearDraft, INITIAL_STATE, loadDraft, saveDraft, submitReducer, type SubmitState } from "./state";
import { firstInvalidStep, validateStep } from "./validation";

export type SubmitIntent = "submit" | "draft";

/** Statuses a partner may still change. Everything else is GigSyc's to move. */
export const EDITABLE: EventStatus[] = ["draft", "pending_review", "rejected"];

function successToast(intent: SubmitIntent, title: string, original?: Event) {
  if (original?.status === "rejected") return toast.success("Resubmitted.", { description: "GigSyc will take another look." });
  if (original?.status === "pending_review") return toast.success("Changes saved.", { description: "GigSyc will review the updated event, usually within a day." });
  if (intent === "draft") return toast.success(original ? "Draft updated." : "Saved as a draft.", { description: "Only you can see it." });
  return toast.success("Submitted.", { description: `GigSyc will review ${title}, usually within a day.` });
}

/**
 * One reducer, persisted to sessionStorage under a key per event, so a refresh keeps the form
 * and an edit never bleeds into a new listing. In edit mode the reducer is prefilled from the
 * event exactly once — a background refetch can't clobber what the partner has typed.
 */
export function useSubmitEventForm(editId: string | undefined) {
  const router = useRouter();
  const { employerId } = useEmployerSession();
  const employerQ = useEmployer(employerId);
  const eventQ = useOrganizerEvent(employerId, editId);
  const create = useCreateOrganizerEvent(employerId);
  const update = useUpdateOrganizerEvent(employerId);
  const submitDraft = useSubmitOrganizerEvent(employerId);

  const [state, dispatch] = useReducer(submitReducer, INITIAL_STATE);
  const [busy, setBusy] = useState<SubmitIntent | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const hydrated = state.hydrated;

  const original = editId ? eventQ.data : undefined;
  const notFound = !!editId && eventQ.isError && isNotFoundError(eventQ.error);
  /** The form really holds the edited event's content — the prefill has landed, or the session restored it. */
  const editing = !!editId && !!original && state.editId === editId;

  // 1. Restore an in-progress form for this exact event (or for a new listing).
  useEffect(() => {
    const saved = loadDraft(editId);
    if (saved && saved.editId === (editId ?? null)) dispatch({ type: "hydrate", state: saved });
    else dispatch({ type: "ready" });
  }, [editId]);

  // 2. Prefill from the event once it arrives — only if the form isn't already holding it.
  useEffect(() => {
    if (hydrated && editId && eventQ.data && state.editId !== editId) dispatch({ type: "prefill", event: eventQ.data });
  }, [hydrated, editId, eventQ.data, state.editId]);

  // 3. A new listing starts at the organisation's own venue and district.
  useEffect(() => {
    const org = employerQ.data;
    if (!org || !hydrated || editId || state.venuePrefilled || state.venue || state.address) return;
    dispatch({ type: "set", patch: { venue: org.name, address: org.district, place: state.place || "Kigali", venuePrefilled: true, dirty: state.dirty } });
  }, [employerQ.data, hydrated, editId, state.venuePrefilled, state.venue, state.address, state.place, state.dirty]);

  // 4. Persist every change.
  useEffect(() => {
    if (hydrated) saveDraft(editId, state);
  }, [editId, state, hydrated]);

  const errors = useMemo(() => (state.showErrors ? validateStep(state.step, state) : {}), [state]);
  const set = (patch: Partial<SubmitState>) => dispatch({ type: "set", patch });
  const goto = (step: number) => dispatch({ type: "goto", step });

  const next = () => {
    if (Object.keys(validateStep(state.step, state)).length) {
      dispatch({ type: "showErrors" });
      return;
    }
    goto(state.step + 1);
  };

  const submit = async (intent: SubmitIntent) => {
    const invalid = firstInvalidStep(state, intent);
    if (invalid !== null) {
      goto(invalid);
      dispatch({ type: "showErrors" });
      toast.error("A few details are missing", {
        description: intent === "draft" ? "A draft needs the basics — a title, category and description — so you can find it again." : `Finish step ${invalid + 1} before submitting.`,
      });
      return;
    }
    setBusy(intent);
    const input = buildEventInput(state, intent === "draft");
    try {
      let saved: Event;
      if (editing && original) {
        const patch = changedFields(original, input);
        saved = Object.keys(patch).length ? await update.mutateAsync({ id: original.id, patch }) : original;
        // A draft the partner is now happy with goes to the queue; the store handles rejected → pending itself.
        if (intent === "submit" && saved.status === "draft") saved = await submitDraft.mutateAsync(saved.id);
      } else {
        saved = await create.mutateAsync(input);
      }
      successToast(intent, saved.title, editing ? original : undefined);
      clearDraft(editId);
      router.push(`/employer/events/${saved.id}`);
    } catch (err) {
      setBusy(null);
      toast.error(errorMessage(err));
    }
  };

  const leave = () => {
    clearDraft(editId);
    router.push(editId ? `/employer/events/${editId}` : "/employer/events");
  };
  const cancel = () => (state.dirty ? setLeaveOpen(true) : leave());

  return {
    state, errors, set, goto, next, submit, cancel, leave,
    leaveOpen, setLeaveOpen,
    employer: employerQ.data, employerId,
    original, editing, notFound,
    loading: !hydrated || (!!editId && eventQ.isPending),
    loadError: !!editId && eventQ.isError && !notFound ? eventQ.error : undefined,
    submitting: busy === "submit",
    savingDraft: busy === "draft",
  };
}
