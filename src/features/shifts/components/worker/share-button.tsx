"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/** Native share sheet where available, otherwise copy the link. */
export function ShareButton({ title }: { title: string }) {
  const share = async () => {
    const url = window.location.href;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title, text: `${title} — on GigSyc`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Link copied", { description: "Send it to a friend who'd suit this shift." });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      toast.error("We couldn't share this link. Copy it from the address bar instead.");
    }
  };
  return (
    <Button variant="outline" size="sm" onClick={share} aria-label="Share this shift">
      <Share2 aria-hidden /> Share
    </Button>
  );
}
