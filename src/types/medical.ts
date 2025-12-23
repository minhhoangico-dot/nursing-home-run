export interface Assessment {
  date: string;
  score: number;
  level: 1 | 2 | 3 | 4;
  assessor: string;
}

export interface Prescription {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  doctor: string;
  status: 'Active' | 'Completed';
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