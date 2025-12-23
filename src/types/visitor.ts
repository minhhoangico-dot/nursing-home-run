export interface VisitorLog {
  id: string;
  visitorName: string;
  idCard: string; // CCCD number
  phone: string;
  residentId: string;
  residentName: string;
  relationship: string;
  checkInTime: string; // ISO String
  checkOutTime?: string; // ISO String
  status: 'Active' | 'Completed';
  note?: string;
  itemBrought?: string; // Items brought in for resident
}