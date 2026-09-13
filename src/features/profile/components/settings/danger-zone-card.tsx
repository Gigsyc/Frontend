"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { LogOut, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSession } from "@/features/session";

export function DangerZoneCard() {
  const router = useRouter();
  const { signOut } = useSession();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const logOut = () => {
    signOut();
    toast("Logged out", { description: "See you at the next shift." });
    router.push("/login");
  };

  const requestDeletion = () => {
    setDeleteOpen(false);
    toast.info("Account deletion isn't in the prototype", { description: "In the real app we'd email a confirmation and delete your data within 30 days." });
  };

  return (
    <Card className="border border-danger-100">
      <CardHeader className="px-4 sm:px-5">
        <CardTitle className="text-danger-700">Danger zone</CardTitle>
        <CardDescription>Log out on shared phones. Deleting removes your history and ratings for good.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-4 pt-3 sm:flex-row sm:px-5">
        <Button variant="outline" onClick={logOut} className="sm:flex-1"><LogOut /> Log out</Button>
        <Button variant="danger-soft" onClick={() => setDeleteOpen(true)} className="sm:flex-1"><Trash2 /> Delete account</Button>
      </CardContent>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>Your ratings, work history and verification marks can&rsquo;t be recovered. Pending payouts are still paid.</DialogDescription>
          </DialogHeader>
          <DialogBody className="text-sm text-fg-muted">If you just need a break, switch off &ldquo;Show my profile&rdquo; in Privacy instead — your reputation stays intact.</DialogBody>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Keep my account</Button></DialogClose>
            <Button variant="danger" onClick={requestDeletion}>Delete account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
