import { create } from 'zustand';

import {
  buildActiveMedicationSummary,
  type ActiveMedicationSummaryRow,
} from '@/src/features/prescriptions/utils/activeMedicationSummary';
import {
  buildLegacyMedicineRowPayload,
  buildLegacyPrescriptionItemRowPayload,
  buildMedicineRowPayload,
  buildPrescriptionItemRowPayload,
  buildPrescriptionRowPayload,
  mapMedicineRow,
  mapPrescriptionRow,
} from '@/src/features/prescriptions/utils/prescriptionMappers';
import { supabase } from '@/src/lib/supabase';
import { Medicine, Prescription, PrescriptionItem } from '@/src/types/medical';

type PrescriptionDraft = Omit<Prescription, 'id' | 'items'>;
type PrescriptionItemDraft = Omit<PrescriptionItem, 'id' | 'prescriptionId'>;

interface PrescriptionsState {
  prescriptions: Prescription[];
  isLoading: boolean;
  error: string | null;
  medicines: Medicine[];
  fetchPrescriptions: (residentId?: string) => Promise<void>;
  createPrescription: (
    prescription: PrescriptionDraft,
    items: PrescriptionItemDraft[],
  ) => Promise<void>;
  updatePrescription: (
    id: string,
    prescription: PrescriptionDraft,
    items: PrescriptionItemDraft[],
  ) => Promise<void>;
  duplicatePrescription: (
    id: string,
    overrides?: Partial<PrescriptionDraft>,
  ) => Promise<Prescription | null>;
  pausePrescription: (id: string) => Promise<void>;
  cancelPrescription: (id: string) => Promise<void>;
  completePrescription: (id: string) => Promise<void>;
  getResidentActiveMedicationRows: (
    residentId: string,
  ) => ActiveMedicationSummaryRow[];
  fetchMedicines: () => Promise<void>;
  createMedicine: (medicine: Partial<Medicine>) => Promise<void>;
  updateMedicine: (id: string, medicine: Partial<Medicine>) => Promise<void>;
  deleteMedicine: (id: string) => Promise<void>;
}

const PRESCRIPTION_SELECT = `
  *,
  items:prescription_items(*)
`;

function isMissingColumnError(error: any): boolean {
  const message = `${error?.message ?? ''} ${error?.details ?? ''}`.toLowerCase();

  return (
    message.includes('could not find the') ||
    message.includes('schema cache') ||
    (message.includes('column') && message.includes('does not exist'))
  );
}

function buildFallbackPrescriptionCode(dateString?: string): string {
  const stampSource = (dateString ?? new Date().toISOString().slice(0, 10)).replaceAll(
    '-',
    '',
  );
  const suffix = Date.now().toString().slice(-4);

  return `DT-${stampSource}-${suffix}`;
}

function isItemCurrentlyActive(
  item: PrescriptionItem,
  prescription: Prescription,
  today: string,
): boolean {
  const effectiveStartDate = item.startDate ?? prescription.startDate;
  const effectiveEndDate = item.endDate ?? prescription.endDate;

  if (effectiveStartDate && effectiveStartDate > today) {
    return false;
  }

  if (item.isContinuous) {
    return true;
  }

  if (effectiveEndDate && effectiveEndDate < today) {
    return false;
  }

  return true;
}

async function insertPrescriptionItems(
  prescriptionId: string,
  items: PrescriptionItemDraft[],
) {
  const enhancedPayload = items.map((item) =>
    buildPrescriptionItemRowPayload(item, prescriptionId),
  );

  const enhancedResult = await supabase
    .from('prescription_items')
    .insert(enhancedPayload);

  if (!enhancedResult.error) {
    return;
  }

  if (!isMissingColumnError(enhancedResult.error)) {
    throw enhancedResult.error;
  }

  const legacyPayload = items.map((item) =>
    buildLegacyPrescriptionItemRowPayload(item, prescriptionId),
  );
  const legacyResult = await supabase.from('prescription_items').insert(legacyPayload);

  if (legacyResult.error) {
    throw legacyResult.error;
  }
}

