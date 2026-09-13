import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query/keys";
import { notificationsApi } from "./api";

export const useNotifications = (recipientId: string) =>
  useQuery({ queryKey: qk.notifications.byRecipient(recipientId), queryFn: () => notificationsApi.list(recipientId), refetchInterval: 45_000 });

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.notifications.all }),
  });
}

export function useMarkAllNotificationsRead(recipientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(recipientId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.notifications.all }),
  });
}
