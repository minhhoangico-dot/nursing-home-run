import { create } from 'zustand';
import { BloodSugarRecord } from '../types';
import { supabase } from '../lib/supabase';

interface DiabetesState {
    records: BloodSugarRecord[];
    isLoading: boolean;
    error: string | null;
    fetchRecords: (residentId: string) => Promise<void>;
    addRecord: (record: Omit<BloodSugarRecord, 'id' | 'createdAt'>) => Promise<void>;
    updateRecord: (id: string, updates: Partial<BloodSugarRecord>) => Promise<void>;
    fetchAllRecords: (month: string) => Promise<void>;
}

export const useDiabetesStore = create<DiabetesState>((set) => ({
    records: [],
    isLoading: false,
    error: null,

    fetchRecords: async (residentId) => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase
                .from('blood_sugar_records')
                .select('*')
                .eq('resident_id', residentId)
                .order('record_date', { ascending: false });

            if (error) throw error;

            set({
                records: (data || []).map((d: any) => ({
                    id: d.id,
                    residentId: d.resident_id,
                    recordDate: d.record_date,
                    morningBeforeMeal: d.morning_before_meal,
                    morningAfterMeal: d.morning_after_meal,
                    lunchBeforeMeal: d.lunch_before_meal,
                    lunchAfterMeal: d.lunch_after_meal,
                    dinnerBeforeMeal: d.dinner_before_meal,
                    dinnerAfterMeal: d.dinner_after_meal,
                    insulinUnits: d.insulin_units,
                    insulinTime: d.insulin_time,
                    administeredBy: d.administered_by,
                    notes: d.notes,
                    createdAt: d.created_at,
                    createdBy: d.created_by
                })),
                isLoading: false
            });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    fetchAllRecords: async (month) => {
        set({ isLoading: true, error: null });
        try {
            // month is YYYY-MM
            const start = `${month}-01`;
            const end = `${month}-31`; // Approx

            const { data, error } = await supabase
                .from('blood_sugar_records')
                .select('*')
                .gte('record_date', start)
                .lte('record_date', end)
                .order('record_date', { ascending: false });

            if (error) throw error;

            set({
                records: (data || []).map((d: any) => ({
                    id: d.id,
                    residentId: d.resident_id,
                    recordDate: d.record_date,
                    morningBeforeMeal: d.morning_before_meal,
                    morningAfterMeal: d.morning_after_meal,
                    lunchBeforeMeal: d.lunch_before_meal,
                    lunchAfterMeal: d.lunch_after_meal,
                    dinnerBeforeMeal: d.dinner_before_meal,
                    dinnerAfterMeal: d.dinner_after_meal,
                    insulinUnits: d.insulin_units,
                    insulinTime: d.insulin_time,
                    administeredBy: d.administered_by,
                    notes: d.notes,
                    createdAt: d.created_at,
                    createdBy: d.created_by
                })),
                isLoading: false
            });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    addRecord: async (record) => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase
                .from('blood_sugar_records')
                .insert({
                    resident_id: record.residentId,
                    record_date: record.recordDate,
                    morning_before_meal: record.morningBeforeMeal,
                    morning_after_meal: record.morningAfterMeal,
                    lunch_before_meal: record.lunchBeforeMeal,
                    lunch_after_meal: record.lunchAfterMeal,
                    dinner_before_meal: record.dinnerBeforeMeal,
                    dinner_after_meal: record.dinnerAfterMeal,
                    insulin_units: record.insulinUnits,
                    insulin_time: record.insulinTime,
                    administered_by: record.administeredBy,
                    notes: record.notes
                })
                .select()
                .single();

            if (error) throw error;

            set((state) => ({
                records: [{
                    id: data.id,
                    residentId: data.resident_id,
                    recordDate: data.record_date,
                    morningBeforeMeal: data.morning_before_meal,
                    morningAfterMeal: data.morning_after_meal,
                    lunchBeforeMeal: data.lunch_before_meal,
                    lunchAfterMeal: data.lunch_after_meal,
                    dinnerBeforeMeal: data.dinner_before_meal,
                    dinnerAfterMeal: data.dinner_after_meal,
                    insulinUnits: data.insulin_units,
                    insulinTime: data.insulin_time,
                    administeredBy: data.administered_by,
                    notes: data.notes,
                    createdAt: data.created_at,
                    createdBy: data.created_by
                }, ...state.records],
                isLoading: false
            }));
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    updateRecord: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
            const dbUpdates: any = {};
            if (updates.morningBeforeMeal !== undefined) dbUpdates.morning_before_meal = updates.morningBeforeMeal;
            if (updates.morningAfterMeal !== undefined) dbUpdates.morning_after_meal = updates.morningAfterMeal;
            if (updates.lunchBeforeMeal !== undefined) dbUpdates.lunch_before_meal = updates.lunchBeforeMeal;
            if (updates.lunchAfterMeal !== undefined) dbUpdates.lunch_after_meal = updates.lunchAfterMeal;
            if (updates.dinnerBeforeMeal !== undefined) dbUpdates.dinner_before_meal = updates.dinnerBeforeMeal;
            if (updates.dinnerAfterMeal !== undefined) dbUpdates.dinner_after_meal = updates.dinnerAfterMeal;
            if (updates.insulinUnits !== undefined) dbUpdates.insulin_units = updates.insulinUnits;
            if (updates.insulinTime !== undefined) dbUpdates.insulin_time = updates.insulinTime;
            if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

            const { error } = await supabase
                .from('blood_sugar_records')
                .update(dbUpdates)
                .eq('id', id);

            if (error) throw error;

            set((state) => ({
                records: state.records.map(r => r.id === id ? { ...r, ...updates } : r),
                isLoading: false
            }));
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },
}));
