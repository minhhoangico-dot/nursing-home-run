import { create } from 'zustand';
import { MedicationLog } from '../types';
import { db } from '../services/databaseService';

interface MedicationState {
    logs: MedicationLog[];
    isLoading: boolean;
    error: string | null;

    fetchLogs: () => Promise<void>;
    addLog: (log: MedicationLog) => Promise<void>;
}

export const useMedicationStore = create<MedicationState>((set) => ({
    logs: [],
    isLoading: false,
    error: null,

    fetchLogs: async () => {
        set({ isLoading: true });
        try {
            const data = await db.medication.getLogs();
            set({ logs: data, isLoading: false });
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    addLog: async (log) => {
        set({ isLoading: true });
        try {
            await db.medication.addLog(log);
            set(state => ({ logs: [log, ...state.logs], isLoading: false }));
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    }
}));
