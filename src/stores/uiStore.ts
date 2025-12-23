import { create } from 'zustand';
import { ToastType } from '../components/ui/Toast';

export interface ToastMessage {
    id: string;
    type: ToastType;
    title: string;
    message: string;
}

interface UiState {
    sidebarOpen: boolean;
    toasts: ToastMessage[];
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    addToast: (type: ToastType, title: string, message: string) => void;
    removeToast: (id: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
    sidebarOpen: true,
    toasts: [],

    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),

    addToast: (type, title, message) => {
        const id = Math.random().toString(36).substr(2, 9);
        set((state) => ({ toasts: [...state.toasts, { id, type, title, message }] }));
        // Auto remove after 3 seconds
        setTimeout(() => {
            set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
        }, 5000); // 5 seconds match existing
    },

    removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
