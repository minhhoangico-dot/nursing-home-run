export type ShiftType = 'Morning' | 'Afternoon' | 'Night';

export interface ShiftAssignment {
  shift: ShiftType;
  building?: string;
  floor?: string;
  note?: string;
}

export interface StaffSchedule {
  userId: string;
  userName: string;
  role: string;
  shifts: Record<string, ShiftAssignment[]>; // Key is date string YYYY-MM-DD, value is ARRAY of assignments
}

export const SHIFT_CONFIG: Record<ShiftType, { label: string; time: string; color: string; icon: string }> = {
  Morning: { label: 'Sáng', time: '06:00 - 14:00', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: '🌅' },
  Afternoon: { label: 'Chiều', time: '14:00 - 22:00', color: 'bg-sky-100 text-sky-700 border-sky-200', icon: '🌤️' },
  Night: { label: 'Đêm', time: '22:00 - 06:00', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: '🌙' }
};