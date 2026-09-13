"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModerationTab } from "./moderation-tab";
import { PlatformTab } from "./platform-tab";
import { PrototypeTab } from "./prototype-tab";
import { TeamTab } from "./team-tab";

type Tab = "platform" | "moderation" | "team" | "prototype";

/** /admin/settings — how the platform behaves, and the demo controls that sit behind it. */
export function AdminSettingsScreen() {
  const [tab, setTab] = useState<Tab>("platform");

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="How GigSyc names itself, what happens to an event before customers see it, and who can run the console."
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList aria-label="Settings sections">
          <TabsTrigger value="platform">Platform</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="prototype">Prototype</TabsTrigger>
        </TabsList>
        <TabsContent value="platform" className="pt-6 focus-visible:outline-none"><PlatformTab /></TabsContent>
        <TabsContent value="moderation" className="pt-6 focus-visible:outline-none"><ModerationTab /></TabsContent>
        <TabsContent value="team" className="pt-6 focus-visible:outline-none"><TeamTab /></TabsContent>
        <TabsContent value="prototype" className="pt-6 focus-visible:outline-none"><PrototypeTab /></TabsContent>
      </Tabs>

      <p className="text-xs text-fg-subtle">
        Settings are not stored in the prototype. Saving confirms the change for this session only — reloading brings the defaults back.
      </p>
    </div>
  );
}
