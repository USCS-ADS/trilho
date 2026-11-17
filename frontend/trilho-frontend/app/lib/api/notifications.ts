import "server-only";
import type { NotificationsSnapshot } from "../notifications/types";
import { apiFetch } from "./client";
import { isMockMode } from "./config";
import type { ResponseNotificationListJson } from "./dtos";

const EMPTY: NotificationsSnapshot = { unreadCount: 0, notifications: [] };

/** GET /api/Notification — do usuário logado, mais recentes primeiro. */
export async function fetchNotifications(token: string, limit = 20): Promise<NotificationsSnapshot> {
    if (isMockMode) return EMPTY;

    const response = await apiFetch<ResponseNotificationListJson>(`/api/Notification?limit=${limit}`, { token });
    if (!response) return EMPTY;

    return {
        unreadCount: response.unreadCount,
        notifications: response.notifications.map((notification) => ({
            id: String(notification.id),
            type: notification.type,
            message: notification.message,
            taskId: notification.taskId != null ? String(notification.taskId) : undefined,
            createdAt: notification.createdAt,
            isRead: notification.isRead,
        })),
    };
}

export async function markNotificationAsRead(notificationId: string, token: string) {
    await apiFetch<undefined>(`/api/Notification/${encodeURIComponent(notificationId)}/read`, {
        method: "PUT",
        token,
    });
}

export async function markAllNotificationsAsRead(token: string) {
    await apiFetch<undefined>("/api/Notification/read-all", { method: "PUT", token });
}
