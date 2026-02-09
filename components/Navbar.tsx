import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole, NavigateFunction } from '../types';
import { notificationService } from '../services/notificationService';
import Notifications from './Notifications';
import { useTheme } from '../contexts/ThemeContext';

interface NavbarProps {
    navigate: NavigateFunction;
}

const Navbar: React.FC<NavbarProps> = ({ navigate }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        if (user) {
            const notifications = notificationService.getNotificationsForUser(user.id);
            setUnreadCount(notifications.filter(n => !n.isRead).length);
        }
    }, [user]);
    
    // This is a bit of a hack to keep the notification count updated.
    // In a real app, this would be managed by a global state manager or websockets.
    useEffect(() => {
        const interval = setInterval(() => {
            if(user) {
                const notifications = notificationService.getNotificationsForUser(user.id);
                setUnreadCount(notifications.filter(n => !n.isRead).length);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [user]);

    if (!user) return null;

    const handleNotificationsClick = () => {
        setShowNotifications(!showNotifications);
        if (!showNotifications) {
            // Optimistically set count to 0. Real update happens inside Notifications component.
             setUnreadCount(0);
        }
    }

    return (
        <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-md z-50">
            <nav className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer" onClick={() => navigate('dashboard')}>
                    GigConnect
                </div>
                <div className="flex items-center space-x-4">
                    {user.role === UserRole.Employer && (
                        <button onClick={() => navigate('postJob')} className="hidden sm:block text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400">Post a Job</button>
                    )}
                    <button onClick={() => navigate('dashboard')} className="hidden sm:block text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400">Dashboard</button>
                    <button onClick={() => navigate('messages')} className="hidden sm:block text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400">Messages</button>
                    <button onClick={() => navigate('wallet')} className="hidden sm:block text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400">Wallet</button>
                    <button onClick={() => navigate('blog')} className="hidden sm:block text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400">Blog</button>
                    
                     <button onClick={toggleTheme} className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 p-2 rounded-full" aria-label="Toggle theme">
                        {theme === 'light' ? 
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> : 
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        }
                    </button>
                    
                    <div className="relative">
                        <button onClick={handleNotificationsClick} className="relative text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">{unreadCount}</span>
                            )}
                        </button>
                        {showNotifications && <Notifications navigate={navigate} onClose={() => setShowNotifications(false)} />}
                    </div>

                    <button onClick={() => navigate('profile')} className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400">Profile</button>
                    <button onClick={logout} className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400">Logout</button>
                </div>
            </nav>
            {/* Bottom Nav for Mobile */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-t-md p-2 flex justify-around">
                 <button onClick={() => navigate('dashboard')} className="flex flex-col items-center text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    <span className="text-xs">Jobs</span>
                </button>
                {user.role === UserRole.Employer && (
                    <button onClick={() => navigate('postJob')} className="flex flex-col items-center text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="text-xs">Post</span>
                    </button>
                )}
                <button onClick={() => navigate('messages')} className="flex flex-col items-center text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    <span className="text-xs">Messages</span>
                </button>
                <button onClick={() => navigate('wallet')} className="flex flex-col items-center text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2m3-3h-6a2 2 0 000 4h6m-3-2h.01" /></svg>
                    <span className="text-xs">Wallet</span>
                </button>
                <button onClick={() => navigate('blog')} className="flex flex-col items-center text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14-4H5m14 8H5m14 4H5" /></svg>
                    <span className="text-xs">Blog</span>
                </button>
                 <button onClick={() => navigate('profile')} className="flex flex-col items-center text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <span className="text-xs">Profile</span>
                 </button>
            </div>
        </header>
    );
};

export default Navbar;
