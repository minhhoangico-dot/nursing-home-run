export interface Room {
  id: string;
  number: string;
  floor: string;
  building: string;
  type: '1 Giường' | '2 Giường' | '4 Giường';
  beds: { id: string; residentId?: string; status: 'Available' | 'Occupied' | 'Maintenance' }[];
}