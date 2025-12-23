import { Assessment, Prescription, MedicalVisit, MonitoringPlan, MedicalCondition, Allergy, VitalSign } from './medical';

export interface CareLog {
  id: string;
  timestamp: string; // ISO String
  category: 'Hygiene' | 'Nutrition' | 'Sleep' | 'Mood' | 'Activity' | 'Other';
  note: string;
  performer: string;
  importance?: 'Normal' | 'High';
}

export interface Resident {
  id: string;
  name: string;
  dob: string;
  gender: 'Nam' | 'Nữ';
  room: string;
  bed: string;
  floor: string;
  building: string;
  careLevel: 1 | 2 | 3 | 4;
  status: 'Active' | 'Discharged';
  admissionDate: string;
  guardianName: string;
  guardianPhone: string;
  balance: number;
  assessments: Assessment[];
  prescriptions: Prescription[];
  medicalVisits: MedicalVisit[];
  specialMonitoring: MonitoringPlan[];
  medicalHistory: MedicalCondition[];
  allergies: Allergy[];
  vitalSigns?: VitalSign[];
  careLogs: CareLog[];
  currentConditionNote: string;
  lastMedicalUpdate: string;
  lastUpdatedBy?: string;
  roomType: '1 Giường' | '2 Giường' | '4 Giường';
  dietType: 'Normal' | 'Porridge' | 'Soup' | 'Pureed' | 'Tube' | 'Cut'; // Cơm, Cháo, Súp, Xay, Sonde, Cắt
  dietNote?: string;
  isDiabetic: boolean;
}