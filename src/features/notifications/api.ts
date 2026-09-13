import { store } from "@/lib/mock/store";
export const notificationsApi = {
  list: (recipientId: string) => store.listNotifications(recipientId),
  markRead: (id: string) => store.markNotificationRead(id),
  markAllRead: (recipientId: string) => store.markAllNotificationsRead(recipientId),
};
