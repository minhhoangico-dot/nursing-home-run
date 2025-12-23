export type IncidentType = 'Fall' | 'Medical' | 'Aggression' | 'Equipment' | 'Other';
export type IncidentSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type IncidentStatus = 'New' | 'Investigating' | 'Resolved' | 'Closed';

export interface Incident {
  id: string;
  date: string;
  time: string;
  type: IncidentType;
  severity: IncidentSeverity;
  residentId?: string;
  residentName?: string;
  location: string;
  description: string;
  immediateAction: string;
  reporter: string;
  status: IncidentStatus;
  witnesses?: string;
  notes?: string;
}