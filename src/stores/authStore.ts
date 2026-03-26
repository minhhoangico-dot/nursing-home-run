import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { db } from '../services/databaseService';

const sanitizePersistedUser = (user: User | null): User | null =>
    user ? { ...user, password: undefined } : null;

const syncCurrentUser = (currentUser: User | null, users: User[]) => {
    if (!currentUser) {
        return { user: null, isAuthenticated: false };
    }

    const nextUser = users.find((candidate) => candidate.id === currentUser.id);

    if (!nextUser || nextUser.isActive === false) {
        return { user: null, isAuthenticated: false };
    }

    return { user: nextUser, isAuthenticated: true };
};

const upsertUser = (users: User[], user: User) => {
    const nextUsers = users.filter((candidate) => candidate.id !== user.id);
    nextUsers.push(user);
    return nextUsers;
};

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (user: User) => void;
    logout: () => void;
    fetchUsers: () => Promise<User[]>;
    users: User[];
    createUser: (user: User) => Promise<User>;
    updateUser: (user: User) => Promise<User>;
    deactivateUser: (id: string) => Promise<User>;
    reactivateUser: (id: string) => Promise<User>;
    resetPassword: (id: string, password: string) => Promise<User>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            users: [],

            login: (user) => set({ user, isAuthenticated: true, error: null }),
            logout: () => set({ user: null, isAuthenticated: false, error: null }),
            fetchUsers: async () => {
                set({ isLoading: true, error: null });

                try {
                    const users = await db.users.getAll();
                    const currentUserState = syncCurrentUser(get().user, users);

                    set({
                        users,
                        user: currentUserState.user,
                        isAuthenticated: currentUserState.isAuthenticated,
                        isLoading: false,
                    });

                    return users;
                } catch (error) {
                    set({ error: (error as Error).message, isLoading: false });
                    throw error;
                }
            },
            createUser: async (user) => {
                set({ isLoading: true, error: null });

                try {
                    const createdUser = await db.users.create(user);
                    set((state) => ({
                        users: upsertUser(state.users, createdUser),
                        isLoading: false,
                        error: null,
                    }));
                    return createdUser;
                } catch (error) {
                    const message = (error as Error).message;
                    set({ error: message, isLoading: false });
                    throw error;
                }
            },
            updateUser: async (user) => {
                const currentUser = get().user;

                if (currentUser?.id === user.id && currentUser.role !== user.role) {
                    const message = 'You cannot change your own role.';
                    set({ error: message });
                    throw new Error(message);
                }

                set({ isLoading: true, error: null });

                try {
                    const updatedUser = await db.users.update(user);
                    set((state) => ({
                        users: upsertUser(state.users, updatedUser),
                        user: state.user?.id === updatedUser.id
                            ? (updatedUser.isActive === false ? null : updatedUser)
                            : state.user,
                        isAuthenticated: state.user?.id === updatedUser.id
                            ? updatedUser.isActive !== false
                            : state.isAuthenticated,
                        isLoading: false,
                        error: null,
                    }));
                    return updatedUser;
                } catch (error) {
                    const message = (error as Error).message;
                    set({ error: message, isLoading: false });
                    throw error;
                }
            },
            deactivateUser: async (id) => {
                if (get().user?.id === id) {
                    const message = 'You cannot deactivate your own account.';
                    set({ error: message });
                    throw new Error(message);
                }

                set({ isLoading: true, error: null });

                try {
                    const updatedUser = await db.users.deactivate(id);
                    set((state) => ({
                        users: upsertUser(state.users, updatedUser),
                        isLoading: false,
                        error: null,
                    }));
                    return updatedUser;
                } catch (error) {
                    const message = (error as Error).message;
                    set({ error: message, isLoading: false });
                    throw error;
                }
            },
            reactivateUser: async (id) => {
                set({ isLoading: true, error: null });

                try {
                    const updatedUser = await db.users.reactivate(id);
                    set((state) => ({
                        users: upsertUser(state.users, updatedUser),
                        isLoading: false,
                        error: null,
                    }));
                    return updatedUser;
                } catch (error) {
                    const message = (error as Error).message;
                    set({ error: message, isLoading: false });
                    throw error;
                }
            },
            resetPassword: async (id, password) => {
                set({ isLoading: true, error: null });

                try {
                    const updatedUser = await db.users.resetPassword(id, password);
                    set((state) => ({
                        users: upsertUser(state.users, updatedUser),
                        user: state.user?.id === updatedUser.id ? updatedUser : state.user,
                        isLoading: false,
                        error: null,
                    }));
                    return updatedUser;
                } catch (error) {
                    const message = (error as Error).message;
                    set({ error: message, isLoading: false });
                    throw error;
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: sanitizePersistedUser(state.user),
                isAuthenticated: state.isAuthenticated && !!state.user && state.user.isActive !== false,
            }),
        }
    )
);
