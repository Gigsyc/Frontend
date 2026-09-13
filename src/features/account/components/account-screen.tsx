"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/features/auth";
import type { InterestId } from "@/types";
import { ACCOUNT_TAB_LABEL, accountTabsForRole, parseAccountTab } from "../lib/tabs";
import { AccountSkeleton } from "./account-skeleton";
import { InterestsTab } from "./interests-tab";
import { ProfileTab } from "./profile-tab";
import { SavedTab } from "./saved-tab";
import { DEFAULT_ACCOUNT_PREFS, SettingsTab, type AccountPrefs } from "./settings-tab";

const PANEL = "pt-5 focus-visible:outline-none";
/** Reading columns stay narrow; only the saved-events grid uses the full container. */
const NARROW = `${PANEL} max-w-4xl`;

/**
 * /account — one identity, a few views. The tab lives in `?tab=` so the header menu can
 * deep-link straight to settings or interests and a reload lands in the same place.
 */
export function AccountScreen() {
  const { user } = useAuth();
  const params = useSearchParams();
  const router = useRouter();

  const tabs = accountTabsForRole(user?.role ?? "customer");
  const tab = parseAccountTab(params.get("tab"), tabs);
  const asked = params.get("tab");

  // Radix unmounts the panel it leaves, so anything a tab is still holding lives up here: an
  // unsaved interest selection survives a trip to Profile and back, and so do the preferences.
  const [interests, setInterests] = useState<InterestId[] | null>(null);
  const [prefs, setPrefs] = useState<AccountPrefs>(DEFAULT_ACCOUNT_PREFS);

  const setTab = useCallback((next: string) => {
    const p = new URLSearchParams(params.toString());
    if (next === "profile") p.delete("tab");
    else p.set("tab", next);
    const qs = p.toString();
    router.replace(qs ? `/account?${qs}` : "/account", { scroll: false });
  }, [params, router]);

  // ?tab=nope, or a tab this role isn't offered, shows the profile — so say the profile in the
  // address bar too, rather than leaving a URL that claims a tab nobody is looking at.
  useEffect(() => {
    if (asked !== null && asked !== tab) setTab(tab);
  }, [asked, tab, setTab]);

  // <AccountRoute> holds the route until the session is read, so this is only the type guard.
  if (!user) return <AccountSkeleton />;

  return (
    <div className="bg-canvas pb-16">
      <div className="container-x space-y-6 py-8 lg:py-10">
        <PageHeader
          title="Your account"
          description="Your profile, what you're interested in, and how GigSyc talks to you."
        />

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList aria-label="Account sections" className="-mx-4 px-4 sm:mx-0 sm:px-0">
            {tabs.map((t) => (
              <TabsTrigger key={t} value={t}>{ACCOUNT_TAB_LABEL[t]}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="profile" className={NARROW}><ProfileTab user={user} /></TabsContent>
          {tabs.includes("interests") ? (
            <TabsContent value="interests" className={NARROW}>
              <InterestsTab user={user} draft={interests} onDraftChange={setInterests} />
            </TabsContent>
          ) : null}
          {tabs.includes("saved") ? (
            <TabsContent value="saved" className={PANEL}><SavedTab /></TabsContent>
          ) : null}
          <TabsContent value="settings" className={NARROW}>
            <SettingsTab user={user} prefs={prefs} onPrefsChange={setPrefs} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
