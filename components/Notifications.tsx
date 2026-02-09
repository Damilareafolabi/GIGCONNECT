
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Notification, NavigateFunction } from '../types';
import { notificationService } from '../services/notificationService';

interface NotificationsProps {
    navigate: NavigateFunction;
    onClose: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ navigate, onClose }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        if (user) {
            setNotifications(notificationService.getNotificationsForUser(user.id));
            // Mark all as read when opened
            notificationService.markAllAsRead(user.id);
        }
    }, [user]);

    const handleNotificationClick = (notification: Notification) => {
        if (notification.link) {
            navigate(notification.link.view, notification.link.params);
        }
        onClose();
    };

    return (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-20">
            <div className="py-2">
                <div className="px-4 py-2 font-bold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">Notifications</div>
                <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map(n => (
                        <div key={n.id} onClick={() => handleNotificationClick(n)} className="flex items-center px-4 py-3 border-b hover:bg-gray-100 dark:hover:bg-gray-700 -mx-2 cursor-pointer">
                            <div className="mx-3">
                                <p className="text-gray-600 dark:text-gray-200 text-sm">{n.message}</p>
                            </div>
                        </div>
                    )) : (
                         <p className="text-center text-gray-500 py-4">No new notifications.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
