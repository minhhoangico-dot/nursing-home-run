import { create } from 'zustand';
import { StaffSchedule, ShiftAssignment } from '../types/schedule';
import { db } from '../services/databaseService';

interface ScheduleState {
    schedules: StaffSchedule[];
    isLoading: boolean;
    error: string | null;

    fetchSchedules: () => Promise<void>;
    updateSchedule: (userId: string, date: string, assignments: ShiftAssignment[]) => Promise<void>;
    addStaff: (staff: StaffSchedule) => Promise<void>;
    removeStaff: (userId: string) => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
    schedules: [],
    isLoading: false,
    error: null,

    fetchSchedules: async () => {
        set({ isLoading: true });
        try {
            const data = await db.schedules.getAll();
            set({ schedules: data, isLoading: false });
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    updateSchedule: async (userId, date, assignments) => {
        try {
            const schedules = get().schedules;
            const staff = schedules.find(s => s.userId === userId);
            if (!staff) return;

            const updatedStaff = {
                ...staff,
                shifts: { ...staff.shifts, [date]: assignments }
            };

            await db.schedules.upsert(updatedStaff);

            set((state) => ({
                schedules: state.schedules.map((s) =>
                    s.userId === userId ? updatedStaff : s
                ),
            }));
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    addStaff: async (staff) => {
        try {
            await db.schedules.upsert(staff);
            set(state => ({ schedules: [...state.schedules, staff] }));
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    removeStaff: async (userId) => {
        try {
            await db.schedules.delete(userId);
            set(state => ({ schedules: state.schedules.filter(s => s.userId !== userId) }));
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}));
