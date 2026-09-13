"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useReducer, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Stepper } from "@/components/ui/stepper";
import { clearDraft, INITIAL_STATE, loadDraft, reducer, saveDraft } from "../lib/state";
import { firstInvalidStep, STEPS, stepIndex, validateStep, type StepId } from "../lib/steps";
import { OnboardingSkeleton } from "./onboarding-skeleton";
import { OnboardingSuccess } from "./onboarding-success";
import { StepAbout } from "./step-about";
import { StepAvailability } from "./step-availability";
import { StepReview } from "./step-review";
import { StepSkills } from "./step-skills";
import { StepVerify } from "./step-verify";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const SUBMIT_MS = 900;

export function OnboardingScreen() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [attempted, setAttempted] = useState<Partial<Record<StepId, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Restore the draft, then let ?step= win so deep links from the profile land on the right step.
  // A deep link is a request to edit, so it also reopens a wizard that was already submitted —
  // otherwise the persisted `submitted` flag would show the success screen instead of the step.
  useEffect(() => {
    const draft = loadDraft() ?? INITIAL_STATE;
    const param = searchParams.get("step");
    const step = param ? stepIndex(param) : draft.step;
    dispatch({ type: "hydrate", state: { ...draft, step, submitted: param ? false : draft.submitted } });
    // Runs once on mount by design; later step changes are pushed to the URL below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state.hydrated) saveDraft(state);
  }, [state]);

  // Keep ?step= in sync so refresh and back-links land on the same step. history.replaceState is
  // router-aware in Next and skips the server round-trip that router.replace would trigger.
  useEffect(() => {
    if (!state.hydrated || state.submitted) return;
    const id = STEPS[state.step]?.id;
    if (!id) return;
    const next = `${pathname}?step=${id}`;
    if (`${window.location.pathname}${window.location.search}` !== next) window.history.replaceState(null, "", next);
  }, [state.hydrated, state.submitted, state.step, pathname]);

  if (!state.hydrated) return <OnboardingSkeleton />;

  const step = STEPS[state.step];
  const errors = attempted[step.id] ? validateStep(step.id, state) : {};
  const isLast = state.step === STEPS.length - 1;

  const scrollToTop = () => cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const next = () => {
    setAttempted((a) => ({ ...a, [step.id]: true }));
    if (Object.keys(validateStep(step.id, state)).length) return;
    dispatch({ type: "goto", step: state.step + 1 });
    scrollToTop();
  };

  const back = () => { dispatch({ type: "goto", step: state.step - 1 }); scrollToTop(); };

  const submit = () => {
    setAttempted(Object.fromEntries(STEPS.map((s) => [s.id, true])));
    const invalid = firstInvalidStep(state);
    if (invalid !== null) {
      if (invalid !== state.step) {
        dispatch({ type: "goto", step: invalid });
        toast.error(`Finish "${STEPS[invalid].label}" first`, { description: "One or two fields still need an answer." });
        scrollToTop();
      }
      return;
    }
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      dispatch({ type: "submitted" });
      toast.success("Profile submitted", { description: "ID check started. We'll text you when it clears." });
    }, SUBMIT_MS);
  };

  const startOver = () => { clearDraft(); setAttempted({}); dispatch({ type: "reset" }); };

  if (state.submitted) {
    return (
      <div className="space-y-6">
        <PageHeader title="Welcome to GigSyc" />
        <OnboardingSuccess firstName={state.about.firstName} onStartOver={startOver} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Set up your profile" description="About five minutes. Your progress is saved as you go." />
      <div ref={cardRef} className="scroll-mt-20">
      <Card className="overflow-visible">
        <div className="border-b border-border px-4 py-4 sm:px-6">
          <Stepper steps={STEPS} current={state.step} onStepClick={(i) => { dispatch({ type: "goto", step: i }); scrollToTop(); }} />
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={step.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25, ease: EASE }} className="px-4 py-5 sm:px-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold leading-6">{step.title}</h2>
              <p className="mt-1 text-sm text-fg-muted">{step.description}</p>
            </div>
            {step.id === "about" ? <StepAbout about={state.about} errors={errors} dispatch={dispatch} /> : null}
            {step.id === "skills" ? <StepSkills skills={state.skills} errors={errors} dispatch={dispatch} /> : null}
            {step.id === "availability" ? <StepAvailability availability={state.availability} primary={state.skills.primary} district={state.about.district} errors={errors} dispatch={dispatch} /> : null}
            {step.id === "verify" ? <StepVerify verify={state.verify} errors={errors} dispatch={dispatch} /> : null}
            {step.id === "review" ? <StepReview state={state} errors={errors} dispatch={dispatch} /> : null}
          </motion.div>
        </AnimatePresence>

        <div className="sticky bottom-[calc(62px+env(safe-area-inset-bottom))] z-10 flex items-center justify-between gap-3 rounded-b-lg border-t border-border bg-surface/95 px-4 py-3 backdrop-blur sm:px-6 lg:bottom-0">
          {state.step > 0 ? (
            <Button variant="ghost" onClick={back} disabled={submitting} className="min-h-11"><ArrowLeft /> Back</Button>
          ) : (
            <span className="text-[13px] text-fg-muted">Step 1 of {STEPS.length}</span>
          )}
          {isLast ? (
            <Button size="lg" onClick={submit} loading={submitting} className="min-w-40">Join GigSyc</Button>
          ) : (
            <Button size="lg" onClick={next} className="min-w-32">Next <ArrowRight /></Button>
          )}
        </div>
      </Card>
      </div>
    </div>
  );
}
