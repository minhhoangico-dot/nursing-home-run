export type ActivityType = 'Exercise' | 'Social' | 'Entertainment' | 'Spiritual' | 'Education' | 'Other';

export interface ActivityEvent {
  id: string;
  title: string;
  type: ActivityType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location: string;
  host: string; // Staff name
  description: string;
  status: 'Scheduled' | 'Happening' | 'Completed' | 'Cancelled';
}