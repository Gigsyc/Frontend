"use client";

import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import { Button } from "@/components/ui";

interface WizardFooterProps {
  step: number;
  lastStep: number;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  onPost: () => void;
  posting: boolean;
  savingDraft: boolean;
  /** "Save as draft" on an existing draft updates it rather than creating another. */
  draftLabel?: string;
}

/** Sticky on mobile so Continue is always under the thumb. Save as draft is offered at every step. */
export function WizardFooter({ step, lastStep, onBack, onNext, onSaveDraft, onPost, posting, savingDraft, draftLabel = "Save draft" }: WizardFooterProps) {
  const busy = posting || savingDraft;
  const review = step === lastStep;
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-2 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:rounded-lg sm:border sm:bg-surface sm:px-5 sm:py-4 sm:shadow-card">
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <Button type="button" variant="ghost" onClick={onBack} disabled={step === 0 || busy} className="h-11 px-3 sm:px-4">
          <ArrowLeft /> Back
        </Button>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={onSaveDraft} loading={savingDraft} disabled={posting} className="h-11">
            {draftLabel}
          </Button>
          {review ? (
            <Button type="button" variant="accent" onClick={onPost} loading={posting} disabled={savingDraft} className="h-11">
              <Send /> Post shift
            </Button>
          ) : (
            <Button type="button" onClick={onNext} disabled={busy} className="h-11 sm:min-w-32">
              Continue <ArrowRight />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
