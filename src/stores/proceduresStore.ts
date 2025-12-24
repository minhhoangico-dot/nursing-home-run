import { create } from 'zustand';
import { ProcedureRecord } from '../types';
import { supabase } from '../lib/supabase';

interface ProceduresState {
    records: ProcedureRecord[];
    isLoading: boolean;
    error: string | null;
    fetchRecords: (residentId: string) => Promise<void>;
    fetchAllRecords: (month: number, year: number) => Promise<void>;
    upsertRecord: (record: Partial<ProcedureRecord>) => Promise<void>;
}

export const useProceduresStore = create<ProceduresState>((set) => ({
    records: [],
    isLoading: false,
    error: null,

    fetchRecords: async (residentId) => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase
                .from('procedure_records')
                .select('*')
                .eq('resident_id', residentId)
                .order('record_date', { ascending: false });

            if (error) throw error;

            set((state) => ({
                records: (data || []).map((d: any) => ({
                    id: d.id,
                    residentId: d.resident_id,
                    recordDate: d.record_date,
                    injection: d.injection,
                    ivDrip: d.iv_drip,
                    gastricTube: d.gastric_tube,
                    urinaryCatheter: d.urinary_catheter,
                    bladderWash: d.bladder_wash,
                    bloodSugarTest: d.blood_sugar_test,
                    bloodPressure: d.blood_pressure,
                    oxygenTherapy: d.oxygen_therapy,
                    woundDressing: d.wound_dressing,
                    injectionCount: d.injection_count,
                    ivDripCount: d.iv_drip_count,
                    performedBy: d.performed_by,
                    notes: d.notes,
                    createdAt: d.created_at
                })),
                isLoading: false
            }));
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    fetchAllRecords: async (month, year) => {
        set({ isLoading: true, error: null });
        try {
            const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
            const endDate = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;

            const { data, error } = await supabase
                .from('procedure_records')
                .select('*')
                .gte('record_date', startDate)
                .lte('record_date', endDate);

            if (error) throw error;

            set({
                records: (data || []).map((d: any) => ({
                    id: d.id,
                    residentId: d.resident_id,
                    recordDate: d.record_date,
                    injection: d.injection,
                    ivDrip: d.iv_drip,
                    gastricTube: d.gastric_tube,
                    urinaryCatheter: d.urinary_catheter,
                    bladderWash: d.bladder_wash,
                    bloodSugarTest: d.blood_sugar_test,
                    bloodPressure: d.blood_pressure,
                    oxygenTherapy: d.oxygen_therapy,
                    woundDressing: d.wound_dressing,
                    injectionCount: d.injection_count,
                    ivDripCount: d.iv_drip_count,
                    performedBy: d.performed_by,
                    notes: d.notes,
                    createdAt: d.created_at
                })),
                isLoading: false
            });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    upsertRecord: async (record) => {
        set({ isLoading: true });
        try {
            const dbRecord = {
                resident_id: record.residentId,
                record_date: record.recordDate,
                injection: record.injection,
                iv_drip: record.ivDrip,
                gastric_tube: record.gastricTube,
                urinary_catheter: record.urinaryCatheter,
                bladder_wash: record.bladderWash,
                blood_sugar_test: record.bloodSugarTest,
                blood_pressure: record.bloodPressure,
                oxygen_therapy: record.oxygenTherapy,
                wound_dressing: record.woundDressing,
                injection_count: record.injectionCount,
                iv_drip_count: record.ivDripCount,
                performed_by: record.performedBy,
                notes: record.notes
            };

            const { error } = await supabase
                .from('procedure_records')
                .upsert(dbRecord, { onConflict: 'resident_id,record_date' });

            if (error) throw error;
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    }
}));
