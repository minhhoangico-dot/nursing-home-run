import { create } from 'zustand';
import { Incident } from '../types';
import { db } from '../services/databaseService';

interface IncidentsState {
    incidents: Incident[];
    isLoading: boolean;
    isLoaded: boolean;
    isSyncing: boolean;
    error: string | null;

    fetchIncidents: () => Promise<void>;
    addIncident: (incident: Incident) => Promise<void>;
    updateIncident: (incident: Incident) => Promise<void>;
}

export const useIncidentsStore = create<IncidentsState>((set) => ({
    incidents: [],
    isLoading: false,
    isLoaded: false,
    isSyncing: false,
    error: null,

    fetchIncidents: async () => {
        set({ isLoading: true });
        try {
            const data = await db.incidents.getAll();
            set({ incidents: data, isLoading: false, isLoaded: true });
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    addIncident: async (incident) => {
        set({ isSyncing: true });
        try {
            await db.incidents.upsert(incident);
            set(state => ({ incidents: [incident, ...state.incidents], isSyncing: false, isLoaded: true }));
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
                isSyncing: false,
                isLoaded: true,
            }));
        } catch (error) {
            set({ error: (error as Error).message, isSyncing: false });
        }
    }
}));
