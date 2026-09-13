"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkerSession } from "@/features/session";
import { useWorker } from "@/features/workers";
import type { StrengthActionKind } from "../lib/profile-strength";
import { AboutTab } from "./about-tab";
import { AddCertificationDialog } from "./add-certification-dialog";
import { EditProfileSheet } from "./edit-profile-sheet";
import { EditSkillsSheet } from "./edit-skills-sheet";
import { HistoryTab } from "./history-tab";
import { ProfileHeader } from "./profile-header";
import { ProfileSkeleton } from "./profile-skeleton";
import { ReviewsTab } from "./reviews-tab";
import { VerificationTab } from "./verification-tab";

type Tab = "about" | "history" | "verification" | "reviews";
type Overlay = "edit" | "skills" | "certification" | null;

export function ProfileScreen() {
  const { workerId } = useWorkerSession();
  const { data: worker, isPending, isError, error, refetch, isRefetching } = useWorker(workerId);
  const [tab, setTab] = useState<Tab>("about");
  const [overlay, setOverlay] = useState<Overlay>(null);

  const handleAction = (kind: StrengthActionKind) => {
    if (kind === "edit") setOverlay("edit");
    else if (kind === "skills") setOverlay("skills");
    else if (kind === "certification") setOverlay("certification");
    else if (kind === "availability") setTab("about");
    else setTab("verification");
  };

  const header = (
    <PageHeader
      title="My profile"
      description="What employers see when you apply or they search."
      actions={
        <>
          {worker ? <Button variant="outline" size="sm" asChild><Link href={`/employer/talent/${worker.id}`}><Eye /> Preview as employer</Link></Button> : null}
          <Button variant="ghost" size="sm" asChild><Link href="/worker/profile/settings"><Settings /> Settings</Link></Button>
        </>
      }
    />
  );

  if (isPending) return <div className="space-y-6">{header}<ProfileSkeleton /></div>;
  if (isError || !worker) {
    return (
      <div className="space-y-6">
        {header}
        <div className="rounded-lg bg-surface shadow-card"><ErrorState title="We couldn't load your profile" error={error} onRetry={() => refetch()} retrying={isRefetching} /></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {header}
      <ProfileHeader worker={worker} onEdit={() => setOverlay("edit")} onAction={handleAction} />

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList aria-label="Profile sections">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="history" count={worker.completedShifts}>Work history</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="reviews" count={worker.ratingCount}>Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="about" className="rounded-lg pt-4 focus-visible:outline-none focus-visible:shadow-focus">
          <AboutTab worker={worker} onEditProfile={() => setOverlay("edit")} onEditSkills={() => setOverlay("skills")} onAddCertification={() => setOverlay("certification")} />
        </TabsContent>
        <TabsContent value="history" className="rounded-lg pt-4 focus-visible:outline-none focus-visible:shadow-focus"><HistoryTab worker={worker} /></TabsContent>
        <TabsContent value="verification" className="rounded-lg pt-4 focus-visible:outline-none focus-visible:shadow-focus"><VerificationTab worker={worker} /></TabsContent>
        <TabsContent value="reviews" className="rounded-lg pt-4 focus-visible:outline-none focus-visible:shadow-focus"><ReviewsTab worker={worker} /></TabsContent>
      </Tabs>

      <EditProfileSheet worker={worker} open={overlay === "edit"} onOpenChange={(o) => setOverlay(o ? "edit" : null)} />
      <EditSkillsSheet worker={worker} open={overlay === "skills"} onOpenChange={(o) => setOverlay(o ? "skills" : null)} />
      <AddCertificationDialog worker={worker} open={overlay === "certification"} onOpenChange={(o) => setOverlay(o ? "certification" : null)} />
    </div>
  );
}
