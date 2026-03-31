import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { ActiveMedicationRow, Medicine, Prescription, PrescriptionItem, PrescriptionSnapshot } from '../types/medical';
import {
  buildActiveMedicationRows,
  getMedicationLineStatus,
} from '../features/prescriptions/utils/prescriptionDerivations';
import {
  mapPrescriptionFromDb,
  mapPrescriptionItemToDb,
  mapPrescriptionToDb,
} from '../features/prescriptions/utils/prescriptionMappers';

interface PrescriptionsState {
  prescriptions: Prescription[];
  isLoading: boolean;
  error: string | null;
  medicines: Medicine[];
  fetchPrescriptions: (residentId?: string) => Promise<void>;
  createPrescription: (
    prescription: Omit<Prescription, 'id' | 'items'>,
    items: Omit<PrescriptionItem, 'id' | 'prescriptionId'>[],
  ) => Promise<void>;
  updatePrescription: (
    id: string,
    prescription: Omit<Prescription, 'id' | 'items'>,
    items: Omit<PrescriptionItem, 'id' | 'prescriptionId'>[],
  ) => Promise<void>;
  cancelPrescription: (id: string) => Promise<void>;
  pausePrescription: (id: string, reason?: string) => Promise<void>;
  completePrescription: (id: string, reason?: string) => Promise<void>;
  duplicatePrescription: (id: string) => Promise<void>;
  fetchPrescriptionSnapshots: (prescriptionId: string) => Promise<PrescriptionSnapshot[]>;
  getActivePrescriptionsForResident: (residentId: string) => Prescription[];
  getActiveMedicationRowsForResident: (residentId: string) => ActiveMedicationRow[];
  fetchMedicines: () => Promise<void>;
  createMedicine: (medicine: Partial<Medicine>) => Promise<void>;
  updateMedicine: (id: string, medicine: Partial<Medicine>) => Promise<void>;
  deleteMedicine: (id: string) => Promise<void>;
}

const mapMedicineFromDb = (row: any): Medicine => ({
  id: row.id,
  name: row.name,
  activeIngredient: row.active_ingredient,
  unit: row.unit,
  defaultDosage: row.default_dosage,
  price: row.price ? Number(row.price) : undefined,
  strength: row.strength ?? undefined,
  route: row.route ?? undefined,
  therapeuticGroup: row.therapeutic_group ?? undefined,
  source: row.source ?? undefined,
});

const mapMedicineToDb = (medicine: Partial<Medicine>) => ({
  name: medicine.name,
  active_ingredient: medicine.activeIngredient,
  unit: medicine.unit,
  default_dosage: medicine.defaultDosage,
  price: medicine.price,
  strength: medicine.strength,
  route: medicine.route,
  therapeutic_group: medicine.therapeuticGroup,
  source: medicine.source,
});

const hydratePrescriptionQuery = (residentId?: string) => {
  let query = supabase
    .from('prescriptions')
    .select(
      `
        *,
        items:prescription_items(*)
      `,
    )
    .order('prescription_date', { ascending: false });

  if (residentId) {
    query = query.eq('resident_id', residentId);
  }

  return query;
};

const findPrescription = (prescriptions: Prescription[], id: string) =>
  prescriptions.find((prescription) => prescription.id === id) ?? null;

const buildNewPrescriptionCode = () =>
  `DT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')}`;

const safeWriteSnapshot = async (prescription: Prescription, reason?: string) => {
  try {
    const { data: lastSnapshot, error: versionError } = await supabase
      .from('prescription_snapshots')
      .select('version')
      .eq('prescription_id', prescription.id)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (versionError) throw versionError;

    const { error } = await supabase.from('prescription_snapshots').insert({
      prescription_id: prescription.id,
      version: (lastSnapshot?.version ?? 0) + 1,
      actor: prescription.doctorName ?? 'unknown',
      change_reason: reason ?? null,
      header_payload: mapPrescriptionToDb(prescription),
      items_payload: prescription.items.map((item) => mapPrescriptionItemToDb(item, prescription.id)),
    });

    if (error) throw error;
  } catch (error: any) {
    if (typeof error?.message === 'string' && error.message.includes('prescription_snapshots')) {
      console.warn('Skipping prescription snapshot because the table is unavailable.');
      return;
    }

    throw error;
  }
};

