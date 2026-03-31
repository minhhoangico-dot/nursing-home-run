import { Prescription, PrescriptionItem, PrescriptionItemSchedule } from '../../../types/medical';

type PrescriptionDbRow = Record<string, any>;
type PrescriptionItemDbRow = Record<string, any>;

const TIME_LABELS: Array<{ key: keyof PrescriptionItemSchedule; label: string }> = [
  { key: 'morning', label: 'Sang' },
  { key: 'noon', label: 'Trua' },
  { key: 'afternoon', label: 'Chieu' },
  { key: 'evening', label: 'Toi' },
];

const emptySchedule = (): PrescriptionItemSchedule => ({
  morning: false,
  noon: false,
  afternoon: false,
  evening: false,
});

const normalizeText = (value?: string | null) => (value ?? '').trim();

const normalizeScheduleFromRow = (row: PrescriptionItemDbRow): PrescriptionItemSchedule => {
  const schedule = emptySchedule();

  if (typeof row.morning === 'boolean') schedule.morning = row.morning;
  if (typeof row.noon === 'boolean') schedule.noon = row.noon;
  if (typeof row.afternoon === 'boolean') schedule.afternoon = row.afternoon;
  if (typeof row.evening === 'boolean') schedule.evening = row.evening;

  if (Array.isArray(row.times_of_day)) {
    const labels = row.times_of_day.map((value: unknown) => normalizeText(String(value)));
    schedule.morning = schedule.morning || labels.includes('Sang');
    schedule.noon = schedule.noon || labels.includes('Trua');
    schedule.afternoon = schedule.afternoon || labels.includes('Chieu');
    schedule.evening = schedule.evening || labels.includes('Toi');
  }

  return schedule;
};

const buildTimesOfDay = (schedule: PrescriptionItemSchedule) =>
  TIME_LABELS.filter(({ key }) => schedule[key]).map(({ label }) => label);

export const mapPrescriptionItemFromDb = (
  row: PrescriptionItemDbRow,
  defaults?: { startDate?: string; endDate?: string },
): PrescriptionItem => {
  const schedule = normalizeScheduleFromRow(row);
  const timesOfDay = buildTimesOfDay(schedule);
  const quantitySupplied = Number(row.quantity_supplied ?? row.quantity ?? 0);
  const administrationsPerDay = Number(
    row.administrations_per_day ?? (timesOfDay.length || 1),
  ) || 1;

  return {
    id: row.id ?? '',
    prescriptionId: row.prescription_id ?? '',
    medicineId: row.medicine_id ?? undefined,
    medicineName: row.medicine_name ?? '',
    dosage: row.dosage ?? '',
    frequency: row.frequency ?? '',
    timesOfDay,
    quantity: row.quantity ?? quantitySupplied,
    instructions: row.instructions ?? undefined,
    startDate: row.start_date ?? defaults?.startDate,
    endDate: row.end_date ?? defaults?.endDate ?? undefined,
    continuous: Boolean(row.continuous ?? false),
    quantitySupplied,
    administrationsPerDay,
    schedule,
  };
};

export const mapPrescriptionItemToDb = (
  item: Omit<PrescriptionItem, 'id' | 'prescriptionId'> | PrescriptionItem,
  prescriptionId?: string,
) => {
  const schedule = item.schedule ?? emptySchedule();
  const timesOfDay = item.timesOfDay?.length ? item.timesOfDay : buildTimesOfDay(schedule);
  const quantitySupplied = item.quantitySupplied ?? item.quantity ?? 0;

  return {
    prescription_id: prescriptionId ?? ('prescriptionId' in item ? item.prescriptionId : undefined),
    medicine_id: item.medicineId ?? null,
    medicine_name: item.medicineName,
    dosage: item.dosage,
    frequency: item.frequency,
    times_of_day: timesOfDay,
    quantity: item.quantity ?? quantitySupplied,
    instructions: item.instructions ?? null,
    start_date: item.startDate ?? null,
    end_date: item.endDate ?? null,
    continuous: Boolean(item.continuous),
    quantity_supplied: quantitySupplied,
    administrations_per_day: item.administrationsPerDay ?? Math.max(timesOfDay.length, 1),
    morning: Boolean(schedule.morning),
    noon: Boolean(schedule.noon),
    afternoon: Boolean(schedule.afternoon),
    evening: Boolean(schedule.evening),
  };
};

export const mapPrescriptionFromDb = (row: PrescriptionDbRow): Prescription => ({
  id: row.id ?? '',
  code: row.code ?? '',
  residentId: row.resident_id ?? '',
  residentName: row.resident_name ?? undefined,
  doctorId: row.doctor_id ?? '',
  doctorName: row.doctor_name ?? undefined,
  diagnosis: row.diagnosis ?? '',
  prescriptionDate: row.prescription_date ?? '',
  startDate: row.start_date ?? row.prescription_date ?? '',
  endDate: row.end_date ?? undefined,
  status: row.status ?? 'Active',
  notes: row.notes ?? undefined,
  duplicatedFromPrescriptionId: row.duplicated_from_prescription_id ?? undefined,
  items: Array.isArray(row.items)
    ? row.items.map((item: PrescriptionItemDbRow) =>
        mapPrescriptionItemFromDb(item, {
          startDate: row.start_date ?? row.prescription_date ?? '',
          endDate: row.end_date ?? undefined,
        }),
      )
    : [],
});

export const mapPrescriptionToDb = (
  prescription: Omit<Prescription, 'id'> | Prescription,
) => ({
  code: prescription.code,
  resident_id: prescription.residentId,
  doctor_id: prescription.doctorId,
  doctor_name: prescription.doctorName ?? null,
  diagnosis: prescription.diagnosis,
  prescription_date: prescription.prescriptionDate,
  start_date: prescription.startDate,
  end_date: prescription.endDate ?? null,
  status: prescription.status,
  notes: prescription.notes ?? null,
  duplicated_from_prescription_id: prescription.duplicatedFromPrescriptionId ?? null,
});
