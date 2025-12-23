import { create } from 'zustand';
import { MaintenanceRequest } from '../types';
import { db } from '../services/databaseService';

// Logic for rooms/beds often overlaps with Residents and Maintenance modules.
// We will manage MaintenanceRequests here and derived room availability.

interface RoomsState {
    maintenanceRequests: MaintenanceRequest[];
    isLoading: boolean;
    isSyncing: boolean;
    error: string | null;

    fetchMaintenanceRequests: () => Promise<void>;
    addMaintenanceRequest: (req: MaintenanceRequest) => Promise<void>;
    updateMaintenanceRequests: (reqs: MaintenanceRequest[]) => Promise<void>;
}

export const useRoomsStore = create<RoomsState>((set) => ({
    maintenanceRequests: [],
    isLoading: false,
    isSyncing: false,
    error: null,

    fetchMaintenanceRequests: async () => {
        set({ isLoading: true });
        try {
            const reqs = await db.maintenance.getAll();
            set({ maintenanceRequests: reqs, isLoading: false });
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    addMaintenanceRequest: async (req) => {
        set({ isSyncing: true });
        try {
            await db.maintenance.upsert(req);
            set(state => ({ maintenanceRequests: [req, ...state.maintenanceRequests], isSyncing: false }));
        } catch (error) {
            set({ error: (error as Error).message, isSyncing: false });
        }
    },

    updateMaintenanceRequests: async (reqs) => {
        set({ isSyncing: true });
        try {
            // Bulk upsert logic
            await db.maintenance.bulkUpsert(reqs);
            set({ maintenanceRequests: reqs, isSyncing: false });
        } catch (error) {
            set({ error: (error as Error).message, isSyncing: false });
        }
    }
}));
