export interface Assessment {
  date: string;
  score: number;
  level: 1 | 2 | 3 | 4;
  assessor: string;
}

export type PrescriptionStatus = 'Active' | 'Paused' | 'Completed';
export type LegacyPrescriptionStatus = PrescriptionStatus | 'Cancelled';

export function normalizePrescriptionStatus(
  status?: string | null,
): PrescriptionStatus {
  if (status === 'Cancelled' || status === 'Paused') return 'Paused';
  if (status === 'Completed') return 'Completed';
  return 'Active';
}

export interface Medicine {
  id: string;
  name: string;
  activeIngredient?: string;
  strength?: string;
  unit: string;
  route?: string;
  drugGroup?: string;
  defaultDosage?: string;
  defaultFrequency?: number;
  price?: number;
}

export interface PrescriptionItem {
  id: string;
  prescriptionId: string;
  medicineId?: string;
  medicineName: string;
  activeIngredientSnapshot?: string;
  strengthSnapshot?: string;
  routeSnapshot?: string;
  dosePerTime?: number;
  doseUnit?: string;
  dosage: string;
  timesPerDay?: number;
  frequency: string;
  timesOfDay: string[];
  quantityDispensed?: number;
  quantity?: number;
  daysSupply?: number;
  startDate?: string;
  endDate?: string;
  isContinuous?: boolean;
  instructions?: string;
  specialInstructions?: string;
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
