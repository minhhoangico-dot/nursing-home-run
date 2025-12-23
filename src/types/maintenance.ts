export type MaintenancePriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type MaintenanceStatus = 'Pending' | 'In_Progress' | 'Completed' | 'Cancelled';

export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  location: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  reporter: string;
  assignee?: string;
  createdAt: string;
  completedAt?: string;
  cost?: number;
  note?: string;
}