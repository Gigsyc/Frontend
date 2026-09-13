"use client";

import { NotificationsScreen } from "@/features/notifications";
import { useEmployerSession } from "@/features/session";

export default function EmployerNotificationsPage() {
  const { employerId } = useEmployerSession();
  return <NotificationsScreen recipientId={employerId} />;
}
