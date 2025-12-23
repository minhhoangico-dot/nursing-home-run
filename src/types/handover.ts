export interface HandoverReport {
  id: string;
  date: string;
  shift: 'Morning' | 'Afternoon' | 'Night';
  leader: string; // Name of the shift leader
  totalResidents: number;
  newAdmissions: number;
  discharges: number;
  transfers: number; // Hospital transfers
  medicalAlerts: string;
  equipmentIssues: string;
  generalNotes: string;
  createdAt: string;
}