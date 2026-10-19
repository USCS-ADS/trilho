"use server";

import { isMockMode } from "@/app/lib/api/config";
import {
    fetchNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
} from "@/app/lib/api/notifications";
import type { NotificationsSnapshot } from "@/app/lib/notifications/types";
import { verifySession } from "@/app/lib/session/dal";

const EMPTY: NotificationsSnapshot = { unreadCount: 0, notifications: [] };

/** Atualização periódica do sino. Falhas de rede mantêm o que já está na tela (devolve `undefined`). */
export async function refreshNotificationsAction(): Promise<NotificationsSnapshot | undefined> {
    const session = await verifySession();
    if (isMockMode) return EMPTY;

    try {
        return await fetchNotifications(session.token);
    } catch {
        return undefined;
    }
}

export async function markNotificationReadAction(notificationId: string): Promise<boolean> {
    const session = await verifySession();
    if (isMockMode) return true;

    try {
        await markNotificationAsRead(notificationId, session.token);
        return true;
    } catch {
        return false;
    }
}

export async function markAllNotificationsReadAction(): Promise<boolean> {
    const session = await verifySession();
    if (isMockMode) return true;

    try {
        await markAllNotificationsAsRead(session.token);
        return true;
    } catch {
        return false;
    }
}
