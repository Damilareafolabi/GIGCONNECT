
import { storageService } from './storageService';
import { Notification } from '../types';
import { supabaseTableSyncService } from './supabaseTableSyncService';

export const notificationService = {
    getNotificationsForUser: (userId: string): Notification[] => {
        return storageService.getNotifications()
            .filter(n => n.userId === userId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    createNotification: (userId: string, message: string, link?: { view: string; params: object }): Notification => {
        const notifications = storageService.getNotifications();
        const newNotification: Notification = {
            id: `notif-${Date.now()}`,
            userId,
            message,
            link,
            isRead: false,
            createdAt: new Date().toISOString(),
        };
        notifications.push(newNotification);
        storageService.saveNotifications(notifications);
        supabaseTableSyncService.syncItem('notifications', newNotification);
        return newNotification;
    },

    markAsRead: (notificationId: string): void => {
        const notifications = storageService.getNotifications();
        const notification = notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.isRead = true;
            storageService.saveNotifications(notifications);
            supabaseTableSyncService.syncItem('notifications', notification);
        }
    },

    markAllAsRead: (userId: string): void => {
        const notifications = storageService.getNotifications();
        notifications.forEach(n => {
            if (n.userId === userId) {
                n.isRead = true;
                supabaseTableSyncService.syncItem('notifications', n);
            }
        });
        storageService.saveNotifications(notifications);
    }
};
