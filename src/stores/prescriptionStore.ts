import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { normalizePrescriptionStatus, Prescription, PrescriptionItem, Medicine } from '../types/medical';
import { mapMedicineRowFromDb, mapMedicineRowToDb } from '../features/prescriptions/utils/medicineMappers';
import {
    buildActiveMedicationSummary,
    type ActiveMedicationSummaryRow,
} from '../features/prescriptions/utils/activeMedicationSummary';

interface PrescriptionsState {
    prescriptions: Prescription[];
    isLoading: boolean;
    error: string | null;
    medicines: Medicine[];

    // Actions
    fetchPrescriptions: (residentId?: string) => Promise<void>;
    createPrescription: (prescription: Omit<Prescription, 'id' | 'items'>, items: Omit<PrescriptionItem, 'id' | 'prescriptionId'>[]) => Promise<void>;
    updatePrescription: (id: string, prescription: Omit<Prescription, 'id' | 'items'>, items: Omit<PrescriptionItem, 'id' | 'prescriptionId'>[]) => Promise<void>;
    cancelPrescription: (id: string) => Promise<void>;
    completePrescription: (id: string) => Promise<void>;
    pausePrescription: (id: string) => Promise<void>;
    resumePrescription: (id: string) => Promise<void>;
    duplicatePrescription: (id: string) => Promise<Prescription | null>;
    fetchMedicines: () => Promise<void>;
    createMedicine: (medicine: Partial<Medicine>) => Promise<void>;
    updateMedicine: (id: string, medicine: Partial<Medicine>) => Promise<void>;
    deleteMedicine: (id: string) => Promise<void>;
    getResidentActiveMedicationRows: (residentId: string) => ActiveMedicationSummaryRow[];
}