async function upsertMedicineWithFallback(
  mode: 'insert' | 'update',
  medicine: Partial<Medicine>,
  id?: string,
) {
  const enhancedPayload = buildMedicineRowPayload(medicine);
  const enhancedQuery =
    mode === 'insert'
      ? supabase.from('medicines').insert(enhancedPayload)
      : supabase.from('medicines').update(enhancedPayload).eq('id', id);

  const enhancedResult = await enhancedQuery;

  if (!enhancedResult.error) {
    return;
  }

  if (!isMissingColumnError(enhancedResult.error)) {
    throw enhancedResult.error;
  }

  const legacyPayload = buildLegacyMedicineRowPayload(medicine);
  const legacyQuery =
    mode === 'insert'
      ? supabase.from('medicines').insert(legacyPayload)
      : supabase.from('medicines').update(legacyPayload).eq('id', id);

  const legacyResult = await legacyQuery;

  if (legacyResult.error) {
    throw legacyResult.error;
  }
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
        .select(PRESCRIPTION_SELECT)
        .order('prescription_date', { ascending: false });

      if (residentId) {
        query = query.eq('resident_id', residentId);
      }

      const { data, error } = await query;

      if (error) throw error;

      set({ prescriptions: (data ?? []).map(mapPrescriptionRow) });
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
      const { data: createdPrescription, error: prescriptionError } = await supabase
        .from('prescriptions')
        .insert(buildPrescriptionRowPayload(prescriptionData))
        .select(PRESCRIPTION_SELECT)
        .single();

      if (prescriptionError) throw prescriptionError;

      await insertPrescriptionItems(createdPrescription.id, itemsData);
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
      const { error: prescriptionError } = await supabase
        .from('prescriptions')
        .update(buildPrescriptionRowPayload(prescriptionData))
        .eq('id', id);

      if (prescriptionError) throw prescriptionError;

      const { error: deleteItemsError } = await supabase
        .from('prescription_items')
        .delete()
        .eq('prescription_id', id);

      if (deleteItemsError) throw deleteItemsError;

      await insertPrescriptionItems(id, itemsData);
      await get().fetchPrescriptions(prescriptionData.residentId);
    } catch (err: any) {
      console.error('Update prescription error', err);
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  duplicatePrescription: async (id, overrides = {}) => {
    const sourcePrescription = get().prescriptions.find(
      (prescription) => prescription.id === id,
    );

    if (!sourcePrescription) {
      return null;
    }

    const prescriptionDate =
      overrides.prescriptionDate ?? new Date().toISOString().slice(0, 10);
    const duplicatedDraft: PrescriptionDraft = {
      ...sourcePrescription,
      ...overrides,
      code: overrides.code ?? buildFallbackPrescriptionCode(prescriptionDate),
      prescriptionDate,
      startDate: overrides.startDate ?? prescriptionDate,
      status: overrides.status ?? 'Active',
      items: undefined as never,
      id: undefined as never,
    };

    const duplicatedItems: PrescriptionItemDraft[] = sourcePrescription.items.map(
      ({ id: _id, prescriptionId: _prescriptionId, ...item }) => ({
        ...item,
        startDate: item.startDate ?? duplicatedDraft.startDate,
      }),
    );

    await get().createPrescription(duplicatedDraft, duplicatedItems);

    return (
      get().prescriptions.find(
        (prescription) => prescription.code === duplicatedDraft.code,
      ) ?? null
    );
  },

  pausePrescription: async (id) => {
    try {
      const { error } = await supabase
        .from('prescriptions')
        .update({ status: 'Paused' })
        .eq('id', id);

      if (error) throw error;

      set({
        prescriptions: get().prescriptions.map((prescription) =>
          prescription.id === id
            ? { ...prescription, status: 'Paused' }
            : prescription,
        ),
      });
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  cancelPrescription: async (id) => {
    await get().pausePrescription(id);
  },

  completePrescription: async (id) => {
    try {
      const { error } = await supabase
        .from('prescriptions')
        .update({ status: 'Completed' })
        .eq('id', id);

      if (error) throw error;

      set({
        prescriptions: get().prescriptions.map((prescription) =>
          prescription.id === id
            ? { ...prescription, status: 'Completed' }
            : prescription,
        ),
      });
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  getResidentActiveMedicationRows: (residentId) => {
    const today = new Date().toISOString().slice(0, 10);
    const activeSourceRows = get()
      .prescriptions.filter(
        (prescription) =>
          prescription.residentId === residentId && prescription.status === 'Active',
      )
      .flatMap((prescription) =>
        (prescription.items ?? [])
          .filter((item) => isItemCurrentlyActive(item, prescription, today))
          .map((item) => ({
            ...item,
            prescriptionCode: prescription.code,
            sourcePrescriptionId: prescription.id,
            sourcePrescriptionCode: prescription.code,
            sourcePrescriptionStartDate: prescription.startDate,
            sourcePrescriptionEndDate: prescription.endDate,
            sourcePrescriptionStatus: prescription.status,
          })),
      );

    return buildActiveMedicationSummary(activeSourceRows, { asOfDate: today });
  },

  fetchMedicines: async () => {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .order('name');

      if (error) throw error;

      set({ medicines: (data ?? []).map(mapMedicineRow) });
    } catch (err: any) {
      console.error('Fetch medicines error', err);
      set({ error: err.message });
    }
  },

  createMedicine: async (medicine) => {
    try {
      await upsertMedicineWithFallback('insert', medicine);
      await get().fetchMedicines();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  updateMedicine: async (id, medicine) => {
    try {
      await upsertMedicineWithFallback('update', medicine, id);
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
