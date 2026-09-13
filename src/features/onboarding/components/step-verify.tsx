"use client";

import { Camera, IdCard, Lock, ShieldCheck } from "lucide-react";
import type { Action, VerifyState } from "../lib/state";
import type { StepErrors } from "../lib/steps";
import { UploadTile } from "./upload-tile";

const CHECKS = [
  "The name and date of birth on your ID match what you entered.",
  "Your selfie matches the photo on the ID.",
  "The ID is genuine and not expired.",
];

export function StepVerify({ verify, errors, dispatch }: { verify: VerifyState; errors: StepErrors; dispatch: (a: Action) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <UploadTile icon={IdCard} title="National ID — front" hint="Tap to photograph or upload" capture="environment" done={verify.idFront} error={errors.idFront} onDone={() => dispatch({ type: "uploaded", key: "idFront" })} />
        <UploadTile icon={Camera} title="Selfie" hint="Good light, no hat or sunglasses" capture="user" done={verify.selfie} error={errors.selfie} onDone={() => dispatch({ type: "uploaded", key: "selfie" })} />
      </div>

      <div className="rounded-lg border border-border p-4">
        <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-fg"><ShieldCheck className="size-4 text-cyan-700" aria-hidden /> What we check</h3>
        <ul className="mt-2 space-y-1.5 text-[13px] leading-5 text-fg-muted">
          {CHECKS.map((c) => <li key={c} className="flex gap-2"><span className="mt-2 size-1 shrink-0 rounded-full bg-ink-400" aria-hidden />{c}</li>)}
        </ul>
        <p className="mt-3 text-[13px] text-fg-muted">Checks usually finish within 24 hours. You can browse and apply for shifts while you wait; employers see &ldquo;ID pending&rdquo; until it clears.</p>
      </div>

      <div className="flex items-start gap-3 rounded-lg bg-navy-50 p-4 text-[13px] leading-5 text-navy-900">
        <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p>Employers never see your ID or selfie — only the verified mark. Images are encrypted, used solely for this check, and deleted 30 days after it completes.</p>
      </div>
    </div>
  );
}
