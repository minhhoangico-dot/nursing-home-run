import { create } from 'zustand';
import { Incident } from '../types';
import { db } from '../services/databaseService';

interface IncidentsState {
    incidents: Incident[];
    isLoading: boolean;
    isSyncing: boolean;
    error: string | null;

    fetchIncidents: () => Promise<void>;
    addIncident: (incident: Incident) => Promise<void>;
    updateIncident: (incident: Incident) => Promise<void>;
}

export const useIncidentsStore = create<IncidentsState>((set) => ({
    incidents: [],
    isLoading: false,
    isSyncing: false,
    error: null,

    fetchIncidents: async () => {
        set({ isLoading: true });
        try {
            const data = await db.incidents.getAll();
            set({ incidents: data, isLoading: false });
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    addIncident: async (incident) => {
        set({ isSyncing: true });
        try {
            await db.incidents.upsert(incident);
            set(state => ({ incidents: [incident, ...state.incidents], isSyncing: false }));
        } catch (error) {
            set({ error: (error as Error).message, isSyncing: false });
        }
    },

    updateIncident: async (incident) => {
        set({ isSyncing: true });
        try {
            await db.incidents.upsert(incident);
            set(state => ({
                incidents: state.incidents.map(i => i.id === incident.id ? incident : i),
                isSyncing: false
            }));
        } catch (error) {
            set({ error: (error as Error).message, isSyncing: false });
        }
    }
}));
