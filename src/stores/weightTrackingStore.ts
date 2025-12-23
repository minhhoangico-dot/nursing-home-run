import { create } from 'zustand';
import { WeightRecord } from '../types';
import { supabase } from '../lib/supabase';

interface WeightTrackingState {
    records: WeightRecord[];
    isLoading: boolean;
    error: string | null;
    fetchRecords: (residentId: string) => Promise<void>;
    addRecord: (record: Omit<WeightRecord, 'id' | 'createdAt'>) => Promise<void>;
}

export const useWeightTrackingStore = create<WeightTrackingState>((set) => ({
    records: [],
    isLoading: false,
    error: null,

    fetchRecords: async (residentId) => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase
                .from('weight_records')
                .select('*')
                .eq('resident_id', residentId)
                .order('record_month', { ascending: false });

            if (error) throw error;

            set({
                records: (data || []).map((d: any) => ({
                    id: d.id,
                    residentId: d.resident_id,
                    recordMonth: d.record_month,
                    weightKg: Number(d.weight_kg),
                    notes: d.notes,
                    recordedBy: d.recorded_by,
                    createdAt: d.created_at
                })),
                isLoading: false
            });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    addRecord: async (record) => {
        set({ isLoading: true });
        try {
            const { error } = await supabase
                .from('weight_records')
                .upsert({
                    resident_id: record.residentId,
                    record_month: record.recordMonth,
                    weight_kg: record.weightKg,
                    notes: record.notes,
                    recorded_by: record.recordedBy
                }, { onConflict: 'resident_id,record_month' });

            if (error) throw error;

            const store = useWeightTrackingStore.getState();
            store.fetchRecords(record.residentId);
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    }
}));
