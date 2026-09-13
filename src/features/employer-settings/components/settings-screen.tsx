"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEmployerSession } from "@/features/session";
import { NotificationsTab } from "./notifications-tab";
import { OrganisationTab } from "./organisation-tab";
import { PrototypeTab } from "./prototype-tab";
import { TeamTab } from "./team-tab";

type Tab = "organisation" | "team" | "notifications" | "prototype";

export function SettingsScreen() {
  const { employerId } = useEmployerSession();
  const [tab, setTab] = useState<Tab>("organisation");

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Your organisation profile, who can post on its behalf, and what we tell you about."
      />
      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList aria-label="Settings sections">
          <TabsTrigger value="organisation">Organisation</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="prototype">Prototype</TabsTrigger>
        </TabsList>
        <TabsContent value="organisation" className="pt-6 focus-visible:outline-none"><OrganisationTab employerId={employerId} /></TabsContent>
        <TabsContent value="team" className="pt-6 focus-visible:outline-none"><TeamTab employerId={employerId} /></TabsContent>
        <TabsContent value="notifications" className="pt-6 focus-visible:outline-none"><NotificationsTab /></TabsContent>
        <TabsContent value="prototype" className="pt-6 focus-visible:outline-none"><PrototypeTab /></TabsContent>
      </Tabs>
    </div>
  );
}
