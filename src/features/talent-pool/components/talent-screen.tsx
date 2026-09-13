"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEmployerSession } from "@/features/session";
import { WorkerGridSkeleton } from "@/features/workers/components/employer/worker-grid";
import { useTalentPool } from "../queries";
import { FindWorkersTab } from "./find-workers-tab";
import { TalentPoolTab } from "./talent-pool-tab";

type TalentTab = "pool" | "find";
const isTab = (v: string | null): v is TalentTab => v === "pool" || v === "find";

const TITLE = "Talent";
const DESCRIPTION = "Your talent pool and every verified professional on GigSyc.";

/** ?tab=pool|find lives in the URL so a shared search link opens on the right tab. */
function useTalentTab() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tab: TalentTab = isTab(sp.get("tab")) ? (sp.get("tab") as TalentTab) : "pool";
  const setTab = useCallback(
    (next: string) => {
      const params = new URLSearchParams(sp.toString());
      if (next === "pool") params.delete("tab");
      else params.set("tab", next);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [sp, router, pathname],
  );
  return { tab, setTab };
}

export function TalentScreen() {
  const { employerId } = useEmployerSession();
  const { tab, setTab } = useTalentTab();
  const pool = useTalentPool(employerId);

  return (
    <div className="space-y-8">
      <PageHeader title={TITLE} description={DESCRIPTION} />
      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList aria-label="Talent sections">
          <TabsTrigger value="pool" count={pool.data?.length}>Talent pool</TabsTrigger>
          <TabsTrigger value="find">Find workers</TabsTrigger>
        </TabsList>
        <TabsContent value="pool" className="focus-visible:outline-none">
          <TalentPoolTab employerId={employerId} onFindWorkers={() => setTab("find")} />
        </TabsContent>
        <TabsContent value="find" className="focus-visible:outline-none">
          <FindWorkersTab employerId={employerId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/** Suspense fallback while search params resolve on the client. Mirrors the pool tab layout. */
export function TalentScreenSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true">
      <PageHeader title={TITLE} description={DESCRIPTION} />
      <div className="space-y-6">
        <div className="flex gap-1 border-b border-border">
          <Skeleton className="mb-2 h-7 w-32" />
          <Skeleton className="mb-2 h-7 w-28" />
        </div>
        <WorkerGridSkeleton count={4} withToolbar />
      </div>
    </div>
  );
}
