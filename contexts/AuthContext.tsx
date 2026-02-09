import React, { createContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/authService';
import { supabaseTableSyncService } from '../services/supabaseTableSyncService';

const GODMODE_ADMIN_KEY = 'godmodeAdminId';

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<User | null>;
    logout: () => void;
    signup: (name: string, email: string, password: string, role: 'JobSeeker' | 'Employer') => Promise<User | null>;
    updateUser: (updatedUser: User) => void;
    startGodMode: (targetUserId: string) => void;
    exitGodMode: () => void;
    isGodMode: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isGodMode, setIsGodMode] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            const currentUser = await authService.getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
            }
            setIsGodMode(sessionStorage.getItem(GODMODE_ADMIN_KEY) !== null);
            if (currentUser && supabaseTableSyncService.isEnabled()) {
                supabaseTableSyncService.hydrate();
            }
        };
        loadUser();
    }, []);

    const login = async (email: string, password: string): Promise<User | null> => {
        const loggedInUser = await authService.login(email, password);
        setUser(loggedInUser);
        if (loggedInUser && supabaseTableSyncService.isEnabled()) {
            await supabaseTableSyncService.hydrate();
        }
        return loggedInUser;
    };

    const logout = () => {
        void authService.logout();
        sessionStorage.removeItem(GODMODE_ADMIN_KEY);
        setUser(null);
        setIsGodMode(false);
    };
    
    const signup = async (name: string, email: string, password: string, role: 'JobSeeker' | 'Employer'): Promise<User | null> => {
        const newUser = await authService.signup(name, email, password, role);
        // Auto-login the user by setting them in the context.
        setUser(newUser); 
        if (newUser && supabaseTableSyncService.isEnabled()) {
            await supabaseTableSyncService.hydrate();
        }
        return newUser;
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
        authService.updateCurrentUser(updatedUser);
    };

    const startGodMode = (targetUserId: string) => {
        const adminId = user?.id;
        if (!adminId || user?.role !== UserRole.Admin) return;

        const targetUser = authService.loginById(targetUserId);
        if (targetUser) {
            sessionStorage.setItem(GODMODE_ADMIN_KEY, adminId);
            setUser(targetUser);
            setIsGodMode(true);
        }
    };

    const exitGodMode = () => {
        const adminId = sessionStorage.getItem(GODMODE_ADMIN_KEY);
        if (!adminId) return;

        const adminUser = authService.loginById(adminId);
        if (adminUser) {
            sessionStorage.removeItem(GODMODE_ADMIN_KEY);
            setUser(adminUser);
            setIsGodMode(false);
        } else {
            // Fallback: just logout
            logout();
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, signup, updateUser, startGodMode, exitGodMode, isGodMode }}>
            {children}
        </AuthContext.Provider>
    );
};
