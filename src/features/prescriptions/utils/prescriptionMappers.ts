import {
  Medicine,
  Prescription,
  PrescriptionItem,
  normalizePrescriptionStatus,
} from '@/src/types/medical';

export function mapMedicineRow(row: any): Medicine {
  return {
    id: row.id,
    name: row.name,
    activeIngredient: row.active_ingredient,
    strength: row.strength,
    unit: row.unit,
    route: row.route,
    drugGroup: row.drug_group,
    defaultDosage: row.default_dosage,
    defaultFrequency: row.default_frequency,
    price: row.price,
  };
}

export function mapPrescriptionItemRow(row: any): PrescriptionItem {
  return {
    id: row.id,
    prescriptionId: row.prescription_id,
    medicineId: row.medicine_id,
    medicineName: row.medicine_name,
    activeIngredientSnapshot: row.active_ingredient_snapshot,
    strengthSnapshot: row.strength_snapshot,
    routeSnapshot: row.route_snapshot,
    dosePerTime: row.dose_per_time,
    doseUnit: row.dose_unit,
    dosage: row.dosage ?? '',
    timesPerDay: row.times_per_day,
    frequency: row.frequency ?? '',
    timesOfDay: row.times_of_day ?? [],
    quantityDispensed: row.quantity_dispensed ?? row.quantity,
    quantity: row.quantity ?? row.quantity_dispensed,
    daysSupply: row.days_supply,
    startDate: row.start_date,
    endDate: row.end_date,
    isContinuous: row.is_continuous,
    instructions: row.instructions,
    specialInstructions: row.special_instructions,
  };
}

export function mapPrescriptionRow(row: any): Prescription {
  return {
    id: row.id,
    code: row.code,
    residentId: row.resident_id,
    residentName: row.resident_name,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    diagnosis: row.diagnosis ?? '',
    prescriptionDate: row.prescription_date,
    startDate: row.start_date,
    endDate: row.end_date ?? undefined,
    status: normalizePrescriptionStatus(row.status),
    notes: row.notes ?? undefined,
    items: (row.items ?? []).map(mapPrescriptionItemRow),
  };
}

export function buildPrescriptionRowPayload(
  prescription: Omit<Prescription, 'id' | 'items'>,
) {
  return compactObject({
    code: prescription.code,
    resident_id: prescription.residentId,
    doctor_id: prescription.doctorId,
    doctor_name: prescription.doctorName,
    diagnosis: prescription.diagnosis,
    prescription_date: prescription.prescriptionDate,
    start_date: prescription.startDate,
    end_date: prescription.endDate,
    status: prescription.status,
    notes: prescription.notes,
  });
}

export function buildPrescriptionItemRowPayload(
  item: Omit<PrescriptionItem, 'id' | 'prescriptionId'>,
  prescriptionId: string,
) {
  return compactObject({
    prescription_id: prescriptionId,
    medicine_id: item.medicineId,
    medicine_name: item.medicineName,
    active_ingredient_snapshot: item.activeIngredientSnapshot,
    strength_snapshot: item.strengthSnapshot,
    route_snapshot: item.routeSnapshot,
    dose_per_time: item.dosePerTime,
    dose_unit: item.doseUnit,
    dosage: item.dosage,
    times_per_day: item.timesPerDay,
    frequency: item.frequency,
    times_of_day: item.timesOfDay ?? [],
    quantity_dispensed: item.quantityDispensed ?? item.quantity,
    quantity: item.quantity ?? item.quantityDispensed,
    days_supply: item.daysSupply,
    start_date: item.startDate,
    end_date: item.endDate,
    is_continuous: item.isContinuous,
    instructions: item.instructions,
    special_instructions: item.specialInstructions,
  });
}

export function buildLegacyPrescriptionItemRowPayload(
  item: Omit<PrescriptionItem, 'id' | 'prescriptionId'>,
  prescriptionId: string,
) {
  return compactObject({
    prescription_id: prescriptionId,
    medicine_id: item.medicineId,
    medicine_name: item.medicineName,
    dosage: item.dosage,
    frequency: item.frequency,
    times_of_day: item.timesOfDay ?? [],
    quantity: item.quantity ?? item.quantityDispensed,
    instructions: item.instructions ?? item.specialInstructions,
  });
}

export function buildMedicineRowPayload(medicine: Partial<Medicine>) {
  return compactObject({
    name: medicine.name,
    active_ingredient: medicine.activeIngredient,
    strength: medicine.strength,
    unit: medicine.unit,
    route: medicine.route,
    drug_group: medicine.drugGroup,
    default_dosage: medicine.defaultDosage,
    default_frequency: medicine.defaultFrequency,
    price: medicine.price,
  });
}

export function buildLegacyMedicineRowPayload(medicine: Partial<Medicine>) {
  return compactObject({
    name: medicine.name,
    active_ingredient: medicine.activeIngredient,
    unit: medicine.unit,
    default_dosage: medicine.defaultDosage,
    price: medicine.price,
  });
}

function compactObject<T extends Record<string, unknown>>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}
