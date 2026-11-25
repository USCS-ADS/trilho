export interface NotificationView {
    id: string;
    type: string;
    message: string;
    taskId?: string;
    /** Instante ISO (UTC). */
    createdAt: string;
    isRead: boolean;
}

export interface NotificationsSnapshot {
    unreadCount: number;
    notifications: NotificationView[];
}
