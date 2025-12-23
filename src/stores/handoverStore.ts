import { create } from 'zustand';
import { HandoverReport } from '../types/index';
import { db } from '../services/databaseService';

interface HandoverState {
    handovers: HandoverReport[];
    isLoading: boolean;
    error: string | null;

    fetchHandovers: () => Promise<void>;
    addHandover: (handover: HandoverReport) => Promise<void>;
}

export const useHandoverStore = create<HandoverState>((set) => ({
    handovers: [],
    isLoading: false,
    error: null,

    fetchHandovers: async () => {
        set({ isLoading: true });
        try {
            const data = await db.handovers.getAll();
            set({ handovers: data, isLoading: false });
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    addHandover: async (handover) => {
        set({ isLoading: true });
        try {
            await db.handovers.insert(handover);
            set(state => ({ handovers: [handover, ...state.handovers], isLoading: false }));
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    }
}));
