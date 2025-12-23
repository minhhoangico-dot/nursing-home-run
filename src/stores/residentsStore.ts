import { create } from 'zustand';
import { Resident } from '../types';
import { db } from '../services/databaseService';

interface ResidentsState {
    residents: Resident[];
    selectedResident: Resident | null;
    isLoading: boolean;
    isSyncing: boolean; // For background syncs
    error: string | null;

    fetchResidents: () => Promise<void>;
    addResident: (resident: Resident) => Promise<void>;
    updateResident: (resident: Resident) => Promise<void>;
    deleteResident: (id: string) => Promise<void>; // Note: DB service needs delete method or we just hide it?
    selectResident: (resident: Resident | null) => void;
}

export const useResidentsStore = create<ResidentsState>((set, get) => ({
    residents: [],
    selectedResident: null,
    isLoading: false,
    isSyncing: false,
    error: null,

    fetchResidents: async () => {
        set({ isLoading: true, error: null });
        try {
            const residents = await db.residents.getAll();
            set({ residents, isLoading: false });
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    addResident: async (resident) => {
        set({ isSyncing: true, error: null });
        // Optimistic update
        const currentResidents = get().residents;
        set({ residents: [resident, ...currentResidents] });

        try {
            await db.residents.upsert(resident);
            set({ isSyncing: false });
        } catch (error) {
            // Revert on error
            set({ residents: currentResidents, error: (error as Error).message, isSyncing: false });
            throw error;
        }
    },

    updateResident: async (resident) => {
        set({ isSyncing: true, error: null });
        const currentResidents = get().residents;
        const currentSelected = get().selectedResident;

        // Optimistic update
        set({
            residents: currentResidents.map(r => r.id === resident.id ? resident : r),
            selectedResident: currentSelected?.id === resident.id ? resident : currentSelected
        });

        try {
            await db.residents.upsert(resident);
            set({ isSyncing: false });
        } catch (error) {
            set({ residents: currentResidents, selectedResident: currentSelected, error: (error as Error).message, isSyncing: false });
            throw error;
        }
    },

    deleteResident: async (id) => {
        // Not implemented in DB service yet, just local state removal for now
        const currentResidents = get().residents;
        set({ residents: currentResidents.filter(r => r.id !== id) });
    },

    selectResident: (resident) => set({ selectedResident: resident }),
}));
