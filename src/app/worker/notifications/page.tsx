"use client";

import { NotificationsScreen } from "@/features/notifications";
import { useWorkerSession } from "@/features/session";

export default function WorkerNotificationsPage() {
  const { workerId } = useWorkerSession();
  return <NotificationsScreen recipientId={workerId} />;
}
