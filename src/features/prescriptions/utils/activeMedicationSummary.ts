import { calculateMedicationEndDate } from './medicationCalculations';
import {
  normalizePrescriptionStatus,
  type Prescription,
  type PrescriptionItem,
  type PrescriptionStatus,
} from '../../../types/index';

export type ActiveMedicationTimeSlot = 'morning' | 'noon' | 'afternoon' | 'night';

export interface ActiveMedicationSummaryRow {
  sourcePrescriptionId: string;
  sourcePrescriptionCode: string;
  sourcePrescriptionStartDate: string;
  sourcePrescriptionEndDate?: string;
  sourcePrescriptionStatus: PrescriptionStatus;
  sourcePrescriptionLabel: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  note?: string;
  quantity?: number;
  morning: string;
  noon: string;
  afternoon: string;
  night: string;
  timeSlots: ActiveMedicationTimeSlot[];
  isNearingEndDate: boolean;
  isContinuous: boolean;
}

export interface ActiveMedicationSummaryOptions {
  asOfDate?: string | Date;
  nearingEndThresholdDays?: number;
}

export interface ActiveMedicationSourceItem extends PrescriptionItem {
  prescriptionCode?: string;
  sourcePrescriptionId?: string;
  sourcePrescriptionCode?: string;
  sourcePrescriptionStartDate?: string;
  sourcePrescriptionEndDate?: string;
  sourcePrescriptionStatus?: PrescriptionStatus | string;
}

type ActiveMedicationSourcePrescription = Prescription & { items: PrescriptionItem[] };
type ActiveMedicationSummaryInput =
  | ActiveMedicationSourcePrescription[]
  | ActiveMedicationSourceItem[];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseDateOnly(value?: string | Date): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return undefined;
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  }

  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return undefined;

  const parsed = new Date(Date.UTC(year, month - 1, day));
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function formatDate(value?: string): string {
  if (!value) return '';
  const parsed = parseDateOnly(value);
  return parsed ? parsed.toLocaleDateString('vi-VN') : value;
}

function isPrescriptionArray(
  source: ActiveMedicationSummaryInput,
): source is ActiveMedicationSourcePrescription[] {
  return Boolean(source[0] && 'items' in source[0]);
}

function normalizeTimeLabel(value: string): ActiveMedicationTimeSlot | undefined {
  const normalized = value.trim().toLowerCase();
  if (['sáng', 'morning', 'am'].includes(normalized)) return 'morning';
  if (['trưa', 'noon', 'midday', 'lunch'].includes(normalized)) return 'noon';
  if (['chiều', 'afternoon', 'pm'].includes(normalized)) return 'afternoon';
  if (['tối', 'night', 'evening'].includes(normalized)) return 'night';
  return undefined;
}

function getTimeSlots(timesOfDay: string[] | undefined): ActiveMedicationTimeSlot[] {
  const slots: ActiveMedicationTimeSlot[] = [];
  timesOfDay?.forEach((time) => {
    const slot = normalizeTimeLabel(time);
    if (slot && !slots.includes(slot)) {
      slots.push(slot);
    }
  });
  return slots;
}

function getDoseLabel(item: PrescriptionItem): string {
  if (typeof item.dosePerTime === 'number' && Number.isFinite(item.dosePerTime)) {
    return item.doseUnit?.trim()
      ? `${item.dosePerTime} ${item.doseUnit.trim()}`
      : `${item.dosePerTime}`;
  }
  return item.dosage?.trim() || '';
}

function getFrequencyLabel(item: PrescriptionItem): string {
  if (item.frequency?.trim()) return item.frequency.trim();
  if (typeof item.timesPerDay === 'number' && Number.isFinite(item.timesPerDay)) {
    return `${item.timesPerDay} lần/ngày`;
  }
  return '';
}

function getSourcePrescriptionLabel(code: string, startDate?: string): string {
  const dateLabel = formatDate(startDate);
  return dateLabel ? `${code} • ${dateLabel}` : code;
}

function isNearEndDate(
  endDate?: string,
  asOfDate?: Date,
  thresholdDays = 7,
): boolean {
  if (!endDate || !asOfDate) return false;

  const parsedEnd = parseDateOnly(endDate);
  if (!parsedEnd) return false;

  const diffDays = (parsedEnd.getTime() - asOfDate.getTime()) / MS_PER_DAY;
  return diffDays >= 0 && diffDays <= thresholdDays;
}

function buildRowFromItem(
  item: ActiveMedicationSourceItem,
  fallbackPrescription?: ActiveMedicationSourcePrescription,
  options?: ActiveMedicationSummaryOptions,
): ActiveMedicationSummaryRow {
  const sourcePrescriptionId =
    item.sourcePrescriptionId || fallbackPrescription?.id || item.prescriptionId;
  const sourcePrescriptionCode =
    item.sourcePrescriptionCode || item.prescriptionCode || fallbackPrescription?.code || '';
  const sourcePrescriptionStartDate =
    item.sourcePrescriptionStartDate || fallbackPrescription?.startDate || item.startDate || '';
  const sourcePrescriptionEndDate =
    item.sourcePrescriptionEndDate ||
    item.endDate ||
    fallbackPrescription?.endDate ||
    calculateMedicationEndDate({
      startDate: item.startDate || fallbackPrescription?.startDate,
      daysSupply: item.daysSupply,
      isContinuous: item.isContinuous,
    });
  const sourcePrescriptionStatus = normalizePrescriptionStatus(
    item.sourcePrescriptionStatus || fallbackPrescription?.status,
  );
  const timeSlots = getTimeSlots(item.timesOfDay);
  const doseLabel = getDoseLabel(item);
  const frequencyLabel = getFrequencyLabel(item);
  const asOfDate = parseDateOnly(options?.asOfDate);
  const rowDose = doseLabel || frequencyLabel;
  const cell = (slot: ActiveMedicationTimeSlot) => (timeSlots.includes(slot) ? rowDose : '');

  return {
    sourcePrescriptionId,
    sourcePrescriptionCode,
    sourcePrescriptionStartDate,
    sourcePrescriptionEndDate,
    sourcePrescriptionStatus,
    sourcePrescriptionLabel: getSourcePrescriptionLabel(
      sourcePrescriptionCode,
      sourcePrescriptionStartDate,
    ),
    medicineName: item.medicineName,
    dosage: doseLabel,
    frequency: frequencyLabel,
    note: item.specialInstructions?.trim() || item.instructions?.trim() || undefined,
    quantity: item.quantityDispensed ?? item.quantity,
    morning: cell('morning'),
    noon: cell('noon'),
    afternoon: cell('afternoon'),
    night: cell('night'),
    timeSlots,
    isNearingEndDate: Boolean(
      !item.isContinuous &&
      isNearEndDate(sourcePrescriptionEndDate, asOfDate, options?.nearingEndThresholdDays ?? 7),
    ),
    isContinuous: Boolean(item.isContinuous),
  };
}

export function buildActiveMedicationSummary(
  source: ActiveMedicationSummaryInput,
  options: ActiveMedicationSummaryOptions = {},
): ActiveMedicationSummaryRow[] {
  if (source.length === 0) return [];

  if (isPrescriptionArray(source)) {
    return source
      .filter((prescription) => normalizePrescriptionStatus(prescription.status) === 'Active')
      .flatMap((prescription) =>
        (prescription.items ?? []).map((item) =>
          buildRowFromItem(item as ActiveMedicationSourceItem, prescription, options),
        ),
      );
  }

  return source.map((item) => buildRowFromItem(item, undefined, options));
}
