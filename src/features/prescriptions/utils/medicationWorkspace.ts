import type { Prescription, ResidentListItem } from '@/src/types';
import {
  buildActiveMedicationSummary,
  type ActiveMedicationSummaryRow,
} from './activeMedicationSummary';
import { normalizePrescriptionStatus } from '@/src/types/medical';

export type MedicationAlertTone = 'info' | 'warning' | 'danger';

export interface MedicationWorkspaceRow extends ActiveMedicationSummaryRow {
  residentId: string;
  residentName: string;
  room: string;
  bed: string;
  residentPath: string;
}

export interface MedicationPendingAlert {
  title: string;
  body: string;
  to: string;
  tone: MedicationAlertTone;
}

export interface MedicationWorkspaceSummary {
  activeRows: MedicationWorkspaceRow[];
  pendingAlerts: MedicationPendingAlert[];
  counts: {
    activePrescriptions: number;
    pausedPrescriptions: number;
    nearEndMedications: number;
  };
}

export interface MedicationWorkspaceInput {
  today: string;
  residents: ResidentListItem[];
  prescriptions: Prescription[];
}

const findResident = (residents: ResidentListItem[], residentId: string) =>
  residents.find((resident) => resident.id === residentId);

const getResidentName = (residents: ResidentListItem[], residentId: string) =>
  findResident(residents, residentId)?.name ?? residentId;

const getResidentPath = (residentId: string) => `/residents/${residentId}`;

export function buildMedicationWorkspaceSummary({
  today,
  residents,
  prescriptions,
}: MedicationWorkspaceInput): MedicationWorkspaceSummary {
  const activePrescriptions = prescriptions.filter(
    (prescription) => normalizePrescriptionStatus(prescription.status) === 'Active',
  );
  const pausedPrescriptions = prescriptions.filter(
    (prescription) => normalizePrescriptionStatus(prescription.status) === 'Paused',
  );

  const activeRows = activePrescriptions.flatMap((prescription) => {
    const resident = findResident(residents, prescription.residentId);

    return buildActiveMedicationSummary([prescription], { asOfDate: today }).map((row) => ({
      ...row,
      residentId: prescription.residentId,
      residentName: resident?.name ?? prescription.residentId,
      room: resident?.room ?? '',
      bed: resident?.bed ?? '',
      residentPath: getResidentPath(prescription.residentId),
    }));
  });

  const nearEndAlerts = activeRows
    .filter((row) => row.isNearingEndDate)
    .map((row) => ({
      title: `${row.medicineName} sắp hết`,
      body: `${row.residentName} - đơn ${row.sourcePrescriptionCode}, kết thúc ${row.sourcePrescriptionEndDate ?? 'chưa rõ'}`,
      to: row.residentPath,
      tone: 'warning' as const,
    }));

  const pausedAlerts = pausedPrescriptions.map((prescription) => ({
    title: `${prescription.code} đang tạm ngưng`,
    body: `${getResidentName(residents, prescription.residentId)} - ${prescription.diagnosis}`,
    to: getResidentPath(prescription.residentId),
    tone: 'info' as const,
  }));

  return {
    activeRows,
    pendingAlerts: [...nearEndAlerts, ...pausedAlerts],
    counts: {
      activePrescriptions: activePrescriptions.length,
      pausedPrescriptions: pausedPrescriptions.length,
      nearEndMedications: nearEndAlerts.length,
    },
  };
}

const escapeCsvCell = (value: unknown) => {
  const text = String(value ?? '');

  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

export function buildMedicationSummaryCsv(rows: MedicationWorkspaceRow[]): string {
  const header = [
    'Resident',
    'Room',
    'Bed',
    'Medicine',
    'Dosage',
    'Frequency',
    'Prescription',
    'End Date',
  ];
  const dataRows = rows.map((row) => [
    row.residentName,
    row.room,
    row.bed,
    row.medicineName,
    row.dosage,
    row.frequency,
    row.sourcePrescriptionCode,
    row.sourcePrescriptionEndDate ?? '',
  ]);

  return [header, ...dataRows]
    .map((row) => row.map(escapeCsvCell).join(','))
    .join('\n');
}
