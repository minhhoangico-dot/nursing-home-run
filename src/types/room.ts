export interface Room {
  id: string;
  number: string;
  floor: string;
  building: string;
  type: '1 Giường' | '2 Giường' | '3 Giường' | '4 Giường' | '5 Giường' | '7 Giường' | '8 Giường' | '9 Giường';
  beds: { id: string; residentId?: string; status: 'Available' | 'Occupied' | 'Maintenance' }[];
}