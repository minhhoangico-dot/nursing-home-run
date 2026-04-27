import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { BloodSugarRecord } from '../types';
import { getYearMonthRange } from '@/src/utils/monthDateRange';

export const BLOOD_SUGAR_COLUMNS = [
    'id',
    'resident_id',
    'record_date',
    'morning_before_meal',
    'morning_after_meal',
    'lunch_before_meal',
    'lunch_after_meal',
    'dinner_before_meal',
    'dinner_after_meal',
    'insulin_units',
    'insulin_time',
    'administered_by',
    'notes',
    'created_at',
    'created_by',
].join(',');

const trimMonthCache = <T,>(recordsByMonth: Record<string, T[]>) => {
    const keys = Object.keys(recordsByMonth).sort();

    if (keys.length <= 3) {
        return recordsByMonth;
    }

    const trimmed = { ...recordsByMonth };
    const keysToRemove = keys.slice(0, keys.length - 3);
    keysToRemove.forEach((key) => {
        delete trimmed[key];
    });
    return trimmed;
};

const mapRecord = (record: any): BloodSugarRecord => ({
    id: record.id,
    residentId: record.resident_id,
    recordDate: record.record_date,
    morningBeforeMeal: record.morning_before_meal,
    morningAfterMeal: record.morning_after_meal,
    lunchBeforeMeal: record.lunch_before_meal,
    lunchAfterMeal: record.lunch_after_meal,
    dinnerBeforeMeal: record.dinner_before_meal,
    dinnerAfterMeal: record.dinner_after_meal,
    insulinUnits: record.insulin_units,
    insulinTime: record.insulin_time,
    administeredBy: record.administered_by,
    notes: record.notes,
    createdAt: record.created_at,
    createdBy: record.created_by
});

const buildInsert = (record: Omit<BloodSugarRecord, 'id' | 'createdAt'>) => ({
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
});

const buildUpdates = (updates: Partial<BloodSugarRecord>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.morningBeforeMeal !== undefined) dbUpdates.morning_before_meal = updates.morningBeforeMeal;
    if (updates.morningAfterMeal !== undefined) dbUpdates.morning_after_meal = updates.morningAfterMeal;
    if (updates.lunchBeforeMeal !== undefined) dbUpdates.lunch_before_meal = updates.lunchBeforeMeal;
    if (updates.lunchAfterMeal !== undefined) dbUpdates.lunch_after_meal = updates.lunchAfterMeal;
    if (updates.dinnerBeforeMeal !== undefined) dbUpdates.dinner_before_meal = updates.dinnerBeforeMeal;
    if (updates.dinnerAfterMeal !== undefined) dbUpdates.dinner_after_meal = updates.dinnerAfterMeal;
    if (updates.insulinUnits !== undefined) dbUpdates.insulin_units = updates.insulinUnits;
    if (updates.insulinTime !== undefined) dbUpdates.insulin_time = updates.insulinTime;
    if (updates.administeredBy !== undefined) dbUpdates.administered_by = updates.administeredBy;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    return dbUpdates;
};

const upsertMonthRecord = (records: BloodSugarRecord[], record: BloodSugarRecord) => {
    const existingIndex = records.findIndex((currentRecord) => currentRecord.id === record.id);

    if (existingIndex >= 0) {
        const nextRecords = [...records];
        nextRecords[existingIndex] = record;
        return nextRecords;
    }

    return [record, ...records];
};

interface BloodSugarState {
    records: BloodSugarRecord[];
    recordsByMonth: Record<string, BloodSugarRecord[]>;
    isLoading: boolean;
    error: string | null;
    fetchRecords: (residentId: string) => Promise<void>;
    addRecord: (record: Omit<BloodSugarRecord, 'id' | 'createdAt'>) => Promise<void>;
    updateRecord: (id: string, updates: Partial<BloodSugarRecord>) => Promise<void>;
    fetchAllRecords: (month: string) => Promise<void>;
}

export const useBloodSugarStore = create<BloodSugarState>((set, get) => ({
    records: [],
    recordsByMonth: {},
    isLoading: false,
    error: null,

    fetchRecords: async (residentId) => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase
                .from('blood_sugar_records')
                .select(BLOOD_SUGAR_COLUMNS)
                .eq('resident_id', residentId)
                .order('record_date', { ascending: false });

            if (error) throw error;

            set({
                records: (data || []).map(mapRecord),
                isLoading: false
            });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    fetchAllRecords: async (month) => {
        const cachedRecords = get().recordsByMonth[month];

        if (cachedRecords) {
            set({ records: cachedRecords, isLoading: false, error: null });
        } else {
            set({ isLoading: true, error: null });
        }

        try {
            const { startDate: start, endDate: end } = getYearMonthRange(month);

            const { data, error } = await supabase
                .from('blood_sugar_records')
                .select(BLOOD_SUGAR_COLUMNS)
                .gte('record_date', start)
                .lte('record_date', end)
                .order('record_date', { ascending: false });

            if (error) throw error;

            const records = (data || []).map(mapRecord);
            set((state) => ({
                records,
                recordsByMonth: trimMonthCache({
                    ...state.recordsByMonth,
                    [month]: records,
                }),
                isLoading: false,
            }));
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    addRecord: async (record) => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase
                .from('blood_sugar_records')
                .insert(buildInsert(record))
                .select(BLOOD_SUGAR_COLUMNS)
                .single();

            if (error) throw error;

            const mappedRecord = mapRecord(data);
            const monthKey = mappedRecord.recordDate.slice(0, 7);

            set((state) => ({
                records: [mappedRecord, ...state.records],
                recordsByMonth: state.recordsByMonth[monthKey]
                    ? trimMonthCache({
                        ...state.recordsByMonth,
                        [monthKey]: upsertMonthRecord(state.recordsByMonth[monthKey], mappedRecord),
                    })
                    : state.recordsByMonth,
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
            const { error } = await supabase
                .from('blood_sugar_records')
                .update(buildUpdates(updates))
                .eq('id', id);

            if (error) throw error;

            set((state) => {
                const records = state.records.map((record) => record.id === id ? { ...record, ...updates } : record);
                const updatedRecord = records.find((record) => record.id === id);

                if (!updatedRecord) {
                    return {
                        records,
                        isLoading: false,
                    };
                }

                const monthKey = updatedRecord.recordDate.slice(0, 7);
                return {
                    records,
                    recordsByMonth: state.recordsByMonth[monthKey]
                        ? trimMonthCache({
                            ...state.recordsByMonth,
                            [monthKey]: upsertMonthRecord(state.recordsByMonth[monthKey], updatedRecord),
                        })
                        : state.recordsByMonth,
                    isLoading: false
                };
            });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },
}));
