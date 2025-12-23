import { create } from 'zustand';
import { ActivityEvent } from '../types';
import { db } from '../services/databaseService';

interface ActivitiesState {
    activities: ActivityEvent[];
    isLoading: boolean;
    error: string | null;

    fetchActivities: () => Promise<void>;
    addActivity: (activity: ActivityEvent) => Promise<void>;
}

export const useActivitiesStore = create<ActivitiesState>((set) => ({
    activities: [],
    isLoading: false,
    error: null,

    fetchActivities: async () => {
        set({ isLoading: true });
        try {
            const data = await db.activities.getAll();
            set({ activities: data, isLoading: false });
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    addActivity: async (activity) => {
        set({ isLoading: true });
        try {
            await db.activities.insert(activity);
            set(state => ({ activities: [...state.activities, activity], isLoading: false }));
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    }
}));
