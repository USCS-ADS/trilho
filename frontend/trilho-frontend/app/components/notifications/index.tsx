"use client";

import {
    markAllNotificationsReadAction,
    markNotificationReadAction,
    refreshNotificationsAction,
} from "@/app/(app)/notifications-actions";
import { formatRelative } from "@/app/lib/date";
import type { NotificationsSnapshot } from "@/app/lib/notifications/types";
import { useRouter } from "next/navigation";
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { BellIcon } from "../icons";

const POLL_INTERVAL_MS = 60_000;

interface NotificationsContextValue {
    snapshot: NotificationsSnapshot;
    markRead: (notificationId: string) => Promise<void>;
    markAllRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

/**
 * Guarda as notificações no layout autenticado (persiste entre páginas) e as atualiza a cada
 * minuto enquanto a aba está visível.
 */
export function NotificationsProvider({
    initial,
    children,
}: {
    initial: NotificationsSnapshot;
    children: ReactNode;
}) {
    const [snapshot, setSnapshot] = useState(initial);

    const refresh = useCallback(async () => {
        const next = await refreshNotificationsAction();
        if (next) setSnapshot(next);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            if (document.visibilityState === "visible") void refresh();
        }, POLL_INTERVAL_MS);

        return () => clearInterval(timer);
    }, [refresh]);

    const value = useMemo<NotificationsContextValue>(
        () => ({
            snapshot,
            async markRead(notificationId) {
                // Otimista; se o servidor recusar, a próxima atualização corrige.
                setSnapshot((previous) => ({
                    unreadCount: Math.max(
                        0,
                        previous.unreadCount -
                            (previous.notifications.find((n) => n.id === notificationId && !n.isRead) ? 1 : 0),
                    ),
                    notifications: previous.notifications.map((n) =>
                        n.id === notificationId ? { ...n, isRead: true } : n,
                    ),
                }));

                if (!(await markNotificationReadAction(notificationId))) void refresh();
            },
            async markAllRead() {
                setSnapshot((previous) => ({
                    unreadCount: 0,
                    notifications: previous.notifications.map((n) => ({ ...n, isRead: true })),
                }));

                if (!(await markAllNotificationsReadAction())) void refresh();
            },
        }),
        [snapshot, refresh],
    );

    return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

/** Sino do cabeçalho: contador de não lidas e painel com as mais recentes (RF08). */
export function NotificationBell() {
    const context = useContext(NotificationsContext);
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        function handlePointerDown(event: PointerEvent) {
            if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") setIsOpen(false);
        }

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    if (!context) return null;

    const { snapshot, markRead, markAllRead } = context;

    async function handleOpenNotification(notification: NotificationsSnapshot["notifications"][number]) {
        setIsOpen(false);
        if (!notification.isRead) void markRead(notification.id);
        if (notification.taskId) router.push(`/kanban/${notification.taskId}`);
    }

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                aria-label={
                    snapshot.unreadCount > 0
                        ? `Notificações (${snapshot.unreadCount} não lidas)`
                        : "Notificações"
                }
                aria-expanded={isOpen}
                aria-haspopup="true"
                onClick={() => setIsOpen((open) => !open)}
                className="relative rounded-full p-2 text-trilho-dim transition-colors hover:bg-trilho-surface-2 hover:text-trilho-text"
            >
                <BellIcon className="h-5 w-5" />
                {snapshot.unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-trilho-danger px-1 text-[10px] font-semibold text-white">
                        {snapshot.unreadCount > 9 ? "9+" : snapshot.unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    role="dialog"
                    aria-label="Notificações"
                    className="absolute right-0 z-30 mt-2 w-80 max-w-[85vw] rounded-xl border border-trilho-border bg-trilho-surface shadow-trilho"
                >
                    <div className="flex items-center justify-between gap-3 border-b border-trilho-border px-4 py-3">
                        <p className="text-sm font-semibold text-trilho-text">Notificações</p>
                        {snapshot.unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={() => void markAllRead()}
                                className="text-xs text-trilho-accent-2 hover:underline"
                            >
                                Marcar todas como lidas
                            </button>
                        )}
                    </div>

                    {snapshot.notifications.length === 0 ? (
                        <p className="px-4 py-6 text-center text-sm text-trilho-dim">
                            Nenhuma notificação por enquanto.
                        </p>
                    ) : (
                        <ul className="max-h-96 divide-y divide-trilho-border overflow-y-auto">
                            {snapshot.notifications.map((notification) => (
                                <li key={notification.id}>
                                    <button
                                        type="button"
                                        onClick={() => void handleOpenNotification(notification)}
                                        className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-trilho-surface-2"
                                    >
                                        <span
                                            aria-hidden="true"
                                            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                                                notification.isRead ? "bg-transparent" : "bg-trilho-accent-2"
                                            }`}
                                        />
                                        <span className="min-w-0">
                                            <span
                                                className={`block text-sm ${
                                                    notification.isRead ? "text-trilho-dim" : "text-trilho-text"
                                                }`}
                                            >
                                                {notification.message}
                                            </span>
                                            <span className="mt-0.5 block text-xs text-trilho-dim">
                                                {formatRelative(notification.createdAt)}
                                            </span>
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