export const usePrescriptionsStore = create<PrescriptionsState>((set, get) => ({
  prescriptions: [],
  isLoading: false,
  error: null,
  medicines: [],

  fetchPrescriptions: async (residentId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await hydratePrescriptionQuery(residentId);
      if (error) throw error;

      set({ prescriptions: (data || []).map(mapPrescriptionFromDb) });
    } catch (err: any) {
      console.error('Error fetching prescriptions:', err);
      set({ error: err.message });
      if (err.message?.includes('relation "prescriptions" does not exist')) {
        set({ prescriptions: [] });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  createPrescription: async (prescriptionData, itemsData) => {
    set({ isLoading: true, error: null });
    try {
      const { data: prescriptionRow, error: prescriptionError } = await supabase
        .from('prescriptions')
        .insert(mapPrescriptionToDb(prescriptionData))
        .select()
        .single();

      if (prescriptionError) throw prescriptionError;

      const itemsToInsert = itemsData.map((item) => mapPrescriptionItemToDb(item, prescriptionRow.id));
      if (itemsToInsert.length > 0) {
        const { error: itemError } = await supabase.from('prescription_items').insert(itemsToInsert);
        if (itemError) throw itemError;
      }

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
      const currentPrescription = findPrescription(get().prescriptions, id);
      if (currentPrescription) {
        await safeWriteSnapshot(currentPrescription, 'adjust');
      }

      const { error: prescriptionError } = await supabase
        .from('prescriptions')
        .update(mapPrescriptionToDb(prescriptionData))
        .eq('id', id);

      if (prescriptionError) throw prescriptionError;

      const { error: deleteError } = await supabase
        .from('prescription_items')
        .delete()
        .eq('prescription_id', id);

      if (deleteError) throw deleteError;

      const itemsToInsert = itemsData.map((item) => mapPrescriptionItemToDb(item, id));
      if (itemsToInsert.length > 0) {
        const { error: itemError } = await supabase.from('prescription_items').insert(itemsToInsert);
        if (itemError) throw itemError;
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
      const { error } = await supabase.from('prescriptions').update({ status: 'Cancelled' }).eq('id', id);
      if (error) throw error;
      set({
        prescriptions: get().prescriptions.map((prescription) =>
          prescription.id === id ? { ...prescription, status: 'Cancelled' } : prescription,
        ),
      });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  pausePrescription: async (id, reason) => {
    try {
      const currentPrescription = findPrescription(get().prescriptions, id);
      if (currentPrescription) {
        await safeWriteSnapshot(currentPrescription, reason ?? 'pause');
      }

      const { error } = await supabase.from('prescriptions').update({ status: 'Paused' }).eq('id', id);
      if (error) throw error;

      set({
        prescriptions: get().prescriptions.map((prescription) =>
          prescription.id === id ? { ...prescription, status: 'Paused' } : prescription,
        ),
      });
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  completePrescription: async (id, reason) => {
    try {
      const currentPrescription = findPrescription(get().prescriptions, id);
      if (currentPrescription) {
        await safeWriteSnapshot(currentPrescription, reason ?? 'complete');
      }

      const { error } = await supabase.from('prescriptions').update({ status: 'Completed' }).eq('id', id);
      if (error) throw error;

      set({
        prescriptions: get().prescriptions.map((prescription) =>
          prescription.id === id ? { ...prescription, status: 'Completed' } : prescription,
        ),
      });
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  duplicatePrescription: async (id) => {
    const currentPrescription = findPrescription(get().prescriptions, id);
    if (!currentPrescription) return;

    const today = new Date().toISOString().split('T')[0];
    const duplicatedPrescription: Omit<Prescription, 'id'> = {
      ...currentPrescription,
      code: buildNewPrescriptionCode(),
      prescriptionDate: today,
      startDate: today,
      endDate: currentPrescription.endDate,
      status: 'Active',
      duplicatedFromPrescriptionId: currentPrescription.id,
      items: currentPrescription.items.map((item) => ({
        ...item,
        id: `dup-${item.id}`,
        prescriptionId: '',
      })),
    };

    await get().createPrescription(
      {
        code: duplicatedPrescription.code,
        residentId: duplicatedPrescription.residentId,
        doctorId: duplicatedPrescription.doctorId,
        doctorName: duplicatedPrescription.doctorName,
        diagnosis: duplicatedPrescription.diagnosis,
        prescriptionDate: duplicatedPrescription.prescriptionDate,
        startDate: duplicatedPrescription.startDate,
        endDate: duplicatedPrescription.endDate,
        status: duplicatedPrescription.status,
        notes: duplicatedPrescription.notes,
        duplicatedFromPrescriptionId: duplicatedPrescription.duplicatedFromPrescriptionId,
      },
      duplicatedPrescription.items.map((item) => ({
        medicineId: item.medicineId,
        medicineName: item.medicineName,
        dosage: item.dosage,
        frequency: item.frequency,
        timesOfDay: item.timesOfDay,
        quantity: item.quantity,
        instructions: item.instructions,
        startDate: item.startDate ?? duplicatedPrescription.startDate,
        endDate: item.endDate,
        continuous: item.continuous,
        quantitySupplied: item.quantitySupplied ?? item.quantity,
        administrationsPerDay:
          item.administrationsPerDay ??
          Math.max((item.schedule ? Object.values(item.schedule).filter(Boolean).length : item.timesOfDay.length), 1),
        schedule: item.schedule,
      })),
    );
  },

  fetchPrescriptionSnapshots: async (prescriptionId) => {
    try {
      const { data, error } = await supabase
        .from('prescription_snapshots')
        .select('*')
        .eq('prescription_id', prescriptionId)
        .order('version', { ascending: false });

      if (error) throw error;

      return (data || []).map((row) => ({
        id: row.id,
        prescriptionId: row.prescription_id,
        version: row.version,
        snapshotAt: row.snapshot_at,
        actor: row.actor ?? undefined,
        changeReason: row.change_reason ?? undefined,
        headerPayload: row.header_payload ?? {},
        itemsPayload: row.items_payload ?? [],
      }));
    } catch (error: any) {
      if (typeof error?.message === 'string' && error.message.includes('prescription_snapshots')) {
        return [];
      }

      throw error;
    }
  },

  getActivePrescriptionsForResident: (residentId) =>
    get().prescriptions
      .filter((prescription) => prescription.residentId === residentId && prescription.status === 'Active')
      .filter((prescription) =>
        prescription.items.some((item) => getMedicationLineStatus(item).active),
      ),

  getActiveMedicationRowsForResident: (residentId) =>
    buildActiveMedicationRows(
      get().prescriptions.filter((prescription) => prescription.residentId === residentId),
    ),

  fetchMedicines: async () => {
    try {
      const { data, error } = await supabase.from('medicines').select('*').order('name');
      if (error) throw error;
      set({ medicines: (data || []).map(mapMedicineFromDb) });
    } catch (err: any) {
      console.error('Fetch medicines error', err);
      set({ error: err.message });
    }
  },

  createMedicine: async (medicine) => {
    try {
      const { error } = await supabase.from('medicines').insert(mapMedicineToDb(medicine));
      if (error) throw error;
      await get().fetchMedicines();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  updateMedicine: async (id, medicine) => {
    try {
      const { error } = await supabase.from('medicines').update(mapMedicineToDb(medicine)).eq('id', id);
      if (error) throw error;
      await get().fetchMedicines();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteMedicine: async (id) => {
    try {
      const { error } = await supabase.from('medicines').delete().eq('id', id);
      if (error) throw error;
      await get().fetchMedicines();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },
}));