export const usePrescriptionsStore = create<PrescriptionsState>((set, get) => ({
    prescriptions: [],
    isLoading: false,
    error: null,
    medicines: [],
    getResidentActiveMedicationRows: (residentId) =>
        buildActiveMedicationSummary(
            get().prescriptions.filter((prescription) => prescription.residentId === residentId),
            { asOfDate: new Date() },
        ),

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
                status: normalizePrescriptionStatus(p.status),
                notes: p.notes,
                duplicatedFromId: p.duplicated_from_id,
                items: (p.items || []).map((i: any) => ({
                    id: i.id,
                    prescriptionId: i.prescription_id,
                    medicineId: i.medicine_id,
                    medicineName: i.medicine_name,
                    dosage: i.dosage,
                    frequency: i.frequency,
                    timesOfDay: i.times_of_day || [],
                    quantity: i.quantity,
                    instructions: i.instructions,
                    startDate: i.start_date,
                    endDate: i.end_date,
                    continuous: i.continuous ?? false,
                }))
            }));

            set({ prescriptions: mappedData });
        } catch (err: any) {
            console.error('Error fetching prescriptions:', err);
            set({ error: err.message });
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
                    notes: prescriptionData.notes,
                    duplicated_from_id: prescriptionData.duplicatedFromId || null,
                })
                .select()
                .single();

            if (pError) throw pError;

            const itemsToInsert = itemsData.map(item => ({
                prescription_id: pData.id,
                medicine_id: item.medicineId,
                medicine_name: item.medicineName,
                dosage: item.dosage,
                frequency: item.frequency,
                times_of_day: item.timesOfDay,
                quantity: item.quantity,
                instructions: item.instructions,
                start_date: item.startDate || null,
                end_date: item.endDate || null,
                continuous: item.continuous ?? false,
            }));

            const { error: iError } = await supabase
                .from('prescription_items')
                .insert(itemsToInsert);

            if (iError) throw iError;

            await get().fetchPrescriptions(prescriptionData.residentId);

        } catch (err: any) {
            console.error('Create prescription error', err);
            set({ error: err.message });
            throw err;
        } finally {
            set({ isLoading: false });
        }
    },

    updatePrescription: async (id, prescriptionData, itemsData) => {
        set({ isLoading: true, error: null });
        try {
            const { error: pError } = await supabase
                .from('prescriptions')
                .update({
                    code: prescriptionData.code,
                    resident_id: prescriptionData.residentId,
                    doctor_id: prescriptionData.doctorId,
                    doctor_name: prescriptionData.doctorName,
                    diagnosis: prescriptionData.diagnosis,
                    prescription_date: prescriptionData.prescriptionDate,
                    start_date: prescriptionData.startDate,
                    end_date: prescriptionData.endDate,
                    status: prescriptionData.status,
                    notes: prescriptionData.notes,
                })
                .eq('id', id);

            if (pError) throw pError;

            const { error: deleteError } = await supabase
                .from('prescription_items')
                .delete()
                .eq('prescription_id', id);

            if (deleteError) throw deleteError;

            const itemsToInsert = itemsData.map(item => ({
                prescription_id: id,
                medicine_id: item.medicineId,
                medicine_name: item.medicineName,
                dosage: item.dosage,
                frequency: item.frequency,
                times_of_day: item.timesOfDay,
                quantity: item.quantity,
                instructions: item.instructions,
                start_date: item.startDate || null,
                end_date: item.endDate || null,
                continuous: item.continuous ?? false,
            }));

            if (itemsToInsert.length > 0) {
                const { error: iError } = await supabase
                    .from('prescription_items')
                    .insert(itemsToInsert);

                if (iError) throw iError;
            }

            await get().fetchPrescriptions(prescriptionData.residentId);
        } catch (err: any) {
            console.error('Update prescription error', err);
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
            set({ prescriptions: current.map(p => p.id === id ? { ...p, status: 'Cancelled' as const } : p) });
        } catch (e: any) { set({ error: e.message }); }
    },

    completePrescription: async (id) => {
        try {
            await supabase.from('prescriptions').update({ status: 'Completed' }).eq('id', id);
            const current = get().prescriptions;
            set({ prescriptions: current.map(p => p.id === id ? { ...p, status: 'Completed' as const } : p) });
        } catch (e: any) { set({ error: e.message }); }
    },

    pausePrescription: async (id) => {
        try {
            await supabase.from('prescriptions').update({ status: 'Paused' }).eq('id', id);
            const current = get().prescriptions;
            set({ prescriptions: current.map(p => p.id === id ? { ...p, status: 'Paused' as const } : p) });
        } catch (e: any) { set({ error: e.message }); }
    },

    resumePrescription: async (id) => {
        try {
            await supabase.from('prescriptions').update({ status: 'Active' }).eq('id', id);
            const current = get().prescriptions;
            set({ prescriptions: current.map(p => p.id === id ? { ...p, status: 'Active' as const } : p) });
        } catch (e: any) { set({ error: e.message }); }
    },

    duplicatePrescription: async (id) => {
        try {
            const source = get().prescriptions.find(p => p.id === id);
            if (!source) return null;

            const today = new Date().toISOString().split('T')[0];
            const newCode = `DT-${today.replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

            const newPrescription: Omit<Prescription, 'id' | 'items'> = {
                code: newCode,
                residentId: source.residentId,
                doctorId: source.doctorId,
                doctorName: source.doctorName,
                diagnosis: source.diagnosis,
                prescriptionDate: today,
                startDate: today,
                endDate: source.endDate,
                status: 'Active',
                notes: source.notes,
                duplicatedFromId: source.id,
            };

            const newItems: Omit<PrescriptionItem, 'id' | 'prescriptionId'>[] = (source.items || []).map(item => ({
                medicineId: item.medicineId,
                medicineName: item.medicineName,
                dosage: item.dosage,
                frequency: item.frequency,
                timesOfDay: item.timesOfDay,
                quantity: item.quantity,
                instructions: item.instructions,
                startDate: today,
                endDate: item.continuous ? undefined : item.endDate,
                continuous: item.continuous,
            }));

            await get().createPrescription(newPrescription, newItems);

            // Return the newly created prescription (last one with this code)
            const updated = get().prescriptions;
            return updated.find(p => p.code === newCode) || null;
        } catch (e: any) {
            set({ error: e.message });
            return null;
        }
    },

    fetchMedicines: async () => {
        try {
            const { data, error } = await supabase.from('medicines').select('*').order('name');
            if (error) throw error;

            const mapped: Medicine[] = data.map((m: any) => mapMedicineRowFromDb(m));
            set({ medicines: mapped });
        } catch (e: any) {
            console.error('Fetch medicines error', e);
        }
    },

    createMedicine: async (medicine) => {
        try {
            const { error } = await supabase.from('medicines').insert(mapMedicineRowToDb(medicine));
            if (error) throw error;
            await get().fetchMedicines();
        } catch (e: any) {
            set({ error: e.message });
            throw e;
        }
    },

    updateMedicine: async (id, medicine) => {
        try {
            const { error } = await supabase
                .from('medicines')
                .update(mapMedicineRowToDb(medicine, { forUpdate: true }))
                .eq('id', id);
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
