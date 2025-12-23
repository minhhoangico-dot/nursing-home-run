import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { db } from '../services/databaseService';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (user: User) => void;
    logout: () => void;
    fetchUsers: () => Promise<User[]>;
    users: User[]; // List of available users for the simulation login
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            users: [],

            login: (user) => set({ user, isAuthenticated: true }),
            logout: () => set({ user: null, isAuthenticated: false }),
            fetchUsers: async () => {
                set({ isLoading: true, error: null });
                try {
                    const users = await db.users.getAll();
                    set({ users, isLoading: false });
                    return users;
                } catch (error) {
                    set({ error: (error as Error).message, isLoading: false });
                    return [];
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
        }
    )
);
