export interface Assessment {
  date: string;
  score: number;
  level: 1 | 2 | 3 | 4;
  assessor: string;
}

export type PrescriptionStatus = 'Active' | 'Completed' | 'Cancelled' | 'Paused';

export interface Medicine {
  id: string;
  name: string;
  activeIngredient?: string;
  unit: string;
  defaultDosage?: string;
  price?: number;
  strength?: string;
  route?: string;
  therapeuticGroup?: string;
  source?: 'MANUAL' | 'IMPORT';
}

export interface PrescriptionItemSchedule {
  morning: boolean;
  noon: boolean;
  afternoon: boolean;
  evening: boolean;
}

export interface PrescriptionItem {
  id: string;
  prescriptionId: string;
  medicineId?: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  timesOfDay: string[];
  quantity?: number;
  instructions?: string;
  startDate?: string;
  endDate?: string;
  continuous?: boolean;
  quantitySupplied?: number;
  administrationsPerDay?: number;
  schedule?: PrescriptionItemSchedule;
}

export interface Prescription {
  id: string;
  code: string;
  residentId: string;
  residentName?: string;
  doctorId: string;
  doctorName?: string;
  diagnosis: string;
  prescriptionDate: string;
  startDate: string;
  endDate?: string;
  status: PrescriptionStatus;
  notes?: string;
  items: PrescriptionItem[];
  duplicatedFromPrescriptionId?: string;
}

export interface PrescriptionSnapshot {
  id: string;
  prescriptionId: string;
  version: number;
  snapshotAt: string;
  actor?: string;
  changeReason?: string;
  headerPayload: Record<string, unknown>;
  itemsPayload: Array<Record<string, unknown>>;
}

export interface MedicationLineStatus {
  active: boolean;
  nearEnd: boolean;
  exhausted: boolean;
  remainingDays: number | null;
  estimatedExhaustionDate: string | null;
}

export interface ActiveMedicationRow {
  prescriptionId: string;
  sourcePrescriptionCode: string;
  medicineName: string;
  dosage: string;
  instructions?: string;
  timeOfDay: 'morning' | 'noon' | 'afternoon' | 'evening';
  startDate?: string;
  status: MedicationLineStatus;
}

export interface MedicationLog {
  id: string;
  residentId: string;
  prescriptionId: string;
  medicationName: string;
  dose: string;
  time: string;
  date: string;
  status: 'Given' | 'Refused' | 'Pending';
  performer: string;
  note?: string;
}

export interface MedicalVisit {
  id: string;
  date: string;
  doctor: string;
  complaint: string;
  diagnosis: string;
  treatment: string;
}

export interface MonitoringPlan {
  id: string;
  type: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  note: string;
  status: 'Active' | 'Completed';
  assigner?: string;
}

export interface MedicalCondition {
  id: string;
  name: string;
  diagnosedDate: string;
  status: 'Active' | 'Resolved';
}

export interface Allergy {
  id: string;
  allergen: string;
  severity: 'Nhẹ' | 'Trung bình' | 'Nặng';
  reaction: string;
}

export interface VitalSign {
  id: string;
  residentId: string;
  recordDate: string;
  pulse?: number;
  bpMorningSystolic?: number;
  bpMorningDiastolic?: number;
  bpNoonSystolic?: number;
  bpNoonDiastolic?: number;
  bpEveningSystolic?: number;
  bpEveningDiastolic?: number;
  temperature?: number;
  spo2?: number;
  bloodSugar?: number;
  bowelMovement: boolean;
  notes?: string;
  recordedBy: string;
  createdAt: string;
}
