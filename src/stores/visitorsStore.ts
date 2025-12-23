import { create } from 'zustand';
import { VisitorLog } from '../types/index';
import { db } from '../services/databaseService';

interface VisitorsState {
    visitors: VisitorLog[];
    isLoading: boolean;
    error: string | null;

    fetchVisitors: () => Promise<void>;
    addVisitor: (log: VisitorLog) => Promise<void>;
    checkOutVisitor: (id: string, time: string) => Promise<void>;
}

export const useVisitorsStore = create<VisitorsState>((set, get) => ({
    visitors: [],
    isLoading: false,
    error: null,

    fetchVisitors: async () => {
        set({ isLoading: true });
        try {
            const data = await db.visitors.getAll();
            set({ visitors: data, isLoading: false });
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    addVisitor: async (log) => {
        set({ isLoading: true });
        try {
            await db.visitors.upsert(log);
            set(state => ({ visitors: [log, ...state.visitors], isLoading: false }));
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    checkOutVisitor: async (id, time) => {
        set({ isLoading: true });
        try {
            const visitor = get().visitors.find(v => v.id === id);
            if (visitor) {
                const updated = { ...visitor, checkOutTime: time, status: 'Completed' as const };
                await db.visitors.upsert(updated);
                set(state => ({
                    visitors: state.visitors.map(v => v.id === id ? updated : v),
                    isLoading: false
                }));
            }
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    }
}));
