import { storageService } from './storageService';
import { User, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { supabaseTableSyncService } from './supabaseTableSyncService';

const SESSION_KEY = 'currentUser';
const normalizeEmail = (email: string) => email.trim().toLowerCase();
const adminEmail = (import.meta as any)?.env?.VITE_ADMIN_EMAIL
    ? String((import.meta as any).env.VITE_ADMIN_EMAIL).toLowerCase()
    : '';

export const authService = {
    login: async (email: string, password: string): Promise<User | null> => {
        const normalizedEmail = normalizeEmail(email);
        if (isSupabaseConfigured && supabase) {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: normalizedEmail,
                password,
            });
            if (error) throw new Error(error.message);
            if (!data.user) return null;

            let users = storageService.getUsers();
            let profile = users.find(u => normalizeEmail(u.email) === normalizedEmail);
            if (!profile) {
                profile = {
                    id: data.user.id,
                    email: normalizedEmail,
                    name: normalizedEmail.split('@')[0],
                    role: adminEmail && normalizedEmail === adminEmail ? UserRole.Admin : UserRole.JobSeeker,
                    approved: true,
                };
                users = [...users, profile];
                storageService.saveUsers(users);
                supabaseTableSyncService.syncItem('users', profile);
            } else if (!profile.id || profile.id.startsWith('user-')) {
                profile = { ...profile, id: data.user.id };
                storageService.saveUsers(users.map(u => (u.email === profile!.email ? profile! : u)));
                supabaseTableSyncService.syncItem('users', profile);
            }

            sessionStorage.setItem(SESSION_KEY, JSON.stringify(profile));
            return profile;
        }

        const users = storageService.getUsers();
        const user = users.find(u => normalizeEmail(u.email) === normalizedEmail && u.password === password);

        if (user && user.approved) {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
            return user;
        }
        if (user && !user.approved) {
            throw new Error("Your account is pending admin approval.");
        }
        return null;
    },

    loginById: (userId: string): User | null => {
        const users = storageService.getUsers();
        const user = users.find(u => u.id === userId);
        if (user) {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
            return user;
        }
        return null;
    },

    logout: async (): Promise<void> => {
        if (isSupabaseConfigured && supabase) {
            await supabase.auth.signOut();
        }
        sessionStorage.removeItem(SESSION_KEY);
    },
    
    signup: async (name: string, email: string, password: string, role: 'JobSeeker' | 'Employer'): Promise<User> => {
        const users = storageService.getUsers();
        const normalizedEmail = normalizeEmail(email);
        if (users.some(u => normalizeEmail(u.email) === normalizedEmail)) {
            throw new Error('User with this email already exists.');
        }

        if (isSupabaseConfigured && supabase) {
            const { data, error } = await supabase.auth.signUp({
                email: normalizedEmail,
                password,
            });
            if (error) throw new Error(error.message);

            const newUser: User = {
                id: data.user?.id || `user-${Date.now()}`,
                name,
                email: normalizedEmail,
                role: adminEmail && normalizedEmail === adminEmail ? UserRole.Admin : (role === 'JobSeeker' ? UserRole.JobSeeker : UserRole.Employer),
                approved: true,
                skills: role === 'JobSeeker' ? [] : undefined,
                companyName: role === 'Employer' ? name : undefined,
            };
            storageService.saveUsers([...users, newUser]);
            supabaseTableSyncService.syncItem('users', newUser);

            if (data.session) {
                sessionStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
            }
            return newUser;
        }

        const newUser: User = {
            id: `user-${Date.now()}`,
            name,
            email: normalizedEmail,
            password,
            role: role === 'JobSeeker' ? UserRole.JobSeeker : UserRole.Employer,
            approved: true, // Automatically approve user
            skills: role === 'JobSeeker' ? [] : undefined,
            companyName: role === 'Employer' ? name : undefined,
        };

        storageService.saveUsers([...users, newUser]);
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
        return newUser;
    },

    getCurrentUser: async (): Promise<User | null> => {
        if (isSupabaseConfigured && supabase) {
            const { data } = await supabase.auth.getUser();
            if (!data.user) return null;
            const normalizedEmail = normalizeEmail(data.user.email || '');
            let users = storageService.getUsers();
            let profile = users.find(u => normalizeEmail(u.email) === normalizedEmail);
            if (!profile) {
                profile = {
                    id: data.user.id,
                    email: normalizedEmail,
                    name: normalizedEmail.split('@')[0],
                    role: adminEmail && normalizedEmail === adminEmail ? UserRole.Admin : UserRole.JobSeeker,
                    approved: true,
                };
                users = [...users, profile];
                storageService.saveUsers(users);
                supabaseTableSyncService.syncItem('users', profile);
            } else if (!profile.id || profile.id.startsWith('user-')) {
                profile = { ...profile, id: data.user.id };
                storageService.saveUsers(users.map(u => (u.email === profile!.email ? profile! : u)));
                supabaseTableSyncService.syncItem('users', profile);
            }
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(profile));
            return profile;
        }

        const userJson = sessionStorage.getItem(SESSION_KEY);
        return userJson ? JSON.parse(userJson) : null;
    },

    updateCurrentUser: (updatedUser: User): void => {
        const userJson = sessionStorage.getItem(SESSION_KEY);
        if (userJson) {
            const users = storageService.getUsers();
            const userIndex = users.findIndex(u => u.id === updatedUser.id);
            if (userIndex !== -1) {
                users[userIndex] = { ...users[userIndex], ...updatedUser };
                storageService.saveUsers(users);
                sessionStorage.setItem(SESSION_KEY, JSON.stringify(users[userIndex]));
                supabaseTableSyncService.syncItem('users', users[userIndex]);
            }
        }
    }
};
