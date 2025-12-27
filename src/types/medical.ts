export interface Assessment {
  date: string;
  score: number;
  level: 1 | 2 | 3 | 4;
  assessor: string;
}

export type PrescriptionStatus = 'Active' | 'Completed' | 'Cancelled';

export interface Medicine {
  id: string;
  name: string;
  activeIngredient?: string;
  unit: string;
  defaultDosage?: string;
  price?: number;
}

export interface PrescriptionItem {
  id: string;
  prescriptionId: string;
  medicineId?: string;
  medicineName: string;
  dosage: string; // e.g., "1 viên"
  frequency: string; // e.g., "2 lần/ngày"
  timesOfDay: string[]; // e.g., ["Sáng", "Chiều"]
  quantity?: number;
  instructions?: string; // e.g., "Uống sau ăn"
}

export interface Prescription {
  id: string;
  code: string; // DT-20231226-001
  residentId: string;
  residentName?: string; // Computed/Joined
  doctorId: string; // User ID
  doctorName?: string; // Cache
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
  time: string; // 'Morning', 'Noon', 'Afternoon', 'Night'
  date: string; // YYYY-MM-DD
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