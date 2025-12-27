import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Prescription, PrescriptionItem, Medicine } from '../types/medical';

interface PrescriptionsState {
    prescriptions: Prescription[];
    isLoading: boolean;
    error: string | null;
    medicines: Medicine[];

    // Actions
    fetchPrescriptions: (residentId?: string) => Promise<void>;
    createPrescription: (prescription: Omit<Prescription, 'id' | 'items'>, items: Omit<PrescriptionItem, 'id' | 'prescriptionId'>[]) => Promise<void>;
    cancelPrescription: (id: string) => Promise<void>;
    completePrescription: (id: string) => Promise<void>;
    fetchMedicines: () => Promise<void>;
    createMedicine: (medicine: Partial<Medicine>) => Promise<void>;
    updateMedicine: (id: string, medicine: Partial<Medicine>) => Promise<void>;
    deleteMedicine: (id: string) => Promise<void>;
}

export const usePrescriptionsStore = create<PrescriptionsState>((set, get) => ({
    prescriptions: [],
    isLoading: false,
    error: null,
    medicines: [],

    fetchPrescriptions: async (residentId) => {
        set({ isLoading: true, error: null });
        try {
            let query = supabase
                .from('prescriptions')
                .select(`
          *,
          items:prescription_items(*)
        `)
                .order('prescription_date', { ascending: false });

            if (residentId) {
                query = query.eq('resident_id', residentId);
            }

            const { data, error } = await query;

            if (error) throw error;

            // Transform snake_case to camelCase mapping manually or ensure types match DB
            // For now assuming the types need mapping if DB is snake_case (which my migration used)
            const mappedData: Prescription[] = (data || []).map((p: any) => ({
                id: p.id,
                code: p.code,
                residentId: p.resident_id,
                doctorId: p.doctor_id,
                doctorName: p.doctor_name,
                diagnosis: p.diagnosis,
                prescriptionDate: p.prescription_date,
                startDate: p.start_date,
                endDate: p.end_date,
                status: p.status,
                notes: p.notes,
                items: (p.items || []).map((i: any) => ({
                    id: i.id,
                    prescriptionId: i.prescription_id,
                    medicineId: i.medicine_id,
                    medicineName: i.medicine_name,
                    dosage: i.dosage,
                    frequency: i.frequency,
                    timesOfDay: i.times_of_day || [],
                    quantity: i.quantity,
                    instructions: i.instructions
                }))
            }));

            set({ prescriptions: mappedData });
        } catch (err: any) {
            console.error('Error fetching prescriptions:', err);
            set({ error: err.message });
            // Fallback for demo if DB doesn't exist yet
            if (err.message?.includes('relation "prescriptions" does not exist')) {
                console.warn('Using mock data for prescriptions');
                set({ prescriptions: [] });
            }
        } finally {
            set({ isLoading: false });
        }
    },

    createPrescription: async (prescriptionData, itemsData) => {
        set({ isLoading: true, error: null });
        try {
            // 1. Insert Header
            const { data: pData, error: pError } = await supabase
                .from('prescriptions')
                .insert({
                    code: prescriptionData.code,
                    resident_id: prescriptionData.residentId,
                    doctor_id: prescriptionData.doctorId,
                    doctor_name: prescriptionData.doctorName,
                    diagnosis: prescriptionData.diagnosis,
                    prescription_date: prescriptionData.prescriptionDate,
                    start_date: prescriptionData.startDate,
                    end_date: prescriptionData.endDate,
                    status: prescriptionData.status,
                    notes: prescriptionData.notes
                })
                .select()
                .single();

            if (pError) throw pError;

            // 2. Insert Items with returned ID
            const itemsToInsert = itemsData.map(item => ({
                prescription_id: pData.id,
                medicine_id: item.medicineId,
                medicine_name: item.medicineName,
                dosage: item.dosage,
                frequency: item.frequency,
                times_of_day: item.timesOfDay,
                quantity: item.quantity,
                instructions: item.instructions
            }));

            const { error: iError } = await supabase
                .from('prescription_items')
                .insert(itemsToInsert);

            if (iError) throw iError;

            // Reload
            await get().fetchPrescriptions(prescriptionData.residentId);

        } catch (err: any) {
            console.error('Create prescription error', err);
            set({ error: err.message });
            throw err;
        } finally {
            set({ isLoading: false });
        }
    },

    cancelPrescription: async (id) => {
        try {
            await supabase.from('prescriptions').update({ status: 'Cancelled' }).eq('id', id);
            const current = get().prescriptions;
            set({ prescriptions: current.map(p => p.id === id ? { ...p, status: 'Cancelled' } : p) });
        } catch (e: any) { set({ error: e.message }); }
    },

    completePrescription: async (id) => {
        try {
            await supabase.from('prescriptions').update({ status: 'Completed' }).eq('id', id);
            const current = get().prescriptions;
            set({ prescriptions: current.map(p => p.id === id ? { ...p, status: 'Completed' } : p) });
        } catch (e: any) { set({ error: e.message }); }
    },

    fetchMedicines: async () => {
        try {
            const { data, error } = await supabase.from('medicines').select('*').order('name');
            if (error) throw error;

            const mapped: Medicine[] = data.map((m: any) => ({
                id: m.id,
                name: m.name,
                activeIngredient: m.active_ingredient,
                unit: m.unit,
                defaultDosage: m.default_dosage,
                price: m.price
            }));
            set({ medicines: mapped });
        } catch (e: any) {
            console.error('Fetch medicines error', e);
        }
    },

    createMedicine: async (medicine) => {
        try {
            const { error } = await supabase.from('medicines').insert({
                name: medicine.name,
                active_ingredient: medicine.activeIngredient,
                unit: medicine.unit,
                default_dosage: medicine.defaultDosage,
                price: medicine.price
            });
            if (error) throw error;
            await get().fetchMedicines();
        } catch (e: any) {
            set({ error: e.message });
            throw e;
        }
    },

    updateMedicine: async (id, medicine) => {
        try {
            const { error } = await supabase.from('medicines').update({
                name: medicine.name,
                active_ingredient: medicine.activeIngredient,
                unit: medicine.unit,
                default_dosage: medicine.defaultDosage,
                price: medicine.price
            }).eq('id', id);
            if (error) throw error;
            await get().fetchMedicines();
        } catch (e: any) {
            set({ error: e.message });
            throw e;
        }
    },

    deleteMedicine: async (id) => {
        try {
            const { error } = await supabase.from('medicines').delete().eq('id', id);
            if (error) throw error;
            await get().fetchMedicines();
        } catch (e: any) {
            set({ error: e.message });
            throw e;
        }
    }
}));
